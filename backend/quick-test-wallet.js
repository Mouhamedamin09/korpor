const fetch = require('node-fetch');

async function testWalletEndpoint() {
  try {
    console.log('🔍 Testing wallet endpoint availability...\n');
    
    // Test endpoint without auth (should get 401)
    const response = await fetch('http://localhost:5000/api/wallet', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Response body:', data);
    
    if (response.status === 401) {
      console.log('✅ Wallet endpoint is working! (401 = needs authentication)');
    } else if (response.status === 404) {
      console.log('❌ Wallet endpoint not found (404)');
    } else {
      console.log('🤔 Unexpected response status:', response.status);
    }
    
  } catch (error) {
    console.error('❌ Error testing endpoint:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on port 5000');
    }
  }
}

// Test all wallet endpoints
async function testAllEndpoints() {
  const endpoints = [
    'GET /api/wallet',
    'GET /api/wallet/transactions', 
    'POST /api/wallet/deposit',
    'POST /api/wallet/withdraw',
    'POST /api/wallet/rewards'
  ];
  
  console.log('Testing wallet endpoints...\n');
  
  for (const endpoint of endpoints) {
    const [method, path] = endpoint.split(' ');
    console.log(`Testing ${endpoint}:`);
    
    try {
      const response = await fetch(`http://localhost:5000${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: method === 'POST' ? JSON.stringify({ amount: 10 }) : undefined
      });
      
      console.log(`  Status: ${response.status} ${response.status === 401 ? '✅' : response.status === 404 ? '❌' : '🤔'}`);
    } catch (error) {
      console.log(`  Error: ${error.message}`);
    }
  }
}

console.log('🧪 Quick Wallet API Test\n');
testWalletEndpoint();

setTimeout(() => {
  console.log('\n' + '='.repeat(50) + '\n');
  testAllEndpoints();
}, 2000); 