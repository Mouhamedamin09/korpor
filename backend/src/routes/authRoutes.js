const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const {
  authLimiter,
  handleFailedLogin,
} = require("../middleware/loginLimiter");

// Apply rate limiting to all authentication routes
router.use(authLimiter);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - surname
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID (auto-generated)
 *         accountNo:
 *           type: integer
 *           description: The auto-generated account number
 *         name:
 *           type: string
 *           description: User's first name
 *         surname:
 *           type: string
 *           description: User's last name
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *         password:
 *           type: string
 *           format: password
 *           description: User's password (will be hashed)
 *         birthdate:
 *           type: string
 *           format: date
 *           description: User's date of birth
 *         profilePicture:
 *           type: string
 *           description: URL to the user's profile picture
 *         isVerified:
 *           type: boolean
 *           description: Whether the email is verified
 *         approvalStatus:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: Admin approval status
 *         roleId:
 *           type: integer
 *           description: Foreign key to user's role
 *         refreshToken:
 *           type: string
 *           description: JWT refresh token for extending sessions
 *         refreshTokenExpires:
 *           type: string
 *           format: date-time
 *           description: Expiration date for refresh token
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Timestamp of last successful login
 *         failedLoginAttempts:
 *           type: integer
 *           description: Count of consecutive failed login attempts
 *         lockedUntil:
 *           type: string
 *           format: date-time
 *           description: Account lockout expiration timestamp
 *       example:
 *         id: 1234
 *         accountNo: 87654321
 *         name: John
 *         surname: Doe
 *         email: john.doe@example.com
 *         password: SecurePassword123!
 *         birthdate: 1990-01-01
 *         isVerified: true
 *         approvalStatus: approved
 *         roleId: 2
 *         lastLogin: 2023-06-15T09:30:00.000Z
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Sign in successful
 *         accessToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         refreshToken:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 12345
 *             accountNo:
 *               type: integer
 *               example: 87654321
 *             name:
 *               type: string
 *               example: John
 *             surname:
 *               type: string
 *               example: Doe
 *             email:
 *               type: string
 *               example: john.doe@example.com
 *             profilePicture:
 *               type: string
 *               example: https://example.com/avatar.jpg
 *             lastLogin:
 *               type: string
 *               format: date-time
 *               example: 2023-06-15T09:30:00.000Z
 *         role:
 *           type: string
 *           example: agent
 *           description: User role (superadmin, admin, agent, user)
 *         privileges:
 *           type: array
 *           items:
 *             type: string
 *           example: ["read:users", "write:projects"]
 *         deviceInfo:
 *           type: object
 *           properties:
 *             deviceId:
 *               type: string
 *               example: TW96aWxsYS8
 *             browser:
 *               type: string
 *               example: Mozilla/5.0
 *             os:
 *               type: string
 *               example: Windows NT 10.0
 *             location:
 *               type: string
 *               example: 192.168.1.1
 *         dashboardRoute:
 *           type: string
 *           example: /agent/dashboard
 *           description: Role-specific dashboard route
 *
 *     SignUpResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Registration successful - waiting for admin approval
 *         status:
 *           type: string
 *           enum: [pending]
 *           example: pending
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 12345
 *             accountNo:
 *               type: integer
 *               example: 87654321
 *             email:
 *               type: string
 *               example: john.doe@example.com
 *             approval_status:
 *               type: string
 *               enum: [pending]
 *               example: pending
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter JWT token in the format 'Bearer {token}'
 *
 * tags:
 *   - name: Authentication
 *     description: User authentication operations
 */

/**
 * @swagger
 * /api/auth/sign-up:
 *   post:
 *     summary: Register new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - surname
 *               - email
 *               - password
 *               - birthdate
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *               phone:
 *                 type: string
 *                 description: Phone number (optional)
 *               referralCode:
 *                 type: string
 *                 description: Referral code from another user (optional)
 *     responses:
 *       201:
 *         description: Registration successful - Waiting for admin approval
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SignUpResponse'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Server error
 */
router.post("/sign-up", authController.signUp);

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify email address
 *     description: Verify a user's email address using the verification code sent during registration. This must be completed before the user can sign in.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               code:
 *                 type: string
 *                 example: 1234
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email verified successfully. Your account is now active!
 *       400:
 *         description: Invalid or expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid verification code
 *       500:
 *         description: Server error
 */
router.post("/verify-email", authController.verifyEmail);

/**
 * @swagger
 * /api/auth/send-phone-verification:
 *   post:
 *     summary: Send phone verification code
 *     tags: [Authentication]
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
 *                 description: User ID to send verification code to
 *     responses:
 *       200:
 *         description: Verification code sent successfully
 *       400:
 *         description: Bad request or email not verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/send-phone-verification", authController.sendPhoneVerification);

/**
 * @swagger
 * /api/auth/verify-phone:
 *   post:
 *     summary: Verify phone number with OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - verificationCode
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: User ID
 *               verificationCode:
 *                 type: string
 *                 description: 6-digit verification code
 *     responses:
 *       200:
 *         description: Phone verified successfully
 *       400:
 *         description: Invalid code or email not verified
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/verify-phone", authController.verifyPhone);

/**
 * @swagger
 * /api/auth/sign-in:
 *   post:
 *     summary: Sign in user
 *     description: Authenticate a user and return tokens along with role-based dashboard route
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123!
 *               rememberMe:
 *                 type: boolean
 *                 description: Extend token validity period
 *                 example: true
 *     responses:
 *       200:
 *         description: Sign in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Sign in successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 12345
 *                     accountNo:
 *                       type: integer
 *                       example: 87654321
 *                     name:
 *                       type: string
 *                       example: John
 *                     surname:
 *                       type: string
 *                       example: Doe
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     profilePicture:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *                       example: 2023-06-15T09:30:00.000Z
 *                 role:
 *                   type: string
 *                   example: agent
 *                   description: User role (superadmin, admin, agent, user)
 *                 privileges:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["read:users", "write:projects"]
 *                 deviceInfo:
 *                   type: object
 *                   properties:
 *                     deviceId:
 *                       type: string
 *                       example: TW96aWxsYS8
 *                     browser:
 *                       type: string
 *                       example: Mozilla/5.0
 *                     os:
 *                       type: string
 *                       example: Windows NT 10.0
 *                     location:
 *                       type: string
 *                       example: 192.168.1.1
 *                 dashboardRoute:
 *                   type: string
 *                   example: /agent/dashboard
 *                   description: Role-specific dashboard route
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email and password are required
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
 *                 remainingAttempts:
 *                   type: integer
 *                   example: 4
 *                   description: Number of attempts remaining before account lockout
 *       403:
 *         description: Account not verified or pending approval or rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Email not verified. Please verify your email before signing in.
 *       423:
 *         description: Account temporarily locked due to too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Account is temporarily locked due to too many failed attempts
 *                 lockoutDuration:
 *                   type: integer
 *                   example: 600000
 *                   description: Lockout duration in milliseconds
 *                 unlockTime:
 *                   type: string
 *                   format: date-time
 *                   example: 2023-06-15T10:30:00.000Z
 *                 waitTime:
 *                   type: string
 *                   example: 10 minute(s)
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred during sign in
 *                 error:
 *                   type: string
 */
router.post("/sign-in", handleFailedLogin, authController.signIn);

/**
 * @swagger
 * /api/auth/complete-2fa-login:
 *   post:
 *     summary: Complete Two-Factor Authentication Login
 *     description: Complete the login process by verifying the 2FA token after successful password authentication.
 *     tags: [Authentication]
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
 *                 description: User ID from the initial sign-in response
 *                 example: 12345
 *               token:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit TOTP code from authenticator app
 *                 example: "123456"
 *               backupCode:
 *                 type: string
 *                 description: Backup recovery code (alternative to token)
 *                 example: "ABC123-DEF456"
 *     responses:
 *       200:
 *         description: 2FA verification successful, login completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid request or verification failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid 2FA code or backup code
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/complete-2fa-login", authController.complete2FALogin);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Get a new access token using a valid refresh token. This extends the user's session without requiring them to sign in again.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Token refreshed successfully
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Refresh token is required
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired refresh token
 *       500:
 *         description: Server error
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user
 *     description: Invalidate the user's access token and remove their refresh token from the database.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       400:
 *         description: No token provided
 *       401:
 *         description: Invalid token
 *       500:
 *         description: Server error
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/auth/validate-token:
 *   get:
 *     summary: Validate access token
 *     description: Check if the provided JWT access token is valid and return the associated user information. This is used for authentication persistence and session validation.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                       example: 12345
 *                     email:
 *                       type: string
 *                       example: john.doe@example.com
 *                     role:
 *                       type: string
 *                       example: agent
 *                     accountNo:
 *                       type: integer
 *                       example: 87654321
 *                     name:
 *                       type: string
 *                       example: John
 *                     surname:
 *                       type: string
 *                       example: Doe
 *                     profilePicture:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                     privileges:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["read:users", "write:projects"]
 *                     dashboardRoute:
 *                       type: string
 *                       example: /agent/dashboard
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access denied. Invalid or expired token.
 *                 type:
 *                   type: string
 *                   example: INVALID_TOKEN
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while validating token
 */
router.get("/validate-token", authenticate, authController.validateToken);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Send a password reset code to the user's email to initiate the password recovery process.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Reset code sent (for security, this response is the same whether the email exists or not)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If your email exists in our system, you will receive a password reset code.
 *       400:
 *         description: Email is required
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Set a new password using the verification code sent to the user's email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *               - newPassword
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               code:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: NewSecurePassword456!
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid or expired verification code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired verification code
 *       500:
 *         description: Server error
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Resend verification code
 *     description: Request a new verification code for an unverified account. This is useful if the original code expired or was lost.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Verification code resent (for security, this response is the same whether the email exists or not)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If your email is registered, a new verification code has been sent.
 *       400:
 *         description: Account already verified or email is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: This account is already verified. Please sign in instead.
 *       500:
 *         description: Server error
 */
router.post("/resend-verification", authController.resendVerificationCode);

// Add the route for approving/rejecting users (superadmin only)
/**
 * @swagger
 * /api/auth/approve-user:
 *   post:
 *     summary: Approve or reject a user account
 *     description: Superadmin only endpoint to approve or reject user registrations
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - approvalStatus
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to approve/reject
 *               approvalStatus:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: New approval status
 *               roleId:
 *                 type: integer
 *                 description: Optional - Role ID to assign to the user
 *     responses:
 *       200:
 *         description: User approval status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     approval_status:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized (not a superadmin)
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  "/approve-user",
  authenticate,
  (req, res, next) => {
    // Check if the authenticated user is a superadmin
    if (req.user.role !== "superadmin") {
      return res.status(403).json({
        message: "Access denied. Only superadmins can approve users.",
      });
    }
    next();
  },
  authController.approveUser
);

/**
 * @swagger
 * /api/auth/clerk-auth:
 *   post:
 *     summary: Handle Clerk authentication
 *     description: Process authentication from Clerk.dev and create/update user in the database. This is the primary authentication method for the application. Clerk handles the initial auth flow, and this endpoint integrates Clerk users with the application's user system.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - userId
 *               - emailAddress
 *             properties:
 *               token:
 *                 type: string
 *                 description: Clerk session token
 *                 example: "sess_verylongclerksessiontoken"
 *               userId:
 *                 type: string
 *                 description: Clerk user ID
 *                 example: "user_2KHd829jskdS72Hs"
 *               emailAddress:
 *                 type: string
 *                 format: email
 *                 description: User's email address verified by Clerk
 *                 example: "john.doe@example.com"
 *               firstName:
 *                 type: string
 *                 description: User's first name from Clerk
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 description: User's last name from Clerk
 *                 example: "Doe"
 *               imageUrl:
 *                 type: string
 *                 description: URL to user's profile picture from Clerk
 *                 example: "https://img.clerk.com/avatars/user_2KHd829jskdS72Hs.jpg"
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     isNewUser:
 *                       type: boolean
 *                       description: Indicates if this is the user's first login
 *                       example: false
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Missing required fields: token, userId, and emailAddress are required"
 *       403:
 *         description: Account pending approval or disabled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Your account is pending approval by an administrator"
 *                 type:
 *                   type: string
 *                   example: "ACCOUNT_DISABLED"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "An error occurred during authentication"
 *                 error:
 *                   type: string
 */
router.post("/clerk-auth", authController.handleClerkAuth);

// Close account
router.delete("/close-account", authenticate, authController.closeAccount);

// Add the following route before the module.exports line
// Development-only route to reset rate limits
if (process.env.NODE_ENV !== "production") {
  router.get("/reset-rate-limit", (req, res) => {
    const { resetRateLimit } = require("../middleware/loginLimiter");
    resetRateLimit(req, res);
  });
}

module.exports = router;
