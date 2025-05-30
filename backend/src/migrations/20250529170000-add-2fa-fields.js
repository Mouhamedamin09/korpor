'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if the columns exist before adding them
    const tableDesc = await queryInterface.describeTable('users');
    
    if (!tableDesc.twoFactorSecret) {
      await queryInterface.addColumn('users', 'twoFactorSecret', {
        type: queryInterface.sequelize.Sequelize.STRING(128),
        allowNull: true,
        comment: 'Base32 encoded TOTP secret for 2FA'
      });
    }

    if (!tableDesc.twoFactorEnabled) {
      await queryInterface.addColumn('users', 'twoFactorEnabled', {
        type: queryInterface.sequelize.Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether 2FA is enabled for this user'
      });
    }

    if (!tableDesc.backupCodes) {
      await queryInterface.addColumn('users', 'backupCodes', {
        type: queryInterface.sequelize.Sequelize.JSON,
        allowNull: true,
        comment: 'JSON array of backup codes for 2FA recovery'
      });
    }

    if (!tableDesc.twoFactorSetupAt) {
      await queryInterface.addColumn('users', 'twoFactorSetupAt', {
        type: queryInterface.sequelize.Sequelize.DATE,
        allowNull: true,
        comment: 'Timestamp when 2FA was first set up'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'twoFactorSecret');
    await queryInterface.removeColumn('users', 'twoFactorEnabled');
    await queryInterface.removeColumn('users', 'backupCodes');
    await queryInterface.removeColumn('users', 'twoFactorSetupAt');
  }
}; 