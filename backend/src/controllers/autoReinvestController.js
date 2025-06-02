const AutoReinvest = require("../models/AutoReinvest");
const RentalPayout = require("../models/RentalPayout");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");
const Project = require("../models/Project");
const { Op } = require("sequelize");
const { rawQuery } = require("../config/db.config");

/**
 * Create a new AutoReinvest plan
 */
exports.createAutoReinvest = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      minimumReinvestAmount,
      reinvestPercentage,
      theme,
      riskLevel,
      preferredRegions,
      excludedPropertyTypes,
      reinvestmentFrequency,
      autoApprovalEnabled,
      maxReinvestPercentagePerProject,
      notes,
    } = req.body;

    // Validation
    if (reinvestPercentage < 0 || reinvestPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Reinvest percentage must be between 0 and 100",
      });
    }

    if (minimumReinvestAmount && minimumReinvestAmount < 10) {
      return res.status(400).json({
        success: false,
        message: "Minimum reinvest amount must be at least 10 TND",
      });
    }

    // Check if user already has an active plan
    const existingPlan = await AutoReinvest.findOne({
      where: { userId, status: { [Op.in]: ["active", "paused"] } },
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message:
          "User already has an AutoReinvest plan. Please update the existing plan or cancel it first.",
      });
    }

    // Get user to verify
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check minimum total invested requirement (2000 TND)
    const totalInvested = parseFloat(user.investmentTotal) || 0;
    if (totalInvested < 2000) {
      return res.status(400).json({
        success: false,
        message: `Auto Reinvest requires a minimum of 2000 TND total invested. Current: ${totalInvested} TND`,
      });
    }

    // Create AutoReinvest plan
    const autoReinvestPlan = await AutoReinvest.create({
      userId,
      minimumReinvestAmount: parseFloat(minimumReinvestAmount) || 100.0,
      reinvestPercentage: parseFloat(reinvestPercentage) || 100.0,
      theme: theme || "balanced",
      riskLevel: riskLevel || "medium",
      preferredRegions: preferredRegions || null,
      excludedPropertyTypes: excludedPropertyTypes || null,
      reinvestmentFrequency: reinvestmentFrequency || "monthly",
      autoApprovalEnabled: autoApprovalEnabled !== false,
      maxReinvestPercentagePerProject:
        parseFloat(maxReinvestPercentagePerProject) || 25.0,
      notes: notes || null,
    });

    return res.json({
      success: true,
      data: {
        autoReinvestPlan: {
          id: autoReinvestPlan.id,
          status: autoReinvestPlan.status,
          minimumReinvestAmount: autoReinvestPlan.minimumReinvestAmount,
          reinvestPercentage: autoReinvestPlan.reinvestPercentage,
          theme: autoReinvestPlan.theme,
          riskLevel: autoReinvestPlan.riskLevel,
          reinvestmentFrequency: autoReinvestPlan.reinvestmentFrequency,
          autoApprovalEnabled: autoReinvestPlan.autoApprovalEnabled,
          maxReinvestPercentagePerProject:
            autoReinvestPlan.maxReinvestPercentagePerProject,
          totalRentalIncome: autoReinvestPlan.totalRentalIncome,
          totalReinvested: autoReinvestPlan.totalReinvested,
          pendingReinvestAmount: autoReinvestPlan.pendingReinvestAmount,
          createdAt: autoReinvestPlan.createdAt,
        },
      },
      message: "AutoReinvest plan created successfully",
    });
  } catch (error) {
    console.error("Error creating AutoReinvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create AutoReinvest plan",
    });
  }
};

/**
 * Get user's AutoReinvest plan and status
 */
exports.getAutoReinvest = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's investment total to check eligibility
    const user = await User.findByPk(userId, {
      attributes: ["id", "investmentTotal"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const totalInvested = parseFloat(user.investmentTotal) || 0;
    const isEligible = totalInvested >= 2000;

    // Get AutoReinvest plan if exists
    const autoReinvestPlan = await AutoReinvest.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    // Get rental income stats
    const rentalStats = await this.calculateRentalStats(userId);

    return res.json({
      success: true,
      data: {
        isEligible,
        totalInvested,
        minimumRequired: 2000,
        autoReinvestPlan: autoReinvestPlan
          ? {
              id: autoReinvestPlan.id,
              status: autoReinvestPlan.status,
              minimumReinvestAmount: autoReinvestPlan.minimumReinvestAmount,
              reinvestPercentage: autoReinvestPlan.reinvestPercentage,
              theme: autoReinvestPlan.theme,
              riskLevel: autoReinvestPlan.riskLevel,
              reinvestmentFrequency: autoReinvestPlan.reinvestmentFrequency,
              autoApprovalEnabled: autoReinvestPlan.autoApprovalEnabled,
              maxReinvestPercentagePerProject:
                autoReinvestPlan.maxReinvestPercentagePerProject,
              totalRentalIncome: autoReinvestPlan.totalRentalIncome,
              totalReinvested: autoReinvestPlan.totalReinvested,
              pendingReinvestAmount: autoReinvestPlan.pendingReinvestAmount,
              lastReinvestDate: autoReinvestPlan.lastReinvestDate,
              preferredRegions: autoReinvestPlan.preferredRegions,
              excludedPropertyTypes: autoReinvestPlan.excludedPropertyTypes,
              notes: autoReinvestPlan.notes,
              createdAt: autoReinvestPlan.createdAt,
              updatedAt: autoReinvestPlan.updatedAt,
            }
          : null,
        rentalStats,
      },
      message: isEligible
        ? "AutoReinvest data retrieved successfully"
        : "User not eligible for AutoReinvest yet",
    });
  } catch (error) {
    console.error("Error fetching AutoReinvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch AutoReinvest plan",
    });
  }
};

/**
 * Update AutoReinvest plan
 */
exports.updateAutoReinvest = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      minimumReinvestAmount,
      reinvestPercentage,
      theme,
      riskLevel,
      preferredRegions,
      excludedPropertyTypes,
      reinvestmentFrequency,
      autoApprovalEnabled,
      maxReinvestPercentagePerProject,
      notes,
    } = req.body;

    const autoReinvestPlan = await AutoReinvest.findOne({
      where: { userId, status: { [Op.in]: ["active", "paused"] } },
    });

    if (!autoReinvestPlan) {
      return res.status(404).json({
        success: false,
        message: "No active AutoReinvest plan found",
      });
    }

    // Validation
    if (
      reinvestPercentage !== undefined &&
      (reinvestPercentage < 0 || reinvestPercentage > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Reinvest percentage must be between 0 and 100",
      });
    }

    if (minimumReinvestAmount !== undefined && minimumReinvestAmount < 10) {
      return res.status(400).json({
        success: false,
        message: "Minimum reinvest amount must be at least 10 TND",
      });
    }

    // Update plan
    const updateData = {};
    if (minimumReinvestAmount !== undefined)
      updateData.minimumReinvestAmount = parseFloat(minimumReinvestAmount);
    if (reinvestPercentage !== undefined)
      updateData.reinvestPercentage = parseFloat(reinvestPercentage);
    if (theme !== undefined) updateData.theme = theme;
    if (riskLevel !== undefined) updateData.riskLevel = riskLevel;
    if (preferredRegions !== undefined)
      updateData.preferredRegions = preferredRegions;
    if (excludedPropertyTypes !== undefined)
      updateData.excludedPropertyTypes = excludedPropertyTypes;
    if (reinvestmentFrequency !== undefined)
      updateData.reinvestmentFrequency = reinvestmentFrequency;
    if (autoApprovalEnabled !== undefined)
      updateData.autoApprovalEnabled = autoApprovalEnabled;
    if (maxReinvestPercentagePerProject !== undefined)
      updateData.maxReinvestPercentagePerProject = parseFloat(
        maxReinvestPercentagePerProject
      );
    if (notes !== undefined) updateData.notes = notes;

    await autoReinvestPlan.update(updateData);

    return res.json({
      success: true,
      data: {
        autoReinvestPlan: {
          id: autoReinvestPlan.id,
          status: autoReinvestPlan.status,
          minimumReinvestAmount: autoReinvestPlan.minimumReinvestAmount,
          reinvestPercentage: autoReinvestPlan.reinvestPercentage,
          theme: autoReinvestPlan.theme,
          riskLevel: autoReinvestPlan.riskLevel,
          reinvestmentFrequency: autoReinvestPlan.reinvestmentFrequency,
          autoApprovalEnabled: autoReinvestPlan.autoApprovalEnabled,
          maxReinvestPercentagePerProject:
            autoReinvestPlan.maxReinvestPercentagePerProject,
          totalRentalIncome: autoReinvestPlan.totalRentalIncome,
          totalReinvested: autoReinvestPlan.totalReinvested,
          pendingReinvestAmount: autoReinvestPlan.pendingReinvestAmount,
          lastReinvestDate: autoReinvestPlan.lastReinvestDate,
          updatedAt: autoReinvestPlan.updatedAt,
        },
      },
      message: "AutoReinvest plan updated successfully",
    });
  } catch (error) {
    console.error("Error updating AutoReinvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update AutoReinvest plan",
    });
  }
};

/**
 * Toggle AutoReinvest status (pause/resume)
 */
exports.toggleAutoReinvest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action } = req.body; // 'pause' or 'resume'

    if (!["pause", "resume"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be 'pause' or 'resume'",
      });
    }

    const autoReinvestPlan = await AutoReinvest.findOne({
      where: { userId, status: { [Op.in]: ["active", "paused"] } },
    });

    if (!autoReinvestPlan) {
      return res.status(404).json({
        success: false,
        message: "No AutoReinvest plan found",
      });
    }

    const newStatus = action === "pause" ? "paused" : "active";

    if (autoReinvestPlan.status === newStatus) {
      return res.status(400).json({
        success: false,
        message: `AutoReinvest plan is already ${newStatus}`,
      });
    }

    await autoReinvestPlan.update({ status: newStatus });

    return res.json({
      success: true,
      data: {
        status: newStatus,
        autoReinvestPlan: {
          id: autoReinvestPlan.id,
          status: autoReinvestPlan.status,
          updatedAt: autoReinvestPlan.updatedAt,
        },
      },
      message: `AutoReinvest plan ${action}d successfully`,
    });
  } catch (error) {
    console.error("Error toggling AutoReinvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle AutoReinvest plan",
    });
  }
};

/**
 * Cancel AutoReinvest plan
 */
exports.cancelAutoReinvest = async (req, res) => {
  try {
    const userId = req.user.id;

    const autoReinvestPlan = await AutoReinvest.findOne({
      where: { userId, status: { [Op.in]: ["active", "paused"] } },
    });

    if (!autoReinvestPlan) {
      return res.status(404).json({
        success: false,
        message: "No active AutoReinvest plan found",
      });
    }

    await autoReinvestPlan.update({ status: "cancelled" });

    return res.json({
      success: true,
      data: {
        autoReinvestPlan: {
          id: autoReinvestPlan.id,
          status: autoReinvestPlan.status,
          updatedAt: autoReinvestPlan.updatedAt,
        },
      },
      message: "AutoReinvest plan cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling AutoReinvest plan:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to cancel AutoReinvest plan",
    });
  }
};

/**
 * Get rental income history
 */
exports.getRentalHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    // Try to get rental payouts with simplified includes first
    const rentalPayouts = await RentalPayout.findAndCountAll({
      where: { userId },
      include: [
        {
          model: Project,
          as: "project",
          attributes: ["id", "name", "location"], // Changed from "title" to "name"
          required: false, // Make it optional in case project doesn't exist
        },
        {
          model: Transaction,
          as: "reinvestTransaction",
          attributes: ["id", "amount", "status", "created_at"],
          required: false, // Make it optional in case transaction doesn't exist
        },
      ],
      order: [["payoutDate", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.json({
      success: true,
      data: {
        rentalPayouts: rentalPayouts.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: rentalPayouts.count,
          pages: Math.ceil(rentalPayouts.count / limit),
        },
      },
      message: "Rental history retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching rental history:", error);

    // Fallback: try without includes if associations fail
    try {
      console.log("Trying simplified rental history query...");
      const rentalPayouts = await RentalPayout.findAndCountAll({
        where: { userId },
        order: [["payoutDate", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.json({
        success: true,
        data: {
          rentalPayouts: rentalPayouts.rows,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: rentalPayouts.count,
            pages: Math.ceil(rentalPayouts.count / limit),
          },
        },
        message: "Rental history retrieved successfully (simplified)",
      });
    } catch (fallbackError) {
      console.error("Error with fallback rental history query:", fallbackError);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch rental history",
        error:
          process.env.NODE_ENV === "development"
            ? fallbackError.message
            : undefined,
      });
    }
  }
};

/**
 * Process pending reinvestments (can be called manually or via cron)
 */
exports.processPendingReinvestments = async (req, res) => {
  try {
    const result = await this.processAllPendingReinvestments();

    return res.json({
      success: true,
      data: result,
      message: "Pending reinvestments processed successfully",
    });
  } catch (error) {
    console.error("Error processing pending reinvestments:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process pending reinvestments",
    });
  }
};

/**
 * Helper function to calculate rental statistics
 */
exports.calculateRentalStats = async (userId) => {
  try {
    // Get rental income from rent_distributions table (legacy)
    const [legacyRentals] = await rawQuery(
      `SELECT 
         COUNT(*) as count,
         COALESCE(SUM(amount), 0) as total_amount,
         MAX(created_at) as last_payout_date
       FROM rent_distributions 
       WHERE user_address = (
         SELECT CONCAT('0x', LOWER(HEX(id))) FROM users WHERE id = ?
       )`,
      [userId]
    );

    // Get rental income from new rental_payouts table
    const newRentals = await RentalPayout.findAll({
      where: { userId },
      attributes: [
        [
          RentalPayout.sequelize.fn("COUNT", RentalPayout.sequelize.col("id")),
          "count",
        ],
        [
          RentalPayout.sequelize.fn(
            "SUM",
            RentalPayout.sequelize.col("amount")
          ),
          "total_amount",
        ],
        [
          RentalPayout.sequelize.fn(
            "MAX",
            RentalPayout.sequelize.col("payoutDate")
          ),
          "last_payout_date",
        ],
        [
          RentalPayout.sequelize.fn(
            "SUM",
            RentalPayout.sequelize.col("reinvestedAmount")
          ),
          "total_reinvested",
        ],
      ],
      raw: true,
    });

    const legacyTotal = parseFloat(legacyRentals[0]?.total_amount || 0);
    const newTotal = parseFloat(newRentals[0]?.total_amount || 0);
    const totalReinvested = parseFloat(newRentals[0]?.total_reinvested || 0);

    return {
      totalRentalIncome: legacyTotal + newTotal,
      totalReinvested,
      availableToReinvest: newTotal - totalReinvested,
      payoutCount:
        parseInt(legacyRentals[0]?.count || 0) +
        parseInt(newRentals[0]?.count || 0),
      lastPayoutDate:
        newRentals[0]?.last_payout_date || legacyRentals[0]?.last_payout_date,
    };
  } catch (error) {
    console.error("Error calculating rental stats:", error);
    return {
      totalRentalIncome: 0,
      totalReinvested: 0,
      availableToReinvest: 0,
      payoutCount: 0,
      lastPayoutDate: null,
    };
  }
};

/**
 * Helper function to process all pending reinvestments
 */
exports.processAllPendingReinvestments = async () => {
  try {
    // Get all active auto-reinvest plans
    const activeReinvestPlans = await AutoReinvest.findAll({
      where: { status: "active" },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email"],
        },
      ],
    });

    const results = {
      processed: 0,
      failed: 0,
      totalReinvested: 0,
      errors: [],
    };

    for (const plan of activeReinvestPlans) {
      try {
        const result = await this.processIndividualReinvestment(plan);
        if (result.success) {
          results.processed++;
          results.totalReinvested += result.amount || 0;
        } else {
          results.failed++;
          results.errors.push({
            userId: plan.userId,
            error: result.error,
          });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          userId: plan.userId,
          error: error.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error processing all pending reinvestments:", error);
    throw error;
  }
};

/**
 * Helper function to process individual reinvestment
 */
exports.processIndividualReinvestment = async (autoReinvestPlan) => {
  try {
    const userId = autoReinvestPlan.userId;

    // Get pending rental payouts that haven't been reinvested
    const pendingPayouts = await RentalPayout.findAll({
      where: {
        userId,
        isReinvested: false,
        status: "paid",
      },
    });

    if (pendingPayouts.length === 0) {
      return { success: true, message: "No pending payouts to reinvest" };
    }

    // Calculate total available for reinvestment
    const totalAvailable = pendingPayouts.reduce(
      (sum, payout) => sum + parseFloat(payout.amount),
      0
    );

    const reinvestAmount =
      (totalAvailable * autoReinvestPlan.reinvestPercentage) / 100;

    // Check if reinvest amount meets minimum threshold
    if (reinvestAmount < autoReinvestPlan.minimumReinvestAmount) {
      // Update pending amount for future processing
      await autoReinvestPlan.update({
        pendingReinvestAmount:
          autoReinvestPlan.pendingReinvestAmount + reinvestAmount,
      });

      return {
        success: true,
        message: "Amount below minimum threshold, added to pending",
        pendingAmount: autoReinvestPlan.pendingReinvestAmount + reinvestAmount,
      };
    }

    // Include any previously pending amount
    const finalReinvestAmount =
      reinvestAmount + autoReinvestPlan.pendingReinvestAmount;

    // Here you would implement the actual reinvestment logic
    // For now, we'll create a mock transaction
    const transaction = await Transaction.create({
      userId,
      type: "reinvestment",
      amount: finalReinvestAmount,
      currency: "TND",
      status: "completed",
      description: `Auto-reinvestment of rental income (${autoReinvestPlan.theme} theme)`,
      autoReinvestPlanId: autoReinvestPlan.id,
    });

    // Update rental payouts as reinvested
    for (const payout of pendingPayouts) {
      const reinvestedFromThisPayout =
        (parseFloat(payout.amount) * autoReinvestPlan.reinvestPercentage) / 100;

      await payout.update({
        isReinvested: true,
        reinvestedAmount: reinvestedFromThisPayout,
        reinvestTransactionId: transaction.id,
        autoReinvestPlanId: autoReinvestPlan.id,
        status: "reinvested",
      });
    }

    // Update auto-reinvest plan statistics
    await autoReinvestPlan.update({
      totalReinvested: autoReinvestPlan.totalReinvested + finalReinvestAmount,
      totalRentalIncome: autoReinvestPlan.totalRentalIncome + totalAvailable,
      pendingReinvestAmount: 0,
      lastReinvestDate: new Date(),
    });

    return {
      success: true,
      amount: finalReinvestAmount,
      transactionId: transaction.id,
      message: "Reinvestment processed successfully",
    };
  } catch (error) {
    console.error("Error processing individual reinvestment:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
