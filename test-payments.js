const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const AUTH_TOKEN = process.env.AUTH_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // Replace with an actual token

// Test plan configurations
const testPlans = [
  {
    name: "Monthly Lite Plan",
    package_id: "lite_monthly", // Match the exact package ID used in your CREDIT_PACKAGES array in the backend
    is_yearly: false,
    price: 9.9,
    credits: 50
  },
  {
    name: "Yearly Lite Plan",
    package_id: "lite_yearly", // Match the exact package ID used in your CREDIT_PACKAGES array in the backend
    is_yearly: true,
    price: 106.8,
    credits: 600
  },
  {
    name: "Monthly Pro Plan",
    package_id: "pro_monthly", // Match the exact package ID used in your CREDIT_PACKAGES array in the backend
    is_yearly: false,
    price: 24.9,
    credits: 250
  },
  {
    name: "Yearly Pro Plan",
    package_id: "pro_yearly", // Match the exact package ID used in your CREDIT_PACKAGES array in the backend
    is_yearly: true,
    price: 262.8,
    credits: 3000
  }
];

// Function to test creating a checkout session
async function testCreateCheckoutSession(plan) {
  try {
    console.log(`\nTesting checkout session creation for: ${plan.name}`);
    
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment-success`;
    const cancelUrl = `${baseUrl}/pricing`;
    
    const response = await axios.post(`${API_BASE_URL}/api/payment/create-checkout-session`, {
      package_id: plan.package_id,
      price: plan.price,
      credits: plan.credits,
      is_yearly: plan.is_yearly,
      success_url: successUrl,
      cancel_url: cancelUrl
    }, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Checkout session created successfully!');
    console.log(`Session ID: ${response.data.id}`);
    console.log(`Checkout URL: ${response.data.url}`);
    
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
    return null;
  }
}

// Main function to run the tests
async function runTests() {
  console.log('⭐️ Starting payment tests...');
  
  // Check if a specific plan was requested
  const requestedPlanId = process.env.PLAN_ID;
  
  if (requestedPlanId) {
    const plan = testPlans.find(p => p.package_id === requestedPlanId);
    if (plan) {
      console.log(`Testing single plan: ${plan.name}`);
      await testCreateCheckoutSession(plan);
    } else {
      console.error(`Plan with ID "${requestedPlanId}" not found. Available plans: ${testPlans.map(p => p.package_id).join(', ')}`);
    }
  } else {
    // Test all plans
    for (const plan of testPlans) {
      await testCreateCheckoutSession(plan);
    }
  }
  
  console.log('\n✅ All tests completed!');
}

// Run the tests
runTests();