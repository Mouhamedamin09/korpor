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
 * /api/payment/payme/test-config:
 *   get:
 *     summary: Test PayMe configuration and API connectivity
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: PayMe configuration status and test data
 */
router.get("/payme/test-config", controller.testPaymeConfig);

/**
 * @swagger
 * /api/payment/payme/test-payment:
 *   post:
 *     summary: Test PayMe payment creation with minimal data (Debug Only)
 *     tags: [Payments]
 *     description: Creates a test payment to debug PayMe API requirements
 *     responses:
 *       200:
 *         description: Test payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "PayMe test payment created successfully"
 *                 data:
 *                   type: object
 *                 test_data_sent:
 *                   type: object
 *       500:
 *         description: PayMe API error with detailed debugging information
 */
router.post("/payme/test-payment", controller.testPaymePayment);

/**
 * @swagger
 * /api/payment/payme/create:
 *   post:
 *     summary: Create PayMe payment in development mode
 *     tags: [Payments]
 *     description: |
 *       Creates a new PayMe payment in sandbox mode.
 *       PayMe.tn supports Tunisian Dinar (TND) payments with mobile wallet and bank transfers.
 *
 *       **Test Credentials (Sandbox):**
 *       - Phone: 11111111
 *       - Password: 11111111
 *
 *       **Features:**
 *       - Mobile wallet payments
 *       - Bank transfers
 *       - Local payment methods
 *       - QR code payments
 *       - Webhook notifications
 *
 *       **Processing:** 1-3 minutes
 *       **Fees:** 1.5% + 0.5 TND
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - walletAddress
 *               - email
 *               - phone
 *               - first_name
 *               - last_name
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 example: 100.50
 *                 description: "Amount in Tunisian Dinar (TND)"
 *               note:
 *                 type: string
 *                 example: "Investment payment"
 *                 description: "Payment description"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *                 description: "User's wallet address for tracking"
 *               first_name:
 *                 type: string
 *                 example: "Ahmed"
 *                 description: "Customer's first name"
 *               last_name:
 *                 type: string
 *                 example: "Ben Ali"
 *                 description: "Customer's last name"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@example.com"
 *                 description: "Customer's email address"
 *               phone:
 *                 type: string
 *                 example: "11222333"
 *                 description: "Phone number (will be formatted to +216 for Tunisia)"
 *               projectId:
 *                 type: string
 *                 example: "proj_123"
 *                 description: "Project ID for investment tracking"
 *     responses:
 *       200:
 *         description: PayMe payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 payment_method:
 *                   type: string
 *                   example: "payme"
 *                 token:
 *                   type: string
 *                   example: "dfe54df34b54df3a854f3a53fc85a"
 *                   description: "PayMe payment token"
 *                 order_id:
 *                   type: string
 *                   example: "korpor_1640995200000_abc123"
 *                   description: "Unique order identifier"
 *                 payment_url:
 *                   type: string
 *                   example: "https://sandbox.paymee.tn/payment/dfe54df34b54df3a854f3a53fc85a"
 *                   description: "URL to redirect user for payment"
 *                 amount:
 *                   type: number
 *                   example: 100.50
 *                   description: "Payment amount in TND"
 *                 currency:
 *                   type: string
 *                   example: "TND"
 *                   description: "Tunisian Dinar"
 *                 first_name:
 *                   type: string
 *                   example: "Ahmed"
 *                 last_name:
 *                   type: string
 *                   example: "Ben Ali"
 *                 email:
 *                   type: string
 *                   example: "ahmed@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+21611222333"
 *                 note:
 *                   type: string
 *                   example: "Investment payment"
 *                 test_credentials:
 *                   type: object
 *                   properties:
 *                     phone:
 *                       type: string
 *                       example: "11111111"
 *                     password:
 *                       type: string
 *                       example: "11111111"
 *                 instructions:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [
 *                     "Use the test credentials in sandbox mode:",
 *                     "Phone: 11111111",
 *                     "Password: 11111111",
 *                     "Watch for '/loader' URL to know when payment is complete",
 *                     "Payment status will be sent to webhook URL"
 *                   ]
 *       400:
 *         description: Missing required fields or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: amount, walletAddress, email, phone, first_name, last_name"
 *       500:
 *         description: PayMe API error or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "PayMe API validation error: Erroneous provided data"
 *   tags:
 *     - Payments
 *   security: []
 *   examples:
 *     PayMePayment:
 *       summary: PayMe payment for investment
 *       value:
 *         amount: 250.75
 *         note: "Korpor investment payment"
 *         walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *         first_name: "Ahmed"
 *         last_name: "Ben Ali"
 *         email: "ahmed@example.com"
 *         phone: "11222333"
 *         projectId: "korpor_tech_fund_2024"
 *       responses:
 *         "200":
 *           description: Success response
 *           content:
 *             application/json:
 *               example:
 *                 status: "success"
 *                 payment_method: "payme"
 *                 token: "dfe54df34b54df3a854f3a53fc85a"
 *                 order_id: "korpor_1640995200000_abc123"
 *                 payment_url: "https://sandbox.paymee.tn/payment/dfe54df34b54df3a854f3a53fc85a"
 *                 amount: 250.75
 *                 currency: "TND"
 *                 first_name: "Ahmed"
 *                 last_name: "Ben Ali"
 *                 email: "ahmed@example.com"
 *                 phone: "+21611222333"
 *                 note: "Korpor investment payment"
 *                 test_credentials:
 *                   phone: "11111111"
 *                   password: "11111111"
 *                 instructions: [
 *                   "Use the test credentials in sandbox mode:",
 *                   "Phone: 11111111",
 *                   "Password: 11111111",
 *                   "Watch for '/loader' URL to know when payment is complete",
 *                   "Payment status will be sent to webhook URL"
 *                 ]
 *                 message:
 *                   example: "PayMe integration is coming soon!"
 *                 features_planned:
 *                   type: array
 *                   items:
 *                     type: string
 */
router.post("/payme/create", controller.createPaymePayment);

/**
 * @swagger
 * /api/payment/payme/webhook:
 *   post:
 *     summary: PayMe webhook endpoint for payment status updates
 *     tags: [Payments]
 *     description: Receives payment status updates from PayMe.tn API
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - payment_status
 *               - check_sum
 *             properties:
 *               token:
 *                 type: string
 *                 example: "dfe54df34b54df3a854f3a53fc85a"
 *               payment_status:
 *                 type: boolean
 *                 example: true
 *               check_sum:
 *                 type: string
 *                 example: "14efe54d8664f34543a854f3a5213fc85a"
 *               order_id:
 *                 type: string
 *                 example: "244557"
 *               first_name:
 *                 type: string
 *                 example: "John"
 *               last_name:
 *                 type: string
 *                 example: "Doe"
 *               email:
 *                 type: string
 *                 example: "test@paymee.tn"
 *               phone:
 *                 type: string
 *                 example: "+21611222333"
 *               note:
 *                 type: string
 *                 example: "Order #123"
 *               amount:
 *                 type: number
 *                 example: 220.25
 *               transaction_id:
 *                 type: number
 *                 example: 5578
 *               received_amount:
 *                 type: number
 *                 example: 210.25
 *               cost:
 *                 type: number
 *                 example: 10
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Webhook processed successfully"
 *                 token:
 *                   type: string
 *                   example: "dfe54df34b54df3a854f3a53fc85a"
 *                 payment_status:
 *                   type: string
 *                   example: "completed"
 */
router.post("/payme/webhook", controller.handlePaymeWebhook);

/**
 * @swagger
 * /api/payment/payme/status/{token}:
 *   get:
 *     summary: Check PayMe payment status by token
 *     tags: [Payments]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: PayMe payment token
 *         example: "dfe54df34b54df3a854f3a53fc85a"
 *     responses:
 *       200:
 *         description: Payment status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 payment:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: "dfe54df34b54df3a854f3a53fc85a"
 *                     order_id:
 *                       type: string
 *                       example: "korpor_1234567890_abc123"
 *                     amount:
 *                       type: number
 *                       example: 220.25
 *                     currency:
 *                       type: string
 *                       example: "TND"
 *                     status:
 *                       type: string
 *                       enum: [pending, completed, failed]
 *                       example: "completed"
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     completed_at:
 *                       type: string
 *                       format: date-time
 *                     transaction_id:
 *                       type: number
 *                       example: 5578
 *                     received_amount:
 *                       type: number
 *                       example: 210.25
 *                     transaction_fee:
 *                       type: number
 *                       example: 10
 *       404:
 *         description: Payment not found
 *       400:
 *         description: Token is required
 */
router.get("/payme/status/:token", controller.checkPaymePaymentStatus);

/**
 * @swagger
 * /api/payment/payme/callback:
 *   post:
 *     summary: PayMe webhook callback (Legacy Support - Deprecated)
 *     tags: [Payments]
 *     deprecated: true
 *     description: Legacy callback endpoint. Use /payme/webhook instead.
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

/**
 * @swagger
 * /api/payment/payme/deposit:
 *   post:
 *     summary: Create PayMe deposit for wallet funding
 *     tags: [Payments]
 *     description: |
 *       Creates a new PayMe payment for depositing funds into the user's wallet.
 *       This follows the same flow as regular payments but is specifically for wallet deposits.
 *
 *       **Test Credentials (Sandbox):**
 *       - Phone: 11111111
 *       - Password: 11111111
 *
 *       **Features:**
 *       - Mobile wallet payments
 *       - Bank transfers
 *       - Local payment methods
 *       - QR code payments
 *       - Webhook notifications
 *
 *       **Processing:** 1-3 minutes
 *       **Fees:** 1.5% + 0.5 TND
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - walletAddress
 *               - email
 *               - phone
 *               - first_name
 *               - last_name
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 example: 100.50
 *                 description: "Amount in Tunisian Dinar (TND) to deposit"
 *               note:
 *                 type: string
 *                 example: "Wallet deposit"
 *                 description: "Deposit description"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *                 description: "User's wallet address for tracking"
 *               first_name:
 *                 type: string
 *                 example: "Ahmed"
 *                 description: "Customer's first name"
 *               last_name:
 *                 type: string
 *                 example: "Ben Ali"
 *                 description: "Customer's last name"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@example.com"
 *                 description: "Customer's email address"
 *               phone:
 *                 type: string
 *                 example: "11222333"
 *                 description: "Phone number (will be formatted to +216 for Tunisia)"
 *     responses:
 *       200:
 *         description: PayMe deposit created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 payment_method:
 *                   type: string
 *                   example: "payme"
 *                 token:
 *                   type: string
 *                   example: "dfe54df34b54df3a854f3a53fc85a"
 *                   description: "PayMe payment token"
 *                 order_id:
 *                   type: string
 *                   example: "deposit_1640995200000_abc123"
 *                   description: "Unique order identifier"
 *                 payment_url:
 *                   type: string
 *                   example: "https://sandbox.paymee.tn/payment/dfe54df34b54df3a854f3a53fc85a"
 *                   description: "URL to redirect user for payment"
 *                 amount:
 *                   type: number
 *                   example: 100.50
 *                   description: "Deposit amount in TND"
 *                 currency:
 *                   type: string
 *                   example: "TND"
 *                   description: "Tunisian Dinar"
 *       400:
 *         description: Missing required fields or validation error
 *       500:
 *         description: PayMe API error or server error
 */
router.post("/payme/deposit", controller.createPaymeDeposit);

/**
 * @swagger
 * /api/payment/payme/withdrawal:
 *   post:
 *     summary: Create PayMe withdrawal from wallet
 *     tags: [Payments]
 *     description: |
 *       Creates a PayMe withdrawal request to transfer funds from the user's wallet
 *       to their bank account or mobile wallet.
 *
 *       **Features:**
 *       - Bank account transfers
 *       - Mobile wallet transfers
 *       - Real-time processing
 *
 *       **Processing:** 1-3 minutes
 *       **Fees:** 1.5% + 0.5 TND
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - walletAddress
 *               - email
 *               - phone
 *               - first_name
 *               - last_name
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 1
 *                 example: 50.00
 *                 description: "Amount in TND to withdraw"
 *               note:
 *                 type: string
 *                 example: "Wallet withdrawal"
 *                 description: "Withdrawal description"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *                 description: "User's wallet address"
 *               first_name:
 *                 type: string
 *                 example: "Ahmed"
 *                 description: "Customer's first name"
 *               last_name:
 *                 type: string
 *                 example: "Ben Ali"
 *                 description: "Customer's last name"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ahmed@example.com"
 *                 description: "Customer's email address"
 *               phone:
 *                 type: string
 *                 example: "11222333"
 *                 description: "Phone number"
 *               bank_account:
 *                 type: object
 *                 properties:
 *                   account_number:
 *                     type: string
 *                     example: "1234567890"
 *                   bank_name:
 *                     type: string
 *                     example: "Banque Centrale de Tunisie"
 *                   account_holder:
 *                     type: string
 *                     example: "Ahmed Ben Ali"
 *     responses:
 *       200:
 *         description: PayMe withdrawal created successfully
 *       400:
 *         description: Insufficient funds or validation error
 *       500:
 *         description: Server error
 */
router.post("/payme/withdrawal", controller.createPaymeWithdrawal);

/**
 * @swagger
 * /api/payment/payme/refund:
 *   post:
 *     summary: Create PayMe refund
 *     tags: [Payments]
 *     description: |
 *       Creates a refund request for a PayMe payment.
 *       Supports both full and partial refunds.
 *
 *       **Processing:** 1-3 minutes
 *       **Fees:** No additional fees for refunds
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - original_payment_token
 *               - walletAddress
 *             properties:
 *               original_payment_token:
 *                 type: string
 *                 example: "dfe54df34b54df3a854f3a53fc85a"
 *                 description: "Token of the original payment to refund"
 *               amount:
 *                 type: number
 *                 example: 25.00
 *                 description: "Amount to refund (if not provided, full refund)"
 *               reason:
 *                 type: string
 *                 example: "Customer request"
 *                 description: "Reason for refund"
 *               walletAddress:
 *                 type: string
 *                 example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *                 description: "User's wallet address"
 *     responses:
 *       200:
 *         description: PayMe refund created successfully
 *       400:
 *         description: Invalid payment token or validation error
 *       500:
 *         description: Server error
 */
router.post("/payme/refund", controller.createPaymeRefund);

/**
 * @swagger
 * /api/payment/payme/webhook/deposit:
 *   post:
 *     summary: PayMe webhook for deposit notifications
 *     tags: [Payments]
 *     description: |
 *       Webhook endpoint for PayMe to send deposit payment status updates.
 *       This endpoint processes successful deposit notifications and updates wallet balances.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "dfe54df34b54df3a854f3a53fc85a"
 *               payment_status:
 *                 type: boolean
 *                 example: true
 *               order_id:
 *                 type: string
 *                 example: "deposit_1640995200000_abc123"
 *               amount:
 *                 type: number
 *                 example: 100.50
 *               transaction_id:
 *                 type: number
 *                 example: 5578
 *               received_amount:
 *                 type: number
 *                 example: 98.50
 *               cost:
 *                 type: number
 *                 example: 2.00
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 */
router.post("/payme/webhook/deposit", controller.handlePaymeDepositWebhook);

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
