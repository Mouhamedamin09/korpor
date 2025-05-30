'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if investment_preference column exists
    const tableDesc = await queryInterface.describeTable('users');
    
    if (!tableDesc.investment_preference) {
      await queryInterface.addColumn('users', 'investment_preference', {
        type: queryInterface.sequelize.Sequelize.ENUM('all', 'local'),
        allowNull: false,
        defaultValue: 'all'
      });
    }

    if (!tableDesc.investment_region) {
      await queryInterface.addColumn('users', 'investment_region', {
        type: queryInterface.sequelize.Sequelize.ENUM('Tunisia', 'France'),
        allowNull: false,
        defaultValue: 'Tunisia'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('users');
    
    if (tableDesc.investment_preference) {
      await queryInterface.removeColumn('users', 'investment_preference');
    }
    
    if (tableDesc.investment_region) {
      await queryInterface.removeColumn('users', 'investment_region');
    }
  }
};
