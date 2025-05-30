const express = require("express");
const router = express.Router();
const autoInvestController = require("../controllers/autoInvestController");
const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * components:
 *   schemas:
 *     AutoInvestPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         monthlyAmount:
 *           type: number
 *         currency:
 *           type: string
 *           enum: [TND, EUR]
 *         theme:
 *           type: string
 *           enum: [growth, income, index, balanced]
 *         status:
 *           type: string
 *           enum: [active, paused, cancelled]
 *         depositDay:
 *           type: integer
 *           minimum: 1
 *           maximum: 28
 *         lastDepositDate:
 *           type: string
 *           format: date
 *         nextDepositDate:
 *           type: string
 *           format: date
 *         totalDeposited:
 *           type: number
 *         totalInvested:
 *           type: number
 *         riskLevel:
 *           type: string
 *           enum: [low, medium, high]
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   name: AutoInvest
 *   description: Automated investment management
 */

/**
 * @swagger
 * /api/autoinvest:
 *   post:
 *     summary: Create a new AutoInvest plan
 *     tags: [AutoInvest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monthlyAmount
 *               - theme
 *               - depositDay
 *             properties:
 *               monthlyAmount:
 *                 type: number
 *                 minimum: 100
 *                 description: Monthly investment amount (minimum 100 TND)
 *               theme:
 *                 type: string
 *                 enum: [growth, income, index, balanced]
 *                 description: Investment theme strategy
 *               depositDay:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 28
 *                 description: Day of month for automatic deposits
 *               paymentMethodId:
 *                 type: string
 *                 description: Payment method identifier
 *               riskLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               preferredRegions:
 *                 type: array
 *                 items:
 *                   type: string
 *               excludedPropertyTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: AutoInvest plan created successfully
 *       400:
 *         description: Invalid input or user already has active plan
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, autoInvestController.createAutoInvest);

/**
 * @swagger
 * /api/autoinvest:
 *   get:
 *     summary: Get user's AutoInvest plan
 *     tags: [AutoInvest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AutoInvest plan retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, autoInvestController.getAutoInvest);

/**
 * @swagger
 * /api/autoinvest:
 *   put:
 *     summary: Update AutoInvest plan
 *     tags: [AutoInvest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               monthlyAmount:
 *                 type: number
 *                 minimum: 100
 *               depositDay:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 28
 *               paymentMethodId:
 *                 type: string
 *               riskLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *               preferredRegions:
 *                 type: array
 *                 items:
 *                   type: string
 *               excludedPropertyTypes:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: AutoInvest plan updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: No active AutoInvest plan found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/", authenticate, autoInvestController.updateAutoInvest);

/**
 * @swagger
 * /api/autoinvest/toggle:
 *   post:
 *     summary: Pause or resume AutoInvest plan
 *     tags: [AutoInvest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [pause, resume]
 *                 description: Action to perform on the plan
 *     responses:
 *       200:
 *         description: AutoInvest plan status updated successfully
 *       400:
 *         description: Invalid action
 *       404:
 *         description: No AutoInvest plan found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/toggle", authenticate, autoInvestController.toggleAutoInvest);

/**
 * @swagger
 * /api/autoinvest/cancel:
 *   post:
 *     summary: Cancel AutoInvest plan
 *     tags: [AutoInvest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AutoInvest plan cancelled successfully
 *       404:
 *         description: No active AutoInvest plan found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/cancel", authenticate, autoInvestController.cancelAutoInvest);

/**
 * @swagger
 * /api/autoinvest/stats:
 *   get:
 *     summary: Get AutoInvest analytics and statistics
 *     tags: [AutoInvest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AutoInvest statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/stats", authenticate, autoInvestController.getAutoInvestStats);

/**
 * @swagger
 * /api/autoinvest/process:
 *   post:
 *     summary: Manually trigger AutoInvest processing (admin/testing)
 *     tags: [AutoInvest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AutoInvest processing triggered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     processed:
 *                       type: integer
 *                     failed:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/process",
  authenticate,
  autoInvestController.triggerAutoInvestProcessing
);

module.exports = router;
