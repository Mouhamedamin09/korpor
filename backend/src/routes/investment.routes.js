const express = require("express");
const router = express.Router();
const controller = require("../controllers/investment.controller");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Investments
 *   description: Blockchain investment management
 */

/**
 * @swagger
 * /api/investments/limits:
 *   get:
 *     summary: Get investment limits for the current user
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Investment limits data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 investedThisYear:
 *                   type: number
 *                   description: Amount already invested this year (TND)
 *                 annualLimit:
 *                   type: number
 *                   description: Total annual limit (TND)
 *                 renewalDate:
 *                   type: string
 *                   format: date
 *                   description: ISO date when limit renews
 *                 professionalThreshold:
 *                   type: number
 *                   description: Asset threshold (USD) to become professional
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/limits", authenticate, controller.getInvestmentLimits);

/**
 * @swagger
 * /api/investments:
 *   post:
 *     summary: Create a new investment (initiates Paymee payment session)
 *     tags: [Investments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - project_id
 *               - amount
 *               - user_address
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               project_id:
 *                 type: integer
 *                 example: 1
 *               amount:
 *                 type: number
 *                 example: 5000
 *               user_address:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *     responses:
 *       200:
 *         description: Returns the Paymee payment URL and investment record
 *       400:
 *         description: Missing fields or invalid input
 *       500:
 *         description: Internal server error
 */
router.post("/", controller.createInvestment);

/**
 * @swagger
 * /api/investments:
 *   get:
 *     summary: Get all investments (admin use)
 *     tags: [Investments]
 *     responses:
 *       200:
 *         description: A list of all investments
 *       500:
 *         description: Server error while fetching investments
 */
router.get("/", controller.getAllInvestments);

/**
 * @swagger
 * /api/investments/{walletAddress}:
 *   get:
 *     summary: Get investments by wallet address
 *     tags: [Investments]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Ethereum wallet address of the user
 *         example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *     responses:
 *       200:
 *         description: A list of investments linked to the wallet address
 *       404:
 *         description: No investments found for this wallet
 *       500:
 *         description: Server error while fetching data
 */
router.get("/:walletAddress", controller.getInvestmentsByWallet);

module.exports = router;
