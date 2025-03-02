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

// Optional: Remove CSP headers in development
app.use((req, res, next) => {
  res.removeHeader("Content-Security-Policy");
  next();
});

// Serve static files from the dist directory
app.use(express.static('dist'));

// Handle client-side routing by serving index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`);
});