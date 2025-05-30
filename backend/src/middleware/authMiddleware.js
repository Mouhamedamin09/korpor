/**
 * Authentication middleware for protecting API routes
 */
const jwt = require("jsonwebtoken");
const { logger } = require("../utils/logger");

/**
 * Middleware to authenticate users via JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticate = (req, res, next) => {
  try {
    // Get authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required. No valid token provided.",
      });
    }

    // Extract token from header
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required. No token provided.",
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "korpor-dev-secret-key";
    const decoded = jwt.verify(token, secret);

    // Add user information to request object
    req.user = {
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired. Please login again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token. Please login again.",
      });
    }

    return res.status(401).json({
      status: "error",
      message: "Authentication failed. Please login again.",
    });
  }
};

module.exports = {
  authenticate,
};
