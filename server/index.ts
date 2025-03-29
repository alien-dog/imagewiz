import express from 'express';
import session from 'express-session';
import cors from 'cors';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { setupViteServer } from './vite';
import { registerRoutes } from './routes';
import { storage } from './storage';

const app = express();
const PORT = process.env.PORT || 3000;

// Set up CORS
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true
}));

// Parse JSON request body
app.use(express.json());

// Session middleware
const sessionSettings: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || 'development-secret-key',
  resave: false,
  saveUninitialized: false,
  store: storage.sessionStore,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
};

app.use(session(sessionSettings));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Create HTTP server and register routes
const httpServer = registerRoutes(app);

// Setup Vite server in development
setupViteServer(app);

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;