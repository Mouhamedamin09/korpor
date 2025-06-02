const API_URL = "http://localhost:5000";

// Mock auth token - using the test user we just created
const AUTH_TOKEN = "mock-token-user-7"; // Test user with 5000 TND invested

async function testAutoReinvestAPI() {
  console.log("🔍 Testing Auto-Reinvest API Endpoints...\n");

  try {
    // Test 1: Check server health first
    console.log("1️⃣ Testing server health");
    const healthResponse = await fetch(`${API_URL}/health`, {
      method: "GET",
    });

    console.log("Health Status:", healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Server Health:", JSON.stringify(healthData, null, 2));
    } else {
      console.log("❌ Server health check failed");
      return;
    }

    // Test 2: Check database health
    console.log("\n2️⃣ Testing database connectivity");
    const dbHealthResponse = await fetch(`${API_URL}/db-health`, {
      method: "GET",
    });

    console.log("DB Health Status:", dbHealthResponse.status);
    if (dbHealthResponse.ok) {
      const dbHealthData = await dbHealthResponse.json();
      console.log("✅ Database Health:", JSON.stringify(dbHealthData, null, 2));

      // Check if auto_reinvest_plans table exists
      const tables = dbHealthData.tables || [];
      const autoReinvestTable = tables.find(
        (t) => t.name === "auto_reinvest_plans"
      );
      const rentalPayoutsTable = tables.find(
        (t) => t.name === "rental_payouts"
      );

      console.log("\n📊 Relevant Tables:");
      console.log(
        "- auto_reinvest_plans:",
        autoReinvestTable ? `${autoReinvestTable.rows} rows` : "❌ Not found"
      );
      console.log(
        "- rental_payouts:",
        rentalPayoutsTable ? `${rentalPayoutsTable.rows} rows` : "❌ Not found"
      );
    } else {
      const dbError = await dbHealthResponse.text();
      console.log("❌ Database Error:", dbError);
      return;
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    };

    // Test 3: Get auto-reinvest data
    console.log("\n3️⃣ Testing GET /api/autoreinvest");
    const getResponse = await fetch(`${API_URL}/api/autoreinvest`, {
      method: "GET",
      headers,
    });

    console.log("Status:", getResponse.status);
    console.log("Status Text:", getResponse.statusText);

    if (getResponse.ok) {
      const data = await getResponse.json();
      console.log("✅ Success:", JSON.stringify(data, null, 2));

      // If user is eligible, test creating a plan
      if (data.data?.isEligible) {
        console.log("\n4️⃣ User is eligible! Testing plan creation...");

        const createResponse = await fetch(`${API_URL}/api/autoreinvest`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            minimumReinvestAmount: 100,
            reinvestPercentage: 80,
            theme: "balanced",
            riskLevel: "medium",
            autoApprovalEnabled: true,
          }),
        });

        console.log("Create Plan Status:", createResponse.status);
        if (createResponse.ok) {
          const createData = await createResponse.json();
          console.log("✅ Plan Created:", JSON.stringify(createData, null, 2));
        } else {
          const error = await createResponse.text();
          console.log("❌ Create Error:", error);
        }
      } else {
        console.log("ℹ️ User not eligible for auto-reinvest yet");
        console.log(`Current investment: ${data.data?.totalInvested || 0} TND`);
        console.log(`Required: ${data.data?.minimumRequired || 2000} TND`);
      }
    } else {
      const error = await getResponse.text();
      console.log("❌ Error Response:", error);

      // If it's an auth error, that's expected with mock token
      if (getResponse.status === 401) {
        console.log("⚠️ Authentication error expected with mock token");
      }
    }

    // Test 4: Get rental history (might fail due to auth)
    console.log("\n5️⃣ Testing GET /api/autoreinvest/rental-history");
    const historyResponse = await fetch(
      `${API_URL}/api/autoreinvest/rental-history`,
      {
        method: "GET",
        headers,
      }
    );

    console.log("Rental History Status:", historyResponse.status);
    console.log("Rental History Status Text:", historyResponse.statusText);

    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log("✅ Rental History:", JSON.stringify(historyData, null, 2));
    } else {
      const errorText = await historyResponse.text();
      console.log("❌ Rental History Error:", errorText);

      if (historyResponse.status === 401) {
        console.log("⚠️ Authentication error expected with mock token");
      }
    }
  } catch (error) {
    console.error("🔥 Test failed:", error.message);

    if (error.message.includes("ECONNREFUSED")) {
      console.log("\n💡 Server might not be running. Start it with: npm start");
    } else if (error.message.includes("ENOTFOUND")) {
      console.log("\n💡 DNS/Network issue. Check your network connection.");
    }
  }
}

// Run the test
testAutoReinvestAPI();
