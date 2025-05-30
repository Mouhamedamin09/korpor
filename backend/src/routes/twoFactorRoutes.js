const express = require('express');
const router = express.Router();
const twoFactorController = require('../controllers/twoFactorController');
const { authenticate } = require('../middleware/authenticate');

/**
 * @swagger
 * components:
 *   schemas:
 *     TwoFactorSetup:
 *       type: object
 *       properties:
 *         secret:
 *           type: string
 *           description: Base32 encoded secret for manual entry
 *         otpauthUrl:
 *           type: string
 *           description: Otpauth URL for QR code generation
 *         qrCode:
 *           type: string
 *           description: Base64 encoded QR code image
 *         manualEntryKey:
 *           type: string
 *           description: Manual entry key for authenticator apps
 *     TwoFactorStatus:
 *       type: object
 *       properties:
 *         enabled:
 *           type: boolean
 *           description: Whether 2FA is enabled
 *         setupAt:
 *           type: string
 *           format: date-time
 *           description: When 2FA was first enabled
 *         backupCodesRemaining:
 *           type: integer
 *           description: Number of unused backup codes
 *
 * tags:
 *   name: Two-Factor Authentication
 *   description: 2FA management endpoints
 */

/**
 * @swagger
 * /api/2fa/setup:
 *   post:
 *     summary: Setup 2FA for user account
 *     description: Generate TOTP secret and QR code for 2FA setup
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA setup data generated successfully
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
 *                   $ref: '#/components/schemas/TwoFactorSetup'
 *       400:
 *         description: 2FA already enabled or invalid request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/setup', authenticate, twoFactorController.setup2FA);

/**
 * @swagger
 * /api/2fa/verify:
 *   post:
 *     summary: Verify and enable 2FA
 *     description: Verify TOTP token and enable 2FA for the user
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 example: "123456"
 *                 description: 6-digit TOTP code from authenticator app
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
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
 *                     message:
 *                       type: string
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Backup codes for account recovery
 *       400:
 *         description: Invalid token or validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify', authenticate, twoFactorController.verify2FA);

/**
 * @swagger
 * /api/2fa/disable:
 *   post:
 *     summary: Disable 2FA
 *     description: Disable 2FA for the user account (requires password and optionally 2FA token)
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User's current password
 *               token:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit TOTP code (optional)
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid request or validation error
 *       401:
 *         description: Invalid password or unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/disable', authenticate, twoFactorController.disable2FA);

/**
 * @swagger
 * /api/2fa/verify-login:
 *   post:
 *     summary: Verify 2FA during login
 *     description: Verify TOTP token or backup code during the login process
 *     tags: [Two-Factor Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID from initial login
 *               token:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit TOTP code
 *               backupCode:
 *                 type: string
 *                 description: Backup recovery code
 *     responses:
 *       200:
 *         description: 2FA verification successful
 *       400:
 *         description: Invalid token/backup code or validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/verify-login', twoFactorController.verifyLogin2FA);

/**
 * @swagger
 * /api/2fa/status:
 *   get:
 *     summary: Get 2FA status
 *     description: Get current 2FA status for the authenticated user
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 2FA status retrieved successfully
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
 *                   $ref: '#/components/schemas/TwoFactorStatus'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/status', authenticate, twoFactorController.get2FAStatus);

/**
 * @swagger
 * /api/2fa/regenerate-backup-codes:
 *   post:
 *     summary: Regenerate backup codes
 *     description: Generate new backup codes for 2FA recovery (requires password)
 *     tags: [Two-Factor Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *                 description: User's current password
 *     responses:
 *       200:
 *         description: Backup codes regenerated successfully
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
 *                     backupCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Invalid request or 2FA not enabled
 *       401:
 *         description: Invalid password or unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post('/regenerate-backup-codes', authenticate, twoFactorController.regenerateBackupCodes);

module.exports = router; 