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
const FLASK_URL = 'http://e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev';

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Add manual proxy routes for debugging
app.post('/api/auth/login', (req, res) => {
  console.log('Received auth login request, manually proxying to Flask');
  console.log('Request body:', req.body);
  
  // Forward the request to Flask
  const flaskUrl = `${FLASK_URL}/auth/login`;
  console.log(`Forwarding to: ${flaskUrl}`);
  
  // Use node-fetch to forward the request
  fetch(flaskUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(req.body)
  })
  .then(flaskRes => flaskRes.json())
  .then(data => {
    console.log('Response from Flask:', data);
    res.json(data);
  })
  .catch(error => {
    console.error('Error proxying to Flask:', error);
    res.status(500).json({ error: 'Failed to proxy request to backend' });
  });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Received auth register request, manually proxying to Flask');
  console.log('Request body:', req.body);
  
  // Forward the request to Flask
  const flaskUrl = `${FLASK_URL}/auth/register`;
  console.log(`Forwarding to: ${flaskUrl}`);
  
  // Use node-fetch to forward the request
  fetch(flaskUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(req.body)
  })
  .then(flaskRes => flaskRes.json())
  .then(data => {
    console.log('Response from Flask:', data);
    res.json(data);
  })
  .catch(error => {
    console.error('Error proxying to Flask:', error);
    res.status(500).json({ error: 'Failed to proxy request to backend' });
  });
});

app.get('/api/auth/user', (req, res) => {
  console.log('Received auth user request, manually proxying to Flask');
  console.log('Auth header:', req.headers.authorization);
  
  // Forward the request to Flask
  const flaskUrl = `${FLASK_URL}/auth/user`;
  console.log(`Forwarding to: ${flaskUrl}`);
  
  // Use node-fetch to forward the request
  fetch(flaskUrl, {
    method: 'GET',
    headers: {
      'Authorization': req.headers.authorization || '',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
  .then(flaskRes => flaskRes.json())
  .then(data => {
    console.log('Response from Flask:', data);
    res.json(data);
  })
  .catch(error => {
    console.error('Error proxying to Flask:', error);
    res.status(500).json({ error: 'Failed to proxy request to backend' });
  });
});

// Proxy all other API requests to Flask backend
app.use('/api', createProxyMiddleware({
  target: FLASK_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''  // Remove '/api' prefix when forwarding
  },
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  // Handle each request before it's sent to give more debug info
  onProxyReq: (proxyReq: any, req: any, res: any) => {
    console.log(`Proxying request: ${req.method} ${req.url} to Flask backend`);
    console.log(`Target URL: ${proxyReq.path}`);
  }
}));

// Proxy uploads requests to Flask backend
app.use('/uploads', createProxyMiddleware({
  target: FLASK_URL,
  changeOrigin: true
}));

// Proxy processed requests to Flask backend
app.use('/processed', createProxyMiddleware({
  target: FLASK_URL,
  changeOrigin: true
}));

// We're using the external Flask backend, so no need to start it locally
console.log(`Using external Flask backend at ${FLASK_URL}`);

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