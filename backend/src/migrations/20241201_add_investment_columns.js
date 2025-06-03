const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable("investments");

      // Add currency column if it doesn't exist
      if (!tableInfo.currency) {
        console.log("Adding currency column to investments table");
        await queryInterface.addColumn("investments", "currency", {
          type: DataTypes.STRING(3),
          allowNull: false,
          defaultValue: "TND",
        });
      } else {
        console.log(
          "Currency column already exists in investments table, skipping..."
        );
      }

      // Add payment_method column if it doesn't exist
      if (!tableInfo.payment_method) {
        console.log("Adding payment_method column to investments table");
        await queryInterface.addColumn("investments", "payment_method", {
          type: DataTypes.ENUM("wallet", "card", "bank_transfer"),
          defaultValue: "wallet",
          allowNull: false,
        });
      } else {
        console.log(
          "Payment_method column already exists in investments table, skipping..."
        );
      }

      // Add transaction_id column if it doesn't exist
      if (!tableInfo.transaction_id) {
        console.log("Adding transaction_id column to investments table");
        await queryInterface.addColumn("investments", "transaction_id", {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "transactions",
            key: "id",
          },
        });
      } else {
        console.log(
          "Transaction_id column already exists in investments table, skipping..."
        );
      }

      // Add investment_date column if it doesn't exist
      if (!tableInfo.investment_date) {
        console.log("Adding investment_date column to investments table");
        await queryInterface.addColumn("investments", "investment_date", {
          type: DataTypes.DATE,
          allowNull: true,
        });
      } else {
        console.log(
          "Investment_date column already exists in investments table, skipping..."
        );
      }

      // Add metadata column if it doesn't exist
      if (!tableInfo.metadata) {
        console.log("Adding metadata column to investments table");
        await queryInterface.addColumn("investments", "metadata", {
          type: DataTypes.JSON,
          allowNull: true,
        });
      } else {
        console.log(
          "Metadata column already exists in investments table, skipping..."
        );
      }

      // Add index for transaction_id with error handling
      try {
        await queryInterface.addIndex("investments", ["transaction_id"], {
          name: "idx_investments_transaction_id",
        });
      } catch (err) {
        if (!err.message.includes("Duplicate key name")) {
          throw err;
        }
        console.log(
          "Index idx_investments_transaction_id already exists, skipping..."
        );
      }
    } catch (error) {
      console.error("Investment columns migration failed:", error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex(
      "investments",
      "idx_investments_transaction_id"
    );

    // Remove columns
    await queryInterface.removeColumn("investments", "currency");
    await queryInterface.removeColumn("investments", "payment_method");
    await queryInterface.removeColumn("investments", "transaction_id");
    await queryInterface.removeColumn("investments", "investment_date");
    await queryInterface.removeColumn("investments", "metadata");
  },
};
