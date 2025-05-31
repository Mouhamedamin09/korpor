const express = require("express");
const router = express.Router();
const controller = require("../controllers/payment.controller");
const { authenticateUser } = require("../middleware/auth.middleware");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Multi-gateway payment management (Stripe Test, PayMe Coming Soon, Crypto)
 */

// ================================
// PAYMENT METHOD MANAGEMENT
// ================================

/**
 * @swagger
 * /api/payment/methods:
 *   get:
 *     summary: Get all available payment methods
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of available payment methods
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 payment_methods:
 *                   type: object
 *                   properties:
 *                     stripe:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Credit/Debit Card"
 *                         enabled:
 *                           type: boolean
 *                           example: true
 *                         test_mode:
 *                           type: boolean
 *                           example: true
 *                     payme:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "PayMe"
 *                         enabled:
 *                           type: boolean
 *                           example: false
 *                     crypto:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Cryptocurrency"
 *                         enabled:
 *                           type: boolean
 *                           example: true
 */
router.get("/methods", controller.getPaymentMethods);

// ================================
// STRIPE PAYMENTS (TEST MODE)
// ================================

/**
 * @swagger
 * /api/payment/stripe/payment-intent:
 *   post:
 *     summary: Create Stripe payment intent (Test Mode)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - email
 *               - walletAddress
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100.50
 *               currency:
 *                 type: string
 *                 example: "USD"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *               projectId:
 *                 type: string
 *                 example: "proj_123"
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/stripe/payment-intent", controller.createStripePayment);

/**
 * @swagger
 * /api/payment/stripe/setup-intent:
 *   post:
 *     summary: Create Stripe setup intent for saving cards (Test Mode)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - walletAddress
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *     responses:
 *       200:
 *         description: Setup intent created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/stripe/setup-intent", controller.createStripeSetupIntent);

/**
 * @swagger
 * /api/payment/stripe/payment-methods/{customerId}:
 *   get:
 *     summary: Get saved payment methods for Stripe customer
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe customer ID
 *         example: "cus_test123"
 *     responses:
 *       200:
 *         description: List of payment methods
 *       400:
 *         description: Customer ID required
 *       500:
 *         description: Server error
 */
router.get(
  "/stripe/payment-methods/:customerId",
  controller.getStripePaymentMethods
);

/**
 * @swagger
 * /api/payment/stripe/webhook:
 *   post:
 *     summary: Stripe webhook endpoint (auto-handled)
 *     tags: [Payments]
 *     description: This endpoint is called automatically by Stripe for payment events
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Webhook signature verification failed
 */
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  controller.handleStripeWebhook
);

/**
 * @swagger
 * /api/payment/stripe/test-cards:
 *   get:
 *     summary: Get Stripe test card numbers (Development Only)
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of test card numbers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 test_mode:
 *                   type: boolean
 *                   example: true
 *                 cards:
 *                   type: object
 *                   properties:
 *                     visa:
 *                       type: string
 *                       example: "4242424242424242"
 *                     mastercard:
 *                       type: string
 *                       example: "5555555555554444"
 *       400:
 *         description: Only available in test mode
 */
router.get("/stripe/test-cards", controller.getStripeTestCards);

// ================================
// PAYME PAYMENTS (COMING SOON)
// ================================

/**
 * @swagger
 * /api/payment/payme/create:
 *   post:
 *     summary: Create PayMe payment (Coming Soon)
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - walletAddress
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 100.50
 *               note:
 *                 type: string
 *                 example: "Investment payment"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *     responses:
 *       200:
 *         description: Coming soon response with planned features
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "coming_soon"
 *                 message:
 *                   type: string
 *                   example: "PayMe integration is coming soon!"
 *                 features_planned:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post("/payme/create", controller.createPaymePayment);

/**
 * @swagger
 * /api/payment/payme/callback:
 *   post:
 *     summary: PayMe webhook callback (Legacy Support)
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
router.post("/payme/callback", controller.handlePaymeCallback);

// ================================
// CRYPTO PAYMENTS
// ================================

/**
 * @swagger
 * /api/payment/crypto/create:
 *   post:
 *     summary: Create cryptocurrency payment
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - crypto
 *               - walletAddress
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 0.05
 *               crypto:
 *                 type: string
 *                 enum: [ETH, BTC, USDT, USDC]
 *                 example: "ETH"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *               projectId:
 *                 type: string
 *                 example: "proj_123"
 *     responses:
 *       200:
 *         description: Crypto payment address generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 payment_request:
 *                   type: object
 *                   properties:
 *                     payment_address:
 *                       type: string
 *                       example: "0x1234567890abcdef..."
 *                     amount:
 *                       type: number
 *                       example: 0.05
 *                     expires_at:
 *                       type: string
 *                       format: date-time
 *                 qr_code_data:
 *                   type: string
 *                   example: "ethereum:0x1234...?amount=0.05"
 *       400:
 *         description: Missing required fields or invalid crypto
 *       500:
 *         description: Server error
 */
router.post("/crypto/create", controller.createCryptoPayment);

/**
 * @swagger
 * /api/payment/crypto/transaction/{transactionHash}/{crypto}:
 *   get:
 *     summary: Check cryptocurrency transaction status
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: transactionHash
 *         required: true
 *         schema:
 *           type: string
 *         description: Blockchain transaction hash
 *         example: "0xabc123..."
 *       - in: path
 *         name: crypto
 *         required: true
 *         schema:
 *           type: string
 *           enum: [ETH, BTC, USDT, USDC]
 *         description: Cryptocurrency type
 *         example: "ETH"
 *     responses:
 *       200:
 *         description: Transaction status information
 *       500:
 *         description: Server error
 */
router.get(
  "/crypto/transaction/:transactionHash/:crypto",
  controller.checkCryptoTransaction
);

/**
 * @swagger
 * /api/payment/crypto/supported:
 *   get:
 *     summary: Get supported cryptocurrencies
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of supported cryptocurrencies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 supported_cryptocurrencies:
 *                   type: object
 *                   properties:
 *                     ETH:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Ethereum"
 *                         symbol:
 *                           type: string
 *                           example: "ETH"
 *                         minAmount:
 *                           type: number
 *                           example: 0.001
 *                 test_mode:
 *                   type: boolean
 *                   example: true
 */
router.get("/crypto/supported", controller.getSupportedCryptos);

// ================================
// LEGACY/GENERAL ENDPOINTS
// ================================

/**
 * @swagger
 * /api/payment/status/{ref}:
 *   get:
 *     summary: Get payment status by reference
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: ref
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment reference/ID
 *         example: "payment_123"
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

// Legacy alias for PayMe callback
router.post("/callback", controller.handlePaymeCallback);

// ================================
// SAVED PAYMENT METHODS
// ================================

/**
 * @swagger
 * /api/payment/saved-methods:
 *   get:
 *     summary: Get user's saved payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved payment methods
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 payment_methods:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       stripe_payment_method_id:
 *                         type: string
 *                       card:
 *                         type: object
 *                       is_default:
 *                         type: boolean
 */
router.get(
  "/saved-methods",
  authenticateUser,
  controller.getSavedPaymentMethods
);

/**
 * @swagger
 * /api/payment/stripe/save-method:
 *   post:
 *     summary: Save a Stripe payment method from setup intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - setup_intent_id
 *             properties:
 *               setup_intent_id:
 *                 type: string
 *                 example: "seti_123"
 *               is_default:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Payment method saved successfully
 */
router.post(
  "/stripe/save-method",
  authenticateUser,
  controller.saveStripePaymentMethod
);

/**
 * @swagger
 * /api/payment/saved-methods/{id}:
 *   delete:
 *     summary: Delete a saved payment method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved payment method ID
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
 */
router.delete(
  "/saved-methods/:id",
  authenticateUser,
  controller.deleteSavedPaymentMethod
);

/**
 * @swagger
 * /api/payment/saved-methods/{id}/default:
 *   put:
 *     summary: Set a payment method as default
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Saved payment method ID
 *     responses:
 *       200:
 *         description: Default payment method updated
 */
router.put(
  "/saved-methods/:id/default",
  authenticateUser,
  controller.setDefaultPaymentMethod
);

/**
 * @swagger
 * /api/payment/stripe/payment-with-saved:
 *   post:
 *     summary: Create payment with saved Stripe method
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - saved_method_id
 *               - amount
 *             properties:
 *               saved_method_id:
 *                 type: string
 *               amount:
 *                 type: number
 *               currency:
 *                 type: string
 *                 default: "USD"
 *     responses:
 *       200:
 *         description: Payment created successfully
 */
router.post(
  "/stripe/payment-with-saved",
  authenticateUser,
  controller.createPaymentWithSavedMethod
);

module.exports = router;
