import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

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

// Serve static files from the dist/public directory
app.use(express.static(join(__dirname, '..', 'dist', 'public')));

// Handle client-side routing by serving index.html for all routes
app.get('*', (req, res) => {
  const indexPath = join(__dirname, '..', 'dist', 'public', 'index.html');
  console.log('Serving index.html from:', indexPath);
  res.sendFile(indexPath);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});