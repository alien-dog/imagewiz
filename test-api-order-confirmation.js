/**
 * Simple script to test the order confirmation API endpoint
 */
const axios = require('axios');

// Helper to generate random Stripe-like session IDs for testing
function generateSessionId() {
  return 'cs_test_' + Math.random().toString(36).substring(2, 15);
}

// Test the order confirmation API endpoint
async function testOrderConfirmationApi() {
  console.log('====== TESTING ORDER CONFIRMATION API ENDPOINT ======');
  
  // Generate a test session ID
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing API order confirmation endpoint with session ID: ${sessionId}`);
    const response = await axios.get(`http://localhost:3000/api/order-confirmation?session_id=${sessionId}`);
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error during API order confirmation test:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testOrderConfirmationApi();