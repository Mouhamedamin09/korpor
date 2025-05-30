const express = require('express');
const router = express.Router();
const multer = require('multer');
const verificationController = require('../controllers/verificationController');
const { authenticate } = require('../middleware/authenticate');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

/**
 * @swagger
 * /api/verification/identity:
 *   post:
 *     summary: Upload identity documents (passport + selfie)
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               passportImage:
 *                 type: string
 *                 format: binary
 *               selfieImage:
 *                 type: string
 *                 format: binary
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Identity documents uploaded successfully
 *       400:
 *         description: Missing required files or user ID
 *       500:
 *         description: Upload failed
 */
router.post('/identity', 
  authenticate, 
  upload.fields([
    { name: 'passportImage', maxCount: 1 },
    { name: 'selfieImage', maxCount: 1 }
  ]), 
  verificationController.uploadIdentityDocuments
);

/**
 * @swagger
 * /api/verification/address:
 *   post:
 *     summary: Upload address verification document
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               addressImage:
 *                 type: string
 *                 format: binary
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Address document uploaded successfully
 *       400:
 *         description: Missing required file or user ID
 *       500:
 *         description: Upload failed
 */
router.post('/address', 
  authenticate, 
  upload.fields([{ name: 'addressImage', maxCount: 1 }]), 
  verificationController.uploadAddressDocument
);

/**
 * @swagger
 * /api/verification/status/{userId}:
 *   get:
 *     summary: Get verification status for user
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Verification status retrieved successfully
 *       400:
 *         description: User ID required
 *       500:
 *         description: Failed to get status
 */
router.get('/status/:userId', 
  authenticate, 
  verificationController.getVerificationStatus
);

/**
 * @swagger
 * /api/verification/status:
 *   get:
 *     summary: Get verification status for authenticated user
 *     tags: [Verification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification status retrieved successfully
 *       400:
 *         description: User ID required
 *       500:
 *         description: Failed to get status
 */
router.get('/status', 
  authenticate, 
  verificationController.getVerificationStatus
);

/**
 * @swagger
 * /api/verification/update-status:
 *   post:
 *     summary: Update verification status (backoffice webhook)
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verificationId:
 *                 type: integer
 *               type:
 *                 type: string
 *                 enum: [identity, address]
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       400:
 *         description: Missing required parameters
 *       404:
 *         description: Verification not found
 *       500:
 *         description: Update failed
 */
router.post('/update-status', 
  verificationController.updateVerificationStatus
);

module.exports = router; 