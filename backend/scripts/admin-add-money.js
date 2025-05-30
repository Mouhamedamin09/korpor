#!/usr/bin/env node

const readline = require("readline");
const { User, Wallet, Transaction, sequelize } = require("../src/models");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask questions
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Function to validate user ID
async function validateUserId(userId) {
  try {
    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`❌ User with ID ${userId} not found.`);
      return false;
    }
    console.log(
      `✅ User found: ${user.fullName || user.email} (ID: ${userId})`
    );
    return user;
  } catch (error) {
    console.log(`❌ Error validating user: ${error.message}`);
    return false;
  }
}

// Function to validate amount
function validateAmount(amount) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    console.log(`❌ Invalid amount. Please enter a positive number.`);
    return false;
  }
  return numAmount;
}

// Function to get or create wallet
async function getOrCreateWallet(userId, transaction) {
  let wallet = await Wallet.findOne({
    where: { userId },
    transaction,
  });

  if (!wallet) {
    const user = await User.findByPk(userId);
    wallet = await Wallet.create(
      {
        userId,
        currency: user.currency || "TND",
        cashBalance: 0.0,
        rewardsBalance: 0.0,
      },
      { transaction }
    );
    console.log(`📝 Created new wallet for user ${userId}`);
  }

  return wallet;
}

// Function to add money to wallet
async function addMoneyToWallet(
  userId,
  amount,
  description,
  balanceType = "cash"
) {
  console.log(
    `🔍 DEBUG: addMoneyToWallet called with amount: ${amount} (type: ${typeof amount})`
  );

  const t = await sequelize.transaction();

  try {
    // Get or create wallet
    const wallet = await getOrCreateWallet(userId, t);

    console.log(`🔍 DEBUG: About to create transaction with amount: ${amount}`);

    // Create transaction record
    const transactionRecord = await Transaction.create(
      {
        userId,
        walletId: wallet.id,
        type: "deposit",
        amount,
        currency: wallet.currency,
        status: "completed",
        description: description || `Admin deposit - ${balanceType}`,
        reference: `ADMIN_${Date.now()}`,
        balanceType: balanceType,
        processedAt: new Date(),
        metadata: {
          addedBy: "admin_script",
          timestamp: new Date().toISOString(),
        },
      },
      { transaction: t }
    );

    console.log(
      `🔍 DEBUG: Transaction created with amount: ${transactionRecord.amount}`
    );

    // Update wallet balance
    const oldBalance = parseFloat(
      balanceType === "cash" ? wallet.cashBalance : wallet.rewardsBalance
    );
    const newBalance = oldBalance + parseFloat(amount);

    console.log(
      `🔍 DEBUG: Old balance: ${oldBalance}, Adding: ${parseFloat(
        amount
      )}, New balance: ${newBalance}`
    );

    if (balanceType === "cash") {
      wallet.cashBalance = newBalance;
    } else {
      wallet.rewardsBalance = newBalance;
    }

    wallet.lastTransactionAt = new Date();
    await wallet.save({ transaction: t });

    await t.commit();

    console.log(
      `\n✅ SUCCESS: Added ${amount} ${wallet.currency} to user ${userId}'s ${balanceType} balance`
    );
    console.log(
      `📊 Previous ${balanceType} balance: ${oldBalance} ${wallet.currency}`
    );
    console.log(
      `📊 New ${balanceType} balance: ${newBalance} ${wallet.currency}`
    );
    console.log(
      `📊 Total balance: ${
        parseFloat(wallet.cashBalance) + parseFloat(wallet.rewardsBalance)
      } ${wallet.currency}`
    );
    console.log(`🧾 Transaction ID: ${transactionRecord.id}`);

    return true;
  } catch (error) {
    await t.rollback();
    console.log(`❌ Error adding money: ${error.message}`);
    console.log(`🔍 DEBUG: Error details:`, error);
    return false;
  }
}

// Function to show user wallet details
async function showWalletDetails(userId) {
  try {
    const wallet = await Wallet.findOne({
      where: { userId },
      include: [
        {
          model: User,
          as: "walletUser",
          attributes: ["id", "fullName", "email", "currency"],
        },
      ],
    });

    if (!wallet) {
      console.log(`📭 No wallet found for user ${userId}`);
      return;
    }

    console.log(`\n💳 WALLET DETAILS:`);
    console.log(
      `