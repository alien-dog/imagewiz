/**
 * Simple script to test the order confirmation API endpoint
 */

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fetch from 'node-fetch';

// Get current file's directory (equivalent to __dirname in CommonJS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL for the API - use local server for testing
const BASE_URL = "http://localhost:3000";

// Package data for testing
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

// Generate a random session ID
function generateSessionId() {
  return `cs_test_${Math.random().toString(36).substring(2, 15)}`;
}

// Test a specific package
async function testPackage(packageId) {
  const sessionId = generateSessionId();
  const packageInfo = packages.find(p => p.id === packageId) || packages[0];
  
  console.log(`\n----- Testing ${packageInfo.name} (${packageId}) -----`);
  
  // API endpoint URL
  const apiUrl = `${BASE_URL}/api/order-confirmation?session_id=${sessionId}&package_id=${packageId}&in_redirect_fix=true`;
  
  // Frontend URL (for reference)
  const frontendUrl = `${BASE_URL}/order-confirmation?session_id=${sessionId}&package_id=${packageId}&in_redirect_fix=true`;
  
  console.log(`API URL: ${apiUrl}`);
  console.log(`Frontend URL: ${frontendUrl}`);
  
  try {
    // Make API request
    console.log(`\nSending request to API...`);
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      console.error(`Error: HTTP status ${response.status}`);
      const text = await response.text();
      console.error(`Response: ${text}`);
      return;
    }
    
    // Parse JSON response
    const data = await response.json();
    console.log(`\nAPI Response:`);
    console.log(JSON.stringify(data, null, 2));
    
    // Check if it's a mock response
    if (data.mock_response) {
      console.log(`\n⚠️ NOTE: This is a mock response. The actual backend may not be available.`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error testing ${packageId}:`, error.message);
  }
}

// Main test function that tests all packages
async function testApi() {
  console.log(`🧪 Testing Order Confirmation API`);
  console.log(`Base URL: ${BASE_URL}`);
  
  // Test each package
  for (const pkg of packages) {
    await testPackage(pkg.id);
  }
  
  console.log(`\n✅ API testing complete`);
}

// Run the tests
testApi().catch(error => {
  console.error('Test failed:', error);
});