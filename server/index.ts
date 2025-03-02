import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable trust proxy if behind a reverse proxy
app.set("trust proxy", 1);

// Configure CORS for production
if (process.env.NODE_ENV === "production") {
  const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : [];
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });
}

// Request logging middleware
app.use((req, res, next) => {
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
});

(async () => {
  let server;
  try {
    log(`Starting server in ${process.env.NODE_ENV || 'development'} mode...`);

    server = await registerRoutes(app);

    // Global error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      console.error('Error:', err);
      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    });

    if (process.env.NODE_ENV !== 'production') {
      await setupVite(app);
    } else {
      app.use(express.static(path.join(__dirname, '../dist')));
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
      });
    }

    // Configure port and host from environment variables
    const port = process.env.PORT || 5000;
    const host = process.env.HOST || "0.0.0.0";

    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      log(`Server running on http://${host}:${port}`);
    });

    // Handle graceful shutdown
    const handleShutdown = () => {
      log('Shutdown signal received: closing HTTP server');
      server.close(() => {
        log('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', handleShutdown);
    process.on('SIGINT', handleShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();