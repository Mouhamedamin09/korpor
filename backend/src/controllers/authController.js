require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const User = require("../models/User");
const Role = require("../models/Role");
const { generateOTP } = require("../middleware/otpMiddleware");
const { blacklistToken } = require("../middleware/auth");
const {
  recordFailedLoginAttempt,
  resetFailedLoginAttempts,
} = require("../middleware/loginLimiter");
const { Buffer } = require("buffer");
const { sendVerificationEmail } = require("../config/email.config");

// Helper: Generate tokens (access and refresh)
const generateTokens = (user) => {
  // Include role name if available
  const role = user.role ? user.role.name : null;

  // Generate access token - short lived (e.g., 1 hour)
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h", // 1 hour
    }
  );

  // Generate refresh token - longer lived (e.g., 7 days)
  const refreshToken = jwt.sign(
    {
      userId: user.id,
      tokenType: "refresh",
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: "7d", // 7 days
    }
  );

  return { accessToken, refreshToken };
};

// ======================= CORE AUTH ENDPOINTS =======================

/**
 * User Registration
 * Registers a new user and sends verification code
 */
exports.signUp = async (req, res) => {
  try {
    const { name, surname, email, password, birthdate, phone, requestedRole } =
      req.body;

    // Validate inputs
    if (!name || !surname || !email || !password || !birthdate) {
      return res.status(400).json({
        message: "Name, surname, email, password, and birthdate are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email },
    });

    if (existingUser) {
      // Check if user exists but never verified their email
      if (!existingUser.isVerified) {
        // Check if verification code is expired
        const isExpired =
          !existingUser.signupVerificationExpires ||
          new Date() > new Date(existingUser.signupVerificationExpires);

        if (isExpired) {
          // Generate new verification code for the existing user
          const hashedPassword = await bcrypt.hash(password, 10);
          const { otp: verificationCode, expiry: expiryTime } = generateOTP({
            digits: 4,
            expiryMinutes: 10,
          });

          // Update the existing user with new information
          await User.update(
            {
              name,
              surname,
              password: hashedPassword,
              birthdate,
              phone: phone || existingUser.phone,
              signupVerificationCode: verificationCode,
              signupVerificationExpires: expiryTime,
            },
            { where: { email } }
          );

          // Try to send verification email, but don't block the response
          sendVerificationEmail(
            email,
            verificationCode,
            `${name} ${surname}`,
            "email"
          ).catch((error) =>
            console.error("Failed to send verification email:", error)
          );

          return res.status(200).json({
            message:
              "A new verification code has been sent to your email address",
            status: "pending_verification",
            user: {
              id: existingUser.id,
              email: existingUser.email,
              phone: existingUser.phone,
              approval_status: existingUser.approvalStatus,
            },
          });
        }

        // If verification code is still valid
        return res.status(409).json({
          message:
            "An account with this email already exists but is not verified. Please check your email for a verification code or wait for the current code to expire.",
          status: "pending_verification",
        });
      }

      // User exists and is verified
      return res.status(409).json({
        message: "An account with this email already exists",
        status: "existing_account",
      });
    }

    // New user registration
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate account number (example: current timestamp last 8 digits)
    const accountNo = parseInt(Date.now().toString().slice(-8));

    // Generate verification code
    const { otp: verificationCode, expiry: expiryTime } = generateOTP({
      digits: 4,
      expiryMinutes: 10,
    });

    // Find requested role ID or default to the user role
    let roleId = null;
    if (requestedRole) {
      const role = await Role.findOne({
        where: { name: requestedRole },
      });
      if (role) {
        roleId = role.id;
      }
    }

    // If no role specified or not found, default to user role
    if (!roleId) {
      const userRole = await Role.findOne({
        where: { name: "user" },
      });
      if (userRole) {
        roleId = userRole.id;
      }
    }

    // Create new user
    const newUser = await User.create({
      accountNo,
      name,
      surname,
      email,
      password: hashedPassword,
      birthdate,
      phone: phone || null,
      signupVerificationCode: verificationCode,
      signupVerificationExpires: expiryTime,
      roleId,
      approvalStatus: "unverified",
      isVerified: false,
      phoneVerified: false,
    });

    // Try to send verification email, but don't block the response
    sendVerificationEmail(
      email,
      verificationCode,
      `${name} ${surname}`,
      "email"
    ).catch((error) =>
      console.error("Failed to send verification email:", error)
    );

    // Respond with success
    return res.status(201).json({
      message:
        "Registration successful. Please verify your email address to continue.",
      status: "pending_email_verification",
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        approval_status: newUser.approvalStatus,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};

/**
 * Email Verification
 * Verifies a user's email with the provided code
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log("📧 Email verification attempt:", { email, code });

    if (!email || !code) {
      console.log("❌ Missing email or code");
      return res
        .status(400)
        .json({ message: "Email and verification code are required" });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      console.log("❌ User not found for email:", email);
      return res.status(400).json({ message: "User not found" });
    }

    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
      verificationCode: user.signupVerificationCode,
      verificationCodeExpires: user.signupVerificationExpires,
    });

    if (user.isVerified) {
      console.log("❌ Email already verified");
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.signupVerificationCode !== code) {
      console.log(
        "❌ Invalid verification code. Expected:",
        user.signupVerificationCode,
        "Got:",
        code
      );
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > new Date(user.signupVerificationExpires)) {
      console.log(
        "❌ Verification code expired. Expires:",
        user.signupVerificationExpires,
        "Current:",
        new Date()
      );
      return res.status(400).json({ message: "Verification code has expired" });
    }

    console.log("✅ Verification successful, updating user...");

    // Update user to verified status but still pending approval
    await User.update(
      {
        isVerified: true,
        signupVerificationCode: null,
        signupVerificationExpires: null,
        approvalStatus: "pending", // Set to pending to require admin approval after email verification
      },
      {
        where: { id: user.id },
      }
    );

    console.log("✅ User updated successfully");

    res.json({
      message:
        "Email verified successfully. Your account is now pending admin approval. You'll be notified once approved.",
    });
  } catch (error) {
    console.error("Verification Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * User Sign In
 * Authenticates a user and returns a JWT token
 */
exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user with role information - using the correct association alias 'role'
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: "role" }],
    });

    // User not found
    if (!user) {
      await recordFailedLoginAttempt(email);
      return res.status(401).json({
        message: "Invalid email or password",
        remainingAttempts: 5, // Default value if user not found
      });
    }

    // Check if account is locked due to too many failed attempts
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const lockoutMinutes = Math.ceil(
        (new Date(user.lockedUntil) - new Date()) / 60000
      );

      return res.status(423).json({
        message:
          "Account is temporarily locked due to too many failed attempts",
        lockoutDuration: new Date(user.lockedUntil) - new Date(),
        unlockTime: user.lockedUntil,
        waitTime: `${lockoutMinutes} minute(s)`,
      });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({
        message:
          "Email not verified. Please verify your email before signing in.",
      });
    }

    // Check if user is approved by admin (for roles that require approval)
    if (user.approvalStatus !== "approved") {
      if (user.approvalStatus === "pending") {
        // Check if email is verified to show appropriate message
        if (user.isVerified) {
          return res.status(403).json({
            message:
              "Your email has been verified. Your account is pending approval by an administrator.",
          });
        } else {
          return res.status(403).json({
            message: "Your account is pending approval by an administrator.",
          });
        }
      } else if (user.approvalStatus === "rejected") {
        return res.status(403).json({
          message: "Your account application has been rejected.",
        });
      } else {
        return res.status(403).json({
          message: "Your account is not active. Please contact support.",
        });
      }
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      await recordFailedLoginAttempt(email);
      return res.status(401).json({
        message: "Invalid email or password",
        remainingAttempts: 5 - user.failedLoginAttempts,
      });
    }

    // Reset failed login attempts on successful login
    await resetFailedLoginAttempts(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Update user's refresh token and last login time
    await User.update(
      {
        refreshToken,
        refreshTokenExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        lastLogin: new Date(),
      },
      { where: { id: user.id } }
    );

    // Determine dashboard route based on role
    let dashboardRoute = "/dashboard";
    if (user.role) {
      switch (user.role.name) {
        case "superadmin":
          dashboardRoute = "/super-admin/dashboard";
          break;
        case "admin":
          dashboardRoute = "/admin/dashboard";
          break;
        case "agent":
          dashboardRoute = "/agent/dashboard";
          break;
        default:
          dashboardRoute = "/dashboard";
      }
    }

    // Generate device info for security notification
    const deviceInfo = {
      deviceId: req.headers["user-agent"]
        ? Buffer.from(req.headers["user-agent"])
            .toString("base64")
            .substring(0, 10)
        : "unknown",
      browser: req.headers["user-agent"]
        ? req.headers["user-agent"].split(" ")[0]
        : "unknown",
      os: req.headers["user-agent"]
        ? req.headers["user-agent"].split("(")[1]?.split(")")[0]
        : "unknown",
      location:
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        "unknown",
    };

    // Send response
    return res.status(200).json({
      message: "Sign in successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        accountNo: user.accountNo,
        name: user.name,
        surname: user.surname,
        email: user.email,
        profilePicture: user.profilePicture,
        lastLogin: user.lastLogin,
      },
      role: user.role ? user.role.name : null,
      privileges: user.role ? user.role.privileges : [],
      deviceInfo,
      dashboardRoute,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return res.status(500).json({
      message: "An error occurred during sign in",
      error: error.message,
    });
  }
};

/**
 * Token Refresh
 * Issues a new access token using a valid refresh token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify the refresh token
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      );
      console.log("Refresh token verified:", decoded);

      // Find the user with this refresh token - using the correct association alias 'role'
      const user = await User.findOne({
        where: { id: decoded.userId, refreshToken: refreshToken },
        include: [{ model: Role, as: "role" }],
      });

      if (!user) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        generateTokens(user);

      // Update user with new refresh token
      await user.update({ refreshToken: newRefreshToken });

      return res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      console.error("Token verification error:", error);
      return res
        .status(401)
        .json({ message: "Invalid or expired refresh token" });
    }
  } catch (error) {
    console.error("RefreshToken Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Logout
 * Invalidates the current access token and removes refresh token
 */
exports.logout = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(400).json({ message: "No token provided" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Blacklist the current access token
    await blacklistToken(token);

    // Get user ID from token
    const decoded = jwt.decode(token);
    const userId = decoded?.userId;

    if (userId) {
      // Clear refresh token in database
      await User.update(
        {
          refreshToken: null,
          refreshTokenExpires: null,
        },
        {
          where: { id: userId },
        }
      );
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Validate Token
 * Checks if the provided token is valid
 */
exports.validateToken = async (req, res) => {
  // If we get here, the token is valid (thanks to authenticate middleware)
  res.json({
    valid: true,
    user: req.user,
  });
};

/**
 * Forgot Password
 * Sends a password reset code to the user's email
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(200).json({
        message:
          "If your email exists in our system, you will receive a password reset code.",
      });
    }

    // Generate reset code that expires in 1 hour
    const { otp: resetCode, expiry } = generateOTP({
      digits: 6,
      expiryMinutes: 60,
    });

    // Update user with reset code
    await User.update(
      {
        emailVerificationCode: resetCode,
        verificationCodeExpires: expiry,
      },
      {
        where: { id: user.id },
      }
    );

    // Get client info for email
    const date = moment().format("MMMM Do, YYYY");
    const time = moment().format("h:mm A");
    const userIp = req.ip || req.connection.remoteAddress;
    const userLocation = "Location data unavailable";

    // Send password reset email
    await sendVerificationEmail(email, resetCode, user.name, "email");

    res.json({
      message:
        "If your email exists in our system, you will receive a password reset code.",
    });
  } catch (error) {
    console.error("ForgotPassword Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Reset Password
 * Resets a user's password using the reset code
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user || user.emailVerificationCode !== code) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    if (new Date() > new Date(user.verificationCodeExpires)) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Update password and clear verification code
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      {
        password: hashedPassword,
        emailVerificationCode: null,
        verificationCodeExpires: null,
      },
      {
        where: { id: user.id },
      }
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("ResetPassword Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Resend Verification Code
 * Issues a new verification code for unverified users
 */
exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Find the user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      // For security reasons, don't reveal if the email exists
      return res.status(200).json({
        message:
          "If your email is registered, a new verification code has been sent.",
      });
    }

    // Check if the user is already verified
    if (user.isVerified) {
      return res.status(400).json({
        message: "This account is already verified. Please sign in instead.",
      });
    }

    // Generate new verification code
    const { otp: verificationCode, expiry: expiryTime } = generateOTP({
      digits: 4,
      expiryMinutes: 10,
    });

    // Update the user with new verification code
    await User.update(
      {
        emailVerificationCode: verificationCode,
        verificationCodeExpires: expiryTime,
      },
      {
        where: { id: user.id },
      }
    );

    // Send verification email
    await sendVerificationEmail(email, verificationCode, user.name, "email");

    // Return success message (don't confirm if email exists)
    res.status(200).json({
      message:
        "If your email is registered, a new verification code has been sent.",
    });
  } catch (error) {
    console.error("ResendVerificationCode Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * Superadmin user approval
 * Update user approval status (approve or reject)
 */
exports.approveUser = async (req, res) => {
  try {
    const { userId, approvalStatus, roleId } = req.body;

    // Validate input
    if (!userId || !approvalStatus) {
      return res
        .status(400)
        .json({ message: "User ID and approval status are required" });
    }

    // Validate status value
    if (!["approved", "rejected"].includes(approvalStatus)) {
      return res.status(400).json({
        message: "Invalid approval status. Use 'approved' or 'rejected'",
      });
    }

    // Get the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user is already approved or rejected
    if (user.approvalStatus === approvalStatus) {
      return res.status(409).json({
        message: `User is already ${approvalStatus}`,
        user: {
          id: user.id,
          email: user.email,
          approval_status: user.approvalStatus,
        },
      });
    }

    // Update user approval status
    await user.update({
      approvalStatus,
      roleId: roleId || user.roleId, // Update role if provided, otherwise keep existing
    });

    // If approved, send approval email
    if (approvalStatus === "approved") {
      try {
        const { sendEmail } = require("../config/email.config");
        await sendEmail(
          user.email,
          "Your Account Has Been Approved",
          `Hello ${user.name},\n\nWe're pleased to inform you that your account has been approved. You can now log in to your dashboard.\n\nThank you for joining us!\nThe Korpor Team`
        );
      } catch (error) {
        console.error("Failed to send approval email:", error);
        // Continue anyway, we don't want to fail the API call just because of email failure
      }
    }

    // If rejected, send rejection email
    if (approvalStatus === "rejected") {
      try {
        const { sendEmail } = require("../config/email.config");
        await sendEmail(
          user.email,
          "Your Account Application Status",
          `Hello ${user.name},\n\nWe regret to inform you that your account application has not been approved at this time.\n\nIf you believe this is an error or would like more information, please contact our support team.\n\nThank you for your interest in our platform.\nThe Korpor Team`
        );
      } catch (error) {
        console.error("Failed to send rejection email:", error);
      }
    }

    // Return success response
    return res.status(200).json({
      message: `User ${approvalStatus} successfully`,
      user: {
        id: user.id,
        email: user.email,
        approval_status: user.approvalStatus,
      },
    });
  } catch (error) {
    console.error("User approval error:", error);
    return res.status(500).json({
      message: "An error occurred while processing the approval",
      error: error.message,
    });
  }
};

/**
 * Handle Clerk OAuth Authentication
 * Process authentication from Clerk and create/update user in our database
 * TEMPORARILY MODIFIED FOR CI DEBUG: Using mock authentication
 */
exports.handleClerkAuth = async (req, res) => {
  try {
    const { token, userId, emailAddress, firstName, lastName, imageUrl } =
      req.body;

    if (!token || !userId || !emailAddress) {
      return res
        .status(400)
        .json({ message: "Session token, user ID, and email are required" });
    }

    console.log("[MOCK] Clerk authentication bypassed for CI debugging");

    // Mock a successful response - this simulates a successful auth without using Clerk keys
    return res.status(200).json({
      message: "[MOCK] Authentication successful - CI debug mode",
      accessToken: "mock_access_token",
      refreshToken: "mock_refresh_token",
      user: {
        id: 1,
        accountNo: "12345678",
        name: firstName || "Test",
        surname: lastName || "User",
        email: emailAddress,
        profilePicture: imageUrl || "",
        lastLogin: new Date(),
      },
      role: "agent",
      privileges: ["read"],
      deviceInfo: {
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      },
      dashboardRoute: "/dashboard",
      isNewUser: false,
    });
  } catch (error) {
    console.error("Clerk Auth Error:", error);
    return res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
};

/**
 * Send Phone Verification
 * Sends OTP to user's phone number after email verification
 */
exports.sendPhoneVerification = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if email is verified first
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email address first",
        status: "email_not_verified",
      });
    }

    // Check if phone is already verified
    if (user.phoneVerified) {
      return res.status(400).json({
        message: "Phone number is already verified",
        status: "phone_already_verified",
      });
    }

    // Generate phone verification code
    const { otp: phoneVerificationCode, expiry: expiryTime } = generateOTP({
      digits: 6,
      expiryMinutes: 10,
    });

    // Update user with phone verification code
    await User.update(
      {
        phoneVerificationCode,
        verificationCodeExpires: new Date(expiryTime),
      },
      { where: { id: userId } }
    );

    // Send SMS
    try {
      const { sendSMS } = require("../config/twilio.config");
      const message = `Your Korpor verification code is: ${phoneVerificationCode}. This code will expire in 10 minutes.`;
      await sendSMS(user.phone, message);

      console.log(`Phone verification SMS sent to ${user.phone}`);
    } catch (smsError) {
      console.error("Failed to send SMS:", smsError);
      return res.status(500).json({
        message: "Failed to send verification SMS. Please try again.",
        error: "sms_send_failed",
      });
    }

    res.status(200).json({
      message: "Verification code sent to your phone",
      status: "phone_verification_sent",
    });
  } catch (error) {
    console.error("Send phone verification error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Verify Phone Number
 * Verifies the phone OTP code
 */
exports.verifyPhone = async (req, res) => {
  try {
    const { userId, verificationCode } = req.body;

    console.log("📱 Phone verification attempt:", { userId, verificationCode });

    if (!userId || !verificationCode) {
      console.log("❌ Missing userId or verificationCode");
      return res.status(400).json({
        message: "User ID and verification code are required",
      });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("❌ User not found for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ User found:", {
      id: user.id,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      phoneVerified: user.phoneVerified,
      phoneVerificationCode: user.phoneVerificationCode,
      verificationCodeExpires: user.verificationCodeExpires,
    });

    // Check if email is verified first
    if (!user.isVerified) {
      console.log("❌ Email not verified");
      return res.status(400).json({
        message: "Please verify your email address first",
        status: "email_not_verified",
      });
    }

    // Check if phone is already verified
    if (user.phoneVerified) {
      console.log("❌ Phone already verified");
      return res.status(400).json({
        message: "Phone number is already verified",
        status: "phone_already_verified",
      });
    }

    // Check if verification code exists and is not expired
    if (!user.phoneVerificationCode || !user.verificationCodeExpires) {
      console.log("❌ No verification code or expiry found");
      return res.status(400).json({
        message: "No verification code found. Please request a new one.",
        status: "no_verification_code",
      });
    }

    // Check if code is expired
    if (new Date() > new Date(user.verificationCodeExpires)) {
      console.log(
        "❌ Verification code expired. Expires:",
        user.verificationCodeExpires,
        "Current:",
        new Date()
      );
      return res.status(400).json({
        message: "Verification code has expired. Please request a new one.",
        status: "code_expired",
      });
    }

    // Verify the code
    if (user.phoneVerificationCode !== verificationCode) {
      console.log(
        "❌ Invalid verification code. Expected:",
        user.phoneVerificationCode,
        "Got:",
        verificationCode
      );
      return res.status(400).json({
        message: "Invalid verification code",
        status: "invalid_code",
      });
    }

    console.log("✅ Phone verification successful, updating user...");

    // Mark phone as verified and clear verification data
    await User.update(
      {
        phoneVerified: true,
        phoneVerificationCode: null,
        verificationCodeExpires: null,
        approvalStatus: "approved", // Auto-approve user after phone verification
      },
      { where: { id: userId } }
    );

    console.log("✅ User updated successfully - phone verified and approved");

    res.status(200).json({
      message: "Phone number verified successfully",
      status: "phone_verified",
    });
  } catch (error) {
    console.error("Verify phone error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
