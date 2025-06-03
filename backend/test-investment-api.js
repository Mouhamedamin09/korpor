const fetch = require("node-fetch");

const API_URL = "http://localhost:5000/api";

// Mock auth token for testing (you'll need to replace with a real token)
const AUTH_TOKEN = "your-auth-token-here";

async function testInvestmentAPI() {
  console.log("🧪 Testing Investment API Endpoints...\n");

  try {
    // Test 1: Get property for investment
    console.log("1. Testing GET /real-estate-investment/property/:projectId");
    const propertyResponse = await fetch(
      `${API_URL}/real-estate-investment/property/1`,
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (propertyResponse.ok) {
      const propertyData = await propertyResponse.json();
      console.log("✅ Property endpoint working");
      console.log(
        "   Property:",
        propertyData.data?.property?.name || "Unknown"
      );
    } else {
      console.log("❌ Property endpoint failed:", propertyResponse.status);
    }

    // Test 2: Validate investment
    console.log("\n2. Testing POST /real-estate-investment/validate");
    const validateResponse = await fetch(
      `${API_URL}/real-estate-investment/validate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId: 1,
          amount: 5000,
          paymentMethod: "wallet",
        }),
      }
    );

    if (validateResponse.ok) {
      console.log("✅ Validation endpoint working");
    } else {
      console.log("❌ Validation endpoint failed:", validateResponse.status);
    }

    // Test 3: Get user investments
    console.log("\n3. Testing GET /real-estate-investment/user/investments");
    const investmentsResponse = await fetch(
      `${API_URL}/real-estate-investment/user/investments`,
      {
        headers: {
          Authorization: `Bearer ${AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (investmentsResponse.ok) {
      const investmentsData = await investmentsResponse.json();
      console.log("✅ User investments endpoint working");
      console.log(
        "   Investments count:",
        investmentsData.data?.investments?.length || 0
      );
    } else {
      console.log(
        "❌ User investments endpoint failed:",
        investmentsResponse.status
      );
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    console.log("\n💡 Make sure the backend server is running on port 5000");
    console.log("💡 Update the AUTH_TOKEN variable with a valid token");
  }

  console.log("\n🏁 Investment API test completed");
}

// Test server health first
async function testServerHealth() {
  try {
    const response = await fetch(`${API_URL.replace("/api", "")}/health`);
    if (response.ok) {
      console.log("✅ Backend server is running");
      return true;
    }
  } catch (error) {
    console.log("❌ Backend server is not running");
    console.log("💡 Start the server with: npm start");
    return false;
  }
}

async function runTests() {
  console.log("🚀 Starting Investment API Tests\n");

  const serverRunning = await testServerHealth();
  if (serverRunning) {
    await testInvestmentAPI();
  }
}

runTests();
