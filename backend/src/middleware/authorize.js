/**
 * Role-based authorization middleware
 */
exports.authorizeRoles = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Check if user exists on the request (set by authenticate middleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      console.log(
        `[AUTHORIZE] User ID: ${req.user.userId}, Role ID: ${req.user.roleId}, Allowed roles: ${allowedRoles.join(", ")}`,
      );

      // Get role from database
      const Role = require("../models/Role");
      let userRole = null;

      try {
        const roleRecord = await Role.findByPk(req.user.roleId);
        if (roleRecord) {
          userRole = roleRecord.name.toLowerCase();
          // Add role name to req.user for convenience in controllers
          req.user.role = userRole;
          console.log(
            `[AUTHORIZE] Found role name: ${userRole} for role ID: ${req.user.roleId}`,
          );
        } else {
          console.log(
            `[AUTHORIZE] No role record found for role ID: ${req.user.roleId}`,
          );
        }
      } catch (dbError) {
        console.error("[AUTHORIZE] Database error fetching role:", dbError);
        // Fall back to the switch case method if DB lookup fails
      }

      // If no role found from database, use fallback mapping
      if (!userRole) {
        switch (req.user.roleId) {
          case 1:
            userRole = "superadmin";
            break;
          case 2:
            userRole = "admin";
            break;
          case 3:
            userRole = "agent";
            break;
          case 4:
            userRole = "user";
            break;
          default:
            userRole = "guest";
        }
        console.log(`[AUTHORIZE] Using fallback role mapping: ${userRole}`);
      }

      // Standardize allowed roles to lowercase for comparison
      const normalizedAllowedRoles = allowedRoles.map((role) =>
        role.toLowerCase(),
      );

      // Handle special case for "super admin" vs "superadmin"
      if (userRole === "super admin") userRole = "superadmin";

      // Check if user has one of the allowed roles
      const hasPermission = normalizedAllowedRoles.includes(userRole);
      console.log(
        `[AUTHORIZE] User role: ${userRole}, Has permission: ${hasPermission}`,
      );

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Insufficient privileges",
        });
      }

      // User is authorized
      next();
    } catch (error) {
      console.error("Authorization error:", error);
      return res.status(500).json({
        success: false,
        message: "Authorization failed",
        error: error.message,
      });
    }
  };
};
