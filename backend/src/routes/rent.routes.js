const express = require("express");
const router = express.Router();
const controller = require("../controllers/rent.controller");

/**
 * @swagger
 * tags:
 *   name: Rent
 *   description: Rent distribution and history endpoints
 */

/**
 * @swagger
 * /api/rent/distribute:
 *   post:
 *     summary: Distribute rent based on investor shares
 *     tags: [Rent]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - investors
 *               - totalRent
 *             properties:
 *               projectId:
 *                 type: integer
 *                 example: 1
 *               investors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["0x742d35Cc6634C0532925a3b844Bc454e4438f44e"]
 *               totalRent:
 *                 type: number
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Rent distributed successfully
 *       400:
 *         description: Validation or investment issues
 *       500:
 *         description: Server error
 */
router.post("/distribute", controller.distributeRent);

/**
 * @swagger
 * /api/rent/history/{walletAddress}:
 *   get:
 *     summary: Get rent payout history by wallet address
 *     tags: [Rent]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *         description: Ethereum wallet address
 *     responses:
 *       200:
 *         description: List of rent distributions for the user
 *       404:
 *         description: No payouts found
 *       500:
 *         description: Server error
 */
router.get("/history/:walletAddress", controller.getRentHistoryByWallet);

/**
 * @swagger
 * /api/rent/project/{projectId}:
 *   get:
 *     summary: Get rent distributions for a project
 *     tags: [Rent]
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Rent distributions for the project
 *       404:
 *         description: No payouts found
 *       500:
 *         description: Server error
 */
router.get("/project/:projectId", controller.getRentByProject);

module.exports = router;
