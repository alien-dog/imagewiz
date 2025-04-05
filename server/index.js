/**
 * This is the main server file for handling both Express (frontend) and Python Flask (backend) processes.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const { execSync, spawn } = require('child_process');
const { createProxyMiddleware } = require('http-proxy-middleware');
const paymentHandler = require('./payment-handler');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Express server with frontend static files');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Find frontend build directory
let frontendPath = path.join(process.cwd(), 'frontend', 'dist');
console.log('Checking for frontend build directories:');
console.log(`- Checking: ${frontendPath}`);

// Verify the frontend path has an index.html
const hasFrontendIndex = fs.existsSync(path.join(frontendPath, 'index.html'));
if (hasFrontendIndex) {
  console.log(`✅ Found valid frontend path with index.html: ${frontendPath}`);
} else {
  console.log(`❌ Could not find index.html in ${frontendPath}`);
}

console.log(`Using frontend path: ${frontendPath}`);
console.log(`Files in ${frontendPath}: ${fs.existsSync(frontendPath) ? fs.readdirSync(frontendPath) : 'Directory not found'}`);

// Start Flask backend
console.log('Starting Flask backend...');
const flaskProcess = spawn('bash', ['run_backend.sh'], {
  detached: true,
  stdio: 'inherit'
});

// Set up proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // keep /api prefix when forwarding to Flask
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    // If the path is for order confirmation, use fallback handler
    if (req.path.includes('order-confirmation')) {
      console.log('Using fallback handler for order confirmation');
      req.url = req.url.replace('/api', ''); // Remove /api prefix for our local handler
      return paymentHandler(req, res);
    }
    
    res.status(500).json({
      error: 'Proxy error - Flask backend may not be running',
      message: err.message,
      fallback: true
    });
  }
});

// Register fallback payment handler for direct access and when backend is unavailable
app.use(paymentHandler);

// Frontend static files
app.use(express.static(frontendPath));

// API routes are proxied to Flask
app.use('/api', apiProxy);

// For any route not starting with /api, serve the frontend
app.get('*', (req, res) => {
  console.log('🌟 Serving React app root route');
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  
  // Get the service URL
  try {
    const repl_slug = process.env.REPL_SLUG;
    const repl_owner = process.env.REPL_OWNER;
    const repl_id = process.env.REPL_ID;
    
    if (repl_id) {
      const serviceUrl = `${repl_id}-00-nzrxz81n08w.kirk.replit.dev`;
      console.log(`Access your app at: ${serviceUrl}`);
    }
  } catch (error) {
    console.error('Error getting service URL:', error);
  }
});

// Handle termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  if (flaskProcess && !flaskProcess.killed) {
    flaskProcess.kill();
  }
  process.exit(0);
});