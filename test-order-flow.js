/**
 * Test script for the entire payment order flow
 * This tests:
 * 1. Basic order confirmation with a session ID only
 * 2. Test mode with package_id, price, and credits specified
 * 3. Test mode with the is_yearly flag set to test yearly packages
 */
import axios from 'axios';

// Helper to generate random Stripe-like session IDs for testing
function generateSessionId() {
  return 'cs_test_' + Math.random().toString(36).substring(2, 15);
}

// Test the basic order confirmation API (this will fail as expected since no user ID provided)
async function testBasicOrderConfirmation() {
  console.log('\n===== BASIC ORDER CONFIRMATION TEST =====');
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing basic order confirmation with session ID: ${sessionId}`);
    const response = await axios.get(`http://localhost:3000/api/order-confirmation?session_id=${sessionId}`);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error (expected):', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Test order confirmation with Lite Monthly package
async function testLiteMonthlyPackage() {
  console.log('\n===== LITE MONTHLY PACKAGE TEST =====');
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing Lite Monthly package with session ID: ${sessionId}`);
    const response = await axios.get(
      `http://localhost:3000/api/order-confirmation?session_id=${sessionId}&package_id=lite_monthly&price=9.9&credits=50&is_yearly=false`
    );
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test order confirmation with Lite Yearly package
async function testLiteYearlyPackage() {
  console.log('\n===== LITE YEARLY PACKAGE TEST =====');
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing Lite Yearly package with session ID: ${sessionId}`);
    const response = await axios.get(
      `http://localhost:3000/api/order-confirmation?session_id=${sessionId}&package_id=lite_yearly&price=106.8&credits=600&is_yearly=true`
    );
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test order confirmation with Pro Monthly package
async function testProMonthlyPackage() {
  console.log('\n===== PRO MONTHLY PACKAGE TEST =====');
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing Pro Monthly package with session ID: ${sessionId}`);
    const response = await axios.get(
      `http://localhost:3000/api/order-confirmation?session_id=${sessionId}&package_id=pro_monthly&price=24.9&credits=150&is_yearly=false`
    );
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Test order confirmation with Pro Yearly package
async function testProYearlyPackage() {
  console.log('\n===== PRO YEARLY PACKAGE TEST =====');
  const sessionId = generateSessionId();
  
  try {
    console.log(`Testing Pro Yearly package with session ID: ${sessionId}`);
    const response = await axios.get(
      `http://localhost:3000/api/order-confirmation?session_id=${sessionId}&package_id=pro_yearly&price=262.8&credits=1800&is_yearly=true`
    );
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log('********** STARTING PAYMENT FLOW TESTS **********');
  
  // Test 1: Basic order confirmation (should fail)
  await testBasicOrderConfirmation();
  
  // Test 2-5: Test all package types
  const liteMonthlyResult = await testLiteMonthlyPackage();
  const liteYearlyResult = await testLiteYearlyPackage();
  const proMonthlyResult = await testProMonthlyPackage();
  const proYearlyResult = await testProYearlyPackage();
  
  // Summarize results
  console.log('\n********** TEST SUMMARY **********');
  console.log('Lite Monthly Package:', liteMonthlyResult ? 'SUCCESS' : 'FAILED');
  console.log('Lite Yearly Package:', liteYearlyResult ? 'SUCCESS' : 'FAILED');
  console.log('Pro Monthly Package:', proMonthlyResult ? 'SUCCESS' : 'FAILED');
  console.log('Pro Yearly Package:', proYearlyResult ? 'SUCCESS' : 'FAILED');
  
  // Count test results
  const passed = [liteMonthlyResult, liteYearlyResult, proMonthlyResult, proYearlyResult].filter(Boolean).length;
  console.log(`\nPassed ${passed} out of 4 package tests`);
  
  if (passed === 4) {
    console.log('\n✅ ALL PAYMENT TESTS PASSED! The payment flow is working correctly.');
  } else {
    console.log('\n❌ SOME TESTS FAILED. Please check the errors above.');
  }
}

// Run all tests
runAllTests();