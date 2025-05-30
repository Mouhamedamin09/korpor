const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserPreferences:
 *       type: object
 *       properties:
 *         preference:
 *           type: string
 *           enum: [all, local]
 *           description: Investment preference type
 *         region:
 *           type: string
 *           enum: [Tunisia, France]
 *           description: User's investment region
 *
 * tags:
 *   name: Preferences
 *   description: User investment preferences management
 */

/**
 * @swagger
 * /api/preferences:
 *   get:
 *     summary: Get user's investment preferences
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User preferences retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: User preferences retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/UserPreferences'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, preferencesController.getUserPreferences);

/**
 * @swagger
 * /api/preferences/preference:
 *   put:
 *     summary: Update user's investment preference
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preference
 *             properties:
 *               preference:
 *                 type: string
 *                 enum: [all, local]
 *                 description: Investment preference type
 *     responses:
 *       200:
 *         description: Investment preference updated successfully
 *       400:
 *         description: Invalid preference value
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/preference', authenticate, preferencesController.setUserPreference);

/**
 * @swagger
 * /api/preferences/region:
 *   put:
 *     summary: Update user's investment region
 *     tags: [Preferences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - region
 *             properties:
 *               region:
 *                 type: string
 *                 enum: [Tunisia, France]
 *                 description: User's investment region
 *     responses:
 *       200:
 *         description: Investment region updated successfully
 *       400:
 *         description: Invalid region value
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/region', authenticate, preferencesController.setUserRegion);

module.exports = router; 