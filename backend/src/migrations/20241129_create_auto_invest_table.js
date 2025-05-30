'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('auto_invest_plans')) {
      await queryInterface.createTable('auto_invest_plans', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
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
        monthly_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false
        },
        currency: {
          type: Sequelize.ENUM('TND', 'EUR'),
          defaultValue: 'TND',
          allowNull: false
        },
        theme: {
          type: Sequelize.ENUM('growth', 'income', 'index', 'balanced'),
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('active', 'paused', 'cancelled'),
          defaultValue: 'active',
          allowNull: false
        },
        deposit_day: {
          type: Sequelize.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 28
          }
        },
        payment_method_id: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        last_deposit_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        next_deposit_date: {
          type: Sequelize.DATE,
          allowNull: true
        },
        total_deposited: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        total_invested: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        auto_invest_enabled: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        min_investment_amount: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 500.00
        },
        max_investment_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 25.00
        },
        risk_level: {
          type: Sequelize.ENUM('low', 'medium', 'high'),
          defaultValue: 'medium'
        },
        preferred_regions: {
          type: Sequelize.JSON,
          allowNull: true
        },
        excluded_property_types: {
          type: Sequelize.JSON,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
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

      // Create indexes for better query performance
      await queryInterface.addIndex('auto_invest_plans', ['user_id']);
      await queryInterface.addIndex('auto_invest_plans', ['status']);
      await queryInterface.addIndex('auto_invest_plans', ['next_deposit_date']);
      await queryInterface.addIndex('auto_invest_plans', ['theme']);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('auto_invest_plans');
  }
}; 