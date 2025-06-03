const User = require("../models/User");
const Referral = require("../models/Referral");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const { sequelize } = require("../config/db.config");

/**
 * Get or create wallet for a user
 */
async function getOrCreateWallet(userId, transaction = null) {
  let wallet = await Wallet.findOne({
    where: { userId },
    transaction,
  });

  if (!wallet) {
    const user = await User.findByPk(userId, { transaction });
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

/**
 * Add reward to user's wallet
 */
async function addRewardToWallet(
  userId,
  amount,
  description,
  referralId,
  transaction = null
) {
  try {
    // Get or create wallet
    const wallet = await getOrCreateWallet(userId, transaction);

    // Create transaction record
    const transactionRecord = await Transaction.create(
      {
        userId,
        walletId: wallet.id,
        type: "referral_bonus",
        amount,
        currency: wallet.currency,
        status: "completed",
        description,
        reference: `REF_${referralId}`,
        balanceType: "rewards",
        processedAt: new Date(),
        metadata: {
          referralId,
          rewardType: "referral_bonus",
          timestamp: new Date().toISOString(),
        },
      },
      { transaction }
    );

    // Update wallet rewards balance
    wallet.rewardsBalance =
      parseFloat(wallet.rewardsBalance) + parseFloat(amount);
    wallet.lastTransactionAt = new Date();
    await wallet.save({ transaction });

    console.log(
      `✅ Added ${amount} ${wallet.currency} reward to user ${userId} (Referral ID: ${referralId})`
    );

    return {
      transactionId: transactionRecord.id,
      newBalance: {
        cashBalance: parseFloat(wallet.cashBalance),
        rewardsBalance: parseFloat(wallet.rewardsBalance),
        totalBalance:
          parseFloat(wallet.cashBalance) + parseFloat(wallet.rewardsBalance),
      },
    };
  } catch (error) {
    console.error(`❌ Error adding reward to user ${userId}:`, error);
    throw error;
  }
}

/**
 * Process referee (new user) signup reward
 * Called when a new user completes email verification and is approved
 */
async function processRefereeSignupReward(userId) {
  const t = await sequelize.transaction();

  try {
    console.log(`🔄 Processing referee signup reward for user ${userId}`);

    // Find referral record for this user as referee
    const referral = await Referral.findOne({
      where: {
        refereeId: userId,
        status: "pending",
      },
      include: [
        {
          model: User,
          as: "referrer",
          attributes: ["id", "email", "currency"],
        },
      ],
      transaction: t,
    });

    if (!referral) {
      console.log(`ℹ️ No pending referral found for user ${userId}`);
      await t.rollback();
      return { success: false, message: "No pending referral found" };
    }

    console.log(
      `📋 Found referral: ${referral.id} - Referrer: ${referral.referrer.email}`
    );

    // Add reward to referee (new user)
    const refereeResult = await addRewardToWallet(
      userId,
      referral.refereeReward,
      `Welcome bonus - Referred by user #${referral.referrerId}`,
      referral.id,
      t
    );

    // Update referral status to indicate referee reward has been given
    await referral.update(
      {
        status: "qualified", // Changed from pending to qualified
        qualifiedAt: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    console.log(`🎉 Referee signup reward processed successfully:
      - User: ${userId}
      - Reward: ${referral.refereeReward} ${referral.currency}
      - Transaction ID: ${refereeResult.transactionId}
      - Referral Status: qualified`);

    return {
      success: true,
      message: "Referee signup reward processed successfully",
      data: {
        referralId: referral.id,
        refereeReward: referral.refereeReward,
        currency: referral.currency,
        transactionId: refereeResult.transactionId,
        newBalance: refereeResult.newBalance,
      },
    };
  } catch (error) {
    await t.rollback();
    console.error("❌ Error processing referee signup reward:", error);
    throw error;
  }
}

/**
 * Process referrer reward when referee makes qualifying investment
 * Called when a referred user makes an investment above the minimum threshold
 */
async function processReferrerInvestmentReward(
  refereeUserId,
  investmentAmount
) {
  const t = await sequelize.transaction();

  try {
    console.log(
      `🔄 Processing referrer investment reward for referee ${refereeUserId} (Investment: ${investmentAmount})`
    );

    // Find referral record for this user as referee
    const referral = await Referral.findOne({
      where: {
        refereeId: refereeUserId,
        status: "qualified", // Must be qualified (referee already got their reward)
      },
      include: [
        {
          model: User,
          as: "referrer",
          attributes: ["id", "email", "currency"],
        },
      ],
      transaction: t,
    });

    if (!referral) {
      console.log(`ℹ️ No qualified referral found for user ${refereeUserId}`);
      await t.rollback();
      return { success: false, message: "No qualified referral found" };
    }

    // Check minimum investment requirement
    const minimumInvestment = referral.currency === "EUR" ? 800 : 2000;

    if (parseFloat(investmentAmount) < minimumInvestment) {
      console.log(
        `ℹ️ Investment amount ${investmentAmount} is below minimum ${minimumInvestment} ${referral.currency}`
      );
      await t.rollback();
      return {
        success: false,
        message: `Investment amount is below minimum requirement of ${minimumInvestment} ${referral.currency}`,
      };
    }

    // Update referral with investment amount
    await referral.update(
      {
        refereeInvestmentAmount: investmentAmount,
      },
      { transaction: t }
    );

    // Add reward to referrer
    const referrerResult = await addRewardToWallet(
      referral.referrerId,
      referral.referrerReward,
      `Referral bonus - User #${refereeUserId} invested ${investmentAmount} ${referral.currency}`,
      referral.id,
      t
    );

    // Update referral status to rewarded
    await referral.update(
      {
        status: "rewarded",
        rewardedAt: new Date(),
      },
      { transaction: t }
    );

    await t.commit();

    console.log(`🎉 Referrer investment reward processed successfully:
      - Referrer: ${referral.referrerId}
      - Referee: ${refereeUserId}
      - Investment: ${investmentAmount} ${referral.currency}
      - Reward: ${referral.referrerReward} ${referral.currency}
      - Transaction ID: ${referrerResult.transactionId}
      - Referral Status: rewarded`);

    return {
      success: true,
      message: "Referrer investment reward processed successfully",
      data: {
        referralId: referral.id,
        referrerId: referral.referrerId,
        refereeId: refereeUserId,
        investmentAmount,
        referrerReward: referral.referrerReward,
        currency: referral.currency,
        transactionId: referrerResult.transactionId,
        newBalance: referrerResult.newBalance,
      },
    };
  } catch (error) {
    await t.rollback();
    console.error("❌ Error processing referrer investment reward:", error);
    throw error;
  }
}

/**
 * Check and process pending referral rewards for a user
 * This can be called during user verification or other appropriate times
 */
async function checkAndProcessPendingReferralRewards(userId) {
  try {
    console.log(`🔍 Checking pending referral rewards for user ${userId}`);

    // Check if user has pending referral as referee
    const pendingReferral = await Referral.findOne({
      where: {
        refereeId: userId,
        status: "pending",
      },
    });

    if (pendingReferral) {
      console.log(
        `🎯 Found pending referral for user ${userId}, processing signup reward...`
      );
      return await processRefereeSignupReward(userId);
    } else {
      console.log(`ℹ️ No pending referral rewards found for user ${userId}`);
      return { success: false, message: "No pending referral rewards found" };
    }
  } catch (error) {
    console.error("❌ Error checking pending referral rewards:", error);
    throw error;
  }
}

module.exports = {
  processRefereeSignupReward,
  processReferrerInvestmentReward,
  checkAndProcessPendingReferralRewards,
  addRewardToWallet,
  getOrCreateWallet,
};
