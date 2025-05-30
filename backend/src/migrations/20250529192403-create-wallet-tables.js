'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if wallets table exists
    const tables = await queryInterface.showAllTables();
    
    if (!tables.includes('wallets')) {
      // Create wallets table
      await queryInterface.createTable('wallets', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        cash_balance: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0.00,
          allowNull: false
        },
        rewards_balance: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0.00,
          allowNull: false
        },
        currency: {
          type: Sequelize.ENUM('USD', 'EUR', 'TND'),
          defaultValue: 'TND',
          allowNull: false
        },
        last_transaction_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
    }

    if (!tables.includes('transactions')) {
      // Create transactions table
      await queryInterface.createTable('transactions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        wallet_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'wallets',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        type: {
          type: Sequelize.ENUM('deposit', 'withdrawal', 'reward', 'investment', 'rent_payout', 'referral_bonus'),
          allowNull: false
        },
        amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false
        },
        currency: {
          type: Sequelize.ENUM('USD', 'EUR', 'TND'),
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('pending', 'completed', 'failed', 'cancelled'),
          defaultValue: 'pending',
          allowNull: false
        },
        description: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        reference: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        balance_type: {
          type: Sequelize.ENUM('cash', 'rewards'),
          allowNull: false
        },
        metadata: {
          type: Sequelize.JSON,
          allowNull: true
        },
        processed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });

      // Add indexes for better performance (only if table was just created)
      try {
        await queryInterface.addIndex('transactions', ['user_id'], {
          name: 'transactions_user_id_idx'
        });
        await queryInterface.addIndex('transactions', ['wallet_id'], {
          name: 'transactions_wallet_id_idx'
        });
        await queryInterface.addIndex('transactions', ['type'], {
          name: 'transactions_type_idx'
        });
        await queryInterface.addIndex('transactions', ['status'], {
          name: 'transactions_status_idx'
        });
        await queryInterface.addIndex('transactions', ['created_at'], {
          name: 'transactions_created_at_idx'
        });
      } catch (error) {
        console.log('Some indexes may already exist, continuing...');
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('wallets');
  }
};
