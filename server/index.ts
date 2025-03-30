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

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Add a manual proxy endpoint for auth login
app.post('/api/auth/login', async (req, res) => {
  console.log('Manual proxy: Received login request');
  try {
    const response = await fetch(`http://localhost:${FLASK_PORT}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    
    const data = await response.json();
    console.log('Manual proxy: Login response received');
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Manual proxy: Error forwarding login request', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a manual proxy endpoint for auth user
app.get('/api/auth/user', async (req, res) => {
  console.log('Manual proxy: Received user request');
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    
    console.log('Manual proxy: Forwarding user request with auth header:', authHeader);
    
    const response = await fetch(`http://localhost:${FLASK_PORT}/auth/user`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });
    
    const data = await response.json();
    console.log('Manual proxy: User response received');
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Manual proxy: Error forwarding user request', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy API requests to Flask backend (except login which we handle manually)
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${FLASK_PORT}`,
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
  target: `http://localhost:${FLASK_PORT}`,
  changeOrigin: true
}));

// Proxy processed requests to Flask backend
app.use('/processed', createProxyMiddleware({
  target: `http://localhost:${FLASK_PORT}`,
  changeOrigin: true
}));

// Start Flask backend
console.log('Starting Flask backend...');
const backendProcess = spawn('python', ['run.py'], { 
  cwd: path.join(__dirname, '../backend'),
  stdio: 'inherit',
  shell: true 
});

backendProcess.on('error', (error) => {
  console.error(`Backend Error: ${error.message}`);
});

backendProcess.on('exit', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle shutdown
process.on('SIGINT', () => {
  console.log('Received SIGINT. Shutting down...');
  backendProcess.kill();
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