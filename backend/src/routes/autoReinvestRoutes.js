const express = require("express");
const router = express.Router();
const autoReinvestController = require("../controllers/autoReinvestController");
const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * components:
 *   schemas:
 *     AutoReinvestPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         status:
 *           type: string
 *           enum: [active, paused, cancelled]
 *         minimumReinvestAmount:
 *           type: number
 *         reinvestPercentage:
 *           type: number
 *           minimum: 0
 *           maximum: 100
 *         theme:
 *           type: string
 *           enum: [growth, income, index, balanced, diversified]
 *         riskLevel:
 *           type: string
 *           enum: [low, medium, high]
 *         reinvestmentFrequency:
 *           type: string
 *           enum: [immediate, weekly, monthly]
 *         autoApprovalEnabled:
 *           type: boolean
 *         maxReinvestPercentagePerProject:
 *           type: number
 *         totalRentalIncome:
 *           type: number
 *         totalReinvested:
 *           type: number
 *         pendingReinvestAmount:
 *           type: number
 *         lastReinvestDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *
 * tags:
 *   name: AutoReinvest
 *   description: Automated rental income reinvestment management
 */

/**
 * @swagger
 * /api/autoreinvest:
 *   post:
 *     summary: Create a new AutoReinvest plan
 *     tags: [AutoReinvest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minimumReinvestAmount:
 *                 type: number
 *                 minimum: 10
 *                 default: 100
 *                 description: Minimum amount to trigger reinvestment (TND)
 *               reinvestPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 default: 100
 *                 description: Percentage of rental income to reinvest
 *               theme:
 *                 type: string
 *                 enum: [growth, income, index, balanced, diversified]
 *                 default: balanced
 *                 description: Investment theme strategy
 *               riskLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               reinvestmentFrequency:
 *                 type: string
 *                 enum: [immediate, weekly, monthly]
 *                 default: monthly
 *               autoApprovalEnabled:
 *                 type: boolean
 *                 default: true
 *               maxReinvestPercentagePerProject:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 25
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
 *         description: AutoReinvest plan created successfully
 *       400:
 *         description: Invalid input or user not eligible (requires 2000 TND invested)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, autoReinvestController.createAutoReinvest);

/**
 * @swagger
 * /api/autoreinvest:
 *   get:
 *     summary: Get user's AutoReinvest plan and eligibility status
 *     tags: [AutoReinvest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AutoReinvest data retrieved successfully
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
 *                     isEligible:
 *                       type: boolean
 *                     totalInvested:
 *                       type: number
 *                     minimumRequired:
 *                       type: number
 *                       example: 2000
 *                     autoReinvestPlan:
 *                       $ref: '#/components/schemas/AutoReinvestPlan'
 *                     rentalStats:
 *                       type: object
 *                       properties:
 *                         totalRentalIncome:
 *                           type: number
 *                         totalReinvested:
 *                           type: number
 *                         availableToReinvest:
 *                           type: number
 *                         payoutCount:
 *                           type: integer
 *                         lastPayoutDate:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, autoReinvestController.getAutoReinvest);

/**
 * @swagger
 * /api/autoreinvest:
 *   put:
 *     summary: Update AutoReinvest plan
 *     tags: [AutoReinvest]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               minimumReinvestAmount:
 *                 type: number
 *                 minimum: 10
 *               reinvestPercentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               theme:
 *                 type: string
 *                 enum: [growth, income, index, balanced, diversified]
 *               riskLevel:
 *                 type: string
 *                 enum: [low, medium, high]
 *               reinvestmentFrequency:
 *                 type: string
 *                 enum: [immediate, weekly, monthly]
 *               autoApprovalEnabled:
 *                 type: boolean
 *               maxReinvestPercentagePerProject:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
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
 *         description: AutoReinvest plan updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: No active AutoReinvest plan found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/", authenticate, autoReinvestController.updateAutoReinvest);

/**
 * @swagger
 * /api/autoreinvest/toggle:
 *   post:
 *     summary: Pause or resume AutoReinvest plan
 *     tags: [AutoReinvest]
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
 *                 description: Action to perform on the AutoReinvest plan
 *     responses:
 *       200:
 *         description: AutoReinvest plan toggled successfully
 *       400:
 *         description: Invalid action or plan already in requested state
 *       404:
 *         description: No AutoReinvest plan found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/toggle", authenticate, autoReinvestController.toggleAutoReinvest);

/**
 * @swagger
 * /api/autoreinvest/cancel:
 *   post:
 *     summary: Cancel AutoReinvest plan
 *     tags: [AutoReinvest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AutoReinvest plan cancelled successfully
 *       404:
 *         description: No active AutoReinvest plan found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/cancel", authenticate, autoReinvestController.cancelAutoReinvest);

/**
 * @swagger
 * /api/autoreinvest/rental-history:
 *   get:
 *     summary: Get rental income history
 *     tags: [AutoReinvest]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Rental history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get(
  "/rental-history",
  authenticate,
  autoReinvestController.getRentalHistory
);

/**
 * @swagger
 * /api/autoreinvest/process-pending:
 *   post:
 *     summary: Process pending reinvestments (admin or cron job)
 *     tags: [AutoReinvest]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending reinvestments processed successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  "/process-pending",
  authenticate,
  autoReinvestController.processPendingReinvestments
);

module.exports = router;
