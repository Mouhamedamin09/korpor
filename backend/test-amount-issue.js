#!/usr/bin/env node

const { addMoneyToWallet } = require("./scripts/admin-add-money");
const { sequelize } = require("./src/models");

async function testAmountIssue() {
  console.log("🧪 Testing Amount Issue - Adding 5000 to user wallet");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const userId = 1; // Test with user ID 1
    const amount = 5000;
    const description = "Test deposit - checking 5000 vs 2000 issue";

    console.log(`🔍 Testing with amount: ${amount} (type: ${typeof amount})`);

    const result = await addMoneyToWallet(userId, amount, description, "cash");

    if (result) {
      console.log(`✅ Test completed successfully`);
    } else {
      console.log(`❌ Test failed`);
    }
  } catch (error) {
    console.error("❌ Test error:", error.message);
  } finally {
    await sequelize.close();
  }
}

testAmountIssue();
