const http = require("http");

function makeRequest(path, method = "GET", body = null, token = null) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: "localhost",
      port: 5000,
      path: `/api${path}`,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (token) {
      options.headers["Authorization"] = `Bearer ${token}`;
    }

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

async function testCompleteReferralFlow() {
  console.log("🧪 TESTING COMPLETE REFERRAL REWARD SYSTEM");
  console.log("==========================================\n");

  const timestamp = Date.now();
  let userA = null;
  let userB = null;
  let userAToken = null;
  let userBToken = null;
  let referralCode = null;

  try {
    // =====================================
    // STEP 1: Create User A (Referrer)
    // =====================================
    console.log("📋 STEP 1: Creating User A (Referrer)...");
    const userAData = {
      name: "Alice",
      surname: "Referrer",
      email: `alice.referrer.${timestamp}@test.com`,
      password: "TestPassword123!",
      birthdate: "1990-01-01",
      phone: "+216123456789",
    };

    const signupA = await makeRequest("/auth/sign-up", "POST", userAData);
    console.log(`✅ User A Signup Status: ${signupA.status}`);

    if (signupA.status !== 201) {
      console.log("❌ Failed to create User A:", signupA.data);
      return;
    }

    userA = signupA.data.user;
    console.log(
      `📧 User A created with ID: ${userA.id}, Email: ${userA.email}`
    );

    // Simulate email verification for User A
    console.log("📧 Simulating email verification for User A...");
    const verifyA = await makeRequest("/auth/verify-email", "POST", {
      email: userA.email,
      code: "1234", // Mock verification code
    });
    console.log(`✅ User A Email Verification Status: ${verifyA.status}`);

    // Simulate User A approval by admin
    console.log("👤 Simulating admin approval for User A...");
    // Since we need admin access, let's use mock token for User 1 (admin)
    const approveA = await makeRequest(
      "/admin/user-management/users/" + userA.id + "/approve-pending",
      "PUT",
      {
        roleName: "user",
      },
      "mock-token-user-1"
    );
    console.log(`✅ User A Approval Status: ${approveA.status}`);

    // Login User A to get token and referral code
    console.log("🔐 Logging in User A...");
    const loginA = await makeRequest("/auth/sign-in", "POST", {
      email: userA.email,
      password: userAData.password,
    });
    console.log(`✅ User A Login Status: ${loginA.status}`);

    if (loginA.status === 200) {
      userAToken = loginA.data.accessToken;
      console.log("🔑 User A authenticated successfully");
    }

    // Get User A's referral code
    console.log("🔗 Getting User A's referral code...");
    const referralInfo = await makeRequest(
      "/referrals/info",
      "GET",
      null,
      userAToken
    );
    console.log(`✅ Referral Info Status: ${referralInfo.status}`);

    if (referralInfo.status === 200) {
      referralCode = referralInfo.data.data.code;
      console.log(`🎯 User A's referral code: ${referralCode}`);
      console.log(
        `💰 Reward amount: ${referralInfo.data.data.referralAmount} ${referralInfo.data.data.currency}`
      );
      console.log(
        `📊 Min investment: ${referralInfo.data.data.minInvestment} ${referralInfo.data.data.currency}`
      );
    } else {
      console.log("❌ Failed to get referral code:", referralInfo.data);
      return;
    }

    console.log("");

    // =====================================
    // STEP 2: Create User B (Referee) with Referral Code
    // =====================================
    console.log("📋 STEP 2: Creating User B (Referee) with referral code...");
    const userBData = {
      name: "Bob",
      surname: "Referee",
      email: `bob.referee.${timestamp}@test.com`,
      password: "TestPassword123!",
      birthdate: "1992-01-01",
      phone: "+216987654321",
      referralCode: referralCode, // Using User A's referral code
    };

    const signupB = await makeRequest("/auth/sign-up", "POST", userBData);
    console.log(`✅ User B Signup Status: ${signupB.status}`);

    if (signupB.status !== 201) {
      console.log("❌ Failed to create User B:", signupB.data);
      return;
    }

    userB = signupB.data.user;
    console.log(
      `📧 User B created with ID: ${userB.id}, Email: ${userB.email}`
    );
    console.log(
      `🎯 Referral processed: ${signupB.data.user.referralProcessed}`
    );

    console.log("");

    // =====================================
    // STEP 3: Check Wallets BEFORE Rewards
    // =====================================
    console.log("📋 STEP 3: Checking wallets BEFORE rewards...");

    const walletABefore = await makeRequest("/wallet", "GET", null, userAToken);
    console.log(`💰 User A wallet (before): Status ${walletABefore.status}`);
    if (walletABefore.status === 200) {
      const walletA = walletABefore.data.data;
      console.log(`   Cash: ${walletA.cashBalance} ${walletA.currency}`);
      console.log(`   Rewards: ${walletA.rewardsBalance} ${walletA.currency}`);
      console.log(`   Total: ${walletA.totalBalance} ${walletA.currency}`);
    }

    console.log("");

    // =====================================
    // STEP 4: Approve User B (Triggers Referee Reward)
    // =====================================
    console.log(
      "📋 STEP 4: Approving User B (should trigger referee reward)..."
    );

    // Simulate email verification for User B first
    console.log("📧 Simulating email verification for User B...");
    const verifyB = await makeRequest("/auth/verify-email", "POST", {
      email: userB.email,
      code: "1234", // Mock verification code
    });
    console.log(`✅ User B Email Verification Status: ${verifyB.status}`);

    // Approve User B (this should trigger referee reward)
    const approveB = await makeRequest(
      "/admin/user-management/users/" + userB.id + "/approve-pending",
      "PUT",
      {
        roleName: "user",
      },
      "mock-token-user-1"
    );
    console.log(`✅ User B Approval Status: ${approveB.status}`);

    if (approveB.status === 200) {
      console.log("🎉 User B approved! Referee reward should be processed...");
    }

    // Login User B to get token
    console.log("🔐 Logging in User B...");
    const loginB = await makeRequest("/auth/sign-in", "POST", {
      email: userB.email,
      password: userBData.password,
    });
    console.log(`✅ User B Login Status: ${loginB.status}`);

    if (loginB.status === 200) {
      userBToken = loginB.data.accessToken;
      console.log("🔑 User B authenticated successfully");
    }

    console.log("");

    // =====================================
    // STEP 5: Check Wallets AFTER User B Approval
    // =====================================
    console.log("📋 STEP 5: Checking wallets AFTER User B approval...");

    const walletAAfterApproval = await makeRequest(
      "/wallet",
      "GET",
      null,
      userAToken
    );
    const walletBAfterApproval = await makeRequest(
      "/wallet",
      "GET",
      null,
      userBToken
    );

    console.log(
      `💰 User A wallet (after B's approval): Status ${walletAAfterApproval.status}`
    );
    if (walletAAfterApproval.status === 200) {
      const walletA = walletAAfterApproval.data.data;
      console.log(`   Cash: ${walletA.cashBalance} ${walletA.currency}`);
      console.log(`   Rewards: ${walletA.rewardsBalance} ${walletA.currency}`);
      console.log(`   Total: ${walletA.totalBalance} ${walletA.currency}`);
    }

    console.log(
      `💰 User B wallet (after approval): Status ${walletBAfterApproval.status}`
    );
    if (walletBAfterApproval.status === 200) {
      const walletB = walletBAfterApproval.data.data;
      console.log(`   Cash: ${walletB.cashBalance} ${walletB.currency}`);
      console.log(
        `   🎁 Rewards: ${walletB.rewardsBalance} ${walletB.currency} ⭐`
      );
      console.log(`   Total: ${walletB.totalBalance} ${walletB.currency}`);

      if (walletB.rewardsBalance > 0) {
        console.log("🎉 SUCCESS! User B received referee reward!");
      }
    }

    console.log("");

    // =====================================
    // STEP 6: Add Money to User B's Wallet for Investment
    // =====================================
    console.log("📋 STEP 6: Adding money to User B's wallet for investment...");

    const depositB = await makeRequest(
      "/wallet/deposit",
      "POST",
      {
        amount: 3000,
        description: "Test deposit for referral investment test",
      },
      userBToken
    );
    console.log(`✅ User B Deposit Status: ${depositB.status}`);

    if (depositB.status === 200) {
      console.log("💰 Money added to User B's wallet successfully");
    }

    console.log("");

    // =====================================
    // STEP 7: User B Makes Qualifying Investment (Triggers Referrer Reward)
    // =====================================
    console.log(
      "📋 STEP 7: User B making qualifying investment (should trigger referrer reward)..."
    );

    const investmentData = {
      projectId: 1, // Assuming project 1 exists
      amount: 2500, // Above minimum threshold
      paymentMethod: "wallet",
    };

    const investment = await makeRequest(
      "/investments",
      "POST",
      investmentData,
      userBToken
    );
    console.log(`✅ User B Investment Status: ${investment.status}`);

    if (investment.status === 201) {
      console.log("🎉 Investment created successfully!");
      console.log(
        `💵 Investment amount: ${investment.data.data.investment.amount} ${investment.data.data.investment.currency}`
      );
      console.log("🔄 Referrer reward should be processed...");
    } else {
      console.log("❌ Investment failed:", investment.data);
    }

    console.log("");

    // =====================================
    // STEP 8: Check Final Wallets (Both Should Have Rewards)
    // =====================================
    console.log(
      "📋 STEP 8: Checking FINAL wallets (both should have rewards)..."
    );

    const walletAFinal = await makeRequest("/wallet", "GET", null, userAToken);
    const walletBFinal = await makeRequest("/wallet", "GET", null, userBToken);

    console.log(`💰 User A FINAL wallet: Status ${walletAFinal.status}`);
    if (walletAFinal.status === 200) {
      const walletA = walletAFinal.data.data;
      console.log(`   Cash: ${walletA.cashBalance} ${walletA.currency}`);
      console.log(
        `   🎁 Rewards: ${walletA.rewardsBalance} ${walletA.currency} ⭐`
      );
      console.log(`   Total: ${walletA.totalBalance} ${walletA.currency}`);

      if (walletA.rewardsBalance > 0) {
        console.log("🎉 SUCCESS! User A received referrer reward!");
      }
    }

    console.log(`💰 User B FINAL wallet: Status ${walletBFinal.status}`);
    if (walletBFinal.status === 200) {
      const walletB = walletBFinal.data.data;
      console.log(`   Cash: ${walletB.cashBalance} ${walletB.currency}`);
      console.log(
        `   🎁 Rewards: ${walletB.rewardsBalance} ${walletB.currency} ⭐`
      );
      console.log(`   Total: ${walletB.totalBalance} ${walletB.currency}`);
    }

    console.log("");

    // =====================================
    // STEP 9: Check Transaction History
    // =====================================
    console.log(
      "📋 STEP 9: Checking transaction history for referral bonuses..."
    );

    const transactionsA = await makeRequest(
      "/wallet/transactions",
      "GET",
      null,
      userAToken
    );
    console.log(`📊 User A Transactions Status: ${transactionsA.status}`);
    if (transactionsA.status === 200) {
      const referralTxsA = transactionsA.data.data.transactions.filter(
        (tx) => tx.type === "referral_bonus"
      );
      console.log(
        `🎁 User A referral bonus transactions: ${referralTxsA.length}`
      );
      referralTxsA.forEach((tx) => {
        console.log(
          `   - ${tx.description}: ${tx.amount} ${tx.currency} (${tx.createdAt})`
        );
      });
    }

    const transactionsB = await makeRequest(
      "/wallet/transactions",
      "GET",
      null,
      userBToken
    );
    console.log(`📊 User B Transactions Status: ${transactionsB.status}`);
    if (transactionsB.status === 200) {
      const referralTxsB = transactionsB.data.data.transactions.filter(
        (tx) => tx.type === "referral_bonus"
      );
      console.log(
        `🎁 User B referral bonus transactions: ${referralTxsB.length}`
      );
      referralTxsB.forEach((tx) => {
        console.log(
          `   - ${tx.description}: ${tx.amount} ${tx.currency} (${tx.createdAt})`
        );
      });
    }

    console.log("");

    // =====================================
    // FINAL SUMMARY
    // =====================================
    console.log("🎉 REFERRAL REWARD TEST COMPLETED!");
    console.log("==================================");
    console.log(`👤 User A (Referrer): ID ${userA.id}, Email: ${userA.email}`);
    console.log(`👤 User B (Referee): ID ${userB.id}, Email: ${userB.email}`);
    console.log(`🔗 Referral Code Used: ${referralCode}`);

    if (walletAFinal.status === 200 && walletBFinal.status === 200) {
      const rewardsA = walletAFinal.data.data.rewardsBalance;
      const rewardsB = walletBFinal.data.data.rewardsBalance;
      const currency = walletAFinal.data.data.currency;

      console.log(`💰 User A Rewards: ${rewardsA} ${currency}`);
      console.log(`💰 User B Rewards: ${rewardsB} ${currency}`);

      if (rewardsA > 0 && rewardsB > 0) {
        console.log("✅ SUCCESS: Both users received their referral rewards!");
      } else if (rewardsB > 0) {
        console.log("⚠️ PARTIAL: Only User B (referee) received reward");
      } else if (rewardsA > 0) {
        console.log("⚠️ PARTIAL: Only User A (referrer) received reward");
      } else {
        console.log("❌ FAILED: Neither user received rewards");
      }
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
    console.error("Stack trace:", error.stack);
  }
}

testCompleteReferralFlow();
