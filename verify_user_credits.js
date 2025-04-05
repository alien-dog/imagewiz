/**
 * Script to verify user credit balance after payments
 */
import axios from 'axios';

// Verify user info including credit balance
async function verifyUserCredits() {
  console.log('Verifying user information and credit balance...');
  
  try {
    // Login first to get the auth token
    console.log('Logging in as testuser3...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'testuser3',
      password: 'password123'
    });
    
    if (loginResponse.data && loginResponse.data.access_token) {
      const token = loginResponse.data.access_token;
      console.log('Login successful, token received.');
      
      // User data is already in the login response
      if (loginResponse.data.user) {
        const userData = loginResponse.data.user;
        console.log('User data received with login response');
        
        console.log('\nUser Information:');
        console.log('=================');
        console.log(`Username: ${userData.username}`);
        console.log(`Credit Balance: ${userData.credit_balance}`);
        console.log(`Account Created: ${userData.created_at}`);
        console.log(`Admin Status: ${userData.is_admin ? 'Yes' : 'No'}`);
        
        // Verify credits are correct after our tests
        if (userData.credit_balance >= 2000) {
          console.log('\n✅ Credit balance verification PASSED! User has sufficient credits.');
          console.log('   This indicates payments were processed correctly and credits were added to the account.');
        } else {
          console.log('\n❌ Credit balance verification FAILED! User has insufficient credits.');
          console.log(`   Expected at least 2000 credits, but found ${userData.credit_balance}.`);
        }
        
        return userData;
      } else {
        console.error('Error: User data not found in response');
        return null;
      }
    } else {
      console.error('Error: Login failed, no token received');
      console.log('Response:', loginResponse.data);
      return null;
    }
  } catch (error) {
    console.error('Error during verification:', error.message);
    if (error.response) {
      console.log('Error response status:', error.response.status);
      console.log('Error response data:', JSON.stringify(error.response.data, null, 2));
    }
    return null;
  }
}

// Run the verification
verifyUserCredits();