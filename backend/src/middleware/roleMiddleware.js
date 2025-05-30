/**
 * Role-based access control middleware
 */
const { logger } = require("../utils/logger");

/**
 * Middleware to check if a user has one of the allowed roles
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Middleware function
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // First check if user exists on request (authentication happened)
      if (!req.user) {
        return res.status(401).json({
          status: "error",
          message: "Authentication required before role check",
        });
      }

      const userRoles = Array.isArray(req.user.role)
        ? req.user.role
        : [req.user.role];

      // Check if any of the user's roles match the allowed roles
      const hasAllowedRole = userRoles.some(
        (role) =>
          allowedRoles.includes(role) ||
          // Allow shorthand role names (s -> superadmin, a -> admin)
          (role === "s" && allowedRoles.includes("superadmin")) ||
          (role === "a" && allowedRoles.includes("admin")),
      );

      // If user has an allowed role or the allowed roles includes 'all', proceed
      if (hasAllowedRole || allowedRoles.includes("all")) {
        return next();
      }

      // User doesn't have the required role
      logger.warn(
        `Access denied for user ${req.user.email}. Required roles: ${allowedRoles.join(", ")}, User roles: ${userRoles.join(", ")}`,
      );

      return res.status(403).json({
        status: "error",
        message: "Access denied. You do not have the required permissions.",
      });
    } catch (error) {
      logger.error("Role check error:", error);

      return res.status(500).json({
        status: "error",
        message: "Internal server error during permission check",
      });
    }
  };
};

module.exports = {
  checkRole,
};
