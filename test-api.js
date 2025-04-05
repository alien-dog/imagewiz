import axios from 'axios';

// Function to test a single package type
async function testPackage(packageId) {
  try {
    console.log(`\n🧪 Testing ${packageId} package:`);
    const sessionId = `test_${packageId}_${Date.now()}`;
    
    const response = await axios.get('http://localhost:3000/api/order-confirmation', {
      params: {
        session_id: sessionId,
        direct: 'true',
        package_id: packageId,
        in_redirect_fix: 'true'
      }
    });
    
    console.log(`✅ Status: ${response.status}`);
    console.log(`Response for ${packageId}:`, JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error(`❌ Error testing ${packageId}:`, error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    }
    return false;
  }
}

async function testApi() {
  console.log('=== 🧪 Testing Order Confirmation API ===');
  
  // Test all package types
  const packages = [
    'lite_monthly',
    'lite_yearly',
    'pro_monthly',
    'pro_yearly'
  ];
  
  const results = {};
  
  for (const pkg of packages) {
    results[pkg] = await testPackage(pkg);
  }
  
  console.log('\n=== 📋 Test Summary ===');
  for (const [pkg, success] of Object.entries(results)) {
    console.log(`${success ? '✅' : '❌'} ${pkg}: ${success ? 'Passed' : 'Failed'}`);
  }
}

testApi();