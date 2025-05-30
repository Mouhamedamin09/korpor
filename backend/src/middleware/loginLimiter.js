const rateLimit = require("express-rate-limit");
const { User } = require("../models");
const { Op } = require("sequelize");

// Maximum number of failed attempts before account lockout
const MAX_FAILED_ATTEMPTS = 5;
// Lockout duration in milliseconds (15 minutes)
const LOCKOUT_DURATION = 15 * 60 * 1000;

// Rate limiter for authentication routes
exports.authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (changed from 15 minutes)
  max: 100, // limit each IP to 100 authentication requests per 5 minutes (changed from 10)
  message:
    "Too many authentication attempts from this IP, please try again after 5 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware to check and handle failed login attempts
exports.handleFailedLogin = async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingTime = Math.ceil(
        (new Date(user.lockedUntil) - new Date()) / 60000,
      ); // in minutes
      return res.status(429).json({
        message: `Account locked due to too many failed attempts. Try again in ${remainingTime} minutes.`,
      });
    }

    // Allow login attempt to proceed
    next();
  } catch (error) {
    console.error("Error in login limiter:", error);
    next(error);
  }
};

// Function to record a failed login attempt
exports.recordFailedLoginAttempt = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return;

    // Increment failed attempts
    const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;

    // If user has reached max failed attempts, lock the account
    if (newFailedAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION);

      await User.update(
        {
          failedLoginAttempts: 0, // Reset counter
          lockedUntil: lockedUntil,
        },
        { where: { email } },
      );

      console.log(`Account ${email} locked until ${lockedUntil}`);
    } else {
      // Just increment the failed attempt counter
      await User.update(
        { failedLoginAttempts: newFailedAttempts },
        { where: { email } },
      );
    }
  } catch (error) {
    console.error("Error recording failed login attempt:", error);
  }
};

// Function to reset failed login attempts after successful login
exports.resetFailedLoginAttempts = async (email) => {
  try {
    await User.update(
      {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      { where: { email } },
    );
  } catch (error) {
    console.error("Error resetting failed login attempts:", error);
  }
};

// For development - Reset rate limit for specific IP (use with caution)
exports.resetRateLimit = (req, res) => {
  if (process.env.NODE_ENV !== "production") {
    // This only works if you're using the default memory store
    // The limiter doesn't expose the store by default, so this is just for reference
    const ip = req.ip || req.connection.remoteAddress;
    console.log(`Rate limit reset requested for IP: ${ip}`);

    // In a real implementation, you'd need to access the store
    // For now, the most reliable way is to restart the server
    return res.status(200).json({
      message:
        "Rate limit reset feature is implementation-specific. Server restart is the most reliable method.",
      ip: ip,
    });
  }

  return res
    .status(403)
    .json({ message: "This endpoint is not available in production" });
};
