/**
 * Test script for the order confirmation API endpoint
 * This script tests both regular and test modes to ensure the API behaves correctly
 */
const axios = require('axios');

// Helper to generate random Stripe-like session IDs for testing
function generateSessionId() {
  return 'cs_test_' + Math.random().toString(36).substring(2, 15);
}

// Test all package combinations
async function testAllPackages() {
  console.log('\n====== TESTING ALL PACKAGE COMBINATIONS =======');
  
  const packages = [
    { id: 'lite_monthly', price: 9.90, credits: 50, is_yearly: false, name: 'Lite Monthly' },
    { id: 'lite_yearly', price: 106.80, credits: 600, is_yearly: true, name: 'Lite Yearly' },
    { id: 'pro_monthly', price: 24.90, credits: 150, is_yearly: false, name: 'Pro Monthly' },
    { id: 'pro_yearly', price: 262.80, credits: 1800, is_yearly: true, name: 'Pro Yearly' }
  ];
  
  for (const pkg of packages) {
    console.log(`\n----- Testing ${pkg.name} -----`);
    await testPackage(pkg.id, pkg.price, pkg.credits, pkg.is_yearly);
  }
}

// Test a specific package
async function testPackage(packageId, price, credits, isYearly) {
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing package: ${packageId} with session ID: ${sessionId}`);
    const url = `http://localhost:3000/api/order-confirmation?session_id=${sessionId}&package_id=${packageId}&price=${price}&credits=${credits}&is_yearly=${isYearly}`;
    
    console.log(`Request URL: ${url}`);
    const response = await axios.get(url);
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Check if the response contains the expected values
    const data = response.data;
    if (data.status === 'success') {
      console.log('✅ Success response received');
      
      if (data.credits_added === credits) {
        console.log(`✅ Credits match: ${data.credits_added}`);
      } else {
        console.log(`❌ Credits mismatch: expected ${credits}, got ${data.credits_added}`);
      }
      
      if (Math.abs(data.amount_paid - price) < 0.01) {
        console.log(`✅ Price matches: ${data.amount_paid}`);
      } else {
        console.log(`❌ Price mismatch: expected ${price}, got ${data.amount_paid}`);
      }
    } else {
      console.log(`❌ Error in response: ${data.message || data.error || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error during test:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test a direct API call without any test parameters (should validate session with Stripe)
async function testDirect() {
  console.log('\n====== TESTING DIRECT API CALL =======');
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing direct API call with session ID: ${sessionId}`);
    const response = await axios.get(`http://localhost:3000/api/order-confirmation?session_id=${sessionId}`);
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error during direct test:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Main test function
async function runTests() {
  console.log('====== ORDER CONFIRMATION API TEST SCRIPT ======');
  
  // First test all package combinations
  await testAllPackages();
  
  // Then test a direct API call
  await testDirect();
  
  console.log('\n====== TEST COMPLETE ======');
}

// Run all tests
runTests();