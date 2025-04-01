// This is a proxy server that forwards API requests to the Flask backend
// and serves the React frontend for all other routes
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const FLASK_PORT: number = 5000;

// Define the frontend dist path - check all potential locations
import fs from 'fs';

console.log('Starting Express server with frontend static files');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Try multiple possible frontend dist paths
const possiblePaths = [
  path.join(__dirname, '../frontend/dist'),
  path.join(__dirname, '../client/dist'),
  path.join(process.cwd(), 'frontend/dist'),
  path.join(process.cwd(), 'client/dist')
];

console.log('Checking for frontend build directories:');
let FRONTEND_DIST_PATH = possiblePaths[0]; // Default
let foundValidPath = false;

for (const pathToCheck of possiblePaths) {
  console.log(`- Checking: ${pathToCheck}`);
  if (fs.existsSync(pathToCheck)) {
    try {
      // Also verify index.html exists in this folder
      if (fs.existsSync(path.join(pathToCheck, 'index.html'))) {
        console.log(`✅ Found valid frontend path with index.html: ${pathToCheck}`);
        FRONTEND_DIST_PATH = pathToCheck;
        foundValidPath = true;
        break;
      } else {
        console.log(`❌ Directory exists but no index.html found in: ${pathToCheck}`);
      }
    } catch (err) {
      console.error(`Error checking path ${pathToCheck}:`, err);
    }
  } else {
    console.log(`❌ Directory not found: ${pathToCheck}`);
  }
}

if (!foundValidPath) {
  console.error('⚠️ WARNING: No valid frontend build directory found!');
  console.error('The frontend will not be served correctly.');
} else {
  console.log(`Using frontend path: ${FRONTEND_DIST_PATH}`);
  // List files in the chosen directory
  try {
    const files = fs.readdirSync(FRONTEND_DIST_PATH);
    console.log(`Files in ${FRONTEND_DIST_PATH}:`, files);
  } catch (err) {
    console.error(`Error listing files in ${FRONTEND_DIST_PATH}:`, err);
  }
}

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
      
      try {
        const data = await response.json();
        console.log('✅ Manual proxy: Checkout response received:', JSON.stringify(data, null, 2));
        
        // CRITICAL FIX: Ensure we have the URL in the response
        if (!data.url) {
          console.error('❌ ERROR: Stripe checkout session created but no URL returned');
          return res.status(500).json({
            error: 'Stripe checkout URL missing',
            message: 'The payment session was created but no URL was returned',
            data: data 
          });
        }
        
        // Success! Return the response with URL to the client
        console.log('✅ SUCCESS: Returning Stripe checkout URL to client:', data.url);
        return res.status(response.status).json(data);
      } catch (jsonError: any) {
        console.error('❌ Manual proxy: Error parsing JSON response:', jsonError.message);
        const rawText = await response.text();
        console.error('Raw response text:', rawText.substring(0, 500) + (rawText.length > 500 ? '...' : ''));
        throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
      }
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

// Add a manual proxy endpoint for payment intent
app.post('/api/payment/create-payment-intent', async (req, res) => {
  console.log('✅ Manual proxy: Received create-payment-intent request');
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ Error: No authorization header provided');
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    
    console.log('Manual proxy: Forwarding payment intent request with auth header:', authHeader.substring(0, 20) + '...');
    console.log('Request body:', JSON.stringify(req.body));
    
    // URL to forward to the Flask backend
    const url = `http://localhost:${FLASK_PORT}/payment/create-payment-intent`;
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
      
      try {
        const data = await response.json();
        console.log('✅ Manual proxy: Payment intent response received:', JSON.stringify(data, null, 2));
        
        // Success! Return the response to the client
        return res.status(response.status).json(data);
      } catch (jsonError: any) {
        console.error('❌ Manual proxy: Error parsing JSON response:', jsonError.message);
        const rawText = await response.text();
        console.error('Raw response text:', rawText.substring(0, 500) + (rawText.length > 500 ? '...' : ''));
        throw new Error(`Failed to parse JSON response: ${jsonError.message}`);
      }
    } catch (fetchError: any) {
      // Specific error handling for the fetch request
      console.error('❌ Manual proxy: Fetch error:', fetchError.message);
      if (fetchError.cause) {
        console.error('Cause:', fetchError.cause.code, fetchError.cause.message);
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('❌ Manual proxy: Error forwarding payment intent request', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: error.stack
    });
  }
});

//==========================================================================
// SERVER CONFIGURATION - ROUTE ORDER IS IMPORTANT
//==========================================================================

// STEP 1: START FLASK BACKEND (before setting up routes so it's available when needed)
//==========================================================================
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

// STEP 2: FRONTEND ROUTES - Must come BEFORE API routes
//==========================================================================

// EXPLICITLY handle root route to ensure it's ALWAYS served by Express, not forwarded to Flask
app.get('/', (req, res) => {
  console.log('🌟 Serving React app root route');
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Serve static files from the frontend build directory
app.use(express.static(FRONTEND_DIST_PATH));

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

// STEP 3: BACKEND API PROXYING - Must come AFTER frontend routes
//==========================================================================

// Proxy API requests (except manually handled ones) to Flask backend
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${FLASK_PORT}`,
  changeOrigin: true,
  pathRewrite: {
    '^/api': ''  // Remove '/api' prefix when forwarding
  },
  // @ts-ignore - logLevel is a valid option but TypeScript doesn't recognize it
  logLevel: 'debug',
  onProxyReq: (proxyReq: any, req: any, res: any) => {
    console.log(`🔄 Proxying API request: ${req.method} ${req.url} to Flask backend`);
    console.log(`Target URL: ${proxyReq.path}`);
    
    // Forward authorization headers
    const authHeader = req.headers.authorization;
    if (authHeader) {
      console.log('Authorization header found:', authHeader.substring(0, 20) + '...');
      proxyReq.setHeader('Authorization', authHeader);
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

// STEP 4: CATCH-ALL ROUTE - Must be LAST route defined
//==========================================================================
app.get('*', (req, res) => {
  console.log(`🌐 Serving SPA route: ${req.path}`);
  
  // Special handling for payment routes
  if (req.path === '/payment-success' || req.path === '/payment-failure' || 
      req.path === '/undefined' || req.path.startsWith('/payment')) {
    console.log(`⚠️ Handling special frontend route: ${req.path} → serving index.html`);
    
    if (req.path === '/undefined') {
      console.warn(`
!!! IMPORTANT: Redirect to /undefined detected !!!
This usually happens when a URL parameter is not properly defined in a redirect.
Check that your success_url and cancel_url parameters in Stripe checkout are correct.
      `);
    }
  }
  
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Start the server and bind to all interfaces (0.0.0.0) to make it accessible externally
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Access your app at: ${process.env.REPLIT_DOMAINS || `localhost:${PORT}`}`);
});