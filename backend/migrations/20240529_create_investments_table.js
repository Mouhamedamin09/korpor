const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("investments", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'projects',
          key: 'id'
        }
      },
      amount: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'failed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false,
      },
      user_address: {
        type: DataTypes.STRING(42),
        allowNull: false,
      },
      paymee_ref: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      payment_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tx_hash: {
        type: DataTypes.STRING(66),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });

    // Add indexes
    await queryInterface.addIndex('investments', ['user_id'], {
      name: 'idx_investments_user_id'
    });
    await queryInterface.addIndex('investments', ['project_id'], {
      name: 'idx_investments_project_id'
    });
    await queryInterface.addIndex('investments', ['user_address'], {
      name: 'idx_investments_user_address'
    });
    await queryInterface.addIndex('investments', ['status'], {
      name: 'idx_investments_status'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('investments');
  }
}; 