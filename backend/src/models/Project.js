const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");

/**
 * Project/Property model definition
 */
const Project = sequelize.define(
  "Project",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    goal_amount: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
    current_amount: {
      type: DataTypes.DECIMAL(18, 2),
      defaultValue: 0.0,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "Pending",
        "Active",
        "Funded",
        "Completed",
        "Cancelled",
      ),
      defaultValue: "Pending",
      allowNull: false,
    },
    property_status: {
      type: DataTypes.ENUM("available", "under_review", "sold_out", "rented"),
      defaultValue: "under_review",
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    coordinates: {
      type: DataTypes.GEOMETRY("POINT"),
      allowNull: true,
    },
    address_details: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    property_size: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    property_type: {
      type: DataTypes.ENUM("residential", "commercial", "industrial", "land"),
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    construction_year: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    amenities: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    expected_roi: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    rental_yield: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
    },
    investment_period: {
      type: DataTypes.INTEGER,
      comment: "In months",
      allowNull: true,
    },
    minimum_investment: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    cloudinary_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    tableName: "projects",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "idx_project_status",
        fields: ["status"],
      },
      {
        name: "idx_featured",
        fields: ["featured"],
      },
    ],
  },
);

module.exports = Project;
