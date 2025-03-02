import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

// Create API server
const apiApp = express();
apiApp.use(express.json());
apiApp.use(express.urlencoded({ extended: false }));

// Create frontend server
const frontendApp = express();

// Enable trust proxy if behind a reverse proxy
apiApp.set("trust proxy", 1);
frontendApp.set("trust proxy", 1);

// Configure CORS for production
if (process.env.NODE_ENV === "production") {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];
  const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  };
  apiApp.use(corsMiddleware);
  frontendApp.use(corsMiddleware); // Added CORS middleware to frontendApp
}

// Request logging middleware
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
};

apiApp.use(requestLogger);

(async () => {
  let apiServer;
  let frontendServer;
  try {
    log(`Starting servers in ${process.env.NODE_ENV || 'development'} mode...`);

    apiServer = await registerRoutes(apiApp);

    // Global error handler for API server
    apiApp.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Error:', err);
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    // Configure frontend server in development
    if (process.env.NODE_ENV !== 'production') {
      await setupVite(frontendApp); // Remove frontendServer parameter
    } else {
      // In production, serve the built frontend files
      frontendApp.use(express.static(path.join(__dirname, '../dist')));
      frontendApp.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    }

    // Configure ports
    const apiPort = process.env.API_PORT || 5000;
    const frontendPort = process.env.FRONTEND_PORT || 5001;
    const host = process.env.HOST || "0.0.0.0";

    // Start API server
    apiServer.listen({
      port: apiPort,
      host,
      reusePort: true,
    }, () => {
      log(`API Server running on http://${host}:${apiPort}`);
    });

    // Start frontend server
    frontendServer = frontendApp.listen({
      port: frontendPort,
      host,
    }, () => {
      log(`Frontend Server running on http://${host}:${frontendPort}`);
    });

    // Handle graceful shutdown
    const handleShutdown = () => {
      log('Shutdown signal received: closing HTTP servers');
      apiServer.close(() => {
        log('API server closed');
        frontendServer.close(() => {
          log('Frontend server closed');
          process.exit(0);
        });
      });
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);

  } catch (error) {
    console.error('Failed to start servers:', error);
    process.exit(1);
  }
})();