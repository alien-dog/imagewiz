import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { log } from "./utils";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: process.env.NODE_ENV === "production" 
    ? process.env.ALLOWED_ORIGINS?.split(",") 
    : "http://localhost:5173",
  credentials: true
};

app.use(cors(corsOptions));

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


    // Configure port and host from environment variables
    const port = process.env.PORT || 3000;
    const host = process.env.HOST || "0.0.0.0";

    server.listen({
      port,
      host,
      reusePort: true,
    }, () => {
      log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
      log(`Listening on http://${host}:${port}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        log('HTTP server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();