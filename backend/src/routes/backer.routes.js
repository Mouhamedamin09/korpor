const express = require("express");
const router = express.Router();
const controller = require("../controllers/backer.controller");
const { authenticate } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Backers
 *   description: Backer management
 */

/**
 * @swagger
 * /api/backers:
 *   get:
 *     summary: Get all backers
 *     tags: [Backers]
 *     responses:
 *       200:
 *         description: List of all backers
 *       500:
 *         description: Server error
 */
router.get("/", controller.getAllBackers);

/**
 * @swagger
 * /api/backers:
 *   post:
 *     summary: Add a new backer
 *     tags: [Backers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image_url
 *             properties:
 *               name:
 *                 type: string
 *               image_url:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Backer created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", authenticate, controller.addBacker);

/**
 * @swagger
 * /api/backers/{id}:
 *   put:
 *     summary: Update a backer
 *     tags: [Backers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               image_url:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Backer updated successfully
 *       404:
 *         description: Backer not found
 *       500:
 *         description: Server error
 */
router.put("/:id", authenticate, controller.updateBacker);

/**
 * @swagger
 * /api/backers/{id}:
 *   delete:
 *     summary: Delete a backer
 *     tags: [Backers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Backer deleted successfully
 *       404:
 *         description: Backer not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", authenticate, controller.deleteBacker);

module.exports = router; 