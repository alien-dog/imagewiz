// This is a proxy server that forwards requests to the Flask backend
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
// Try port 5000 first, but fall back to 5001 if it's already in use
const PRIMARY_PORT = 5000;
const FALLBACK_PORT = 5001;
let PORT = PRIMARY_PORT;
const FLASK_PORT = 5001;
const FLASK_HOST = 'e3d010d3-10b7-4398-916c-9569531b7cb9-00-nzrxz81n08w.kirk.replit.dev';

// Enable CORS with specific options
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json());

// Add direct API endpoint for testing
app.post('/test-api/login', (req, res) => {
  console.log('[Test API] Login request received:', req.body);
  
  // Send success response
  if (req.body.username === 'testuser2' && req.body.password === 'password123') {
    res.status(200).json({
      id: 1,
      username: req.body.username,
      access_token: 'test-token-12345',
      credit_balance: 100,
      is_admin: false,
      message: 'Login successful (test API)'
    });
  } else {
    res.status(401).json({
      error: 'Invalid username or password (test API)'
    });
  }
});

// Proxy API requests to Flask backend
app.use('/api', createProxyMiddleware({
  target: `https://${FLASK_HOST}:${FLASK_PORT}`,
  changeOrigin: true,
  // Don't rewrite the path - Flask routes expect /api prefix
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  secure: false, // Allow insecure SSL connections
  ws: true, // Enable WebSocket proxying
  pathRewrite: { '^/api': '/api' }, // No path rewriting needed but explicitly stated for clarity
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[PROXY] Proxying request to: ${req.method} ${req.url}`);
    
    // Log request body for debugging if it's a POST request
    if (req.method === 'POST' && req.body) {
      console.log('[PROXY] Request body:', JSON.stringify(req.body));
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Authorization';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    console.log(`[PROXY] Received response for: ${req.method} ${req.url} with status: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('[PROXY] Proxy error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end(`Proxy Error: ${err.message}`);
  }
}));

// Proxy auth requests to Flask backend
app.use('/auth', createProxyMiddleware({
  target: `https://${FLASK_HOST}:${FLASK_PORT}`,
  changeOrigin: true,
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  secure: false, // Allow insecure SSL connections
  ws: true, // Enable WebSocket proxying
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Authorization';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  }
}));

// Proxy login requests to Flask backend
app.use('/login', createProxyMiddleware({
  target: `https://${FLASK_HOST}:${FLASK_PORT}`,
  changeOrigin: true,
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  secure: false, // Allow insecure SSL connections
  ws: true, // Enable WebSocket proxying
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Authorization';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  }
}));

// Proxy uploads requests to Flask backend
app.use('/uploads', createProxyMiddleware({
  target: `https://${FLASK_HOST}:${FLASK_PORT}`,
  changeOrigin: true,
  secure: false, // Allow insecure SSL connections
  ws: true, // Enable WebSocket proxying
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Authorization';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  }
}));

// Proxy processed requests to Flask backend
app.use('/processed', createProxyMiddleware({
  target: `https://${FLASK_HOST}:${FLASK_PORT}`,
  changeOrigin: true,
  secure: false, // Allow insecure SSL connections
  ws: true, // Enable WebSocket proxying
  onProxyRes: (proxyRes, req, res) => {
    // Add CORS headers to the proxied response
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'X-Requested-With, Content-Type, Accept, Authorization';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
  }
}));

// Using Vite to proxy to the external Flask backend
console.log(`The frontend will proxy API requests directly to the Flask backend`);

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

app.get('/direct-test.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../direct-test.html'));
});

app.get('/test-direct-api.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-direct-api.html'));
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

// Start the server with fallback
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
}).on('error', (e: any) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use, trying fallback port ${FALLBACK_PORT}`);
    PORT = FALLBACK_PORT;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
    });
  } else {
    console.error(`Failed to start server: ${e.message}`);
  }
});