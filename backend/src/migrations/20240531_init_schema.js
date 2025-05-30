'use strict';

module.exports = {
  up: async (queryInterface) => {
    // Add phone verification columns
    const userTable = await queryInterface.describeTable('users');
    if (!userTable.phone_verification_code) {
      await queryInterface.addColumn('users', 'phone_verification_code', {
        type: queryInterface.sequelize.Sequelize.STRING(10),
        allowNull: true
      });
    }
    if (!userTable.pending_phone) {
      await queryInterface.addColumn('users', 'pending_phone', {
        type: queryInterface.sequelize.Sequelize.STRING(32),
        allowNull: true
      });
    }
    if (!userTable.verification_code_expires) {
      await queryInterface.addColumn('users', 'verification_code_expires', {
        type: queryInterface.sequelize.Sequelize.DATE,
        allowNull: true
      });
    }
    if (!userTable.last_phone_change) {
      await queryInterface.addColumn('users', 'last_phone_change', {
        type: queryInterface.sequelize.Sequelize.DATE,
        allowNull: true
      });
    }
    // Add email verification columns
    if (!userTable.pending_email) {
      await queryInterface.addColumn('users', 'pending_email', {
        type: queryInterface.sequelize.Sequelize.STRING,
        allowNull: true
      });
    }
    if (!userTable.email_verification_code) {
      await queryInterface.addColumn('users', 'email_verification_code', {
        type: queryInterface.sequelize.Sequelize.STRING(10),
        allowNull: true
      });
    }
    if (!userTable.email_verification_expires) {
      await queryInterface.addColumn('users', 'email_verification_expires', {
        type: queryInterface.sequelize.Sequelize.DATE,
        allowNull: true
      });
    }
    if (!userTable.last_email_change) {
      await queryInterface.addColumn('users', 'last_email_change', {
        type: queryInterface.sequelize.Sequelize.DATE,
        allowNull: true
      });
    }
    // Create projects table
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('projects')) {
      await queryInterface.createTable('projects', {
        id: {
          type: queryInterface.sequelize.Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        name: {
          type: queryInterface.sequelize.Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: queryInterface.sequelize.Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: queryInterface.sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: queryInterface.sequelize.Sequelize.DATE,
          allowNull: false,
          defaultValue: queryInterface.sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'phone_verification_code');
    await queryInterface.removeColumn('users', 'pending_phone');
    await queryInterface.removeColumn('users', 'verification_code_expires');
    await queryInterface.removeColumn('users', 'last_phone_change');
    await queryInterface.removeColumn('users', 'pending_email');
    await queryInterface.removeColumn('users', 'email_verification_code');
    await queryInterface.removeColumn('users', 'email_verification_expires');
    await queryInterface.removeColumn('users', 'last_email_change');
    await queryInterface.dropTable('projects');
  }
}; 