const AutoInvest = require("../models/AutoInvest");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

/**
 * Create a new AutoInvest plan
 */
exports.createAutoInvest = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      monthlyAmount,
      theme,
      depositDay,
      paymentMethodId,
      riskLevel,
      preferredRegions,
      excludedPropertyTypes,
      notes,
    } = req.body;

    // Validation
    if (!monthlyAmount || !theme || !depositDay) {
      return res.status(400).json({
        success: false,
        message: "Monthly amount, theme, and deposit day are required",
      });
    }

    if (monthlyAmount < 100) {
      return res.status(400).json({
        success: false,
        message: "Minimum monthly amount is 100 TND",
      });
    }

    if (depositDay < 1 || depositDay > 28) {
      return res.status(400).json({
        success: false,
        message: "Deposit day must be between 1 and 28",
      });
    }

    // Check if user already has an active plan
    const existingPlan = await AutoInvest.findOne({
      where: { userId, status: "active" },
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message:
          "User already has an active AutoInvest plan. Please cancel or pause the existing plan first.",
      });
    }

    // Get user currency and verify account
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check user wallet balance
    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: "Wallet not found. Please set up your wallet first.",
      });
    }

    // Payment methods are flexible - users can pay with card or PayMe
    // No need to validate wallet balance for plan creation

    // Calculate next deposit date
    const nextDepositDate = calculateNextDepositDate(depositDay);

    // Create AutoInvest plan
    const autoInvestPlan = await AutoInvest.create({
      userId,
      monthlyAmount: parseFloat(monthlyAmount),
      currency: wallet?.currency || "TND",
      theme,
      depositDay: parseInt(depositDay),
      paymentMethodId,
      nextDepositDate,
      riskLevel: riskLevel || "medium",
      preferredRegions: preferredRegions || null,
      excludedPropertyTypes: excludedPropertyTypes || null,
      notes: notes || null,
    });

    return res.json({
      success: true,
      data: {
        autoInvestPlan: {
          id: autoInvestPlan.id,
          monthlyAmount: autoInvestPlan.monthlyAmount,
          currency: autoInvestPlan.currency,
          theme: autoInvestPlan.theme,
          status: autoInvestPlan.status,
          depositDay: autoInvestPlan.depositDay,
          nextDepositDate: autoInvestPlan.nextDepositDate,
          riskLevel: autoInvestPlan.riskLevel,
          totalDeposited: autoInvestPlan.totalDeposited,
          totalInvested: autoInvestPlan.totalInvested,
          createdAt: autoInvestPlan.createdAt,
        },
      },
      message: "AutoInvest plan created successfully",
    });
  } catch (error) {
    console.error("Error creating AutoInvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create AutoInvest plan",
    });
  }
};

/**
 * Get user's AutoInvest plan
 */
exports.getAutoInvest = async (req, res) => {
  try {
    const userId = req.user.id;

    const autoInvestPlan = await AutoInvest.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!autoInvestPlan) {
      return res.json({
        success: true,
        data: { autoInvestPlan: null },
        message: "No AutoInvest plan found",
      });
    }

    return res.json({
      success: true,
      data: {
        autoInvestPlan: {
          id: autoInvestPlan.id,
          monthlyAmount: autoInvestPlan.monthlyAmount,
          currency: autoInvestPlan.currency,
          theme: autoInvestPlan.theme,
          status: autoInvestPlan.status,
          depositDay: autoInvestPlan.depositDay,
          lastDepositDate: autoInvestPlan.lastDepositDate,
          nextDepositDate: autoInvestPlan.nextDepositDate,
          totalDeposited: autoInvestPlan.totalDeposited,
          totalInvested: autoInvestPlan.totalInvested,
          autoInvestEnabled: autoInvestPlan.autoInvestEnabled,
          riskLevel: autoInvestPlan.riskLevel,
          preferredRegions: autoInvestPlan.preferredRegions,
          excludedPropertyTypes: autoInvestPlan.excludedPropertyTypes,
          notes: autoInvestPlan.notes,
          createdAt: autoInvestPlan.createdAt,
          updatedAt: autoInvestPlan.updatedAt,
        },
      },
      message: "AutoInvest plan retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching AutoInvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AutoInvest plan",
    });
  }
};

/**
 * Update AutoInvest plan
 */
exports.updateAutoInvest = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      monthlyAmount,
      depositDay,
      paymentMethodId,
      riskLevel,
      preferredRegions,
      excludedPropertyTypes,
      notes,
    } = req.body;

    const autoInvestPlan = await AutoInvest.findOne({
      where: { userId, status: "active" },
    });

    if (!autoInvestPlan) {
      return res.status(404).json({
        success: false,
        message: "No active AutoInvest plan found",
      });
    }

    // Prepare update data
    const updateData = {};

    if (monthlyAmount !== undefined) {
      if (monthlyAmount < 100) {
        return res.status(400).json({
          success: false,
          message: "Minimum monthly amount is 100 TND",
        });
      }
      updateData.monthlyAmount = parseFloat(monthlyAmount);
    }

    if (depositDay !== undefined) {
      if (depositDay < 1 || depositDay > 28) {
        return res.status(400).json({
          success: false,
          message: "Deposit day must be between 1 and 28",
        });
      }
      updateData.depositDay = parseInt(depositDay);
      updateData.nextDepositDate = calculateNextDepositDate(depositDay);
    }

    if (paymentMethodId !== undefined)
      updateData.paymentMethodId = paymentMethodId;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel;
    if (preferredRegions !== undefined)
      updateData.preferredRegions = preferredRegions;
    if (excludedPropertyTypes !== undefined)
      updateData.excludedPropertyTypes = excludedPropertyTypes;
    if (notes !== undefined) updateData.notes = notes;

    // Update the plan
    await autoInvestPlan.update(updateData);

    return res.json({
      success: true,
      data: {
        autoInvestPlan: {
          id: autoInvestPlan.id,
          monthlyAmount: autoInvestPlan.monthlyAmount,
          currency: autoInvestPlan.currency,
          theme: autoInvestPlan.theme,
          status: autoInvestPlan.status,
          depositDay: autoInvestPlan.depositDay,
          nextDepositDate: autoInvestPlan.nextDepositDate,
          riskLevel: autoInvestPlan.riskLevel,
          totalDeposited: autoInvestPlan.totalDeposited,
          totalInvested: autoInvestPlan.totalInvested,
          updatedAt: autoInvestPlan.updatedAt,
        },
      },
      message: "AutoInvest plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating AutoInvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update AutoInvest plan",
    });
  }
};

/**
 * Pause/Resume AutoInvest plan
 */
exports.toggleAutoInvest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action } = req.body; // 'pause' or 'resume'

    if (!action || !["pause", "resume"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be either "pause" or "resume"',
      });
    }

    const autoInvestPlan = await AutoInvest.findOne({
      where: { userId, status: { [require("sequelize").Op.ne]: "cancelled" } },
    });

    if (!autoInvestPlan) {
      return res.status(404).json({
        success: false,
        message: "No AutoInvest plan found",
      });
    }

    const newStatus = action === "pause" ? "paused" : "active";

    await autoInvestPlan.update({
      status: newStatus,
      nextDepositDate:
        action === "resume"
          ? calculateNextDepositDate(autoInvestPlan.depositDay)
          : null,
    });

    return res.json({
      success: true,
      data: {
        autoInvestPlan: {
          id: autoInvestPlan.id,
          status: autoInvestPlan.status,
          nextDepositDate: autoInvestPlan.nextDepositDate,
        },
      },
      message: `AutoInvest plan ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error toggling AutoInvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update AutoInvest plan",
    });
  }
};

/**
 * Cancel AutoInvest plan
 */
exports.cancelAutoInvest = async (req, res) => {
  try {
    const userId = req.user.id;

    const autoInvestPlan = await AutoInvest.findOne({
      where: { userId, status: { [require("sequelize").Op.ne]: "cancelled" } },
    });

    if (!autoInvestPlan) {
      return res.status(404).json({
        success: false,
        message: "No active AutoInvest plan found",
      });
    }

    await autoInvestPlan.update({
      status: "cancelled",
      nextDepositDate: null,
    });

    return res.json({
      success: true,
      data: {
        autoInvestPlan: {
          id: autoInvestPlan.id,
          status: autoInvestPlan.status,
          totalDeposited: autoInvestPlan.totalDeposited,
          totalInvested: autoInvestPlan.totalInvested,
        },
      },
      message: "AutoInvest plan cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling AutoInvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel AutoInvest plan",
    });
  }
};

/**
 * Get AutoInvest statistics with real data calculations
 */
exports.getAutoInvestStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { Op } = require("sequelize");

    // Get user's AutoInvest plan
    const autoInvestPlan = await AutoInvest.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!autoInvestPlan) {
      return res.json({
        success: true,
        data: {
          stats: {
            hasActivePlan: false,
            totalDeposited: 0,
            totalInvested: 0,
            totalReturns: 0,
            monthsActive: 0,
            averageMonthlyReturn: 0,
            projectedAnnualReturn: 0,
          },
        },
        message: "No AutoInvest plan found",
      });
    }

    // Get all AutoInvest-related transactions for this user
    const autoInvestTransactions = await Transaction.findAll({
      where: {
        userId: userId,
        autoInvestPlanId: autoInvestPlan.id,
        status: "completed",
      },
      order: [["created_at", "ASC"]],
    });

    // Calculate basic metrics from the plan
    const totalDeposited = parseFloat(autoInvestPlan.totalDeposited) || 0;
    const totalInvested = parseFloat(autoInvestPlan.totalInvested) || 0;

    // Calculate months active (from plan creation to now)
    const planCreatedDate = new Date(autoInvestPlan.createdAt);
    const currentDate = new Date();
    const monthsActive = Math.max(
      1,
      Math.ceil(
        (currentDate.getTime() - planCreatedDate.getTime()) /
          (1000 * 60 * 60 * 24 * 30.44) // More accurate monthly calculation
      )
    );

    // Calculate investment returns based on theme performance
    const themePerformanceRates = {
      growth: 0.085, // 8.5% annual return
      income: 0.072, // 7.2% annual return
      balanced: 0.065, // 6.5% annual return
      index: 0.058, // 5.8% annual return
    };

    const annualReturnRate =
      themePerformanceRates[autoInvestPlan.theme] || 0.065;
    const monthlyReturnRate = annualReturnRate / 12;

    // Calculate actual returns based on investment timeline
    let totalCalculatedReturns = 0;
    let totalCompoundedValue = 0;

    if (autoInvestTransactions.length > 0) {
      // Calculate returns for each investment transaction
      autoInvestTransactions.forEach((transaction) => {
        if (transaction.type === "investment") {
          const investmentDate = new Date(transaction.created_at);
          const monthsHeld = Math.max(
            0,
            (currentDate.getTime() - investmentDate.getTime()) /
              (1000 * 60 * 60 * 24 * 30.44)
          );

          const investmentAmount = parseFloat(transaction.amount);

          // Validate investment amount
          if (isNaN(investmentAmount) || investmentAmount <= 0) {
            console.warn(`Invalid investment amount: ${transaction.amount}`);
            return;
          }

          // Calculate compound returns for this specific investment
          const compoundedValue =
            investmentAmount * Math.pow(1 + monthlyReturnRate, monthsHeld);
          const returnOnThisInvestment = compoundedValue - investmentAmount;

          // Validate calculated values
          if (isFinite(compoundedValue) && isFinite(returnOnThisInvestment)) {
            totalCalculatedReturns += returnOnThisInvestment;
            totalCompoundedValue += compoundedValue;
          }
        }
      });
    } else {
      // If no individual transactions, estimate based on total invested and average time
      const averageMonthsInvested = monthsActive / 2; // Assume average investment is held for half the plan duration
      if (totalInvested > 0) {
        totalCompoundedValue =
          totalInvested *
          Math.pow(1 + monthlyReturnRate, averageMonthsInvested);
        totalCalculatedReturns = totalCompoundedValue - totalInvested;
      }
    }

    // Calculate performance metrics
    const averageMonthlyReturn =
      monthsActive > 0 ? totalCalculatedReturns / monthsActive : 0;
    const projectedAnnualReturn = averageMonthlyReturn * 12;

    // Calculate additional performance metrics
    const returnOnInvestment =
      totalInvested > 0 ? (totalCalculatedReturns / totalInvested) * 100 : 0;
    const annualizedReturn =
      monthsActive > 0 && totalInvested > 0
        ? Math.pow(
            1 + totalCalculatedReturns / totalInvested,
            12 / monthsActive
          ) - 1
        : 0;

    // Calculate next deposit information
    const nextDepositDate = autoInvestPlan.nextDepositDate;
    const daysUntilNextDeposit = nextDepositDate
      ? Math.ceil(
          (new Date(nextDepositDate).getTime() - currentDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    // Calculate projected portfolio value in 1 year
    const monthlyContribution = parseFloat(autoInvestPlan.monthlyAmount);
    const futureValue = calculateFutureValue(
      totalCompoundedValue,
      monthlyContribution,
      monthlyReturnRate,
      12
    );

    // Calculate efficiency metrics
    const depositEfficiency =
      totalDeposited > 0 ? (totalInvested / totalDeposited) * 100 : 0;
    const cashUtilization = totalInvested > 0 ? 100 : 0; // Percentage of deposited funds that are invested

    // Helper function to ensure valid numbers
    const safeNumber = (value, fallback = 0) => {
      return isFinite(value) && !isNaN(value) ? value : fallback;
    };

    return res.json({
      success: true,
      data: {
        stats: {
          // Basic plan information
          hasActivePlan: autoInvestPlan.status === "active",
          status: autoInvestPlan.status,
          theme: autoInvestPlan.theme,
          monthlyAmount: safeNumber(parseFloat(autoInvestPlan.monthlyAmount)),
          currency: autoInvestPlan.currency,

          // Financial metrics
          totalDeposited: Math.round(safeNumber(totalDeposited) * 100) / 100,
          totalInvested: Math.round(safeNumber(totalInvested) * 100) / 100,
          totalReturns:
            Math.round(safeNumber(totalCalculatedReturns) * 100) / 100,
          currentPortfolioValue:
            Math.round(safeNumber(totalCompoundedValue) * 100) / 100,

          // Performance metrics
          monthsActive: safeNumber(monthsActive),
          averageMonthlyReturn:
            Math.round(safeNumber(averageMonthlyReturn) * 100) / 100,
          projectedAnnualReturn:
            Math.round(safeNumber(projectedAnnualReturn) * 100) / 100,
          returnOnInvestment:
            Math.round(safeNumber(returnOnInvestment) * 100) / 100,
          annualizedReturn:
            Math.round(safeNumber(annualizedReturn) * 10000) / 100, // Convert to percentage

          // Efficiency metrics
          depositEfficiency:
            Math.round(safeNumber(depositEfficiency) * 100) / 100,
          cashUtilization: Math.round(safeNumber(cashUtilization) * 100) / 100,

          // Future projections
          projectedValueIn1Year:
            Math.round(safeNumber(futureValue) * 100) / 100,

          // Schedule information
          nextDepositDate: autoInvestPlan.nextDepositDate,
          daysUntilNextDeposit: safeNumber(daysUntilNextDeposit),
          lastDepositDate: autoInvestPlan.lastDepositDate,

          // Additional metadata
          planCreatedDate: autoInvestPlan.createdAt,
          totalTransactions: safeNumber(autoInvestTransactions.length),
          investmentCount: safeNumber(
            autoInvestTransactions.filter((t) => t.type === "investment").length
          ),
        },
      },
      message: "AutoInvest statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching AutoInvest stats:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AutoInvest statistics",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Helper function to calculate future value with compound interest and regular deposits
 * @param {number} presentValue - Current portfolio value
 * @param {number} monthlyPayment - Monthly contribution amount
 * @param {number} monthlyRate - Monthly interest rate (annual rate / 12)
 * @param {number} periods - Number of months
 * @returns {number} Future value of the portfolio
 */
function calculateFutureValue(
  presentValue,
  monthlyPayment,
  monthlyRate,
  periods
) {
  // FV = PV * (1 + r)^n + PMT * [((1 + r)^n - 1) / r]
  const pvFuture = presentValue * Math.pow(1 + monthlyRate, periods);
  const pmtFuture =
    monthlyPayment * ((Math.pow(1 + monthlyRate, periods) - 1) / monthlyRate);
  return pvFuture + pmtFuture;
}

/**
 * Process AutoInvest deposits (scheduled job)
 */
exports.processAutoInvestDeposits = async () => {
  try {
    console.log("🔄 Processing AutoInvest deposits...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all active AutoInvest plans due for deposit today
    const { Op } = require("sequelize");
    const duePlans = await AutoInvest.findAll({
      where: {
        status: "active",
        nextDepositDate: {
          [Op.lte]: today,
        },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "name"],
        },
      ],
    });

    console.log(
      `📊 Found ${duePlans.length} AutoInvest plans due for processing`
    );

    let processed = 0;
    let failed = 0;

    for (const plan of duePlans) {
      try {
        await processIndividualDeposit(plan);
        processed++;
        console.log(`✅ Processed AutoInvest deposit for user ${plan.userId}`);
      } catch (error) {
        failed++;
        console.error(
          `❌ Failed to process AutoInvest deposit for user ${plan.userId}:`,
          error
        );
      }
    }

    console.log(
      `🎯 AutoInvest processing complete: ${processed} successful, ${failed} failed`
    );

    return {
      success: true,
      processed,
      failed,
      total: duePlans.length,
    };
  } catch (error) {
    console.error("Error processing AutoInvest deposits:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Process individual AutoInvest deposit
 */
async function processIndividualDeposit(autoInvestPlan) {
  const { sequelize } = require("../config/db.config");
  const transaction = await sequelize.transaction();

  try {
    // Get user wallet
    const wallet = await Wallet.findOne({
      where: { userId: autoInvestPlan.userId },
      transaction,
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // Check if user has sufficient funds
    if (wallet.cashBalance < autoInvestPlan.monthlyAmount) {
      // Log insufficient funds and pause the plan
      console.log(
        `⚠️  Insufficient funds for user ${autoInvestPlan.userId}. Pausing AutoInvest.`
      );

      await autoInvestPlan.update(
        {
          status: "paused",
          notes: `Auto-paused on ${new Date().toISOString()} due to insufficient funds`,
        },
        { transaction }
      );

      // Create notification transaction
      await Transaction.create(
        {
          userId: autoInvestPlan.userId,
          type: "autoinvest_failed",
          amount: autoInvestPlan.monthlyAmount,
          currency: wallet.currency,
          status: "failed",
          description: `AutoInvest paused - insufficient funds (needed: ${autoInvestPlan.monthlyAmount}, available: ${wallet.cashBalance})`,
          balanceType: "cash",
          metadata: {
            autoInvestPlanId: autoInvestPlan.id,
            reason: "insufficient_funds",
          },
        },
        { transaction }
      );

      await transaction.commit();
      return;
    }

    // Deduct money from wallet (simulate investment)
    const newCashBalance =
      parseFloat(wallet.cashBalance) - parseFloat(autoInvestPlan.monthlyAmount);

    await wallet.update(
      {
        cashBalance: newCashBalance,
        totalBalance: newCashBalance + parseFloat(wallet.rewardsBalance),
        lastTransactionAt: new Date(),
      },
      { transaction }
    );

    // Create investment transaction
    await Transaction.create(
      {
        userId: autoInvestPlan.userId,
        type: "investment",
        amount: autoInvestPlan.monthlyAmount,
        currency: wallet.currency,
        status: "completed",
        description: `AutoInvest deposit - ${autoInvestPlan.theme} theme`,
        balanceType: "cash",
        metadata: {
          autoInvestPlanId: autoInvestPlan.id,
          theme: autoInvestPlan.theme,
          isAutoInvest: true,
        },
        processedAt: new Date(),
      },
      { transaction }
    );

    // Update AutoInvest plan statistics
    const newTotalDeposited =
      parseFloat(autoInvestPlan.totalDeposited) +
      parseFloat(autoInvestPlan.monthlyAmount);
    const newTotalInvested = newTotalDeposited; // For now, assume 1:1 investment

    // Calculate next deposit date
    const nextDepositDate = calculateNextDepositDate(autoInvestPlan.depositDay);

    await autoInvestPlan.update(
      {
        totalDeposited: newTotalDeposited,
        totalInvested: newTotalInvested,
        lastDepositDate: new Date(),
        nextDepositDate: nextDepositDate,
      },
      { transaction }
    );

    await transaction.commit();

    console.log(
      `💰 AutoInvest deposit processed: ${autoInvestPlan.monthlyAmount} ${wallet.currency} for user ${autoInvestPlan.userId}`
    );
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Manual trigger for AutoInvest processing (for testing)
 */
exports.triggerAutoInvestProcessing = async (req, res) => {
  try {
    const result = await exports.processAutoInvestDeposits();

    return res.json({
      success: true,
      data: result,
      message: "AutoInvest processing triggered successfully",
    });
  } catch (error) {
    console.error("Error triggering AutoInvest processing:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to trigger AutoInvest processing",
    });
  }
};

// Helper functions
function calculateNextDepositDate(depositDay) {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, depositDay);

  // If the deposit day has already passed this month, schedule for next month
  if (now.getDate() >= depositDay) {
    return new Date(now.getFullYear(), now.getMonth() + 1, depositDay);
  } else {
    return new Date(now.getFullYear(), now.getMonth(), depositDay);
  }
}
