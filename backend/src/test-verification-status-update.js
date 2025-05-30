/**
 * Test script to simulate backoffice updating verification status
 * Usage: node test-verification-status-update.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test scenarios
const testScenarios = [
  {
    name: 'Approve Identity Verification',
    data: {
      verificationId: 1,
      type: 'identity',
      status: 'approved'
    }
  },
  {
    name: 'Approve Address Verification',
    data: {
      verificationId: 1,
      type: 'address',
      status: 'approved'
    }
  },
  {
    name: 'Reject Identity Verification',
    data: {
      verificationId: 1,
      type: 'identity',
      status: 'rejected',
      rejectionReason: 'Passport image is not clear. Please retake the photo.'
    }
  },
  {
    name: 'Reject Address Verification',
    data: {
      verificationId: 1,
      type: 'address',
      status: 'rejected',
      rejectionReason: 'Address document is expired. Please provide a recent document.'
    }
  }
];

async function testStatusUpdate(scenario) {
  try {
    console.log(`\n🧪 Testing: ${scenario.name}`);
    console.log('📤 Request data:', JSON.stringify(scenario.data, null, 2));
    
    const response = await axios.post(
      `${API_BASE}/verification/update-status`,
      scenario.data,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Response:', response.status, response.statusText);
    console.log('📋 Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.statusText);
    console.error('📋 Error data:', error.response?.data);
  }
}

async function getVerificationStatus(userId = 1) {
  try {
    console.log(`\n📊 Getting verification status for user ${userId}...`);
    
    const response = await axios.get(
      `${API_BASE}/verification/status/${userId}`,
      {
        headers: {
          'Authorization': 'Bearer test-token', // You might need to use a real token
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Current status:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error getting status:', error.response?.status, error.response?.statusText);
    console.error('📋 Error data:', error.response?.data);
  }
}

async function runTests() {
  console.log('🚀 Starting verification status update tests...\n');
  
  // First, check current status
  await getVerificationStatus();
  
  // Get user input for which test to run
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  console.log('\n📋 Available test scenarios:');
  testScenarios.forEach((scenario, index) => {
    console.log(`${index + 1}. ${scenario.name}`);
  });
  console.log('0. Get current status only');
  
  rl.question('\nEnter the number of the test you want to run (or 0 for status only): ', async (answer) => {
    const choice = parseInt(answer);
    
    if (choice === 0) {
      await getVerificationStatus();
    } else if (choice >= 1 && choice <= testScenarios.length) {
      const scenario = testScenarios[choice - 1];
      await testStatusUpdate(scenario);
      
      // Check status after update
      console.log('\n📊 Status after update:');
      await getVerificationStatus();
    } else {
      console.log('❌ Invalid choice');
    }
    
    rl.close();
  });
}

// Run if called directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testStatusUpdate, getVerificationStatus }; 