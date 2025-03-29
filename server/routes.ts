import type { Express } from "express";
import { createServer, type Server } from "http";

export function registerRoutes(app: Express): Server {
  // Just create a minimal HTTP server
  // The actual API routes are handled by the Flask backend
  const httpServer = createServer(app);

  return httpServer;
}