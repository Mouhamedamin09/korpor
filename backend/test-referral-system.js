const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'mock-token-user-1'; // Mock token for user ID 1

async function testReferralSystem() {
  console.log('🧪 Testing Referral System API Endpoints\n');

  try {
    // Test 1: Get referral info
    console.log('1️⃣ Testing GET /api/referrals/info');
    const infoResponse = await axios.get(`${BASE_URL}/referrals/info`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    console.log('✅ Referral info response:', JSON.stringify(infoResponse.data, null, 2));
    
    // Test 2: Get user currency
    console.log('\n2️⃣ Testing GET /api/referrals/currency');
    const currencyResponse = await axios.get(`${BASE_URL}/referrals/currency`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    console.log('✅ Currency response:', JSON.stringify(currencyResponse.data, null, 2));
    
    // Test 3: Switch currency to EUR
    console.log('\n3️⃣ Testing POST /api/referrals/switch-currency (to EUR)');
    const switchToEurResponse = await axios.post(`${BASE_URL}/referrals/switch-currency`, 
      { currency: 'EUR' },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('✅ Switch to EUR response:', JSON.stringify(switchToEurResponse.data, null, 2));
    
    // Test 4: Get updated referral info after currency switch
    console.log('\n4️⃣ Testing GET /api/referrals/info (after currency switch)');
    const updatedInfoResponse = await axios.get(`${BASE_URL}/referrals/info`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    console.log('✅ Updated referral info:', JSON.stringify(updatedInfoResponse.data, null, 2));
    
    // Test 5: Get user's permanent referral code
    console.log('\n5️⃣ Testing GET /api/referrals/get-code');
    const getCodeResponse = await axios.get(`${BASE_URL}/referrals/get-code`,
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('✅ Get code response:', JSON.stringify(getCodeResponse.data, null, 2));
    
    // Test 5b: Verify the code is the same as before (static)
    console.log('\n5️⃣b Testing GET /api/referrals/get-code (should return same code)');
    const getCodeResponse2 = await axios.get(`${BASE_URL}/referrals/get-code`,
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    const firstCode = getCodeResponse.data.data.referralCode;
    const secondCode = getCodeResponse2.data.data.referralCode;
    
    if (firstCode === secondCode) {
      console.log('✅ Code is static and permanent:', firstCode);
    } else {
      console.log('❌ Error: Code changed from', firstCode, 'to', secondCode);
    }
    
    // Test 6: Switch currency back to TND
    console.log('\n6️⃣ Testing POST /api/referrals/switch-currency (back to TND)');
    const switchToTndResponse = await axios.post(`${BASE_URL}/referrals/switch-currency`, 
      { currency: 'TND' },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('✅ Switch to TND response:', JSON.stringify(switchToTndResponse.data, null, 2));
    
    // Test 7: Test invalid currency
    console.log('\n7️⃣ Testing POST /api/referrals/switch-currency (invalid currency)');
    try {
      await axios.post(`${BASE_URL}/referrals/switch-currency`, 
        { currency: 'USD' },
        { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
      );
    } catch (error) {
      console.log('✅ Expected error for invalid currency:', error.response?.data || error.message);
    }
    
    // Test 8: Test unauthorized request
    console.log('\n8️⃣ Testing unauthorized request');
    try {
      await axios.get(`${BASE_URL}/referrals/info`);
    } catch (error) {
      console.log('✅ Expected error for unauthorized request:', error.response?.data || error.message);
    }
    
    console.log('\n🎉 All referral system tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Function to test referral signup process
async function testReferralSignup() {
  console.log('\n🧪 Testing Referral Signup Process\n');
  
  try {
    // First get a referral code
    const infoResponse = await axios.get(`${BASE_URL}/referrals/info`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    const referralCode = infoResponse.data.data.code;
    console.log('📝 Using referral code:', referralCode);
    
    // Test referral signup process
    console.log('\n9️⃣ Testing POST /api/referrals/process-signup');
    const signupResponse = await axios.post(`${BASE_URL}/referrals/process-signup`, {
      referralCode: referralCode,
      newUserId: 999 // Mock new user ID
    });
    
    console.log('✅ Referral signup response:', JSON.stringify(signupResponse.data, null, 2));
    
    // Test duplicate referral
    console.log('\n🔟 Testing duplicate referral signup');
    try {
      await axios.post(`${BASE_URL}/referrals/process-signup`, {
        referralCode: referralCode,
        newUserId: 999 // Same user ID
      });
    } catch (error) {
      console.log('✅ Expected error for duplicate referral:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Referral signup test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runAllTests() {
  await testReferralSystem();
  await testReferralSignup();
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testReferralSystem, testReferralSignup }; 