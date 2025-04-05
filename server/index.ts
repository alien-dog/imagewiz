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

// Special URL decoding middleware for handling encoded query parameters
app.use((req, res, next) => {
  // Enhanced request logging for payment-related paths
  if (req.url.includes('payment')) {
    console.log('⚡ Payment-related URL detected:', req.originalUrl);
    console.log('⚡ Method:', req.method);
    console.log('⚡ Path:', req.path);
    console.log('⚡ Query:', req.query);
  }
  
  // Special handling for Stripe redirect to payment-verify or order-confirmation
  // Stripe will encode the ? as %3F in the URL when redirecting back
  if (req.originalUrl.includes('/payment-verify%3Fsession_id=')) {
    // Extract the session ID from the encoded URL
    const match = req.originalUrl.match(/payment-verify%3Fsession_id=([^&]+)/);
    if (match && match[1]) {
      const sessionId = match[1];
      console.log('🔄 REDIRECTING: Found encoded payment verification URL with session ID:', sessionId);
      
      // Redirect to the properly formatted URL
      const redirectUrl = `/order-confirmation?session_id=${sessionId}`; // Redirect to new route
      console.log('🔄 Redirecting to order confirmation page with session ID:', redirectUrl);
      return res.redirect(redirectUrl);
    }
  }
  
  // Also handle direct encoded order-confirmation URLs
  if (req.originalUrl.includes('/order-confirmation%3Fsession_id=')) {
    // Extract the session ID from the encoded URL
    const match = req.originalUrl.match(/order-confirmation%3Fsession_id=([^&]+)/);
    if (match && match[1]) {
      const sessionId = match[1];
      console.log('🔄 REDIRECTING: Found encoded order confirmation URL with session ID:', sessionId);
      
      // Redirect to the properly formatted URL
      const redirectUrl = `/order-confirmation?session_id=${sessionId}`;
      console.log('🔄 Redirecting to properly formatted URL:', redirectUrl);
      return res.redirect(redirectUrl);
    }
  }
  
  // Look for common encoding issues in URLs, especially for payment routes
  if (req.url.includes('%3F') || req.url.includes('%3D') || 
      req.url.includes('/payment-verify%3F')) {
    console.log('🔍 Detected URL encoding issues in:', req.url);
    
    try {
      // Try to decode the URL (safely)
      let decodedUrl = req.url;
      try {
        decodedUrl = decodeURIComponent(req.url);
        console.log('🔄 Decoded URL once:', decodedUrl);
        
        // Check if it still has encoded parts
        if (decodedUrl.includes('%')) {
          const doubleDecoded = decodeURIComponent(decodedUrl);
          console.log('🔄 Decoded URL twice:', doubleDecoded);
          decodedUrl = doubleDecoded;
        }
      } catch (e) {
        console.warn('⚠️ Error decoding URL:', e);
      }
      
      // Only replace if different
      if (decodedUrl !== req.url) {
        console.log('✅ Rewrote URL from:', req.url);
        console.log('✅ Rewrote URL to:', decodedUrl);
        req.url = decodedUrl;
      }
    } catch (error) {
      console.error('❌ Error in URL decoding middleware:', error);
    }
  }
  next();
});

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
    
    // IMPORTANT: Ensure success_url uses order-confirmation instead of older paths
    // This ensures our modern polling-based approach is used and prevents redirect loops
    if (req.body && req.body.success_url) {
      // If success_url contains payment-success or payment-verify, replace with order-confirmation
      if (req.body.success_url.includes('/payment-success') || req.body.success_url.includes('/payment-verify')) {
        const originalUrl = req.body.success_url;
        // Replace either payment-success or payment-verify with order-confirmation
        req.body.success_url = req.body.success_url
          .replace('/payment-success', '/order-confirmation')
          .replace('/payment-verify', '/order-confirmation');
        console.log(`⚠️ Fixed success_url to use order confirmation page: ${originalUrl} → ${req.body.success_url}`);
      }
    }
    
    console.log('Request body:', JSON.stringify(req.body));
    
    // This is the correct URL to forward to the Flask backend
    // Make sure to use /payment/create-checkout-session (no /api prefix)
    const url = `http://localhost:${FLASK_PORT}/payment/create-checkout-session`;
    console.log('Forwarding to real checkout endpoint:', url);
    
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

// Express middleware to enhance URL processing and debugging
app.use((req, res, next) => {
  // Log all payment-related requests to help debug
  if (req.path.includes('payment') || req.originalUrl.includes('payment')) {
    console.log('⚡ Payment-related URL detected:', req.originalUrl);
    console.log('⚡ Method:', req.method);
    console.log('⚡ Path:', req.path);
    console.log('⚡ Query:', req.query);
  }
  
  // Only apply special handling to non-API, non-asset routes
  if (!req.path.startsWith('/api') && !req.path.startsWith('/assets')) {
    const originalUrl = req.originalUrl;
    
    // Handle Stripe's encoded query parameter format (? becomes %3F)
    if (originalUrl.includes('payment-verify%3Fsession_id=')) {
      // Extract session ID from the encoded URL
      const match = originalUrl.match(/payment-verify%3Fsession_id=([^&]+)/);
      if (match && match[1]) {
        const sessionId = match[1];
        console.log('🔄 REDIRECTING: Found encoded payment verification URL with session ID:', sessionId);
        
        // Redirect to the order-confirmation page instead of payment-verify
        const fixedUrl = `/order-confirmation?session_id=${sessionId}`;
        console.log('🔄 Redirecting to order confirmation page:', fixedUrl);
        
        // Use 302 (temporary) redirect so browsers don't cache it
        return res.redirect(302, fixedUrl);
      }
    }
    
    // Additional handling for common payment routes - ensure they're served by React
    if (req.path === '/payment-verify' || req.path.startsWith('/payment-verify')) {
      console.log('🔎 Payment verify route detected, ensuring React handles it');
      // Force express to serve the SPA
      return res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
    }
    
    if (req.path === '/order-confirmation' || req.path.startsWith('/order-confirmation')) {
      console.log('🔎 Order confirmation route detected, ensuring React handles it');
      // Force express to serve the SPA
      return res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
    }
    
    if (req.path === '/payment-success' || req.path.startsWith('/payment-success')) {
      console.log('🔎 Payment success route detected, ensuring React handles it');
      // Force express to serve the SPA
      return res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
    }
  }
  
  // Continue to next middleware for all other routes
  next();
});

// EXPLICITLY handle root route to ensure it's ALWAYS served by Express, not forwarded to Flask
app.get('/', (req, res) => {
  console.log('🌟 Serving React app root route');
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Explicitly handle common frontend routes
app.get('/pricing', (req, res) => {
  console.log('🌟 Serving React pricing page');
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

app.get('/dashboard', (req, res) => {
  console.log('🌟 Serving React dashboard page');
  console.log('  Query params:', req.query);
  
  // Always serve the React app's index.html for the dashboard
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Special route for handling redirects from payment success to dashboard
app.get('/dashboard/:via?', (req, res) => {
  console.log(`🌟 Serving React dashboard page via ${req.params.via || 'direct'} route`);
  console.log('  Query params:', req.query);
  
  // Always serve the React app's index.html
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

app.get('/login', (req, res) => {
  console.log('🌟 Serving React login page');
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

app.get('/register', (req, res) => {
  console.log('🌟 Serving React register page');
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

app.get('/checkout', (req, res) => {
  console.log('🌟 Serving React checkout page');
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

app.get('/order-confirmation', (req, res) => {
  console.log('🌟 Serving React order confirmation page - explicit route');
  console.log('  Query params:', req.query);
  
  // Log specifically to help diagnose the issue
  console.log('🔎 Order confirmation route detected, ensuring React handles it');
  
  // Make sure we send the React app's index.html for this route
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Direct route from Stripe checkout that bypasses Flask completely
app.get('/payment-success-direct', (req, res) => {
  console.log('🌟 Direct Stripe payment success callback received');
  console.log('  Query params:', req.query);
  
  const sessionId = req.query.session_id;
  if (sessionId) {
    console.log('✅ Success! Stripe directly redirected with session_id:', sessionId);
    
    // Simply serve the React payment-success page directly, no redirects
    console.log(`Serving payment success page with session_id: ${sessionId}`);
    return res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
  } else {
    console.log('❌ Error: No session_id in direct payment success route');
    return res.redirect('/dashboard');
  }
});

// Legacy route - keep for backward compatibility
app.get('/payment-success-express', (req, res) => {
  console.log('🌟 Legacy route: payment-success-express - redirecting to direct route');
  console.log('  Query params:', req.query);
  
  const sessionId = req.query.session_id;
  if (sessionId) {
    // Redirect to the direct route to avoid any Flask interaction
    const redirectUrl = `/payment-success-direct?session_id=${sessionId}`;
    console.log(`Redirecting to direct route: ${redirectUrl}`);
    
    return res.redirect(redirectUrl);
  } else {
    console.log('❌ Error: No session_id in payment-success-express route');
    return res.redirect('/dashboard');
  }
});

// Handle payment verification with or without query params
app.get('/payment-verify', (req, res) => {
  console.log('🌟 Serving React payment verify page');
  console.log('  Query params:', req.query);
  
  // This page handles Stripe payment verification via polling the backend API
  // No redirects needed - just serve the SPA page
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Also explicitly handle the URL with encoded query params (safety measure)
app.get('/payment-verify*', (req, res) => {
  console.log('🌟 Intercepting payment-verify wildcard route for redirection');
  console.log('  Original URL:', req.originalUrl);
  console.log('  Path:', req.path);
  console.log('  Query params:', req.query);
  
  // Redirect to order-confirmation with the same parameters
  if (req.query.session_id) {
    const redirectUrl = `/order-confirmation?session_id=${req.query.session_id}&t=${Date.now()}`;
    console.log(`🔄 Redirecting payment-verify to order-confirmation: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  } else if (req.query.payment_intent) {
    const redirectUrl = `/order-confirmation?payment_intent=${req.query.payment_intent}&t=${Date.now()}`;
    console.log(`🔄 Redirecting payment-verify to order-confirmation: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  } else {
    console.log(`ℹ️ Payment-verify without identifiers - redirecting to generic order confirmation`);
    return res.redirect('/order-confirmation');
  }
});

// Also explicitly handle the URL with encoded query params for order-confirmation
app.get('/order-confirmation*', (req, res) => {
  console.log('🌟 Serving React order confirmation page (wildcard route)');
  console.log('  Original URL:', req.originalUrl);
  console.log('  Path:', req.path);
  console.log('  Query params:', req.query);
  
  // Ensure the SPA is served regardless of URL encoding
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Handle Stripe redirects where :3000 has been added to the URL
app.get('/:3000/order-confirmation*', (req, res) => {
  console.log('⚠️ Detected order confirmation with inappropriate :3000 prefix');
  const originalUrl = req.originalUrl;
  const correctedUrl = originalUrl.replace('/:3000', '');
  
  console.log(`  Redirecting from ${originalUrl} to ${correctedUrl}`);
  res.redirect(302, correctedUrl);
});

// Handle the specific encoded query case for Stripe redirects
app.get('/payment-verify%3Fsession_id=*', (req, res) => {
  console.log('🔄 Detected Stripe redirect with encoded URL format');
  const originalUrl = req.originalUrl;
  
  // Extract the session ID from the encoded URL
  const sessionIdMatch = originalUrl.match(/payment-verify%3Fsession_id=([^&]+)/);
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : 'unknown';
  
  console.log('  Extracted session ID:', sessionId);
  
  // Redirect to the order-confirmation page
  const redirectUrl = `/order-confirmation?session_id=${sessionId}`;
  console.log('  Redirecting to order confirmation page:', redirectUrl);
  
  res.redirect(302, redirectUrl);
});

// Handle the specific encoded query case for Stripe redirects to order-confirmation
app.get('/order-confirmation%3Fsession_id=*', (req, res) => {
  console.log('🔄 Detected Stripe redirect with encoded URL format to order-confirmation');
  const originalUrl = req.originalUrl;
  
  // Extract the session ID from the encoded URL
  const sessionIdMatch = originalUrl.match(/order-confirmation%3Fsession_id=([^&]+)/);
  const sessionId = sessionIdMatch ? sessionIdMatch[1] : 'unknown';
  
  console.log('  Extracted session ID:', sessionId);
  
  // Redirect to the correctly formatted URL
  const redirectUrl = `/order-confirmation?session_id=${sessionId}`;
  console.log('  Redirecting to:', redirectUrl);
  
  res.redirect(302, redirectUrl);
});

// Special handling for the common encoding error with %3F (encoded ?)
app.get('/payment-verify%3Fsession_id=:sessionId', (req, res) => {
  console.log('🔄 Detected payment-verify with encoded session ID in URL parameter');
  console.log('  Session ID from URL parameter:', req.params.sessionId);
  
  // Redirect to the order-confirmation page instead
  const redirectUrl = `/order-confirmation?session_id=${req.params.sessionId}`;
  console.log('  Redirecting to order confirmation page:', redirectUrl);
  
  // Use 302 (temporary) redirect
  res.redirect(302, redirectUrl);
});

// Special handling for the common encoding error with %3F (encoded ?) for order-confirmation
app.get('/order-confirmation%3Fsession_id=:sessionId', (req, res) => {
  console.log('🌟 Serving React order confirmation page (encoded URL special case)');
  console.log('  Session ID from URL parameter:', req.params.sessionId);
  
  // Send the SPA page so client-side routing can take over
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

app.get('/payment-success', (req, res) => {
  console.log('🌟 Intercepting payment-success route for redirection');
  console.log('  Query params:', req.query);
  
  // Redirect to order-confirmation with the same parameters
  if (req.query.session_id) {
    const redirectUrl = `/order-confirmation?session_id=${req.query.session_id}&t=${Date.now()}`;
    console.log(`🔄 Redirecting payment-success to order-confirmation: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  } else if (req.query.payment_intent) {
    const redirectUrl = `/order-confirmation?payment_intent=${req.query.payment_intent}&t=${Date.now()}`;
    console.log(`🔄 Redirecting payment-success to order-confirmation: ${redirectUrl}`);
    return res.redirect(redirectUrl);
  } else {
    console.log(`ℹ️ Payment-success without identifiers - redirecting to generic order confirmation`);
    return res.redirect('/order-confirmation');
  }
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

// New test file for order confirmation page
app.get('/test-order-confirmation.html', (req, res) => {
  console.log('Serving test order confirmation HTML file');
  res.sendFile(path.join(__dirname, '../test-order-confirmation.html'));
});

// STEP 3: BACKEND API PROXYING - Must come AFTER frontend routes
//==========================================================================

// Special webhook handling route - must be before general API proxy
// This route is specifically designed to handle Stripe webhook requests
app.post('/api/payment/webhook', async (req, res) => {
  console.log('⚡ Handling Stripe webhook request');
  
  // Preserve the raw body for webhook signature verification
  const rawBody = JSON.stringify(req.body);
  const signature = req.headers['stripe-signature'];
  
  if (!signature) {
    console.log('❌ Missing Stripe-Signature header in webhook request');
  } else {
    console.log('✅ Stripe-Signature header present:', typeof signature === 'string' ? signature : signature[0]);
  }
  
  try {
    // Forward the webhook directly to Flask
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Safely add the Stripe signature if present
    if (signature) {
      headers['Stripe-Signature'] = typeof signature === 'string' ? signature : signature[0];
    }
    
    const response = await fetch(`http://localhost:${FLASK_PORT}/payment/webhook`, {
      method: 'POST',
      headers,
      body: rawBody
    });
    
    console.log(`Webhook forwarded to Flask, response status: ${response.status}`);
    
    // Get response text
    const responseText = await response.text();
    console.log('Webhook response from Flask:', responseText);
    
    // Return the same status and response from Flask
    res.status(response.status).send(responseText);
  } catch (error) {
    console.error('Error forwarding webhook to Flask:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Add a manual proxy endpoint for payment verification with query parameters
app.get('/api/payment/verify', async (req, res) => {
  console.log('✅ Manual proxy: Received verify payment request with query params:', req.query);
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ Error: No authorization header provided');
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    
    const sessionId = req.query.session_id;
    if (!sessionId) {
      console.log('❌ Error: No session_id provided in query parameters');
      return res.status(400).json({ error: 'No session_id provided' });
    }
    
    console.log('Manual proxy: Forwarding verify payment request with auth header:', authHeader.substring(0, 20) + '...');
    

    
    // URL to forward to the Flask backend for real Stripe verification
    const url = `http://localhost:${FLASK_PORT}/payment/verify?session_id=${sessionId}`;
    console.log('Forwarding to real payment verification endpoint:', url);
    
    // Make the request to the Flask backend
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
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
        console.log('✅ Manual proxy: Payment verification response received:', JSON.stringify(data, null, 2));
        
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
    console.error('❌ Manual proxy: Error forwarding payment verification request', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: error.stack
    });
  }
});

// Add a manual proxy endpoint for payment verification by session_id
app.get('/api/payment/verify-session/:sessionId', async (req, res) => {
  console.log('✅ Manual proxy: Received verify-session request for session:', req.params.sessionId);
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log('❌ Error: No authorization header provided');
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    
    console.log('Manual proxy: Forwarding verify session request with auth header:', authHeader.substring(0, 20) + '...');
    
    // URL to forward to the Flask backend
    const url = `http://localhost:${FLASK_PORT}/payment/verify/${req.params.sessionId}`;
    console.log('Forwarding to:', url);
    
    // Make the request to the Flask backend
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        }
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
        console.log('✅ Manual proxy: Verify session response received:', JSON.stringify(data, null, 2));
        
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
    console.error('❌ Manual proxy: Error forwarding verify session request', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      stack: error.stack
    });
  }
});

// Proxy API requests (except manually handled ones) to Flask backend
app.use('/api', createProxyMiddleware({
  target: `http://localhost:${FLASK_PORT}`,
  changeOrigin: true,
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
  
  // Improved special handling for payment routes and order confirmation
  if (req.path === '/payment-success' || req.path === '/payment-failure' || 
      req.path === '/payment-verify' || req.path === '/order-confirmation' ||
      req.path === '/undefined' || req.path.startsWith('/payment')) {
    
    // Special debug logging for payment-verify and order-confirmation routes
    if (req.path === '/payment-verify') {
      console.log(`⚠️ Detected ${req.path} route with query params:`, req.query);
      
      // Redirect payment-verify to order-confirmation for consistency
      if (req.query.session_id) {
        const redirectUrl = `/order-confirmation?session_id=${req.query.session_id}&t=${Date.now()}`;
        console.log(`🔄 Redirecting payment-verify to order-confirmation page: ${redirectUrl}`);
        return res.redirect(redirectUrl);
      } else {
        console.log(`ℹ️ Payment-verify without session_id - redirecting to generic order confirmation`);
        return res.redirect('/order-confirmation');
      }
    } 
    else if (req.path === '/order-confirmation') {
      console.log(`⚠️ Detected ${req.path} route with query params:`, req.query);
      
      // If we have a session_id, this is likely a redirect from Stripe
      if (req.query.session_id) {
        console.log(`✅ Stripe redirect with session_id detected: ${req.query.session_id}`);
      }
    }
    
    // Check for payment-success route and redirect to order-confirmation
    if (req.path === '/payment-success') {
      console.log(`⚠️ Catch-all detected /payment-success request with query:`, req.query);
      
      // Always redirect payment-success to order-confirmation for consistency
      if (req.query.session_id) {
        const redirectUrl = `/order-confirmation?session_id=${req.query.session_id}&t=${Date.now()}`;
        console.log(`🔄 Redirecting old payment-success to new order-confirmation page: ${redirectUrl}`);
        return res.redirect(redirectUrl);
      } else if (req.query.payment_intent) {
        const redirectUrl = `/order-confirmation?payment_intent=${req.query.payment_intent}&t=${Date.now()}`;
        console.log(`🔄 Redirecting old payment-success to new order-confirmation page: ${redirectUrl}`);
        return res.redirect(redirectUrl);
      } else {
        console.log(`ℹ️ Payment-success without identifiers - redirecting to generic order confirmation`);
        return res.redirect('/order-confirmation');
      }
    } else {
      console.log(`⚠️ Handling special frontend route: ${req.path} → serving index.html`);
    }
    
    if (req.path === '/undefined') {
      console.warn(`
!!! IMPORTANT: Redirect to /undefined detected !!!
This usually happens when a URL parameter is not properly defined in a redirect.
Check that your success_url and cancel_url parameters in Stripe checkout are correct.
      `);
    }
  }
  
  // Always serve the SPA for any route not explicitly handled
  res.sendFile(path.join(FRONTEND_DIST_PATH, 'index.html'));
});

// Start the server and bind to all interfaces (0.0.0.0) to make it accessible externally
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
  console.log(`Access your app at: ${process.env.REPLIT_DOMAINS || `localhost:${PORT}`}`);
});