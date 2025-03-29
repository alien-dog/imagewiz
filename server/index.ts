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

// Proxy API requests to Flask backend
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${FLASK_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api'
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

// Serve test HTML file
app.get('/test-login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-login.html'));
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