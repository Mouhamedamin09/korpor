require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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

// Helper: Create and return a nodemailer transporter
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

// Helper: Send verification email with a rich HTML template
const sendVerificationEmail = async (
  email,
  verificationCode,
  userName,
  userLocation,
  userIp,
  date,
  time,
) => {
  try {
    const transporter = createTransporter();

    // Example icons (replace with your own if desired)
    const locationIcon =
      "https://cdn-icons-png.flaticon.com/512/684/684908.png";
    const ipIcon = "https://cdn-icons-png.flaticon.com/512/841/841364.png";
    const calendarIcon =
      "https://cdn-icons-png.flaticon.com/512/747/747310.png";
    const timeIcon = "https://cdn-icons-png.flaticon.com/512/2911/2911643.png";

    const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Mail Verification - Korpor</title>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15); }
    .header { background-color: #663399; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; }
    .verification-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; color: #663399; }
    .meta-row { display: flex; align-items: center; margin-bottom: 12px; }
    .meta-icon { width: 20px; height: 20px; margin-right: 10px; }
    .meta-text { font-size: 14px; color: #555; }
    .divider { height: 1px; background-color: #eee; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
    .cta-button { display: inline-block; background-color: #663399; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Email Verification</h2>
    </div>
    <div class="content">
      <p>Hello ${userName},</p>
      <p>Thank you for signing up! Please use the verification code below to complete your registration:</p>
      
      <div class="verification-code">${verificationCode}</div>
      
      <p>This code will expire in 10 minutes for security reasons.</p>
      
      <div class="divider"></div>
      
      <p>Request details:</p>
      
      <div class="meta-row">
        <img src="${locationIcon}" alt="Location" class="meta-icon" />
        <div class="meta-text">Location: ${userLocation || "Unknown"}</div>
      </div>
      
      <div class="meta-row">
        <img src="${ipIcon}" alt="IP Address" class="meta-icon" />
        <div class="meta-text">IP Address: ${userIp || "Unknown"}</div>
      </div>
      
      <div class="meta-row">
        <img src="${calendarIcon}" alt="Date" class="meta-icon" />
        <div class="meta-text">Date: ${date || "Unknown"}</div>
      </div>
      
      <div class="meta-row">
        <img src="${timeIcon}" alt="Time" class="meta-icon" />
        <div class="meta-text">Time: ${time || "Unknown"}</div>
      </div>
      
      <div class="divider"></div>
      
      <p>If you did not request this verification code, please ignore this email.</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} Korpor. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

    await transporter.sendMail({
      from: `"Korpor Authentication" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email Address",
      html: emailTemplate,
    });

    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

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
    },
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
    },
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
    const { name, surname, email, password, birthdate, requestedRole } =
      req.body;

    // Validate inputs
    if (!name || !surname || !email || !password || !birthdate) {
      return res.status(400).json({ message: "All fields are required" });
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
          !existingUser.resetCodeExpires ||
          new Date() > new Date(existingUser.resetCodeExpires);

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
              resetCode: verificationCode,
              resetCodeExpires: expiryTime,
            },
            { where: { email } },
          );

          // Try to send verification email, but don't block the response
          sendVerificationEmail(
            email,
            verificationCode,
            `${name} ${surname}`,
            req.ip,
            req.headers["user-agent"],
          ).catch((error) =>
            console.error("Failed to send verification email:", error),
          );

          return res.status(200).json({
            message:
              "A new verification code has been sent to your email address",
            status: "pending_verification",
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

    // Find requested role ID or default to the agent role
    let roleId = null;
    if (requestedRole) {
      const role = await Role.findOne({
        where: { name: requestedRole },
      });
      if (role) {
        roleId = role.id;
      }
    }

    // If no role specified or not found, default to agent role
    if (!roleId) {
      const agentRole = await Role.findOne({
        where: { name: Role.ROLES.AGENT },
      });
      if (agentRole) {
        roleId = agentRole.id;
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
      resetCode: verificationCode,
      resetCodeExpires: expiryTime,
      roleId,
      approvalStatus:
        requestedRole === Role.ROLES.AGENT ? "pending" : "unverified",
    });

    // Try to send verification email, but don't block the response
    sendVerificationEmail(
      email,
      verificationCode,
      `${name} ${surname}`,
      req.headers["x-forwarded-for"] || req.ip,
      req.headers["user-agent"],
    ).catch((error) =>
      console.error("Failed to send verification email:", error),
    );

    // Respond with success
    return res.status(201).json({
      message: "Registration successful. Please verify your email address.",
      status: "pending_verification",
      user: {
        id: newUser.id,
        email: newUser.email,
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

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and verification code are required" });
    }

    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Update user to verified status but still pending approval
    await User.update(
      {
        isVerified: true,
        resetCode: null,
        resetCodeExpires: null,
        approvalStatus: "pending", // Set to pending to require admin approval after email verification
      },
      {
        where: { id: user.id },
      },
    );

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
        (new Date(user.lockedUntil) - new Date()) / 60000,
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
      { where: { id: user.id } },
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
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
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
        },
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
        resetCode: resetCode,
        resetCodeExpires: expiry,
      },
      {
        where: { id: user.id },
      },
    );

    // Get client info for email
    const date = moment().format("MMMM Do, YYYY");
    const time = moment().format("h:mm A");
    const userIp = req.ip || req.connection.remoteAddress;
    const userLocation = "Location data unavailable";

    // Send password reset email
    await sendVerificationEmail(
      email,
      resetCode,
      user.name,
      userLocation,
      userIp,
      date,
      time,
    );

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

    if (!user || user.resetCode !== code) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    if (new Date() > new Date(user.resetCodeExpires)) {
      return res.status(400).json({ message: "Verification code has expired" });
    }

    // Update password and clear reset code
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.update(
      {
        password: hashedPassword,
        resetCode: null,
        resetCodeExpires: null,
      },
      {
        where: { id: user.id },
      },
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
        resetCode: verificationCode,
        resetCodeExpires: expiryTime,
      },
      {
        where: { id: user.id },
      },
    );

    // Send verification email
    const date = moment().format("MMMM Do, YYYY");
    const time = moment().format("h:mm A");
    const userIp = req.ip || req.connection.remoteAddress;
    const userLocation = "Location data unavailable";

    await sendVerificationEmail(
      email,
      verificationCode,
      user.name,
      userLocation,
      userIp,
      date,
      time,
    );

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
      // Implementation would depend on your email sending function
      // For example:
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"Korpor Admin" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Your Account Has Been Approved",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #663399;">Account Approved</h2>
              <p>Hello ${user.name},</p>
              <p>We're pleased to inform you that your account has been approved. You can now log in to your dashboard.</p>
              <a href="${process.env.FRONTEND_URL}/sign-in" style="display: inline-block; background-color: #663399; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px;">Sign In</a>
              <p style="margin-top: 30px;">Thank you for joining us!</p>
              <p>The Korpor Team</p>
            </div>
          `,
        });
      } catch (error) {
        console.error("Failed to send approval email:", error);
        // Continue anyway, we don't want to fail the API call just because of email failure
      }
    }

    // If rejected, send rejection email
    if (approvalStatus === "rejected") {
      try {
        const transporter = createTransporter();
        await transporter.sendMail({
          from: `"Korpor Admin" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: "Your Account Application Status",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #dc3545;">Account Not Approved</h2>
              <p>Hello ${user.name},</p>
              <p>We regret to inform you that your account application has not been approved at this time.</p>
              <p>If you believe this is an error or would like more information, please contact our support team.</p>
              <p style="margin-top: 30px;">Thank you for your interest in our platform.</p>
              <p>The Korpor Team</p>
            </div>
          `,
        });
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
