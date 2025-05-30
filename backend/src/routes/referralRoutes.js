const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferralInfo:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           description: User's unique identifier
 *         currency:
 *           type: string
 *           enum: [TND, EUR]
 *           description: User's preferred currency
 *         code:
 *           type: string
 *           description: User's unique referral code
 *         referralAmount:
 *           type: number
 *           description: Referral bonus amount
 *         minInvestment:
 *           type: number
 *           description: Minimum investment required for referral qualification
 *         stats:
 *           type: object
 *           properties:
 *             totalReferred:
 *               type: integer
 *               description: Total number of users referred
 *             totalInvested:
 *               type: integer
 *               description: Total number of referred users who invested
 *
 * tags:
 *   name: Referrals
 *   description: Referral system and currency management
 */

/**
 * @swagger
 * /api/referrals/info:
 *   get:
 *     summary: Get user's referral information
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ReferralInfo'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/info', authenticate, referralController.getReferralInfo);

/**
 * @swagger
 * /api/referrals/get-code:
 *   get:
 *     summary: Get user's permanent referral code
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permanent referral code retrieved successfully
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
 *                     referralCode:
 *                       type: string
 *                     shareLink:
 *                       type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/get-code', authenticate, referralController.getReferralCode);

/**
 * @swagger
 * /api/referrals/switch-currency:
 *   post:
 *     summary: Switch user's currency preference
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currency
 *             properties:
 *               currency:
 *                 type: string
 *                 enum: [TND, EUR]
 *                 description: New currency preference
 *     responses:
 *       200:
 *         description: Currency switched successfully
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
 *                     currency:
 *                       type: string
 *                     referralAmount:
 *                       type: number
 *                     minInvestment:
 *                       type: number
 *       400:
 *         description: Invalid currency
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/switch-currency', authenticate, referralController.switchCurrency);

/**
 * @swagger
 * /api/referrals/currency:
 *   get:
 *     summary: Get user's currency preference
 *     tags: [Referrals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Currency preference retrieved successfully
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
 *                     currency:
 *                       type: string
 *                       enum: [TND, EUR]
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/currency', authenticate, referralController.getUserCurrency);

/**
 * @swagger
 * /api/referrals/process-signup:
 *   post:
 *     summary: Process referral signup (for internal use during registration)
 *     tags: [Referrals]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - referralCode
 *               - newUserId
 *             properties:
 *               referralCode:
 *                 type: string
 *                 description: Referral code from the referrer
 *               newUserId:
 *                 type: integer
 *                 description: ID of the newly registered user
 *     responses:
 *       200:
 *         description: Referral processed successfully
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
 *                     referralId:
 *                       type: integer
 *                     reward:
 *                       type: number
 *                     currency:
 *                       type: string
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Invalid referral code
 *       409:
 *         description: Referral already exists
 *       500:
 *         description: Server error
 */
router.post('/process-signup', referralController.processReferralSignup);

module.exports = router; 