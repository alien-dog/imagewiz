import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

const googleClient = new OAuth2Client(process.env.VITE_GOOGLE_CLIENT_ID);

export function authenticateToken(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.SESSION_SECRET!, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  });
}

function generateToken(user: SelectUser) {
  return jwt.sign(
    { id: user.id, username: user.username },
    process.env.SESSION_SECRET!,
    { expiresIn: '24h' }
  );
}

export function setupAuth(app: Express) {
  app.use(passport.initialize());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await comparePasswords(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = req.body;
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.VITE_GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ message: "Invalid token" });
      }

      let user = await storage.getUserByEmail(payload.email!);

      if (!user) {
        // Create a new user if they don't exist
        user = await storage.createUser({
          username: payload.email!.split('@')[0],
          email: payload.email!,
          provider: 'google',
          credits: 10, // Default credits for new users
        });
      }

      const token = generateToken(user);
      res.json({ user, token });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(401).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.sendStatus(200);
  });

  app.get("/api/user", authenticateToken, (req, res) => {
    res.json(req.user);
  });
  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      const token = generateToken(user);
      res.status(201).json({ user, token });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Authentication failed" });
      }

      const token = generateToken(user);
      return res.json({ user, token });
    })(req, res, next);
  });
}