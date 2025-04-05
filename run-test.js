/**
 * Standalone test server for order confirmation flow testing
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

// Tell Express to serve static files from the frontend/dist directory
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// Serve the test HTML directly
app.get('/test-order-confirmation.html', (req, res) => {
  console.log('🧪 Serving test order confirmation HTML file');
  console.log('  Query params:', req.query);
  
  // Send the HTML file
  res.sendFile(path.join(__dirname, 'frontend/dist/test-order-confirmation.html'));
});

// Add special handling for API calls
app.use('/api/order-confirmation', (req, res) => {
  console.log('Received API call to /api/order-confirmation with params:', req.query);
  
  // Respond with test data
  const packageId = req.query.package_id || 'lite_monthly';
  const price = parseFloat(req.query.price || '9.90');
  const credits = parseInt(req.query.credits || '50');
  const isYearly = req.query.is_yearly === 'true';
  
  res.json({
    status: 'success',
    message: 'Order processed successfully (test server response)',
    package_name: `${packageId.split('_')[0].charAt(0).toUpperCase() + packageId.split('_')[0].slice(1)} ${isYearly ? 'Annual' : 'Monthly'}`,
    amount_paid: price,
    credits_added: credits,
    is_yearly: isYearly,
    new_balance: credits,
    session_id: req.query.session_id || 'test_session',
    timestamp: new Date().toISOString(),
    test_mode: true
  });
});

// Special SPA route handler for React
app.get('/order-confirmation', (req, res) => {
  console.log('Serving order confirmation page with params:', req.query);
  
  // Inject session ID and other data for client-side processing
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - iMagenWiz</title>
  <style>
    body {
      font-family: 'Helvetica Neue', sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    h1, h2 {
      color: #2E86C1;
    }
    .success-icon {
      color: #28a745;
      font-size: 48px;
      margin-bottom: 20px;
    }
    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 20px 0;
    }
    .details div {
      padding: 10px;
      background: #f1f8fe;
      border-radius: 4px;
    }
    .details strong {
      display: block;
      margin-bottom: 5px;
      color: #2E86C1;
    }
    .btn {
      display: inline-block;
      background-color: #2E86C1;
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div style="text-align: center;">
      <div class="success-icon">✓</div>
      <h1>Payment Successful!</h1>
      <p>Thank you for your purchase. Your account has been credited.</p>
    </div>
    
    <div class="details">
      <div>
        <strong>Package</strong>
        <span>${req.query.package_id ? 
          (req.query.package_id.split('_')[0].charAt(0).toUpperCase() + 
           req.query.package_id.split('_')[0].slice(1) + ' ' +
           (req.query.is_yearly === 'true' ? 'Annual' : 'Monthly')) : 
          'Credit Package'}</span>
      </div>
      <div>
        <strong>Amount Paid</strong>
        <span>$${req.query.price || '9.90'}</span>
      </div>
      <div>
        <strong>Credits Added</strong>
        <span>${req.query.credits || '50'}</span>
      </div>
      <div>
        <strong>New Balance</strong>
        <span>${req.query.credits || '50'}</span>
      </div>
      <div>
        <strong>Transaction ID</strong>
        <span>${req.query.session_id || 'test_session'}</span>
      </div>
      <div>
        <strong>Date</strong>
        <span>${new Date().toLocaleDateString()}</span>
      </div>
    </div>
    
    <div style="text-align: center;">
      <a href="/" class="btn">Return to Dashboard</a>
    </div>
  </div>
  
  <div class="card">
    <h2>What's Next?</h2>
    <p>You can now use your credits to process images. Here's how to get started:</p>
    <ol>
      <li>Upload an image from your dashboard</li>
      <li>Wait a few seconds for processing</li>
      <li>Download your image with the background removed</li>
    </ol>
    <p>If you have any questions, please contact our support team.</p>
  </div>
</body>
</html>
  `;
  
  res.send(html);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running at http://0.0.0.0:${PORT}`);
  console.log(`Access your test app from your Replit URL with port ${PORT}`);
});