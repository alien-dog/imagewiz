import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import multer from "multer";
import { storage } from "./storage";
import { createCheckoutSession, handleWebhook } from "./stripe";
import express from 'express';

// Configure multer for handling file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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

  // Transaction routes
  app.get("/api/users/:userId/transactions", isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const transactions = await storage.getUserTransactions(userId);
    res.json(transactions);
  });

  // Add these routes to handle image history
  app.get("/api/users/:userId/images", isProfileOwner, async (req, res) => {
    const userId = parseInt(req.params.userId);
    const images = await storage.getUserImages(userId);
    res.json(images);
  });

  app.delete("/api/images/:imageId", async (req, res) => {
    const imageId = parseInt(req.params.imageId);
    const image = await storage.getImage(imageId);

    if (!image) {
      return res.status(404).send("Image not found");
    }

    if (!req.isAuthenticated() || (req.user?.id !== image.userId && req.user?.username !== 'admin')) {
      return res.status(403).send("Forbidden");
    }

    await storage.deleteImage(imageId);
    res.sendStatus(200);
  });

  // Update the process endpoint to create an image record
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

    // For demo purposes, just echo back success
    // In a real app, this would integrate with an AI service
    res.json(image);
  });

  // Add this route at the end of the routes section before returning httpServer
  app.post("/api/upload-logo", upload.single("logo"), async (req, res) => {
    if (!req.isAuthenticated() || req.user?.username !== 'admin') {
      return res.status(403).send("Only admin can upload logo");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    // For demo purposes, we'll just return a success response
    // In a real app, you would upload to cloud storage and return the URL
    res.json({
      url: "data:image/png;base64," + req.file.buffer.toString('base64')
    });
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