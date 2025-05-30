const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add currency and referral fields to users table
    await queryInterface.addColumn('users', 'currency', {
      type: DataTypes.ENUM('TND', 'EUR'),
      defaultValue: 'TND',
      allowNull: false,
    });

    await queryInterface.addColumn('users', 'referral_code', {
      type: DataTypes.STRING(20),
      allowNull: true,
      unique: true,
    });

    await queryInterface.addColumn('users', 'referred_by', {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    });

    await queryInterface.addColumn('users', 'referral_stats', {
      type: DataTypes.JSON,
      defaultValue: {
        totalReferred: 0,
        totalInvested: 0,
        totalEarned: 0
      },
    });

    // Create referrals table
    await queryInterface.createTable("referrals", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      referrer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      referee_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'qualified', 'rewarded'),
        defaultValue: 'pending',
        allowNull: false,
      },
      referee_investment_amount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      referrer_reward: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      referee_reward: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      currency: {
        type: DataTypes.ENUM('TND', 'EUR'),
        allowNull: false,
      },
      qualified_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rewarded_at: {
        type: DataTypes.DATE,
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
    await queryInterface.addIndex('users', ['referral_code'], {
      name: 'idx_users_referral_code'
    });
    await queryInterface.addIndex('users', ['referred_by'], {
      name: 'idx_users_referred_by'
    });
    await queryInterface.addIndex('referrals', ['referrer_id'], {
      name: 'idx_referrals_referrer_id'
    });
    await queryInterface.addIndex('referrals', ['referee_id'], {
      name: 'idx_referrals_referee_id'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('users', 'idx_users_referral_code');
    await queryInterface.removeIndex('users', 'idx_users_referred_by');
    await queryInterface.removeIndex('referrals', 'idx_referrals_referrer_id');
    await queryInterface.removeIndex('referrals', 'idx_referrals_referee_id');

    // Drop referrals table
    await queryInterface.dropTable('referrals');

    // Remove columns from users table
    await queryInterface.removeColumn('users', 'currency');
    await queryInterface.removeColumn('users', 'referral_code');
    await queryInterface.removeColumn('users', 'referred_by');
    await queryInterface.removeColumn('users', 'referral_stats');
  }
}; 