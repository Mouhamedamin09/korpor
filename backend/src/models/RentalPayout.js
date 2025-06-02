const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db.config");

const RentalPayout = sequelize.define(
  "RentalPayout",
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
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "project_id",
      references: {
        model: "projects",
        key: "id",
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.ENUM("TND", "EUR"),
      defaultValue: "TND",
      allowNull: false,
    },
    payoutDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "payout_date",
    },
    isReinvested: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: "is_reinvested",
    },
    reinvestedAmount: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0,
      field: "reinvested_amount",
    },
    reinvestTransactionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "reinvest_transaction_id",
      references: {
        model: "transactions",
        key: "id",
      },
    },
    autoReinvestPlanId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "auto_reinvest_plan_id",
      references: {
        model: "auto_reinvest_plans",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "paid",
        "reinvested",
        "partially_reinvested"
      ),
      defaultValue: "pending",
      allowNull: false,
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
    tableName: "rental_payouts",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// Define associations
RentalPayout.associate = function (models) {
  // RentalPayout belongs to User
  RentalPayout.belongsTo(models.User, {
    foreignKey: "userId",
    as: "user",
  });

  // RentalPayout belongs to Project
  if (models.Project) {
    RentalPayout.belongsTo(models.Project, {
      foreignKey: "projectId",
      as: "project",
    });
  }

  // RentalPayout belongs to AutoReinvest plan
  if (models.AutoReinvest) {
    RentalPayout.belongsTo(models.AutoReinvest, {
      foreignKey: "autoReinvestPlanId",
      as: "autoReinvestPlan",
    });
  }

  // RentalPayout belongs to reinvestment Transaction
  if (models.Transaction) {
    RentalPayout.belongsTo(models.Transaction, {
      foreignKey: "reinvestTransactionId",
      as: "reinvestTransaction",
    });
  }
};

module.exports = RentalPayout;
