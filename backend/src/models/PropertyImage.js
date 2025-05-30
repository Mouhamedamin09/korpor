const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");

/**
 * PropertyImage model definition
 */
const PropertyImage = sequelize.define(
  "PropertyImage",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
  },
  {
    tableName: "property_images",
    timestamps: true,
    underscored: true,
  },
);

module.exports = PropertyImage;
