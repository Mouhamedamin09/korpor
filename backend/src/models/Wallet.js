const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Wallet = sequelize.define(
  "Wallet",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id'
      },
      field: "user_id",
    },
    cashBalance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      allowNull: false,
      field: "cash_balance",
    },
    rewardsBalance: {
      type: DataTypes.DECIMAL(15, 2), 
      defaultValue: 0.00,
      allowNull: false,
      field: "rewards_balance",
    },
    totalBalance: {
      type: DataTypes.VIRTUAL,
      get() {
        const cash = parseFloat(this.getDataValue('cashBalance')) || 0;
        const rewards = parseFloat(this.getDataValue('rewardsBalance')) || 0;
        return cash + rewards;
      }
    },
    currency: {
      type: DataTypes.ENUM('USD', 'EUR', 'TND'),
      defaultValue: 'TND',
      allowNull: false,
    },
    lastTransactionAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_transaction_at",
    }
  },
  {
    tableName: "wallets",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = Wallet; 