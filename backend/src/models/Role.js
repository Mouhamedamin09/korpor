const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Role = sequelize.define(
  "Role",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    privileges: {
      type: DataTypes.JSON,
      allowNull: true,
      get() {
        const value = this.getDataValue("privileges");
        return value ? value : [];
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "roles",
    timestamps: true,
    underscored: true,
  },
);

// Define default roles and privileges
Role.ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  AGENT: "agent",
};

// Setup default roles in the database
Role.setupDefaultRoles = async () => {
  try {
    // Define default roles with descriptions and privileges
    const defaultRoles = [
      {
        name: Role.ROLES.SUPERADMIN,
        description: "Super Administrator with full system access",
        privileges: ["all"], // superadmin has all privileges
      },
      {
        name: Role.ROLES.ADMIN,
        description: "Administrator with management access",
        privileges: [
          "manage_users",
          "view_users",
          "edit_users",
          "view_reports",
          "manage_content",
          "view_dashboard",
          "manage_settings",
        ],
      },
      {
        name: Role.ROLES.AGENT,
        description: "Support agent with limited access",
        privileges: [
          "view_dashboard",
          "view_assigned_tasks",
          "manage_own_profile",
          "view_reports",
        ],
      },
    ];

    // Create each role if it doesn't exist
    for (const role of defaultRoles) {
      const [roleRecord, created] = await Role.findOrCreate({
        where: { name: role.name },
        defaults: role,
      });

      // If the role already exists, update its privileges and description
      if (!created) {
        await roleRecord.update({
          privileges: role.privileges,
          description: role.description,
        });
      }
    }

    console.log("Default roles have been set up");
  } catch (error) {
    console.error("Error setting up default roles:", error);
  }
};

module.exports = Role;
