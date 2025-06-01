"use strict";

const { DataTypes } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if wallet_transactions table exists
    const tables = await queryInterface.showAllTables();

    if (!tables.includes("wallet_transactions")) {
      // Create wallet_transactions table for PayMe integration
      await queryInterface.createTable("wallet_transactions", {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        transaction_id: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        transaction_type: {
          type: DataTypes.ENUM("deposit", "withdrawal", "refund"),
          allowNull: false,
        },
        payment_method: {
          type: DataTypes.STRING(50),
          allowNull: false,
        },
        amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: false,
        },
        currency: {
          type: DataTypes.STRING(3),
          defaultValue: "TND",
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM("pending", "completed", "failed", "cancelled"),
          defaultValue: "pending",
          allowNull: false,
        },
        user_address: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },

        // PayMe specific fields
        payme_token: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        payme_order_id: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        payme_transaction_id: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },

        // Customer information
        customer_email: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        customer_phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        customer_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },

        // Withdrawal specific fields
        withdrawal_id: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        fees: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
          defaultValue: 0,
        },
        net_amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        bank_account_info: {
          type: DataTypes.JSON,
          allowNull: true,
        },

        // Webhook and processing fields
        received_amount: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        transaction_fee: {
          type: DataTypes.DECIMAL(15, 2),
          allowNull: true,
        },
        webhook_data: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        completed_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },

        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });

      // Add indexes for better performance
      try {
        await queryInterface.addIndex(
          "wallet_transactions",
          ["transaction_id"],
          {
            name: "wallet_transactions_transaction_id_idx",
          }
        );
        await queryInterface.addIndex("wallet_transactions", ["user_address"], {
          name: "wallet_transactions_user_address_idx",
        });
        await queryInterface.addIndex("wallet_transactions", ["payme_token"], {
          name: "wallet_transactions_payme_token_idx",
        });
        await queryInterface.addIndex(
          "wallet_transactions",
          ["transaction_type"],
          {
            name: "wallet_transactions_type_idx",
          }
        );
        await queryInterface.addIndex("wallet_transactions", ["status"], {
          name: "wallet_transactions_status_idx",
        });
        await queryInterface.addIndex("wallet_transactions", ["created_at"], {
          name: "wallet_transactions_created_at_idx",
        });
      } catch (error) {
        console.log("Some indexes may already exist, continuing...");
      }

      console.log("✅ wallet_transactions table created successfully");
    } else {
      console.log("ℹ️ wallet_transactions table already exists, skipping...");
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("wallet_transactions");
  },
};
