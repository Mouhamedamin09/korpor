const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     UserInvestmentData:
 *       type: object
 *       properties:
 *         currency:
 *           type: string
 *           enum: [TND, EUR]
 *         totalInvested:
 *           type: number
 *         monthlyContribution:
 *           type: number
 *         averageYield:
 *           type: number
 *         projectedReturns:
 *           type: object
 *           properties:
 *             year1:
 *               type: number
 *             year5:
 *               type: number
 *             year10:
 *               type: number
 *             year15:
 *               type: number
 *
 * tags:
 *   name: Investments
 *   description: Investment data and projections
 */

/**
 * @swagger
 * /api/investments/user-data:
 *   get:
 *     summary: Get user's investment data
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User investment data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserInvestmentData'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/user-data', authenticate, investmentController.getUserInvestmentData);

/**
 * @swagger
 * /api/investments/projection:
 *   post:
 *     summary: Calculate investment projection
 *     tags: [Investments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - monthlyDeposit
 *               - years
 *               - yieldPct
 *             properties:
 *               monthlyDeposit:
 *                 type: number
 *               years:
 *                 type: integer
 *               yieldPct:
 *                 type: number
 *     responses:
 *       200:
 *         description: Investment projection calculated successfully
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
 *                     years:
 *                       type: integer
 *                     monthlyDeposit:
 *                       type: number
 *                     yieldPct:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     projections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           year:
 *                             type: integer
 *                           totalValue:
 *                             type: number
 *                           monthlyIncome:
 *                             type: number
 *                           totalDeposited:
 *                             type: number
 *                           totalReturns:
 *                             type: number
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/projection', authenticate, investmentController.calculateProjection);

module.exports = router; 