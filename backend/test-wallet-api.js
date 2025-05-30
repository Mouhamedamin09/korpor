const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000';
const TEST_USER_TOKEN = 'YOUR_TEST_TOKEN_HERE'; // Replace with actual token

const headers = {
  'Authorization': `Bearer ${TEST_USER_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testWalletAPI() {
  console.log('🧪 Testing Wallet API Endpoints...\n');

  try {
    // Test 1: Get wallet balance
    console.log('1️⃣ Testing GET /api/wallet');
    const walletResponse = await fetch(`${API_URL}/api/wallet`, {
      method: 'GET',
      headers
    });
    
    if (walletResponse.ok) {
      const walletData = await walletResponse.json();
      console.log('✅ Wallet data:', JSON.stringify(walletData, null, 2));
    } else {
      console.log('❌ Wallet request failed:', walletResponse.status);
    }

    // Test 2: Deposit funds
    console.log('\n2️⃣ Testing POST /api/wallet/deposit');
    const depositResponse = await fetch(`${API_URL}/api/wallet/deposit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: 100.00,
        description: 'Test deposit',
        reference: 'TEST_' + Date.now()
      })
    });

    if (depositResponse.ok) {
      const depositData = await depositResponse.json();
      console.log('✅ Deposit successful:', JSON.stringify(depositData, null, 2));
    } else {
      console.log('❌ Deposit failed:', depositResponse.status);
    }

    // Test 3: Add rewards
    console.log('\n3️⃣ Testing POST /api/wallet/rewards');
    const rewardsResponse = await fetch(`${API_URL}/api/wallet/rewards`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        amount: 25.00,
        description: 'Test rewards',
        type: 'reward'
      })
    });

    if (rewardsResponse.ok) {
      const rewardsData = await rewardsResponse.json();
      console.log('✅ Rewards added:', JSON.stringify(rewardsData, null, 2));
    } else {
      console.log('❌ Rewards failed:', rewardsResponse.status);
    }

    // Test 4: Get transaction history
    console.log('\n4️⃣ Testing GET /api/wallet/transactions');
    const transactionsResponse = await fetch(`${API_URL}/api/wallet/transactions?page=1&limit=5`, {
      method: 'GET',
      headers
    });

    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();
      console.log('✅ Transactions:', JSON.stringify(transactionsData, null, 2));
    } else {
      console.log('❌ Transactions failed:', transactionsResponse.status);
    }

    // Test 5: Final wallet balance check
    console.log('\n5️⃣ Testing final wallet balance');
    const finalWalletResponse = await fetch(`${API_URL}/api/wallet`, {
      method: 'GET',
      headers
    });
    
    if (finalWalletResponse.ok) {
      const finalWalletData = await finalWalletResponse.json();
      console.log('✅ Final wallet state:', JSON.stringify(finalWalletData, null, 2));
    } else {
      console.log('❌ Final wallet check failed:', finalWalletResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

console.log('📝 Before running this test:');
console.log('1. Make sure the backend server is running on port 5000');
console.log('2. Replace TEST_USER_TOKEN with a valid JWT token');
console.log('3. Ensure you have a user account created');
console.log('4. Run: node test-wallet-api.js\n');

// Uncomment the line below to run the test
// testWalletAPI(); 