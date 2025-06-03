const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const Investment = sequelize.define(
  "Investment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "user_id",
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "project_id",
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "TND",
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "failed", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM("wallet", "card", "bank_transfer"),
      defaultValue: "wallet",
      allowNull: false,
      field: "payment_method",
    },
    userAddress: {
      type: DataTypes.STRING(42),
      allowNull: true,
      field: "user_address",
    },
    paymeeRef: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "paymee_ref",
    },
    paymentUrl: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "payment_url",
    },
    txHash: {
      type: DataTypes.STRING(66),
      allowNull: true,
      field: "tx_hash",
    },
    transactionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "transaction_id",
      comment: "Reference to wallet transaction",
    },
    investmentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "investment_date",
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Additional investment metadata",
    },
  },
  {
    tableName: "investments",
    timestamps: true,
    underscored: true,
    indexes: [
      {
        name: "idx_investments_user_id",
        fields: ["user_id"],
      },
      {
        name: "idx_investments_project_id",
        fields: ["project_id"],
      },
      {
        name: "idx_investments_status",
        fields: ["status"],
      },
    ],
  }
);

module.exports = Investment;
