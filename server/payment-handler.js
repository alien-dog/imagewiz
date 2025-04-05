/**
 * Mock payment handler for local testing
 * This provides a fallback when the Flask backend is unreachable
 */
const { Router } = require('express');

const router = Router();

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

// Order confirmation handler with fallback for database connection issues
router.get('/order-confirmation', (req, res) => {
  const sessionId = req.query.session_id;
  const packageId = req.query.package_id || 'lite_monthly';
  const directMode = req.query.direct === 'true';
  const inRedirectFix = req.query.in_redirect_fix === 'true';
  
  console.log(`[EXPRESS FALLBACK] 📝 Order confirmation request received`);
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
    note: 'This is a fallback response due to database connection issues'
  };
  
  res.json(responseData);
});

// Mock API endpoint for testing order confirmation
router.get('/api/order-confirmation', (req, res) => {
  const sessionId = req.query.session_id;
  const packageId = req.query.package_id || 'lite_monthly';
  const directMode = req.query.direct === 'true';
  const inRedirectFix = req.query.in_redirect_fix === 'true';
  
  console.log(`[EXPRESS FALLBACK] 📝 API order confirmation request received`);
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
    note: 'This is a fallback API response due to database connection issues'
  };
  
  res.json(responseData);
});

module.exports = router;