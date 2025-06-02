const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Helper function to decode JWT token for debugging
 */
const decodeToken = (token) => {
  try {
    // Just decode without verification for debugging
    const decoded = jwt.decode(token);
    return {
      success: true,
      decoded,
      expiresAt: decoded.exp
        ? new Date(decoded.exp * 1000).toISOString()
        : "Unknown",
      expiresIn: decoded.exp
        ? Math.floor(decoded.exp - Date.now() / 1000) + " seconds"
        : "Unknown",
      isExpired: decoded.exp ? decoded.exp < Date.now() / 1000 : "Unknown",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Authentication middleware to verify JWT tokens
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Check for token in headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication failed. No token provided or invalid format.",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Debug info for token issues
    const tokenInfo = decodeToken(token);
    console.log(`[AUTH] Token info:`, JSON.stringify(tokenInfo, null, 2));

    // Check if token is about to expire (less than 10 minutes)
    if (tokenInfo.success && tokenInfo.decoded && tokenInfo.decoded.exp) {
      const tenMinutesInSeconds = 10 * 60;
      const timeUntilExpiry = tokenInfo.decoded.exp - Date.now() / 1000;
      if (timeUntilExpiry > 0 && timeUntilExpiry < tenMinutesInSeconds) {
        console.log(
          `[AUTH] Token will expire soon: ${Math.floor(
            timeUntilExpiry
          )} seconds remaining`
        );
      }
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.error(`[AUTH] JWT verification error:`, jwtError);
      if (jwtError.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token has expired. Please log in again.",
          error: "token_expired",
        });
      } else if (jwtError.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token. Please log in again.",
          error: "invalid_token",
        });
      }
      throw jwtError;
    }

    // Check if token is expired
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
        error: "token_expired",
      });
    }

    // Find user
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      console.log(
        `[AUTH] User with ID ${decoded.userId} from token not found in database`
      );
      return res.status(401).json({
        success: false,
        message: "Authentication failed. User not found.",
        error: "user_not_found",
      });
    }

    // Log authentication success
    console.log(
      `[AUTH] Authentication successful for user ID: ${user.id}, email: ${user.email}`
    );

    // Attach user info to request
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
    };

    // Attach token debugging info if ?debug=true is in the query string
    if (req.query.debug === "true") {
      req.tokenDebug = tokenInfo;
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed. " + (error.message || "Unknown error"),
      error: error.name || "auth_error",
    });
  }
};

// Export the token decoder for use in other parts of the application
exports.decodeToken = decodeToken;
