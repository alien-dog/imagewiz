// This is a proxy server that forwards requests to the Flask backend
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const FLASK_PORT = 5000;
const FLASK_HOST = 'e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev';

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Proxy API requests to Flask backend
app.use('/api', createProxyMiddleware({
  target: `https://${FLASK_HOST}`,
  changeOrigin: true,
  // Don't rewrite the path - Flask routes expect /api prefix
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  secure: false // Allow insecure SSL connections
}));

// Proxy auth requests to Flask backend
app.use('/auth', createProxyMiddleware({
  target: `https://${FLASK_HOST}`,
  changeOrigin: true,
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  secure: false // Allow insecure SSL connections
}));

// Proxy login requests to Flask backend
app.use('/login', createProxyMiddleware({
  target: `https://${FLASK_HOST}`,
  changeOrigin: true,
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  secure: false // Allow insecure SSL connections
}));

// Proxy uploads requests to Flask backend
app.use('/uploads', createProxyMiddleware({
  target: `https://${FLASK_HOST}`,
  changeOrigin: true,
  secure: false // Allow insecure SSL connections
}));

// Proxy processed requests to Flask backend
app.use('/processed', createProxyMiddleware({
  target: `https://${FLASK_HOST}`,
  changeOrigin: true,
  secure: false // Allow insecure SSL connections
}));

// Using external Flask backend
console.log(`Using external Flask backend at: https://${FLASK_HOST}`);

// Create a dummy process for compatibility
const backendProcess = {
  on: (event, callback) => {
    console.log(`Registered handler for ${event} event (not active)`);
  },
  kill: () => {
    console.log('Kill called on dummy process (no action taken)');
  }
};

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down...');
  process.exit(0);
});

// Serve frontend files from dist directory
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Serve test HTML files
app.get('/test-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-login.html'));
});

app.get('/proxy-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../proxy-test.html'));
});

app.get('/simple-form.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../simple-form.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error serving application');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});