const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/authenticate");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { User, sequelize } = require("../models");
const { Op } = require("sequelize");
const { sendSMS } = require("../config/twilio-http.config");
const { sendEmail, sendVerificationEmail } = require("../config/email.config");

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination, filtering and sorting
 *     tags: [User]
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
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unverified, pending, approved, rejected]
 *         description: Filter by approval status
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by role name
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, surname, or email
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of all users with pagination.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 25
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/", userController.getAllUsers);

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data.
 */
router.get("/profile", authenticate, userController.getProfile);

/**
 * @swagger
 * /api/user/upload-profile-picture:
 *   post:
 *     summary: Upload profile picture
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated.
 */
router.post(
  "/upload-profile-picture",
  authenticate,
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);

// Request field change (phone or email)
router.post("/request-:field-change", async (req, res) => {
  const field = req.params.field; // 'phone' or 'email'
  console.log(`📱 ${field} Change Request Started`);
  console.log("Request body:", req.body);

  try {
    const { userId } = req.body;
    const newValue =
      req.body[`new${field.charAt(0).toUpperCase() + field.slice(1)}`];

    // 1. Validate
    if (!userId || !newValue) {
      return res.status(400).json({ error: `Missing userId or new${field}` });
    }

    // Get user's current data
    console.log("🔍 Looking up user with ID:", userId);
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("❌ User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("👤 Found user:", {
      id: user.id,
      currentValue: user[field],
      newValue: newValue,
    });

    // 2. Throttle (5 times per month) - Use camelCase property names
    const lastChangeField =
      field === "phone" ? "lastPhoneChange" : "lastEmailChange";

    // Count changes in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const changeCount = await User.count({
      where: {
        id: userId,
        [lastChangeField]: { [Op.gt]: thirtyDaysAgo },
      },
    });

    if (changeCount >= 5) {
      console.log(
        `❌ ${field} change not allowed - reached monthly limit of 5 changes`
      );
      return res.status(400).json({
        error: `You can only change your ${field} 5 times per month. You've reached this limit.`,
      });
    }

    // 3. Generate & persist code
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("🔐 Generated verification code:", verificationCode);
    console.log("⏰ Code expires at:", expires);

    // Update user record with verification data - Use camelCase property names
    const updateData = {
      verificationCodeExpires: expires,
    };

    if (field === "phone") {
      updateData.pendingPhone = newValue;
      updateData.phoneVerificationCode = verificationCode;
    } else {
      updateData.pendingEmail = newValue;
      updateData.emailVerificationCode = verificationCode;
    }

    await user.update(updateData);

    // 4. Send verification code
    try {
      if (field === "phone") {
        console.log("📤 Sending SMS to:", user.phone);
        const message = `Your Korpor verification code for ${field} change is: ${verificationCode}. This code will expire in 10 minutes.`;
        await sendSMS(user.phone, message);
      } else {
        console.log("📧 Sending verification email to:", user.email);
        await sendVerificationEmail(
          user.email,
          verificationCode,
          user.name || "User",
          field
        );
      }
      console.log(
        `✅ ${field === "phone" ? "SMS" : "Email"} sent successfully`
      );
    } catch (error) {
      console.error(
        `❌ Failed to send ${field === "phone" ? "SMS" : "email"}:`,
        error
      );
      return res.status(500).json({
        error: `Failed to send verification ${
          field === "phone" ? "SMS" : "email"
        }`,
      });
    }

    console.log(`✅ ${field} change request completed successfully`);
    res.json({
      message: `Verification code sent to your current ${field}`,
      // Include code in development only
      code:
        process.env.NODE_ENV === "development" ? verificationCode : undefined,
    });
  } catch (error) {
    console.error(`❌ Error in ${field} change request:`, error);
    res.status(500).json({ error: `Failed to request ${field} change` });
  }
});

// Verify and update field
router.post("/verify-:field", async (req, res) => {
  const field = req.params.field; // 'phone' or 'email'
  console.log(`🔐 ${field} Verification Started`);
  console.log("Request body:", req.body);

  try {
    const { userId, verificationCode } = req.body;

    // 1. Validate
    if (!userId || !verificationCode) {
      return res
        .status(400)
        .json({ error: "Missing userId or verificationCode" });
    }

    // 2. Look up the user with matching code + not-expired - Use camelCase property names
    const now = new Date();
    console.log("🔍 Checking verification code:", {
      userId,
      verificationCode,
      currentTime: now,
      field,
    });

    const whereCondition = {
      id: userId,
      verificationCodeExpires: { [Op.gt]: now },
    };

    // Add the correct verification code field based on field type
    if (field === "phone") {
      whereCondition.phoneVerificationCode = verificationCode;
    } else {
      whereCondition.emailVerificationCode = verificationCode;
    }

    const user = await User.findOne({
      where: whereCondition,
    });

    if (!user) {
      console.log("❌ Invalid or expired verification code");
      return res
        .status(400)
        .json({ error: "Invalid or expired verification code" });
    }

    // 3. All good - apply the pending value - Use camelCase property names
    const pendingField = field === "phone" ? "pendingPhone" : "pendingEmail";
    const lastChangeField =
      field === "phone" ? "lastPhoneChange" : "lastEmailChange";
    const verificationCodeField =
      field === "phone" ? "phoneVerificationCode" : "emailVerificationCode";

    const newValue = user[pendingField];
    console.log(`✅ Verification code is valid`);
    console.log(`📱 Updating ${field} to:`, newValue);

    const updateData = {
      [field]: newValue,
      [pendingField]: null,
      [verificationCodeField]: null,
      verificationCodeExpires: null,
      [lastChangeField]: now,
    };

    await user.update(updateData);

    console.log(`✅ ${field} updated successfully`);
    res.json({
      message: `${field} updated successfully`,
      newValue: newValue,
    });
  } catch (error) {
    console.error(`❌ Error in ${field} verification:`, error);
    res.status(500).json({ error: `Failed to verify ${field}` });
  }
});

module.exports = router;
