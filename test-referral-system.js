const http = require("http");

function makeRequest(
  path,
  method = "GET",
  body = null,
  token = "mock-token-user-1"
) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: "localhost",
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    if (postData) {
      options.headers["Content-Length"] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function testReferralSystem() {
  console.log("🧪 Testing Complete Referral Reward System");
  console.log("==========================================\n");

  try {
    // Step 1: Get User 1's referral code
    console.log("📋 Step 1: Getting User 1 referral info...");
    const referralInfo = await makeRequest("/referrals/info");
    console.log(
      "✅ Referral Info:",
      JSON.stringify(referralInfo.data, null, 2)
    );

    const referralCode = referralInfo.data.data.code;
    console.log(`🔗 User 1 referral code: ${referralCode}\n`);

    // Step 2: Create a new user with referral code (simulate signup)
    console.log("📋 Step 2: Creating new user with referral code...");
    const newUserData = {
      name: "Referred",
      surname: "User",
      email: `referred-user-${Date.now()}@example.com`,
      password: "TestPassword123!",
      birthdate: "1995-01-01",
      phone: "+216987654321",
      referralCode: referralCode,
    };

    const signupResponse = await makeRequest(
      "/auth/signup",
      "POST",
      newUserData,
      null
    );
    console.log("✅ Signup Response Status:", signupResponse.status);
    console.log("📧 New User ID:", signupResponse.data.user.id);
    const newUserId = signupResponse.data.user.id;
    console.log(
      `🎯 Referral processed: ${signupResponse.data.user.referralProcessed}\n`
    );

    // Step 3: Simulate user approval (triggers referee reward)
    console.log("📋 Step 3: Simulating user approval...");
    const approvalData = {
      roleName: "user",
    };

    // Since we don't have admin endpoint access with our test, let's check the referral service directly
    console.log("🔄 Checking referral rewards service...");

    // Step 4: Check wallets before rewards
    console.log("📋 Step 4: Checking wallets before rewards...");
    const user1WalletBefore = await makeRequest(
      "/wallet",
      "GET",
      null,
      "mock-token-user-1"
    );
    const newUserWalletBefore = await makeRequest(
      "/wallet",
      "GET",
      null,
      `mock-token-user-${newUserId}`
    );

    console.log(
      "💰 User 1 wallet before:",
      user1WalletBefore.data.data?.rewardsBalance || 0
    );
    console.log(
      `💰 User ${newUserId} wallet before:`,
      newUserWalletBefore.data.data?.rewardsBalance || 0
    );
    console.log("");

    // Step 5: Check current referrals
    console.log("📋 Step 5: Checking current referrals...");
    const referralsCheck = await makeRequest("/referrals/info");
    console.log("📊 Current referral stats:", referralsCheck.data.data.stats);
    console.log("");

    // Step 6: Simulate investment by referred user (triggers referrer reward)
    console.log("📋 Step 6: Simulating investment by referred user...");
    const investmentData = {
      projectId: 1, // Assuming project 1 exists
      amount: 2500, // Above minimum threshold for TND (2000)
      paymentMethod: "wallet",
    };

    // First add money to the new user's wallet for investment
    console.log("💰 Adding money to new user wallet for investment...");
    const depositData = {
      amount: 3000,
      description: "Test deposit for referral investment",
    };

    const depositResponse = await makeRequest(
      "/wallet/deposit",
      "POST",
      depositData,
      `mock-token-user-${newUserId}`
    );
    console.log(
      "✅ Deposit Response:",
      depositResponse.status === 200 ? "Success" : "Failed"
    );

    // Now make the investment
    const investmentResponse = await makeRequest(
      "/investments",
      "POST",
      investmentData,
      `mock-token-user-${newUserId}`
    );
    console.log("✅ Investment Response:", investmentResponse.status);
    if (investmentResponse.status === 201) {
      console.log("🎉 Investment created successfully!");
      console.log(
        "💵 Investment amount:",
        investmentResponse.data.data.investment.amount
      );
    } else {
      console.log("❌ Investment failed:", investmentResponse.data);
    }
    console.log("");

    // Step 7: Check wallets after rewards
    console.log("📋 Step 7: Checking wallets after rewards...");
    const user1WalletAfter = await makeRequest(
      "/wallet",
      "GET",
      null,
      "mock-token-user-1"
    );
    const newUserWalletAfter = await makeRequest(
      "/wallet",
      "GET",
      null,
      `mock-token-user-${newUserId}`
    );

    console.log(
      "💰 User 1 wallet after:",
      user1WalletAfter.data.data?.rewardsBalance || 0
    );
    console.log(
      `💰 User ${newUserId} wallet after:`,
      newUserWalletAfter.data.data?.rewardsBalance || 0
    );

    // Step 8: Check transactions
    console.log("\n📋 Step 8: Checking transaction history...");
    const user1Transactions = await makeRequest(
      "/wallet/transactions",
      "GET",
      null,
      "mock-token-user-1"
    );
    const newUserTransactions = await makeRequest(
      "/wallet/transactions",
      "GET",
      null,
      `mock-token-user-${newUserId}`
    );

    console.log("📊 User 1 recent transactions:");
    if (user1Transactions.data.data?.transactions) {
      user1Transactions.data.data.transactions.slice(0, 3).forEach((tx) => {
        console.log(
          `  - ${tx.type}: ${tx.amount} ${tx.currency} (${tx.description})`
        );
      });
    }

    console.log(`📊 User ${newUserId} recent transactions:`);
    if (newUserTransactions.data.data?.transactions) {
      newUserTransactions.data.data.transactions.slice(0, 3).forEach((tx) => {
        console.log(
          `  - ${tx.type}: ${tx.amount} ${tx.currency} (${tx.description})`
        );
      });
    }

    console.log("\n🎉 Referral system test completed!");
    console.log("=====================================");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testReferralSystem();
