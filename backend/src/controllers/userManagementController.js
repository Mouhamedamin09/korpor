const { User, Role, sequelize } = require("../models");
const { Op } = require("sequelize");
const {
  checkAndProcessPendingReferralRewards,
} = require("../services/referralRewardService");
const { Buffer } = require("buffer");

/**
 * Change a user's role
 * @route PUT /api/admin/user-management/users/:userId/role
 * @access Private (Super Admin, Admin)
 */
exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({
        success: false,
        message: "Role ID is required",
      });
    }

    // Check if the role exists
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    // Find user and update role
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user role
    user.roleId = roleId;
    await user.save();

    // Transform the user data to match frontend expectations
    const transformedUser = {
      id: user.id.toString(),
      firstName: user.name || "",
      lastName: user.surname || "",
      username: user.email.split("@")[0],
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      status:
        user.approvalStatus === "approved" ? "active" : user.approvalStatus,
      role: role.name.toLowerCase(),
      walletAddress: user.walletAddress || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: transformedUser,
    });
  } catch (error) {
    console.error("Error changing user role:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Get all pending user registrations
 * @route GET /api/admin/user-management/users/pending
 * @access Private (Super Admin, Admin)
 */
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.findAll({
      where: { approvalStatus: "pending" },
      attributes: { exclude: ["password", "resetCode", "resetCodeExpires"] },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Transform the data to match frontend expectations
    const transformedUsers = pendingUsers.map((user) => ({
      id: user.id.toString(),
      firstName: user.name || "",
      lastName: user.surname || "",
      username: user.email.split("@")[0],
      email: user.email,
      phoneNumber: user.phoneNumber || "",
      status: "pending",
      approvalStatus: user.approvalStatus,
      rawApprovalStatus: user.approvalStatus,
      role: user.role ? user.role.name.toLowerCase() : "user",
      isVerified: user.isVerified,
      walletAddress: user.walletAddress || "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      count: transformedUsers.length,
      data: transformedUsers,
    });
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Delete a user
 * @route DELETE /api/admin/user-management/users/:userId
 * @access Private (Super Admin, Admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    console.log(
      `[DELETE USER] Request received to delete user ID: ${req.params.userId}`
    );
    console.log(
      `[DELETE USER] Request made by user ID: ${req.user.userId}, role: ${req.user.roleId}`
    );

    const { userId } = req.params;

    // Find the user to be deleted
    const userToDelete = await User.findByPk(userId);
    if (!userToDelete) {
      console.log(`[DELETE USER] User ID ${userId} not found`);
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user is trying to delete themselves
    if (req.user.userId === parseInt(userId)) {
      console.log(`[DELETE USER] User attempted to delete their own account`);
      return res.status(403).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Add additional protection for superadmin accounts if needed
    const userRole = await Role.findByPk(userToDelete.roleId);
    if (
      userRole &&
      userRole.name.toLowerCase() === "superadmin" &&
      req.user.roleId !== 1
    ) {
      console.log(
        `[DELETE USER] Non-superadmin user attempted to delete a superadmin account`
      );
      return res.status(403).json({
        success: false,
        message: "Only superadmins can delete other superadmin accounts",
      });
    }

    // Delete the user
    await userToDelete.destroy();
    console.log(`[DELETE USER] Successfully deleted user ID: ${userId}`);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(`[DELETE USER] Error deleting user:`, error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting user",
      error: error.message,
    });
  }
};

/**
 * Approve a pending user registration
 * @route PUT /api/admin/user-management/users/:userId/approve-pending
 * @access Private (Super Admin, Admin)
 */
exports.approvePendingUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleName } = req.body;

    console.log(
      `[APPROVE USER] Request to approve user ID: ${userId} with role: ${roleName}`
    );
    console.log(
      `[APPROVE USER] Action by user ID: ${req.user.userId}, role from token: ${req.user.role}`
    );

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: "Role name is required for approval.",
      });
    }

    // Find the role in the Role table to get its ID
    const roleRecord = await Role.findOne({
      where: { name: roleName.toLowerCase() },
    });
    if (!roleRecord) {
      return res.status(404).json({
        success: false,
        message: `Role '${roleName}' not found. Valid roles are typically 'superadmin', 'admin', 'agent', 'user'.`,
      });
    }

    const userToApprove = await User.findByPk(userId);
    if (!userToApprove) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (
      userToApprove.approvalStatus !== "pending" &&
      userToApprove.approvalStatus !== "unverified"
    ) {
      return res.status(400).json({
        success: false,
        message: `User is not in a pending or unverified state. Current status: ${userToApprove.approvalStatus}`,
      });
    }

    userToApprove.approvalStatus = "approved";
    userToApprove.roleId = roleRecord.id;
    userToApprove.isVerified = true; // Mark as verified upon admin approval
    await userToApprove.save();

    // Process referral rewards if user was referred
    try {
      console.log(
        `🔄 Checking for referral rewards for newly approved user ${userId}`
      );
      const referralResult = await checkAndProcessPendingReferralRewards(
        userId
      );
      if (referralResult.success) {
        console.log(
          `✅ Referral rewards processed for user ${userId}:`,
          referralResult.data
        );
      } else {
        console.log(
          `ℹ️ No referral rewards to process for user ${userId}: ${referralResult.message}`
        );
      }
    } catch (error) {
      console.error(
        `❌ Error processing referral rewards for user ${userId}:`,
        error
      );
      // Don't fail the approval process if referral processing fails
    }

    // Optionally, fetch the user again with role details for the response
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: "role", attributes: ["name"] }],
    });

    const responseUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      surname: updatedUser.surname,
      email: updatedUser.email,
      approvalStatus: updatedUser.approvalStatus,
      role: updatedUser.role ? updatedUser.role.name : null,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    console.log(`[APPROVE USER] User ID: ${userId} approved successfully.`);
    return res.status(200).json({
      success: true,
      message: "User approved successfully.",
      user: responseUser,
    });
  } catch (error) {
    console.error("[APPROVE USER] Error approving user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during user approval.",
      error: error.message,
    });
  }
};

/**
 * Reject a pending user registration
 * @route PUT /api/admin/user-management/users/:userId/reject-pending
 * @access Private (Super Admin, Admin)
 */
exports.rejectPendingUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`[REJECT USER] Request to reject user ID: ${userId}`);
    console.log(
      `[REJECT USER] Action by user ID: ${req.user.userId}, role from token: ${req.user.role}`
    );

    const userToReject = await User.findByPk(userId);
    if (!userToReject) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (
      userToReject.approvalStatus !== "pending" &&
      userToReject.approvalStatus !== "unverified"
    ) {
      return res.status(400).json({
        success: false,
        message: `User is not in a pending or unverified state. Current status: ${userToReject.approvalStatus}`,
      });
    }

    userToReject.approvalStatus = "rejected";
    // userToReject.isVerified remains as is (could be true if email was verified prior to rejection)
    await userToReject.save();

    // Optionally, fetch the user again with role details for the response (though role doesn't change on rejection)
    const updatedUser = await User.findByPk(userId, {
      include: [{ model: Role, as: "role", attributes: ["name"] }],
    });

    const responseUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      surname: updatedUser.surname,
      email: updatedUser.email,
      approvalStatus: updatedUser.approvalStatus,
      role: updatedUser.role ? updatedUser.role.name : null,
      isVerified: updatedUser.isVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
    };

    console.log(`[REJECT USER] User ID: ${userId} rejected successfully.`);
    return res.status(200).json({
      success: true,
      message: "User rejected successfully.",
      user: responseUser,
    });
  } catch (error) {
    console.error("[REJECT USER] Error rejecting user:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during user rejection.",
      error: error.message,
    });
  }
};

/**
 * Update user details
 * @route PUT /api/admin/user-management/users/:userId/update-details
 * @access Private (Super Admin, Admin)
 */
exports.updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      name,
      surname,
      email,
      phoneNumber,
      roleName,
      status,
      isVerified: isVerifiedFromRequest,
      walletAddress,
      password,
    } = req.body;

    console.log(
      `[UPDATE USER] Request to update user ID: ${userId} with data:`,
      req.body
    );
    console.log(
      `[UPDATE USER] Action by user ID: ${req.user.userId}, role from token: ${req.user.role}`
    );

    const userToUpdate = await User.findByPk(userId);
    if (!userToUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Update basic fields if provided
    if (name !== undefined) userToUpdate.name = name;
    if (surname !== undefined) userToUpdate.surname = surname;
    if (email !== undefined) userToUpdate.email = email;
    if (phoneNumber !== undefined) userToUpdate.phoneNumber = phoneNumber;
    if (walletAddress !== undefined) userToUpdate.walletAddress = walletAddress;

    // Handle status mapping to approvalStatus and isVerified
    if (status !== undefined) {
      switch (status.toLowerCase()) {
        case "active":
          userToUpdate.approvalStatus = "approved";
          userToUpdate.isVerified = true;
          break;
        case "pending":
          userToUpdate.approvalStatus = "pending";
          break;
        case "inactive":
          userToUpdate.approvalStatus = "rejected";
          break;
        case "suspended":
          userToUpdate.approvalStatus = "rejected";
          break;
        case "unverified":
          userToUpdate.approvalStatus = "unverified";
          break;
        case "rejected":
          userToUpdate.approvalStatus = "rejected";
          break;
        default:
          console.warn(
            `[UPDATE USER] Unknown status received: ${status}. approvalStatus not changed.`
          );
      }
    }

    // If isVerified is explicitly sent, it takes precedence for non-active statuses
    if (isVerifiedFromRequest !== undefined) {
      userToUpdate.isVerified = isVerifiedFromRequest;
      if (userToUpdate.approvalStatus === "approved") {
        userToUpdate.isVerified = true;
      }
    }

    // Update role if roleName is provided
    if (roleName) {
      const roleRecord = await Role.findOne({
        where: { name: roleName.toLowerCase() },
      });
      if (!roleRecord) {
        return res.status(400).json({
          success: false,
          message: `Invalid roleName: '${roleName}'. Role not found.`,
        });
      }
      userToUpdate.roleId = roleRecord.id;
    }

    // Update password if provided
    if (password) {
      const bcrypt = require("bcryptjs");
      userToUpdate.password = await bcrypt.hash(password, 10);
    }

    await userToUpdate.save();

    // Fetch the updated user with role details for the response
    const updatedUserWithDetails = await User.findByPk(userId, {
      include: [{ model: Role, as: "role", attributes: ["name"] }],
    });

    const responseUser = {
      id: updatedUserWithDetails.id,
      name: updatedUserWithDetails.name,
      surname: updatedUserWithDetails.surname,
      email: updatedUserWithDetails.email,
      phoneNumber: updatedUserWithDetails.phoneNumber,
      approvalStatus: updatedUserWithDetails.approvalStatus,
      role: updatedUserWithDetails.role
        ? updatedUserWithDetails.role.name
        : null,
      isVerified: updatedUserWithDetails.isVerified,
      walletAddress: updatedUserWithDetails.walletAddress,
      createdAt: updatedUserWithDetails.createdAt,
      updatedAt: updatedUserWithDetails.updatedAt,
      rawApprovalStatus: updatedUserWithDetails.approvalStatus,
    };

    console.log(
      `[UPDATE USER] User ID: ${userId} updated successfully with new approvalStatus: ${userToUpdate.approvalStatus}`
    );
    return res.status(200).json({
      success: true,
      message: "User details updated successfully.",
      user: responseUser,
    });
  } catch (error) {
    console.error("[UPDATE USER] Error updating user details:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during user update.",
      error: error.message,
    });
  }
};

/**
 * Send invitation email to a new user
 * @route POST /api/admin/user-management/users/invite
 * @access Private (Super Admin, Admin)
 */
exports.sendUserInvitation = async (req, res) => {
  try {
    const { email, roleName, description } = req.body;

    if (!email || !roleName) {
      return res.status(400).json({
        success: false,
        message: "Email and role are required",
      });
    }

    // Check if the role exists
    const role = await Role.findOne({
      where: { name: roleName.toLowerCase() },
    });

    if (!role) {
      return res.status(404).json({
        success: false,
        message: `Role '${roleName}' not found`,
      });
    }

    // Generate invite token that will be used to pre-fill email and role on signup
    const inviteData = {
      email,
      roleName,
      invitedAt: Date.now(),
    };

    const inviteToken = Buffer.from(JSON.stringify(inviteData)).toString(
      "base64"
    );
    const signupUrl = `${
      process.env.FRONTEND_URL || "http://localhost:3000"
    }/auth/sign-up?invite=${inviteToken}`;

    // HTML template for invitation email
    const inviteTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invitation to Join Korpor</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); }
    .header { background-color: #663399; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; }
    .divider { height: 1px; background-color: #eee; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
    .cta-button { display: inline-block; background-color: #663399; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
    .role-badge { display: inline-block; background-color: #f0ebf8; color: #663399; padding: 4px 10px; border-radius: 4px; font-size: 14px; font-weight: bold; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>You're Invited to Join Korpor!</h2>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>You've been invited to join Korpor as a <span class="role-badge">${roleName}</span></p>
      
      ${description ? `<p>"${description}"</p>` : ""}
      
      <p>Click the button below to create your account and get started:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${signupUrl}" class="cta-button">Create Your Account</a>
      </div>
      
      <div class="divider"></div>
      
      <p>If you did not expect this invitation, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Korpor. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

    // Create transporter for sending email
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send the invitation email
    await transporter.sendMail({
      from: `"Korpor Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Invitation to Join Korpor",
      html: inviteTemplate,
    });

    return res.status(200).json({
      success: true,
      message: `Invitation sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending invitation",
      error: error.message,
    });
  }
};
