const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const AutoInvest = require("../models/AutoInvest");
const { Sequelize, Op } = require("sequelize");

/**
 * Get user's portfolio totals and performance metrics
 */
exports.getPortfolioTotals = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details and preferences
    const user = await User.findByPk(userId, {
      attributes: ["id", "currency", "investmentTotal", "investmentUsedPct"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get wallet data (only fields that actually exist)
    const wallet = await Wallet.findOne({
      where: { userId },
      attributes: ["cashBalance", "rewardsBalance", "currency"],
    });

    // Get investment transactions for calculating returns
    const investmentTransactions = await Transaction.findAll({
      where: {
        userId,
        type: {
          [Op.in]: ["investment", "deposit", "rent_payout", "referral_bonus"],
        },
      },
      attributes: ["amount", "type", "created_at"],
      order: [["created_at", "DESC"]],
    });

    // Calculate portfolio metrics from available data
    const totalInvested = parseFloat(user.investmentTotal) || 0;

    // Calculate returns from rent payouts and referral bonuses (closest to dividends/returns)
    const totalReturns = investmentTransactions
      .filter((t) => t.type === "rent_payout" || t.type === "referral_bonus")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const currentValue = totalInvested + totalReturns;

    // Calculate estimated monthly income (assume 6.5% annual yield divided by 12)
    const monthlyIncome =
      Math.round(((totalInvested * 0.065) / 12) * 100) / 100;

    // Calculate average yield based on returns and time invested
    let averageYield = 6.5; // Default yield
    if (totalInvested > 0 && investmentTransactions.length > 0) {
      const oldestInvestment = investmentTransactions
        .filter((t) => t.type === "investment")
        .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0];

      if (oldestInvestment) {
        const monthsInvested = Math.max(
          1,
          (new Date() - new Date(oldestInvestment.created_at)) /
            (1000 * 60 * 60 * 24 * 30.44)
        );

        if (monthsInvested >= 1) {
          const annualizedReturn =
            (totalReturns / totalInvested) * (12 / monthsInvested) * 100;
          if (annualizedReturn > 0 && annualizedReturn < 20) {
            // Sanity check
            averageYield = annualizedReturn;
          }
        }
      }
    }

    // Convert to user's preferred currency for local display
    const exchangeRates = {
      USD: { TND: 3.16, EUR: 0.85 },
      EUR: { TND: 3.32, USD: 1.18 },
      TND: { USD: 0.32, EUR: 0.3 },
    };

    const userCurrency = user.currency || wallet?.currency || "TND";
    let localValue = currentValue;

    // Convert from base currency (assuming TND) to user's preferred currency
    if (userCurrency !== "TND") {
      const rate = exchangeRates.TND[userCurrency] || 1;
      localValue = currentValue * rate;
    }

    // For USD display, convert from base currency to USD
    let usdValue = currentValue;
    if (userCurrency !== "USD") {
      const rate = exchangeRates.TND?.USD || 0.32;
      usdValue = currentValue * rate;
    }

    const portfolioData = {
      usd: Math.round(usdValue * 100) / 100,
      local: Math.round(localValue * 100) / 100,
      currency: userCurrency,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalReturns: Math.round(totalReturns * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      averageYield: Math.round(averageYield * 100) / 100,
    };

    res.json({
      success: true,
      data: portfolioData,
    });
  } catch (error) {
    console.error("Error fetching portfolio totals:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get user's automation settings status
 */
exports.getAutomationStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check for active AutoInvest plan
    const autoInvestPlan = await AutoInvest.findOne({
      where: {
        userId,
        status: "active",
      },
      attributes: [
        "id",
        "monthlyAmount",
        "theme",
        "status",
        "depositDay",
        "nextDepositDate",
        "currency",
      ],
    });

    // For now, AutoReinvest is not implemented, so we'll default to false
    // In the future, you can add AutoReinvest model and check for it here
    const autoReinvestSettings = null; // TODO: Implement AutoReinvest model

    const automationData = {
      autoInvestSetup: autoInvestPlan !== null,
      autoReinvestSetup: autoReinvestSettings !== null,
      autoInvestDetails: autoInvestPlan
        ? {
            id: autoInvestPlan.id,
            monthlyAmount: parseFloat(autoInvestPlan.monthlyAmount),
            theme: autoInvestPlan.theme,
            status: autoInvestPlan.status,
            depositDay: autoInvestPlan.depositDay,
            nextDepositDate: autoInvestPlan.nextDepositDate,
            currency: autoInvestPlan.currency,
          }
        : null,
      autoReinvestDetails: autoReinvestSettings,
    };

    res.json({
      success: true,
      data: automationData,
    });
  } catch (error) {
    console.error("Error fetching automation status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch automation status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Get detailed portfolio performance metrics
 */
exports.getPortfolioPerformance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "ALL" } = req.query;

    // Calculate date range based on period
    let startDate = null;
    const endDate = new Date();

    switch (period) {
      case "1M":
        startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "3M":
        startDate = new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "6M":
        startDate = new Date(endDate.getTime() - 180 * 24 * 60 * 60 * 1000);
        break;
      case "1Y":
        startDate = new Date(endDate.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      case "ALL":
      default:
        startDate = null;
        break;
    }

    // Build query conditions
    const whereConditions = {
      userId,
      type: {
        [Op.in]: ["investment", "rent_payout", "referral_bonus"],
      },
    };

    if (startDate) {
      whereConditions.created_at = {
        [Op.gte]: startDate,
      };
    }

    // Get transactions in the specified period
    const transactions = await Transaction.findAll({
      where: whereConditions,
      attributes: ["amount", "type", "created_at"],
      order: [["created_at", "ASC"]],
    });

    // Calculate performance metrics
    let totalInvested = 0;
    let totalReturns = 0;
    const performanceHistory = [];

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);

      if (transaction.type === "investment") {
        totalInvested += amount;
      } else if (
        transaction.type === "rent_payout" ||
        transaction.type === "referral_bonus"
      ) {
        totalReturns += amount;
      }

      performanceHistory.push({
        date: transaction.created_at,
        type: transaction.type,
        amount: amount,
        cumulativeInvested: totalInvested,
        cumulativeReturns: totalReturns,
        portfolioValue: totalInvested + totalReturns,
      });
    });

    const performanceData = {
      period,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalReturns: Math.round(totalReturns * 100) / 100,
      portfolioValue: Math.round((totalInvested + totalReturns) * 100) / 100,
      returnPercentage:
        totalInvested > 0
          ? Math.round((totalReturns / totalInvested) * 10000) / 100
          : 0,
      history: performanceHistory,
    };

    res.json({
      success: true,
      data: performanceData,
    });
  } catch (error) {
    console.error("Error fetching portfolio performance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch portfolio performance",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/**
 * Calculate portfolio growth projection
 */
exports.calculatePortfolioProjection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { monthlyDeposit, years, yieldPct } = req.body;

    // Validation
    if (!monthlyDeposit || !years || !yieldPct) {
      return res.status(400).json({
        success: false,
        message: "Monthly deposit, years, and yield percentage are required",
      });
    }

    if (monthlyDeposit <= 0 || years <= 0 || yieldPct < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input values",
      });
    }

    // Get user currency and investment data
    const user = await User.findByPk(userId, {
      attributes: ["currency", "investmentTotal"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get current portfolio value from user's total investment and calculated returns
    const totalInvested = parseFloat(user.investmentTotal) || 0;

    // Calculate returns from rent payouts and referral bonuses (closest to returns)
    const returnTransactions = await Transaction.findAll({
      where: {
        userId,
        type: {
          [Op.in]: ["rent_payout", "referral_bonus"],
        },
      },
      attributes: ["amount"],
    });

    const totalReturns = returnTransactions.reduce(
      (sum, t) => sum + parseFloat(t.amount),
      0
    );

    const currentPortfolioValue = totalInvested + totalReturns;

    // Calculate projections for each year
    const projections = [];
    const monthlyRate = yieldPct / 100 / 12;

    for (let year = 0; year <= years; year++) {
      let totalValue = currentPortfolioValue;
      let totalDeposited = 0;

      if (year > 0) {
        const months = year * 12;

        // Future value of current portfolio with compound interest
        const futureValueCurrent =
          currentPortfolioValue * Math.pow(1 + monthlyRate, months);

        // Future value of annuity (monthly deposits)
        const futureValueDeposits =
          monthlyDeposit *
          ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

        totalValue = futureValueCurrent + futureValueDeposits;
        totalDeposited = monthlyDeposit * 12 * year;
      }

      const monthlyIncome = Math.round((totalValue * (yieldPct / 100)) / 12);
      const totalReturns = totalValue - currentPortfolioValue - totalDeposited;

      projections.push({
        year,
        totalValue: Math.round(totalValue),
        monthlyIncome,
        totalDeposited: Math.round(totalDeposited),
        totalReturns: Math.round(totalReturns),
        returnPercentage:
          currentPortfolioValue + totalDeposited > 0
            ? Math.round(
                (totalReturns / (currentPortfolioValue + totalDeposited)) *
                  10000
              ) / 100
            : 0,
      });
    }

    const projectionData = {
      currentPortfolioValue: Math.round(currentPortfolioValue * 100) / 100,
      monthlyDeposit,
      years,
      yieldPct,
      currency: user.currency,
      projections,
    };

    res.json({
      success: true,
      data: projectionData,
    });
  } catch (error) {
    console.error("Error calculating portfolio projection:", error);
    res.status(500).json({
      success: false,
      message: "Failed to calculate portfolio projection",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
