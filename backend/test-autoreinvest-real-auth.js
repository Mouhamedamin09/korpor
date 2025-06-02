const API_URL = "http://localhost:5000";

// Test credentials - you'll need to replace these with real ones from your .env or database
const TEST_CREDENTIALS = {
  email: "test@example.com", // Replace with a real user email
  password: "password123", // Replace with the real password
};

async function testAutoReinvestWithRealAuth() {
  console.log("🔍 Testing Auto-Reinvest API with Real Authentication...\n");

  try {
    // Step 1: Authenticate and get a real JWT token
    console.log("1️⃣ Authenticating user...");
    const loginResponse = await fetch(`${API_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    console.log("Login Status:", loginResponse.status);

    if (!loginResponse.ok) {
      const loginError = await loginResponse.text();
      console.log("❌ Login failed:", loginError);
      console.log(
        "\n💡 Please update TEST_CREDENTIALS in the script with valid user credentials"
      );
      return;
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.accessToken;

    if (!authToken) {
      console.log("❌ No access token received from login");
      return;
    }

    console.log("✅ Authentication successful!");
    console.log(`📧 User: ${loginData.user?.email}`);
    console.log(`🆔 User ID: ${loginData.user?.id}`);
    console.log(`🎫 Token: ${authToken.substring(0, 20)}...`);

    // Step 2: Test auto-reinvest endpoints with real token
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    };

    console.log("\n2️⃣ Testing GET /api/autoreinvest");
    const autoReinvestResponse = await fetch(`${API_URL}/api/autoreinvest`, {
      method: "GET",
      headers,
    });

    console.log("Status:", autoReinvestResponse.status);

    if (autoReinvestResponse.ok) {
      const data = await autoReinvestResponse.json();
      console.log("✅ Auto-Reinvest Data:", JSON.stringify(data, null, 2));

      // Check eligibility
      if (data.data?.isEligible) {
        console.log("\n🎉 User is eligible for auto-reinvest!");
        console.log(`💰 Total invested: ${data.data.totalInvested} TND`);

        if (data.data.autoReinvestPlan) {
          console.log("📋 Existing plan found:");
          console.log(`   - Status: ${data.data.autoReinvestPlan.status}`);
          console.log(
            `   - Percentage: ${data.data.autoReinvestPlan.reinvestPercentage}%`
          );
          console.log(`   - Theme: ${data.data.autoReinvestPlan.theme}`);
        } else {
          console.log("📝 No existing plan - ready to create one!");
        }
      } else {
        console.log("\n⚠️ User not eligible for auto-reinvest yet");
        console.log(
          `💰 Current investment: ${data.data?.totalInvested || 0} TND`
        );
        console.log(`🎯 Required: ${data.data?.minimumRequired || 2000} TND`);
      }
    } else {
      const error = await autoReinvestResponse.text();
      console.log("❌ Auto-reinvest API error:", error);
    }

    // Step 3: Test rental history
    console.log("\n3️⃣ Testing GET /api/autoreinvest/rental-history");
    const historyResponse = await fetch(
      `${API_URL}/api/autoreinvest/rental-history`,
      {
        method: "GET",
        headers,
      }
    );

    console.log("Rental History Status:", historyResponse.status);

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log("✅ Rental History:", JSON.stringify(historyData, null, 2));

      const payouts = historyData.data?.rentalPayouts || [];
      console.log(`📊 Found ${payouts.length} rental payouts`);
    } else {
      const historyError = await historyResponse.text();
      console.log("❌ Rental History Error:", historyError);
    }

    console.log("\n✅ Test completed successfully!");
  } catch (error) {
    console.error("🔥 Test failed:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Server might not be running. Start it with: npm start");
    } else if (error.message.includes("fetch")) {
      console.log("\n💡 Network error. Check if the server is accessible.");
    }
  }
}

// Instructions for the user
console.log("📝 IMPORTANT: Before running this test:");
console.log("1. Make sure your backend server is running (npm start)");
console.log(
  "2. Update TEST_CREDENTIALS with real user credentials from your database"
);
console.log(
  "3. Ensure the user has sufficient investment (>= 2000 TND) to test eligibility"
);
console.log("4. You can check users with: node check-users.js\n");

// Run the test
testAutoReinvestWithRealAuth();
