const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'mock-token-user-1'; // Mock token for user ID 1

async function testInvestmentEndpoints() {
  console.log('🧪 Testing Investment API Endpoints\n');

  try {
    // Test 1: Get user investment data
    console.log('1️⃣ Testing GET /api/investments/user-data');
    const userDataResponse = await axios.get(`${BASE_URL}/investments/user-data`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });
    
    console.log('✅ User investment data response:', JSON.stringify(userDataResponse.data, null, 2));
    
    // Test 2: Calculate investment projection
    console.log('\n2️⃣ Testing POST /api/investments/projection');
    const projectionResponse = await axios.post(`${BASE_URL}/investments/projection`, 
      { 
        monthlyDeposit: 6000, 
        years: 5, 
        yieldPct: 6.5 
      },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('✅ Investment projection response:', JSON.stringify(projectionResponse.data, null, 2));
    
    // Test 3: Test with EUR currency (after switching)
    console.log('\n3️⃣ Testing projection with different parameters');
    const projection2Response = await axios.post(`${BASE_URL}/investments/projection`, 
      { 
        monthlyDeposit: 2500, 
        years: 10, 
        yieldPct: 5.8 
      },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('✅ Different projection response:', JSON.stringify(projection2Response.data, null, 2));
    
    console.log('\n🎉 All investment endpoint tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testInvestmentEndpoints();
}

module.exports = { testInvestmentEndpoints }; 