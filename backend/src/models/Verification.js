const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Verification = sequelize.define('Verification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Identity verification (passport + selfie)
  identityStatus: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  passportImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  selfieImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  identitySubmittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  identityReviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  identityRejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Address verification
  addressStatus: {
    type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected'),
    defaultValue: 'pending'
  },
  addressImageUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressSubmittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  addressReviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  addressRejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Overall verification status
  overallStatus: {
    type: DataTypes.ENUM('incomplete', 'under_review', 'verified', 'rejected'),
    defaultValue: 'incomplete'
  },
  
  // Backoffice integration
  backofficeRequestId: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'verifications',
  timestamps: true,
  underscored: true
});

module.exports = Verification; 