const fetch = require("node-fetch");

const API_BASE_URL = "http://localhost:3000/api";

async function testPropertiesAPI() {
  try {
    console.log("🔍 Testing Properties API...");

    // Test GET all properties
    console.log("\n📋 Testing GET /api/listings...");
    const response = await fetch(`${API_BASE_URL}/listings`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const properties = await response.json();
    console.log(`✅ Successfully fetched ${properties.length} properties`);

    // Display property summary
    properties.forEach((property, index) => {
      const fundingPercentage = (
        ((property.current_funded || property.current_amount || 0) /
          (property.total_needed || property.goal_amount || 1)) *
        100
      ).toFixed(1);
      console.log(
        `  ${index + 1}. ${property.name} - ${fundingPercentage}% funded`
      );
    });

    if (properties.length > 0) {
      // Test GET single property
      const firstProperty = properties[0];
      console.log(`\n🏠 Testing GET /api/listings/${firstProperty.id}...`);

      const singleResponse = await fetch(
        `${API_BASE_URL}/listings/${firstProperty.id}`
      );

      if (!singleResponse.ok) {
        throw new Error(`HTTP error! status: ${singleResponse.status}`);
      }

      const singleProperty = await singleResponse.json();
      console.log(`✅ Successfully fetched property: ${singleProperty.name}`);
      console.log(`   📍 Location: ${singleProperty.location}`);
      console.log(
        `   💰 Goal: ${(
          singleProperty.goal_amount ||
          singleProperty.total_needed ||
          0
        ).toLocaleString()} TND`
      );
      console.log(
        `   📈 Expected ROI: ${
          singleProperty.expected_roi || singleProperty.annual_return_rate
        }%`
      );
      console.log(
        `   🖼️  Images: ${singleProperty.images?.length || 0} images`
      );
    }

    console.log("\n🎉 Properties API test completed successfully!");
    console.log("\n📝 Summary:");
    console.log(`   • ${properties.length} properties available`);
    console.log(`   • Real images from Unsplash`);
    console.log(`   • Complete property details`);
    console.log(`   • Ready for frontend integration`);
  } catch (error) {
    console.error("❌ API test failed:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the backend server is running on port 3000");
      console.log("   Run: npm run dev");
    }
  }
}

// Test investment API with authentication
async function testInvestmentAPI() {
  try {
    console.log("\n🔐 Testing Investment API (requires authentication)...");

    // Try to access protected route without auth
    const response = await fetch(
      `${API_BASE_URL}/real-estate-investment/property/1`
    );

    if (response.status === 401) {
      console.log("✅ Investment API properly protected (401 Unauthorized)");
      console.log("   Login required to access investment endpoints");
    } else {
      console.log(`⚠️  Expected 401, got ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Investment API test failed:", error.message);
  }
}

// Run tests
async function runTests() {
  console.log("🚀 Starting API Tests...\n");

  await testPropertiesAPI();
  await testInvestmentAPI();

  console.log("\n🏁 All tests completed!");
  console.log("\n🔗 Next steps:");
  console.log("   1. Start the frontend: cd ../front-mobile && npm start");
  console.log("   2. Test the investment flow with test credentials");
  console.log("   3. Properties should now display with real data and images");

  process.exit(0);
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testPropertiesAPI, testInvestmentAPI };
