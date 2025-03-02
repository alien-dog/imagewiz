import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, authenticateToken } from "./auth";
import multer from "multer";
import { storage } from "./storage";
import { createCheckoutSession, handleWebhook } from "./stripe";
import express from 'express';
import cors from 'cors';

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Basic CORS setup without domain restrictions
  app.use(cors());

  // Health check endpoint for backend verification
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

  setupAuth(app);

  // Stripe payment routes - protected with token auth
  app.post("/api/create-checkout-session", authenticateToken, createCheckoutSession);
  app.post("/api/webhook", express.raw({type: 'application/json'}), handleWebhook);

  // API version endpoint
  app.get('/api/version', (req, res) => {
    res.json({
      version: '1.0.0',
      apiPrefix: '/api'
    });
  });

  // Admin routes - protected with token auth
  app.get("/api/admin/users", authenticateToken, isAdmin, async (req, res) => {
    const users = await storage.getAllUsers();
    res.json(users);
  });

  // User profile routes - protected with token auth
  app.get("/api/users/:userId/profile", authenticateToken, isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const profile = await storage.getUserProfile(userId);
    if (!profile) {
      return res.json({ userId });
    }
    res.json(profile);
  });

  app.patch("/api/users/:userId/profile", authenticateToken, isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const profile = await storage.updateUserProfile(userId, req.body);
    res.json(profile);
  });

  // Transaction routes - protected with token auth
  app.get("/api/users/:userId/transactions", authenticateToken, isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const transactions = await storage.getUserTransactions(userId);
    res.json(transactions);
  });

  // Image routes - protected with token auth
  app.get("/api/users/:userId/images", authenticateToken, isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const images = await storage.getUserImages(userId);
    res.json(images);
  });

  app.delete("/api/images/:imageId", authenticateToken, async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    const image = await storage.getImage(imageId);

    if (!image) {
      return res.status(404).send("Image not found");
    }

    if (req.user.id !== image.userId && req.user.username !== 'admin') {
      return res.status(403).send("Forbidden");
    }

    await storage.deleteImage(imageId);
    res.sendStatus(200);
  });

  app.post("/api/process", authenticateToken, upload.single("image"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No image provided");
    }

    // Create a new image record
    const image = await storage.createImage({
      userId: req.user.id,
      originalUrl: "temporary-url", // In a real app, this would be the uploaded file URL
      status: "pending",
      metadata: {},
      processedUrl: null
    });

    // For demo purposes, just echo back success
    res.json(image);
  });

  // Upload logo - protected with token and admin check
  app.post("/api/upload-logo", authenticateToken, upload.single("logo"), async (req, res) => {
    if (req.user.username !== 'admin') {
      return res.status(403).send("Only admin can upload logo");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    res.json({
      url: "data:image/png;base64," + req.file.buffer.toString('base64')
    });
  });

  // Middleware to check if user is admin
  function isAdmin(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    if (req.user.username !== 'admin') {
      return res.status(403).send('Forbidden');
    }
    next();
  }

  // Middleware to check if user has access to the requested profile
  function isProfileOwner(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    const userId = parseInt(req.params.userId);
    if (req.user.id !== userId && req.user.username !== 'admin') {
      return res.status(403).send('Forbidden');
    }
    next();
  }

  const httpServer = createServer(app);
  return httpServer;
}