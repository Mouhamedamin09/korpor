const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add currency column
    await queryInterface.addColumn("investments", "currency", {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: "TND",
    });

    // Add payment_method column
    await queryInterface.addColumn("investments", "payment_method", {
      type: DataTypes.ENUM("wallet", "card", "bank_transfer"),
      defaultValue: "wallet",
      allowNull: false,
    });

    // Add transaction_id column for wallet transactions
    await queryInterface.addColumn("investments", "transaction_id", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "transactions",
        key: "id",
      },
    });

    // Add investment_date column
    await queryInterface.addColumn("investments", "investment_date", {
      type: DataTypes.DATE,
      allowNull: true,
    });

    // Add metadata column for additional investment data
    await queryInterface.addColumn("investments", "metadata", {
      type: DataTypes.JSON,
      allowNull: true,
    });

    // Add index for transaction_id
    await queryInterface.addIndex("investments", ["transaction_id"], {
      name: "idx_investments_transaction_id",
    });
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
