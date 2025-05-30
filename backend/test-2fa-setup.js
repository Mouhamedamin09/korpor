const axios = require('axios');

// Test 2FA setup endpoint
async function test2FASetup() {
  try {
    console.log('🔄 Testing 2FA setup endpoint...');
    
    // First, let's test with a mock token for user ID 1 (you should replace this with a real token)
    const mockToken = 'mock-token-user-1'; // This should be replaced with a real JWT token
    
    const response = await axios.post('http://localhost:5000/api/2fa/setup', {}, {
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
    
    console.log('✅ 2FA Setup Response:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
    
    // Check the otpauth URL to see what email is being used
    if (response.data && response.data.data && response.data.data.otpauthUrl) {
      console.log('🔗 OtpAuth URL:', response.data.data.otpauthUrl);
    }
    
  } catch (error) {
    console.error('❌ Error testing 2FA setup:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Test the endpoint
test2FASetup(); 