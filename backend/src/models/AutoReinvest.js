const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const AutoReinvest = sequelize.define(
  "AutoReinvest",
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
    status: {
      type: DataTypes.ENUM("active", "paused", "cancelled"),
      defaultValue: "active",
      allowNull: false,
    },
    minimumReinvestAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 100.0,
      field: "minimum_reinvest_amount",
    },
    reinvestPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 100.0, // 100% of rental income by default
      field: "reinvest_percentage",
      validate: {
        min: 0,
        max: 100,
      },
    },
    theme: {
      type: DataTypes.ENUM(
        "growth",
        "income",
        "index",
        "balanced",
        "diversified"
      ),
      defaultValue: "balanced",
      allowNull: false,
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
    totalRentalIncome: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: "total_rental_income",
    },
    totalReinvested: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: "total_reinvested",
    },
    pendingReinvestAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: "pending_reinvest_amount",
    },
    lastReinvestDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_reinvest_date",
    },
    reinvestmentFrequency: {
      type: DataTypes.ENUM("immediate", "weekly", "monthly"),
      defaultValue: "monthly",
      field: "reinvestment_frequency",
    },
    autoApprovalEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "auto_approval_enabled",
    },
    maxReinvestPercentagePerProject: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 25.0,
      field: "max_reinvest_percentage_per_project",
      validate: {
        min: 1,
        max: 100,
      },
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
    tableName: "auto_reinvest_plans",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
AutoReinvest.associate = function (models) {
  // AutoReinvest belongs to User
  AutoReinvest.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });

  // AutoReinvest has many Transactions (reinvestment records)
  if (models.Transaction) {
    AutoReinvest.hasMany(models.Transaction, {
      foreignKey: "autoReinvestPlanId",
      as: "reinvestmentTransactions",
    });
  }
};

module.exports = AutoReinvest;
