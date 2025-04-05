/**
 * Test script for the order confirmation flow
 * This script generates random Stripe-like session IDs and calls the
 * order confirmation API with different package configurations to verify
 * that the payment processing works as expected.
 */

import fetch from 'node-fetch';

// Generate a Stripe-like session ID for testing
function generateSessionId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const sessionIdLength = 20;
  let sessionId = 'cs_test_';
  
  for (let i = 0; i < sessionIdLength; i++) {
    sessionId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return sessionId;
}

// Package configurations for testing
const packages = {
  lite_monthly: {
    name: 'Lite Monthly',
    price: 9.90,
    credits: 50,
    isYearly: false,
    id: 'lite_monthly'
  },
  lite_yearly: {
    name: 'Lite Yearly',
    price: 106.80,
    credits: 600,
    isYearly: true,
    id: 'lite_yearly'
  },
  pro_monthly: {
    name: 'Pro Monthly',
    price: 24.90,
    credits: 150,
    isYearly: false,
    id: 'pro_monthly'
  },
  pro_yearly: {
    name: 'Pro Yearly',
    price: 262.80,
    credits: 1800,
    isYearly: true,
    id: 'pro_yearly'
  }
};

// Test a specific package configuration
async function testPackage(packageId) {
  const pkg = packages[packageId];
  const sessionId = generateSessionId();
  
  console.log(`Testing ${pkg.name} package:`);
  console.log(`- Package ID: ${packageId}`);
  console.log(`- Price: $${pkg.price}`);
  console.log(`- Credits: ${pkg.credits}`);
  console.log(`- Is Yearly: ${pkg.isYearly}`);
  console.log(`- Session ID: ${sessionId}`);
  console.log('-------------------------------------');
  
  try {
    // The API URL for order confirmation
    const url = `http://localhost:3000/api/order-confirmation?session_id=${sessionId}&package_id=${packageId}&price=${pkg.price}&credits=${pkg.credits}&is_yearly=${pkg.isYearly}&direct=true`;
    
    console.log(`Making API request to: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));
    console.log('-------------------------------------\n');
    
    return data;
  } catch (error) {
    console.error(`Error testing ${pkg.name}:`, error);
    console.log('-------------------------------------\n');
    return null;
  }
}

// Test all package types
async function testAllPackages() {
  console.log('🔍 STARTING ORDER CONFIRMATION API TESTS');
  console.log('=========================================\n');
  
  // Test each package configuration
  for (const packageId of Object.keys(packages)) {
    await testPackage(packageId);
  }
  
  console.log('✅ ORDER CONFIRMATION API TESTS COMPLETED');
}

// Run the tests
testAllPackages().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});