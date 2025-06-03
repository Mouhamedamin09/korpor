"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable("users");

      // Add signup_verification_code column if it doesn't exist
      if (!tableInfo.signup_verification_code) {
        console.log("Adding column: signup_verification_code");
        await queryInterface.addColumn("users", "signup_verification_code", {
          type: DataTypes.STRING(6),
          allowNull: true,
        });
      } else {
        console.log(
          "Column signup_verification_code already exists, skipping..."
        );
      }

      // Add signup_verification_expires column if it doesn't exist
      if (!tableInfo.signup_verification_expires) {
        console.log("Adding column: signup_verification_expires");
        await queryInterface.addColumn("users", "signup_verification_expires", {
          type: DataTypes.DATE,
          allowNull: true,
        });
      } else {
        console.log(
          "Column signup_verification_expires already exists, skipping..."
        );
      }

      console.log(
        "Signup verification fields migration completed successfully"
      );
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable("users");

      // Remove signup_verification_code column if it exists
      if (tableInfo.signup_verification_code) {
        console.log("Removing column: signup_verification_code");
        await queryInterface.removeColumn("users", "signup_verification_code");
      } else {
        console.log(
          "Column signup_verification_code does not exist, skipping..."
        );
      }

      // Remove signup_verification_expires column if it exists
      if (tableInfo.signup_verification_expires) {
        console.log("Removing column: signup_verification_expires");
        await queryInterface.removeColumn(
          "users",
          "signup_verification_expires"
        );
      } else {
        console.log(
          "Column signup_verification_expires does not exist, skipping..."
        );
      }

      console.log("Signup verification fields rollback completed successfully");
    } catch (error) {
      console.error("Rollback failed:", error);
      throw error;
    }
  },
};
