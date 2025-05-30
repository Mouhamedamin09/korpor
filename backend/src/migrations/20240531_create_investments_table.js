'use strict';

module.exports = {
  up: async (queryInterface) => {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('investments')) {
      await queryInterface.createTable('investments', {
        id: {
          type: queryInterface.sequelize.Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false
        },
        user_id: {
          type: queryInterface.sequelize.Sequelize.INTEGER,
          allowNull: false
        },
        project_id: {
          type: queryInterface.sequelize.Sequelize.INTEGER,
          allowNull: false
        },
        amount: {
          type: queryInterface.sequelize.Sequelize.DECIMAL(15, 2),
          allowNull: false
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
    await queryInterface.dropTable('investments');
  }
}; 