const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const AutoInvest = sequelize.define(
  "AutoInvest",
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
      references: {
        model: "users",
        key: "id",
      },
    },
    monthlyAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: "monthly_amount",
    },
    currency: {
      type: DataTypes.ENUM("TND", "EUR"),
      defaultValue: "TND",
      allowNull: false,
    },
    theme: {
      type: DataTypes.ENUM("growth", "income", "index", "balanced"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "paused", "cancelled"),
      defaultValue: "active",
      allowNull: false,
    },
    depositDay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "deposit_day",
      validate: {
        min: 1,
        max: 28,
      },
    },
    paymentMethodId: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: "payment_method_id",
    },
    lastDepositDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_deposit_date",
    },
    nextDepositDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "next_deposit_date",
    },
    totalDeposited: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: "total_deposited",
    },
    totalInvested: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: "total_invested",
    },
    autoInvestEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "auto_invest_enabled",
    },
    minInvestmentAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 500.0,
      field: "min_investment_amount",
    },
    maxInvestmentPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 25.0,
      field: "max_investment_percentage",
    },
    riskLevel: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium",
      field: "risk_level",
    },
    preferredRegions: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "preferred_regions",
    },
    excludedPropertyTypes: {
      type: DataTypes.JSON,
      allowNull: true,
      field: "excluded_property_types",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    tableName: "auto_invest_plans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
AutoInvest.associate = function (models) {
  // AutoInvest belongs to User
  AutoInvest.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });

  // AutoInvest has many Transactions (investment records)
  if (models.Transaction) {
    AutoInvest.hasMany(models.Transaction, {
      foreignKey: "autoInvestPlanId",
      as: "transactions",
    });
  }
};

module.exports = AutoInvest;
