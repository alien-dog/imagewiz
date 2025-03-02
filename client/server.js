import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS
app.use(cors());

// Configure security headers
app.use((req, res, next) => {
  // Remove restrictive CSP headers in development
  res.removeHeader("Content-Security-Policy");
  // Add permissive CSP header for development
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  next();
});

// Test endpoint to verify server is running
app.get('/ping', (req, res) => {
  res.json({ message: 'Frontend server is running!' });
});

// Serve static files from the dist/public directory
app.use(express.static(join(__dirname, '..', 'dist', 'public')));

// Handle client-side routing by serving index.html for all routes
app.get('*', (req, res) => {
  const indexPath = join(__dirname, '..', 'dist', 'public', 'index.html');
  console.log('Serving index.html from:', indexPath);

  // Check if the file exists before sending
  if (!fs.existsSync(indexPath)) {
    console.error('Error: index.html not found at path:', indexPath);
    return res.status(404).send('Frontend build not found. Please build the frontend first.');
  }

  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).send('Internal Server Error');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});