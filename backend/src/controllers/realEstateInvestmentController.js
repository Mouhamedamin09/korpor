const {
  User,
  Project,
  Investment,
  Wallet,
  Transaction,
  sequelize,
  Role,
} = require("../models");
const { Op } = require("sequelize");
const {
  processReferrerInvestmentReward,
} = require("../services/referralRewardService");

/**
 * Get property details for investment with availability check
 */
exports.getPropertyForInvestment = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Get property with investment information
    const property = await Project.findByPk(projectId, {
      include: [
        {
          model: Investment,
          as: "investments",
          where: { status: "confirmed" },
          required: false,
          attributes: ["amount", "userId"],
        },
      ],
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check if property is available for investment
    if (property.property_status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Property is not available for investment",
        propertyStatus: property.property_status,
      });
    }

    // Calculate investment statistics
    const totalInvested = property.investments.reduce(
      (sum, inv) => sum + parseFloat(inv.amount),
      0
    );

    const remainingAmount = parseFloat(property.goal_amount) - totalInvested;
    const investmentProgress =
      (totalInvested / parseFloat(property.goal_amount)) * 100;

    // Check if user has already invested
    const userInvestment = property.investments.find(
      (inv) => inv.userId === userId
    );

    // Get user's wallet balance
    const wallet = await Wallet.findOne({
      where: { userId },
    });

    const response = {
      success: true,
      data: {
        property: {
          id: property.id,
          name: property.name,
          description: property.description,
          location: property.location,
          goalAmount: parseFloat(property.goal_amount),
          currentAmount: parseFloat(property.current_amount),
          totalInvested,
          remainingAmount: Math.max(0, remainingAmount),
          investmentProgress: Math.min(100, investmentProgress),
          minimumInvestment: parseFloat(property.minimum_investment || 1000),
          expectedRoi: parseFloat(property.expected_roi || 0),
          rentalYield: parseFloat(property.rental_yield || 0),
          investmentPeriod: property.investment_period,
          propertyType: property.property_type,
          status: property.status,
          propertyStatus: property.property_status,
          isFullyFunded: remainingAmount <= 0,
        },
        investment: {
          hasInvested: !!userInvestment,
          previousAmount: userInvestment
            ? parseFloat(userInvestment.amount)
            : 0,
          canInvestMore: remainingAmount > 0 && !userInvestment,
        },
        wallet: {
          balance: wallet ? parseFloat(wallet.cashBalance) : 0,
          currency: wallet ? wallet.currency : "TND",
        },
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching property for investment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property details",
      error: error.message,
    });
  }
};

/**
 * Validate investment amount and requirements
 */
exports.validateInvestment = async (req, res) => {
  try {
    const { projectId, amount, paymentMethod = "wallet" } = req.body;
    const userId = req.user.userId;

    if (!projectId || !amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or amount",
      });
    }

    // Get property details
    const property = await Project.findByPk(projectId, {
      include: [
        {
          model: Investment,
          as: "investments",
          where: { status: "confirmed" },
          required: false,
        },
      ],
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check property availability
    if (property.property_status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Property is not available for investment",
      });
    }

    // Calculate current investment status
    const totalInvested = property.investments.reduce(
      (sum, inv) => sum + parseFloat(inv.amount),
      0
    );
    const remainingAmount = parseFloat(property.goal_amount) - totalInvested;

    // Validation checks
    const validationErrors = [];

    // Check minimum investment
    if (amount < parseFloat(property.minimum_investment || 1000)) {
      validationErrors.push(
        `Minimum investment is ${property.minimum_investment || 1000} ${
          property.currency || "TND"
        }`
      );
    }

    // Check if amount exceeds remaining funding needed
    if (amount > remainingAmount) {
      validationErrors.push(
        `Investment amount exceeds remaining funding needed (${remainingAmount.toFixed(
          2
        )})`
      );
    }

    // Check if user already invested
    const existingInvestment = property.investments.find(
      (inv) => inv.userId === userId
    );
    if (existingInvestment) {
      validationErrors.push("You have already invested in this property");
    }

    // Check wallet balance if using wallet payment
    if (paymentMethod === "wallet") {
      const wallet = await Wallet.findOne({ where: { userId } });
      if (!wallet || parseFloat(wallet.cashBalance) < amount) {
        validationErrors.push("Insufficient wallet balance");
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Investment validation failed",
        errors: validationErrors,
      });
    }

    res.json({
      success: true,
      message: "Investment validation passed",
      data: {
        amount,
        paymentMethod,
        property: {
          id: property.id,
          name: property.name,
          remainingAmount,
        },
      },
    });
  } catch (error) {
    console.error("Error validating investment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate investment",
      error: error.message,
    });
  }
};

/**
 * Create investment (wallet payment)
 */
exports.createInvestment = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { projectId, amount, paymentMethod = "wallet" } = req.body;
    const userId = req.user.userId;

    // Validate investment first
    const validation = await validateInvestmentInternal(
      userId,
      projectId,
      amount,
      paymentMethod
    );
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const { property, wallet } = validation.data;

    let investmentData = {
      userId,
      projectId,
      amount,
      currency: wallet.currency,
      paymentMethod,
      status: "pending",
    };

    let walletTransaction = null;

    // Handle wallet payment
    if (paymentMethod === "wallet") {
      // Create wallet transaction first
      walletTransaction = await Transaction.create(
        {
          userId,
          walletId: wallet.id,
          type: "investment",
          amount: -amount, // Negative for deduction
          currency: wallet.currency,
          status: "completed",
          description: `Investment in ${property.name}`,
          balanceType: "cash",
          processedAt: new Date(),
          metadata: {
            projectId,
            investmentType: "property",
          },
        },
        { transaction: t }
      );

      // Update wallet balance
      wallet.cashBalance = parseFloat(wallet.cashBalance) - parseFloat(amount);
      wallet.lastTransactionAt = new Date();
      await wallet.save({ transaction: t });

      // Link transaction to investment
      investmentData.transactionId = walletTransaction.id;
      investmentData.status = "confirmed";
      investmentData.investmentDate = new Date();
    }

    // Create investment record
    const investment = await Investment.create(investmentData, {
      transaction: t,
    });

    // Process referral rewards if applicable
    try {
      console.log(
        `🔄 Checking referral rewards for investment by user ${userId}, amount: ${amount}`
      );
      const referralResult = await processReferrerInvestmentReward(
        userId,
        amount
      );
      if (referralResult.success) {
        console.log(
          `✅ Referrer reward processed for investment:`,
          referralResult.data
        );
      } else {
        console.log(
          `ℹ️ No referrer reward applicable: ${referralResult.message}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error processing referral reward for investment:`,
        error
      );
      // Don't fail the investment process if referral processing fails
    }

    // Update property current amount
    property.current_amount =
      parseFloat(property.current_amount) + parseFloat(amount);

    // Check if property is fully funded
    if (
      parseFloat(property.current_amount) >= parseFloat(property.goal_amount)
    ) {
      property.property_status = "sold_out";
      property.status = "Funded";
    }

    await property.save({ transaction: t });

    // Update user's total investment
    const user = await User.findByPk(userId, { transaction: t });
    user.investmentTotal =
      parseFloat(user.investmentTotal || 0) + parseFloat(amount);
    await user.save({ transaction: t });

    await t.commit();

    // Prepare response
    const response = {
      success: true,
      message: "Investment created successfully",
      data: {
        investment: {
          id: investment.id,
          amount: parseFloat(investment.amount),
          currency: investment.currency,
          status: investment.status,
          paymentMethod: investment.paymentMethod,
          investmentDate: investment.investmentDate,
        },
        property: {
          id: property.id,
          name: property.name,
          currentAmount: parseFloat(property.current_amount),
          remainingAmount: Math.max(
            0,
            parseFloat(property.goal_amount) -
              parseFloat(property.current_amount)
          ),
          isFullyFunded:
            parseFloat(property.current_amount) >=
            parseFloat(property.goal_amount),
        },
        transaction: walletTransaction
          ? {
              id: walletTransaction.id,
              amount: parseFloat(walletTransaction.amount),
              newBalance: parseFloat(wallet.cashBalance),
            }
          : null,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    await t.rollback();
    console.error("Error creating investment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create investment",
      error: error.message,
    });
  }
};

/**
 * Create investment with external payment (Stripe/PayMee)
 */
exports.createInvestmentWithPayment = async (req, res) => {
  try {
    const { projectId, amount, paymentMethod } = req.body;
    const userId = req.user.userId;

    // Validate investment first
    const validation = await validateInvestmentInternal(
      userId,
      projectId,
      amount,
      paymentMethod
    );
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        errors: validation.errors,
      });
    }

    const { property } = validation.data;

    // Create pending investment record
    const investment = await Investment.create({
      userId,
      projectId,
      amount,
      currency: property.currency || "TND",
      paymentMethod,
      status: "pending",
      metadata: {
        requiresExternalPayment: true,
      },
    });

    // Here you would integrate with payment processor (Stripe, PayMee, etc.)
    // For now, return the pending investment
    res.status(201).json({
      success: true,
      message: "Investment created, payment required",
      data: {
        investment: {
          id: investment.id,
          amount: parseFloat(investment.amount),
          currency: investment.currency,
          status: investment.status,
          paymentMethod: investment.paymentMethod,
        },
        paymentRequired: true,
        // In real implementation, you'd return payment URL or client secret
      },
    });
  } catch (error) {
    console.error("Error creating investment with payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create investment",
      error: error.message,
    });
  }
};

/**
 * Get user's investments
 */
exports.getUserInvestments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: investments } = await Investment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Project,
          as: "project",
          attributes: [
            "id",
            "name",
            "location",
            "property_type",
            "expected_roi",
            "rental_yield",
            "image_url",
          ],
        },
        {
          model: Transaction,
          as: "transaction",
          required: false,
          attributes: ["id", "reference", "processedAt"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        investments: investments.map((investment) => ({
          id: investment.id,
          amount: parseFloat(investment.amount),
          currency: investment.currency,
          status: investment.status,
          paymentMethod: investment.paymentMethod,
          investmentDate: investment.investmentDate,
          createdAt: investment.created_at,
          property: investment.project,
          transaction: investment.transaction,
        })),
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user investments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investments",
      error: error.message,
    });
  }
};

/**
 * Get investment details
 */
exports.getInvestmentDetails = async (req, res) => {
  try {
    const { investmentId } = req.params;
    const userId = req.user.userId;

    const investment = await Investment.findOne({
      where: { id: investmentId, userId },
      include: [
        {
          model: Project,
          as: "project",
          include: [
            {
              model: Investment,
              as: "investments",
              where: { status: "confirmed" },
              required: false,
              attributes: ["amount", "userId", "investmentDate"],
            },
          ],
        },
        {
          model: Transaction,
          as: "transaction",
          required: false,
        },
      ],
    });

    if (!investment) {
      return res.status(404).json({
        success: false,
        message: "Investment not found",
      });
    }

    // Calculate investment performance (basic calculation)
    const totalPropertyInvestment = investment.project.investments.reduce(
      (sum, inv) => sum + parseFloat(inv.amount),
      0
    );

    const userShare = parseFloat(investment.amount) / totalPropertyInvestment;
    const estimatedMonthlyReturn =
      (parseFloat(investment.amount) *
        parseFloat(investment.project.rental_yield || 0)) /
      100 /
      12;

    res.json({
      success: true,
      data: {
        investment: {
          id: investment.id,
          amount: parseFloat(investment.amount),
          currency: investment.currency,
          status: investment.status,
          paymentMethod: investment.paymentMethod,
          investmentDate: investment.investmentDate,
          userShare: userShare * 100, // percentage
          estimatedMonthlyReturn,
        },
        property: {
          ...investment.project.dataValues,
          totalInvested: totalPropertyInvestment,
          investorCount: investment.project.investments.length,
        },
        transaction: investment.transaction,
      },
    });
  } catch (error) {
    console.error("Error fetching investment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch investment details",
      error: error.message,
    });
  }
};

/**
 * Internal validation function
 */
async function validateInvestmentInternal(
  userId,
  projectId,
  amount,
  paymentMethod
) {
  const property = await Project.findByPk(projectId, {
    include: [
      {
        model: Investment,
        as: "investments",
        where: { status: "confirmed" },
        required: false,
      },
    ],
  });

  if (!property) {
    return { valid: false, message: "Property not found" };
  }

  if (property.property_status !== "available") {
    return {
      valid: false,
      message: "Property is not available for investment",
    };
  }

  const totalInvested = property.investments.reduce(
    (sum, inv) => sum + parseFloat(inv.amount),
    0
  );
  const remainingAmount = parseFloat(property.goal_amount) - totalInvested;

  const errors = [];

  if (amount < parseFloat(property.minimum_investment || 1000)) {
    errors.push(`Minimum investment is ${property.minimum_investment || 1000}`);
  }

  if (amount > remainingAmount) {
    errors.push(
      `Amount exceeds remaining funding needed (${remainingAmount.toFixed(2)})`
    );
  }

  const existingInvestment = property.investments.find(
    (inv) => inv.userId === userId
  );
  if (existingInvestment) {
    errors.push("You have already invested in this property");
  }

  let wallet = null;
  if (paymentMethod === "wallet") {
    wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet || parseFloat(wallet.cashBalance) < amount) {
      errors.push("Insufficient wallet balance");
    }
  }

  if (errors.length > 0) {
    return { valid: false, message: "Validation failed", errors };
  }

  return {
    valid: true,
    data: { property, wallet },
  };
}
