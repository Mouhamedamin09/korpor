const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db.config');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  referrerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "referrer_id",
    references: {
      model: 'users',
      key: 'id'
    }
  },
  refereeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: "referee_id",
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'qualified', 'rewarded'),
    defaultValue: 'pending',
    allowNull: false
  },
  refereeInvestmentAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: "referee_investment_amount"
  },
  referrerReward: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: "referrer_reward"
  },
  refereeReward: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: "referee_reward"
  },
  currency: {
    type: DataTypes.ENUM('TND', 'EUR'),
    allowNull: false
  },
  qualifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "qualified_at"
  },
  rewardedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: "rewarded_at"
  }
}, {
  tableName: 'referrals',
  timestamps: true,
  underscored: true
});

module.exports = Referral; 