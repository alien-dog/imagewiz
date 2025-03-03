import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage.js";
import { createCheckoutSession, handleWebhook } from "./stripe.js";
import express from 'express';

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe payment routes
  app.post("/api/create-checkout-session", createCheckoutSession);
  app.post("/api/webhook", express.raw({type: 'application/json'}), handleWebhook);

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

  // Image processing routes
  app.post("/api/process", upload.single("image"), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }

    if (!req.file) {
      return res.status(400).send("No image provided");
    }

    // Create a new image record
    const image = await storage.createImage({
      userId: req.user.id,
      originalUrl: "temporary-url", // In a real app, this would be the uploaded file URL
      status: "pending"
    });

    res.json(image);
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

  const httpServer = createServer(app);
  return httpServer;
}