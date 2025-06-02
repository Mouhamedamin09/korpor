const express = require("express");
const router = express.Router();
const portfolioController = require("../controllers/portfolioController");
const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioTotals:
 *       type: object
 *       properties:
 *         usd:
 *           type: number
 *           description: Portfolio value in USD
 *         local:
 *           type: number
 *           description: Portfolio value in user's preferred currency
 *         currency:
 *           type: string
 *           description: User's preferred currency code
 *         totalInvested:
 *           type: number
 *           description: Total amount invested
 *         totalReturns:
 *           type: number
 *           description: Total returns earned
 *         monthlyIncome:
 *           type: number
 *           description: Current monthly income from investments
 *         averageYield:
 *           type: number
 *           description: Average yield percentage
 *
 *     AutomationStatus:
 *       type: object
 *       properties:
 *         autoInvestSetup:
 *           type: boolean
 *           description: Whether AutoInvest is configured
 *         autoReinvestSetup:
 *           type: boolean
 *           description: Whether AutoReinvest is configured
 *         autoInvestDetails:
 *           type: object
 *           description: AutoInvest plan details if configured
 *         autoReinvestDetails:
 *           type: object
 *           description: AutoReinvest settings if configured
 *
 * tags:
 *   name: Portfolio
 *   description: Portfolio data and analytics
 */

/**
 * @swagger
 * /api/portfolio/totals:
 *   get:
 *     summary: Get user's portfolio totals and performance metrics
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio totals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PortfolioTotals'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/totals", authenticate, portfolioController.getPortfolioTotals);

/**
 * @swagger
 * /api/portfolio/automation:
 *   get:
 *     summary: Get user's automation settings status
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Automation status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AutomationStatus'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/automation",
  authenticate,
  portfolioController.getAutomationStatus
);

/**
 * @swagger
 * /api/portfolio/performance:
 *   get:
 *     summary: Get detailed portfolio performance metrics
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [1M, 3M, 6M, 1Y, ALL]
 *         description: Time period for performance data
 *     responses:
 *       200:
 *         description: Portfolio performance data retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/performance",
  authenticate,
  portfolioController.getPortfolioPerformance
);

/**
 * @swagger
 * /api/portfolio/projection:
 *   post:
 *     summary: Calculate portfolio growth projection
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monthlyDeposit
 *               - years
 *               - yieldPct
 *             properties:
 *               monthlyDeposit:
 *                 type: number
 *               years:
 *                 type: integer
 *               yieldPct:
 *                 type: number
 *     responses:
 *       200:
 *         description: Portfolio projection calculated successfully
 *       400:
 *         description: Invalid input parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/projection",
  authenticate,
  portfolioController.calculatePortfolioProjection
);

module.exports = router;
