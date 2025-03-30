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

// Capture any direct requests to payment endpoints (which should go through the proxy)
app.all('/payment/*', (req, res) => {
  console.log('⚠️ DIRECT ACCESS ATTEMPT: Client tried to access backend directly at:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('This request should go through the /api proxy instead');
  
  // For POST to /payment/create-checkout-session, we'll proxy it properly
  if (req.method === 'POST' && (req.url === '/payment/create-checkout-session' || req.url === '/payment/create-checkout')) {
    console.log('⚠️ WARNING: Direct access to create-checkout-session endpoint - will forward anyway');
    // Forward to the /api/payment/create-checkout-session endpoint handler
    return app._router.handle(Object.assign({}, req, {
      url: '/api/payment/create-checkout-session',
      originalUrl: '/api/payment/create-checkout-session',
      baseUrl: '/api'
    }), res, () => {});
  }
  
  // Return a helpful error message for other endpoints
  return res.status(404).json({
    error: 'Incorrect URL path',
    message: 'Please use the /api prefix for all API requests',
    correctPath: `/api${req.url}`
  });
});

// Add a manual proxy endpoint for payment checkout
app.post('/api/payment/create-checkout-session', async (req, res) => {
  console.log('✅ Manual proxy: Received create-checkout-session request');
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ Error: No authorization header provided');
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    
    console.log('Manual proxy: Forwarding checkout request with auth header:', authHeader.substring(0, 20) + '...');
    console.log('Request body:', JSON.stringify(req.body));
    
    // This is the correct URL to forward to the Flask backend
    // Make sure to use /payment/create-checkout-session (no /api prefix)
    const url = `http://localhost:${FLASK_PORT}/payment/create-checkout-session`;
    console.log('Forwarding to:', url);
    
    // Make the request to the Flask backend
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body),
      });
      
      // Log the raw response status
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error(`❌ Manual proxy: Flask server returned ${response.status} ${response.statusText}`);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return res.status(response.status).json({ 
          error: 'Backend server error',
          status: response.status,
          details: errorText
        });
      }
      
      const data = await response.json();
      console.log('✅ Manual proxy: Checkout response received:', data);
      res.status(response.status).json(data);
    } catch (fetchError: any) {
      // Specific error handling for the fetch request
      console.error('❌ Manual proxy: Fetch error:', fetchError.message);
      if (fetchError.cause) {
        console.error('Cause:', fetchError.cause.code, fetchError.cause.message);
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('❌ Manual proxy: Error forwarding checkout request', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: error.stack
    });
  }
});

// Make sure to serve frontend routes first before API proxying

// Root route explicit handler - This ensures the React app loads properly at the root URL
app.get('/', (req, res) => {
  console.log('Serving React app root route');
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Serve static files from the frontend build
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

app.get('/test-stripe-redirect.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-stripe-redirect.html'));
});

app.get('/test-stripe-open.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../test-stripe-open.html'));
});

// Now set up the API proxy after frontend routes
// Proxy API requests to Flask backend (except login and payment/create-checkout-session which we handle manually)
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
    
    // For debugging authorization headers
    const authHeader = req.headers.authorization;
    if (authHeader) {
      console.log('Authorization header found:', authHeader.substring(0, 20) + '...');
      // Add authorization header to proxy request
      proxyReq.setHeader('Authorization', authHeader);
    } else {
      console.log('No authorization header found');
    }
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

// No duplicate needed - already defined above

// Catch-all route for SPA - handle all frontend routes
app.get('*', (req, res) => {
  try {
    console.log(`Serving SPA route: ${req.path}`);
    
    // Special handling for payment success/failure routes to ensure they don't get confused
    // with backend routes
    if (req.path === '/payment-success' || req.path === '/payment-failure' || 
        req.path === '/undefined' || req.path.startsWith('/payment')) {
      console.log(`Handling special frontend route: ${req.path} -> serving index.html`);
      
      // For /undefined, also log a detailed warning to help debug
      if (req.path === '/undefined') {
        console.warn(`
!!! IMPORTANT: Redirect to /undefined detected !!!
This usually happens when a URL parameter is not properly defined in a redirect.
Check that your success_url and cancel_url parameters in Stripe checkout are correct.
The current request will be handled by returning index.html to avoid a 404,
but you should fix the underlying issue.
        `);
      }
    }
    
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