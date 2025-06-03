"use strict";

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create property_images table
    await queryInterface.createTable("property_images", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      image_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cloudinary_public_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Create project_documents table
    await queryInterface.createTable("project_documents", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cloudinary_public_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      document_type: {
        type: DataTypes.ENUM(
          "legal",
          "financial",
          "technical",
          "marketing",
          "other"
        ),
        allowNull: true,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex("property_images", ["project_id"]);
    await queryInterface.addIndex("property_images", ["is_primary"]);
    await queryInterface.addIndex("project_documents", ["project_id"]);
    await queryInterface.addIndex("project_documents", ["document_type"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("project_documents");
    await queryInterface.dropTable("property_images");
  },
};
