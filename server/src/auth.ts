import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "./shared/schema";
import { z } from "zod";

// Add User type to Express namespace
declare global {
  namespace Express {
    interface User extends User {}
  }
}

// Password related functions
const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Auth validation schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  confirm_password: z.string().min(6),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"], 
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Set up authentication
export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60, // 1 hour
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure passport to use local strategy for authentication
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Serialize and deserialize user for session management
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // User registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      // Validate request body
      const result = registerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          success: false, 
          message: "Validation failed", 
          errors: result.error.format() 
        });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ success: false, message: "Username already exists" });
      }

      // Create new user
      const user = await storage.createUser({
        username: req.body.username,
        password: await hashPassword(req.body.password),
      });

      // Log the user in
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        res.status(201).json({ 
          success: true, 
          user: userWithoutPassword,
          expires_in: 3600 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Registration failed" });
    }
  });

  // User login endpoint
  app.post("/api/login", (req, res, next) => {
    // Validate request body
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Validation failed", 
        errors: result.error.format() 
      });
    }

    passport.authenticate("local", (err: Error, user: User) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid username or password" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        return res.json({ 
          success: true, 
          user: userWithoutPassword,
          expires_in: 3600 
        });
      });
    })(req, res, next);
  });

  // User logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ success: true });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }
    
    // Return user data without password
    const { password, ...userWithoutPassword } = req.user;
    res.json({ success: true, user: userWithoutPassword });
  });

  // Check if auth is required middleware
  app.use("/api/*", (req, res, next) => {
    // Skip authentication for login, register and logout routes
    if (
      req.path === "/api/login" || 
      req.path === "/api/register" || 
      req.path === "/api/logout"
    ) {
      return next();
    }

    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    
    next();
  });
}