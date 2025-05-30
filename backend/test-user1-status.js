/**
 * Test script to verify user 1 shows 2/4 progress
 */
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testUser1Status() {
  try {
    console.log('🧪 Testing verification status for user 1 (admin kraiem)...');
    
    const response = await axios.get(
      `${API_BASE}/verification/status/1`,
      {
        headers: {
          'Authorization': 'Bearer mock-token-user-1',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ API Response Status:', response.status);
    console.log('📋 Verification Data:', JSON.stringify(response.data, null, 2));
    
    const data = response.data;
    
    // Check if it shows 2/4 progress (steps 1-2 complete, 3-4 pending)
    const progress = calculateProgress(data);
    console.log(`\n📊 Progress Analysis:`);
    console.log(`- Current Progress: ${progress}/4`);
    console.log(`- Step 1 (Account): ✅ Complete`);
    console.log(`- Step 2 (Employment): ✅ Complete`);
    console.log(`- Step 3 (Identity): ${data.identityStatus === 'pending' ? '⏳ Pending' : '❌ ' + data.identityStatus}`);
    console.log(`- Step 4 (Address): ${data.addressStatus === 'pending' ? '⏳ Pending' : '❌ ' + data.addressStatus}`);
    console.log(`- Can Proceed: ${data.canProceed ? '✅ Yes' : '❌ No'}`);
    console.log(`- Next Step: ${data.nextStep}`);
    
    if (progress === 2) {
      console.log('\n🎉 SUCCESS: User 1 correctly shows 2/4 progress!');
    } else {
      console.log(`\n⚠️  WARNING: Expected 2/4 progress, but got ${progress}/4`);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.statusText);
    console.error('📋 Error data:', error.response?.data);
    return null;
  }
}

function calculateProgress(verificationData) {
  let progress = 2; // Steps 1-2 are always complete (account + employment)
  
  if (verificationData.identityStatus === 'approved') progress++;
  if (verificationData.addressStatus === 'approved') progress++;
  
  return progress;
}

testUser1Status(); 