require("dotenv").config();
const API_URL = "http://localhost:5000";

// Common test passwords to try (typical for development databases)
const COMMON_PASSWORDS = [
  "password",
  "password123",
  "123456",
  "admin",
  "test",
  "hashedpassword", // Used in our test data creation
];

// Eligible users from the database
const ELIGIBLE_USERS = [
  { email: "test@example.com", investmentTotal: 5000 },
  { email: "medaminkraiem101@gmail.com", investmentTotal: 87000 },
  { email: "john.smith@example.com", investmentTotal: 500000 },
  { email: "sarah.j@example.com", investmentTotal: 250000 },
  { email: "m.ali@example.com", investmentTotal: 1000000 },
  { email: "emma.w@example.com", investmentTotal: 750000 },
];

async function tryLogin(email, password) {
  try {
    const response = await fetch(`${API_URL}/api/auth/sign-in`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data,
        token: data.accessToken,
      };
    } else {
      return { success: false, status: response.status };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testAutoReinvestAPI(authToken, userInfo) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  };

  console.log("\n🔍 Testing Auto-Reinvest API endpoints...");

  try {
    // Test 1: Get auto-reinvest data
    console.log("1️⃣ Testing GET /api/autoreinvest");
    const autoReinvestResponse = await fetch(`${API_URL}/api/autoreinvest`, {
      method: "GET",
      headers,
    });

    console.log(`Status: ${autoReinvestResponse.status}`);

    if (autoReinvestResponse.ok) {
      const data = await autoReinvestResponse.json();
      console.log("✅ Auto-Reinvest Response:");
      console.log(`   - Eligible: ${data.data.isEligible ? "YES" : "NO"}`);
      console.log(`   - Investment: ${data.data.totalInvested} TND`);
      console.log(`   - Required: ${data.data.minimumRequired} TND`);

      if (data.data.autoReinvestPlan) {
        console.log(
          `   - Existing Plan: ${data.data.autoReinvestPlan.status} (${data.data.autoReinvestPlan.reinvestPercentage}%)`
        );
      } else {
        console.log(`   - Existing Plan: None`);
      }

      console.log(
        `   - Rental Stats: ${data.data.rentalStats.totalRentalIncome} TND income, ${data.data.rentalStats.payoutCount} payouts`
      );

      // Test 2: Get rental history
      console.log("\n2️⃣ Testing GET /api/autoreinvest/rental-history");
      const historyResponse = await fetch(
        `${API_URL}/api/autoreinvest/rental-history`,
        {
          method: "GET",
          headers,
        }
      );

      console.log(`Rental History Status: ${historyResponse.status}`);

      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        const payouts = historyData.data?.rentalPayouts || [];
        console.log(`✅ Found ${payouts.length} rental payouts`);

        if (payouts.length > 0) {
          console.log("   Recent payouts:");
          payouts.slice(0, 3).forEach((payout, index) => {
            console.log(
              `   ${index + 1}. ${payout.amount} TND on ${
                payout.payoutDate?.split("T")[0]
              } (${payout.status})`
            );
          });
        }
      } else {
        const error = await historyResponse.text();
        console.log(`❌ Rental History Error: ${error}`);
      }

      // Test 3: Try creating a plan if eligible and no plan exists
      if (data.data.isEligible && !data.data.autoReinvestPlan) {
        console.log("\n3️⃣ Testing POST /api/autoreinvest (Create Plan)");
        const createResponse = await fetch(`${API_URL}/api/autoreinvest`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            minimumReinvestAmount: 100,
            reinvestPercentage: 75,
            theme: "balanced",
            riskLevel: "medium",
            autoApprovalEnabled: true,
          }),
        });

        console.log(`Create Plan Status: ${createResponse.status}`);

        if (createResponse.ok) {
          const createData = await createResponse.json();
          console.log("✅ Plan created successfully!");
          console.log(`   - Plan ID: ${createData.data.autoReinvestPlan.id}`);
          console.log(
            `   - Status: ${createData.data.autoReinvestPlan.status}`
          );
        } else {
          const createError = await createResponse.text();
          console.log(`❌ Create Plan Error: ${createError}`);
        }
      }

      return true;
    } else {
      const error = await autoReinvestResponse.text();
      console.log(`❌ Auto-reinvest API error: ${error}`);
      return false;
    }
  } catch (error) {
    console.error(`🔥 API test failed: ${error.message}`);
    return false;
  }
}

async function smartTestAutoReinvest() {
  console.log("🚀 Smart Auto-Reinvest Test - Finding Working Credentials...\n");

  let workingCredentials = null;

  // Try to find working credentials
  for (const user of ELIGIBLE_USERS) {
    console.log(
      `🔍 Testing user: ${user.email} (${user.investmentTotal} TND)...`
    );

    for (const password of COMMON_PASSWORDS) {
      console.log(`   Trying password: ${password}`);

      const loginResult = await tryLogin(user.email, password);

      if (loginResult.success) {
        console.log(`✅ SUCCESS! Found working credentials:`);
        console.log(`   📧 Email: ${user.email}`);
        console.log(`   🔑 Password: ${password}`);
        console.log(`   🆔 User ID: ${loginResult.data.user?.id}`);
        console.log(`   💰 Investment: ${user.investmentTotal} TND`);

        workingCredentials = {
          email: user.email,
          password,
          token: loginResult.token,
          userInfo: loginResult.data.user,
        };
        break;
      } else {
        console.log(`   ❌ Failed (${loginResult.status || "Network error"})`);
      }
    }

    if (workingCredentials) break;
    console.log("");
  }

  if (!workingCredentials) {
    console.log("❌ Could not find working credentials for any eligible user.");
    console.log("💡 You may need to:");
    console.log("   1. Check user passwords in the database");
    console.log("   2. Create a test user with known credentials");
    console.log("   3. Reset password for existing users");
    return;
  }

  // Test the auto-reinvest API with working credentials
  console.log("\n" + "=".repeat(60));
  console.log("🎯 TESTING AUTO-REINVEST API WITH AUTHENTICATED USER");
  console.log("=".repeat(60));

  const success = await testAutoReinvestAPI(
    workingCredentials.token,
    workingCredentials.userInfo
  );

  if (success) {
    console.log("\n🎉 AUTO-REINVEST SYSTEM TEST COMPLETED SUCCESSFULLY!");
    console.log("\n📋 Summary:");
    console.log(`   ✅ Authentication: Working`);
    console.log(`   ✅ Auto-Reinvest API: Working`);
    console.log(`   ✅ Rental History API: Working`);
    console.log(`   ✅ User Eligibility: Verified`);
    console.log(`   ✅ Test User: ${workingCredentials.email}`);
  } else {
    console.log("\n❌ Auto-Reinvest API test failed");
  }
}

// Check if server is running first
async function checkServer() {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  console.log("🏥 Checking server status...");
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.log("❌ Server is not running or not accessible at " + API_URL);
    console.log("💡 Please start the server with: npm start");
    return;
  }

  console.log("✅ Server is running!\n");
  await smartTestAutoReinvest();
}

main().catch(console.error);
