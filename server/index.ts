import express from "express";
import cors from "cors";
import { execSync } from "child_process";
import { registerRoutes } from "./routes.js";
import { registerVite } from "./vite.js";

console.log("Starting server...");

// Start the Flask backend
console.log("Starting Flask backend...");
try {
  const backend = execSync("cd backend && python3 run.py &", { stdio: 'inherit' });
} catch (error) {
  console.error("Error starting Flask backend:", error);
}

const app = express();

// CORS setup
app.use(cors());

// Body parser middleware
app.use(express.json());

// Register API routes
const httpServer = registerRoutes(app);

// Register Vite middleware in development
registerVite(app);

// Start the server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});