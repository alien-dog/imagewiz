/**
 * Simple standalone server for testing order confirmation with fallbacks
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

console.log('Starting Express test server');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Find the test HTML file
const testHtmlPath = path.join(__dirname, 'test-order-confirmation.html');
const frontendPath = path.join(__dirname, 'frontend', 'dist');

// Log file existence checks
console.log(`Test HTML exists: ${fs.existsSync(testHtmlPath)}`);
console.log(`Frontend path exists: ${fs.existsSync(frontendPath)}`);

// Mock packages data
const packages = [
  {
    id: 'lite_monthly',
    name: 'Lite Monthly',
    price: 9.90,
    credits: 50,
    is_yearly: false,
    stripe_price_id: 'price_1QIA8yAGgrMJnivhbqEgzPCx'
  },
  {
    id: 'lite_yearly',
    name: 'Lite Annual',
    price: 106.80,
    credits: 600,
    is_yearly: true,
    stripe_price_id: 'price_1QIA8yAGgrMJnivhKTBJHjP9'
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: 24.90,
    credits: 150,
    is_yearly: false,
    stripe_price_id: 'price_1QIAAnAGgrMJnivhkSDhFFsD'
  },
  {
    id: 'pro_yearly',
    name: 'Pro Annual',
    price: 262.80,
    credits: 1800,
    is_yearly: true,
    stripe_price_id: 'price_1QIAAnAGgrMJnivhCL2VYPNH'
  }
];

// Process order confirmation requests
app.get('/order-confirmation', (req, res) => {
  const sessionId = req.query.session_id;
  const packageId = req.query.package_id || 'lite_monthly';
  const directMode = req.query.direct === 'true';
  const inRedirectFix = req.query.in_redirect_fix === 'true';
  
  console.log(`[EXPRESS] 📝 Order confirmation request received`);
  console.log(`  session_id: ${sessionId}`);
  console.log(`  package_id: ${packageId}`);
  console.log(`  direct: ${directMode}`);
  console.log(`  in_redirect_fix: ${inRedirectFix}`);
  
  // Get package details
  const packageInfo = packages.find(pkg => pkg.id === packageId) || packages[0];
  
  // Create a mock successful response
  const responseData = {
    status: 'success',
    message: 'Your payment was successful and credits have been added to your account.',
    package_name: packageInfo.name,
    amount_paid: packageInfo.price,
    credits_added: packageInfo.credits,
    new_balance: packageInfo.credits,
    mock_response: true,
    note: 'This is a fallback response for testing'
  };
  
  res.json(responseData);
});

// Mock API endpoint for testing order confirmation
app.get('/api/order-confirmation', (req, res) => {
  const sessionId = req.query.session_id;
  const packageId = req.query.package_id || 'lite_monthly';
  const directMode = req.query.direct === 'true';
  const inRedirectFix = req.query.in_redirect_fix === 'true';
  
  console.log(`[EXPRESS] 📝 API order confirmation request received`);
  console.log(`  session_id: ${sessionId}`);
  console.log(`  package_id: ${packageId}`);
  console.log(`  direct: ${directMode}`);
  console.log(`  in_redirect_fix: ${inRedirectFix}`);
  
  // Get package details
  const packageInfo = packages.find(pkg => pkg.id === packageId) || packages[0];
  
  // Create a mock successful response
  const responseData = {
    status: 'success',
    message: 'Your payment was successful and credits have been added to your account.',
    package_name: packageInfo.name,
    amount_paid: packageInfo.price,
    credits_added: packageInfo.credits,
    new_balance: packageInfo.credits,
    mock_response: true,
    note: 'This is a fallback API response for testing'
  };
  
  res.json(responseData);
});

// Frontend static files
if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log(`Serving static files from: ${frontendPath}`);
}

// For any route not handled above, serve the test page
app.get('*', (req, res) => {
  console.log(`📝 GET request to: ${req.url}`);
  
  // Try to serve the test page
  if (fs.existsSync(testHtmlPath)) {
    res.sendFile(testHtmlPath);
  } else {
    res.send(`
      <html>
        <body>
          <h1>Test Server Running</h1>
          <p>Please create a test-order-confirmation.html file in the root directory.</p>
          <p>Current time: ${new Date().toISOString()}</p>
        </body>
      </html>
    `);
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:${PORT}`);
  
  // Get the service URL
  try {
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
  server.close();
  process.exit(0);
});