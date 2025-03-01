import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import multer from "multer";
import { storage } from "./storage";

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to check if user is admin
function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated() || req.user?.username !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  next();
}

// Middleware to check if user has access to the requested profile
function isProfileOwner(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const userId = parseInt(req.params.userId);
  if (!req.isAuthenticated() || (req.user?.id !== userId && req.user?.username !== 'admin')) {
    return res.status(403).send('Forbidden');
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // User profile routes
  app.get("/api/users/:userId/profile", isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getUserProfile(userId);
    if (!profile) {
      return res.json({ userId });
    }
    res.json(profile);
  });

  app.patch("/api/users/:userId/profile", isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const profile = await storage.updateUserProfile(userId, req.body);
    res.json(profile);
  });

  // Transaction routes
  app.get("/api/users/:userId/transactions", isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const transactions = await storage.getUserTransactions(userId);
    res.json(transactions);
  });

  app.post("/api/process", upload.single("image"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }

    if (!req.file) {
      return res.status(400).send("No image provided");
    }

    // For demo purposes, just echo back success
    // In a real app, this would integrate with an AI service
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}