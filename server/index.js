const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Proxy API requests to Flask backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '' // Remove /api prefix when forwarding
  }
}));

// Proxy static file requests to Flask for uploaded/processed images
app.use('/static', createProxyMiddleware({
  target: 'http://localhost:5000',
  changeOrigin: true
}));

// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from Vite build
  app.use(express.static(path.join(__dirname, '../dist')));
  
  // Send all other requests to the frontend SPA
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Node.js proxy server running on port ${PORT}`);
  console.log(`Proxying API requests to Flask backend at http://localhost:5000`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode - serving frontend static assets');
  } else {
    console.log('Running in development mode - frontend served by Vite dev server');
  }
});