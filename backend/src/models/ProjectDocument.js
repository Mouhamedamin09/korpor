const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");

/**
 * ProjectDocument model definition
 */
const ProjectDocument = sequelize.define(
  "ProjectDocument",
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    file_url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    cloudinary_public_id: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    document_type: {
      type: DataTypes.ENUM(
        "contract",
        "image",
        "title_deed",
        "financial_projection",
        "other",
      ),
      defaultValue: "other",
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "project_documents",
    timestamps: true,
    underscored: true,
  },
);

module.exports = ProjectDocument;
