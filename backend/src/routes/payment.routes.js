const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Off-chain payment management using Paymee
 */

/**


/**
 * @swagger
 * /api/payment/callback:
 *   post:
 *     summary: Paymee webhook callback (auto-handled)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - reference
 *               - amount
 *             properties:
 *               status:
 *                 type: string
 *                 example: "paid"
 *               reference:
 *                 type: string
 *                 example: "a7b4bc1601743ad1327ca3052deb2089"
 *               amount:
 *                 type: number
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Investment confirmed and recorded on-chain
 *       400:
 *         description: Payment not confirmed or amount mismatch
 *       500:
 *         description: Blockchain or DB error
 */
router.post("/callback", controller.handleCallback);

/**
 * @swagger
 * /api/payment/status/{ref}:
 *   get:
 *     summary: Get payment status by Paymee reference
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema:
 *           type: string
 *         description: Paymee reference token
 *         example: "a7b4bc1601743ad1327ca3052deb2089"
 *     responses:
 *       200:
 *         description: Payment details found
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Server error
 */
router.get("/status/:ref", controller.getPaymentStatusByRef);

/**
 * @swagger
 * /api/payment/wallet/{walletAddress}:
 *   get:
 *     summary: Get all payments by user wallet address
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Ethereum wallet address
 *         example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *     responses:
 *       200:
 *         description: List of all payments from that wallet
 *       404:
 *         description: No payments found
 *       500:
 *         description: Server error
 */
router.get("/wallet/:walletAddress", controller.getPaymentsByWallet);

module.exports = router;
