const express = require("express");
const router = express.Router();
const userManagementController = require("../controllers/userManagementController");
const { authenticate } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorize");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, pending, inactive, unverified]
 *         role:
 *           type: string
 *           enum: [superadmin, admin, agent, user, cashier, manager]
 *         walletAddress:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// All routes require authentication
// Temporarily commented out for testing
router.use(authenticate);

// Routes for super-admin and admin only
router.use(authorizeRoles(["superadmin", "admin"]));

/**
 * @swagger
 * /api/admin/user-management/users/pending:
 *   get:
 *     summary: Get users pending approval (includes unverified)
 *     description: Retrieves all users with 'pending' or 'unverified' approval status.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending/unverified users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/users/pending", userManagementController.getPendingUsers);

/**
 * @swagger
 * /api/admin/user-management/users/{userId}/role:
 *   put:
 *     summary: Change user role
 *     description: Update a user's role by providing roleId.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleId
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: The ID of the role to assign.
 *     responses:
 *       200:
 *         description: User role updated successfully.
 */
router.put("/users/:userId/role", userManagementController.changeUserRole);

/**
 * @swagger
 * /api/admin/user-management/users/{userId}/approve-pending:
 *   put:
 *     summary: Approve a pending user registration
 *     description: Sets a user's status to 'approved', assigns a role, and marks as verified.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to approve.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *             properties:
 *               roleName:
 *                 type: string
 *                 description: The name of the role to assign (e.g., 'user', 'admin').
 *                 example: "user"
 *     responses:
 *       200:
 *         description: User approved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User' # Assuming User schema is defined
 *       400:
 *         description: Bad request (e.g., user not pending, roleName missing).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (insufficient privileges).
 *       404:
 *         description: User or Role not found.
 *       500:
 *         description: Server error.
 */
router.put(
  "/users/:userId/approve-pending",
  userManagementController.approvePendingUser,
);

/**
 * @swagger
 * /api/admin/user-management/users/{userId}/reject-pending:
 *   put:
 *     summary: Reject a pending user registration
 *     description: Sets a user's status to 'rejected'.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to reject.
 *     responses:
 *       200:
 *         description: User rejected successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (e.g., user not pending).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (insufficient privileges).
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.put(
  "/users/:userId/reject-pending",
  userManagementController.rejectPendingUser,
);

/**
 * @swagger
 * /api/admin/user-management/users/{userId}/update-details:
 *   put:
 *     summary: Update user details
 *     description: Modifies various details of an existing user, including their role and status.
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               surname:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phoneNumber:
 *                 type: string
 *               roleName:
 *                 type: string
 *                 description: "Name of the role to assign (e.g., 'user', 'admin')"
 *               approvalStatus:
 *                 type: string
 *                 enum: [unverified, pending, approved, rejected]
 *                 description: "The user's approval status (can also use rawApprovalStatus)"
 *               isVerified:
 *                 type: boolean
 *               walletAddress:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *                 description: "Optional: New password for the user (will be hashed)"
 *     responses:
 *       200:
 *         description: User details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request (e.g., invalid data, roleName not found).
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden (insufficient privileges).
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
router.put(
  "/users/:userId/update-details",
  userManagementController.updateUserDetails,
);

/**
 * @swagger
 * /api/admin/user-management/users/{userId}:
 *   delete:
 *     summary: Delete a user
 *     description: Permanently removes a user from the system
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       403:
 *         description: Forbidden - Insufficient privileges
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Access denied. Insufficient privileges
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: User not found
 */
router.delete("/users/:userId", userManagementController.deleteUser);

/**
 * @swagger
 * /api/admin/user-management/users/invite:
 *   post:
 *     summary: Send invitation email to a new user
 *     description: Sends an email invitation with a signup link to a prospective user
 *     tags: [User Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - roleName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address of the user to invite
 *               roleName:
 *                 type: string
 *                 description: Role to assign to the user (e.g., 'user', 'agent', 'admin')
 *               description:
 *                 type: string
 *                 description: Optional personal message to include in the invitation
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Invitation sent successfully to example@example.com
 *       400:
 *         description: Bad request (missing fields or user already exists)
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.post("/users/invite", userManagementController.sendUserInvitation);

module.exports = router;
