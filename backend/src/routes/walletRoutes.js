const express = require("express");
const router = express.Router();
const walletController = require("../controllers/walletController");
const { authenticate } = require("../middleware/authenticate");

/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Wallet ID
 *         userId:
 *           type: integer
 *           description: User ID
 *         cashBalance:
 *           type: number
 *           description: Cash balance
 *         rewardsBalance:
 *           type: number
 *           description: Rewards balance
 *         totalBalance:
 *           type: number
 *           description: Total balance (cash + rewards)
 *         currency:
 *           type: string
 *           enum: [USD, EUR, TND]
 *           description: Wallet currency
 *         lastTransactionAt:
 *           type: string
 *           format: date-time
 *           description: Last transaction timestamp
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Transaction ID
 *         type:
 *           type: string
 *           enum: [deposit, withdrawal, reward, investment, rent_payout, referral_bonus]
 *           description: Transaction type
 *         amount:
 *           type: number
 *           description: Transaction amount
 *         currency:
 *           type: string
 *           enum: [USD, EUR, TND]
 *           description: Transaction currency
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *           description: Transaction status
 *         description:
 *           type: string
 *           description: Transaction description
 *         balanceType:
 *           type: string
 *           enum: [cash, rewards]
 *           description: Which balance type is affected
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Transaction creation timestamp
 */

/**
 * @swagger
 * /api/wallet:
 *   get:
 *     summary: Get user wallet with balances
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Wallet'
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Server error
 */
router.get("/", authenticate, walletController.getWallet);

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get transaction history
 *     tags: [Wallet]
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
 *         description: Number of transactions per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [deposit, withdrawal, reward, investment, rent_payout, referral_bonus]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
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
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       500:
 *         description: Server error
 */
router.get("/transactions", authenticate, walletController.getTransactions);

/**
 * @swagger
 * /api/wallet/deposit:
 *   post:
 *     summary: Add funds to wallet (Deposit)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to deposit
 *                 example: 100.00
 *               description:
 *                 type: string
 *                 description: Transaction description
 *                 example: "Credit card deposit"
 *               reference:
 *                 type: string
 *                 description: External transaction reference
 *                 example: "TXN_123456"
 *     responses:
 *       200:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                     newBalance:
 *                       type: object
 *       400:
 *         description: Invalid amount
 *       500:
 *         description: Server error
 */
router.post("/deposit", authenticate, walletController.deposit);

/**
 * @swagger
 * /api/wallet/withdraw:
 *   post:
 *     summary: Withdraw funds from wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to withdraw
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 description: Transaction description
 *                 example: "Bank transfer withdrawal"
 *               reference:
 *                 type: string
 *                 description: External transaction reference
 *                 example: "TXN_789012"
 *     responses:
 *       200:
 *         description: Withdrawal successful
 *       400:
 *         description: Invalid amount or insufficient balance
 *       404:
 *         description: Wallet not found
 *       500:
 *         description: Server error
 */
router.post("/withdraw", authenticate, walletController.withdraw);

/**
 * @swagger
 * /api/wallet/rewards:
 *   post:
 *     summary: Add rewards to wallet
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Reward amount
 *                 example: 25.00
 *               description:
 *                 type: string
 *                 description: Reward description
 *                 example: "Referral bonus"
 *               reference:
 *                 type: string
 *                 description: External reference
 *                 example: "REF_123456"
 *               type:
 *                 type: string
 *                 enum: [reward, referral_bonus, rent_payout]
 *                 default: reward
 *                 description: Type of reward
 *     responses:
 *       200:
 *         description: Rewards added successfully
 *       400:
 *         description: Invalid amount
 *       500:
 *         description: Server error
 */
router.post("/rewards", authenticate, walletController.addRewards);

module.exports = router; 