const API_URL = "http://localhost:5000";
const AUTH_TOKEN = "mock-token-user-7";

async function simpleTest() {
  console.log("🔍 Simple Auto-Reinvest Test...\n");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${AUTH_TOKEN}`,
  };

  try {
    // Test 1: Get auto-reinvest data
    console.log("1️⃣ Testing GET /api/autoreinvest");
    const response = await fetch(`${API_URL}/api/autoreinvest`, {
      method: "GET",
      headers,
    });

    console.log("Status:", response.status);
    console.log("Status Text:", response.statusText);

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Response:", JSON.stringify(data, null, 2));
    } else {
      const error = await response.text();
      console.log("❌ Error:", error);
    }

    // Test 2: Get rental history
    console.log("\n2️⃣ Testing GET /api/autoreinvest/rental-history");
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
      const error = await historyResponse.text();
      console.log("❌ Rental History Error:", error);
    }
  } catch (error) {
    console.error("🔥 Test failed:", error.message);
  }
}

simpleTest();
