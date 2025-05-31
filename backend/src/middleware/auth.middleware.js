// Authentication middleware for payment routes
const jwt = require("jsonwebtoken");

// Simple authentication middleware
const authenticateUser = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const testUserId = req.headers["x-user-id"]; // Fallback for testing

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7); // Remove "Bearer " prefix

      try {
        // Verify JWT token
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "fallback_secret"
        );
        req.user = decoded;
        return next();
      } catch (jwtError) {
        console.log("JWT verification failed:", jwtError.message);
        // Fall through to test user ID fallback
      }
    }

    // Fallback for testing - use x-user-id header
    if (testUserId) {
      console.log(`Using test user ID: ${testUserId}`);
      req.user = {
        userId: testUserId,
        email: `${testUserId}@test.com`,
        test_mode: true,
      };
      return next();
    }

    // No authentication provided
    return res.status(401).json({
      status: "error",
      message:
        "Authentication required. Provide either a valid JWT token or x-user-id header for testing.",
    });
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      status: "error",
      message: "Authentication error",
    });
  }
};

// Optional authentication middleware (for endpoints that work with or without auth)
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const testUserId = req.headers["x-user-id"];

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "fallback_secret"
        );
        req.user = decoded;
      } catch (jwtError) {
        console.log("Optional JWT verification failed:", jwtError.message);
      }
    } else if (testUserId) {
      req.user = {
        userId: testUserId,
        email: `${testUserId}@test.com`,
        test_mode: true,
      };
    }

    // Continue regardless of auth status
    next();
  } catch (error) {
    console.error("Optional auth middleware error:", error);
    next(); // Continue even if there's an error
  }
};

module.exports = {
  authenticateUser,
  optionalAuth,
};
