const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable("users");
      
      const columnsToAdd = [
        {
          name: "phone_verification_code",
          type: DataTypes.STRING(6),
        },
        {
          name: "verification_code_expires",
          type: DataTypes.DATE,
        },
        {
          name: "pending_phone",
          type: DataTypes.STRING(20),
        },
        {
          name: "last_phone_change",
          type: DataTypes.DATE,
        },
        {
          name: "email_verification_code",
          type: DataTypes.STRING(6),
        },
        {
          name: "email_verification_expires",
          type: DataTypes.DATE,
        },
        {
          name: "pending_email",
          type: DataTypes.STRING(254),
        },
        {
          name: "last_email_change",
          type: DataTypes.DATE,
        },
      ];

      for (const column of columnsToAdd) {
        try {
          if (!tableInfo[column.name]) {
            console.log(`Adding column: ${column.name}`);
            await queryInterface.addColumn("users", column.name, {
              type: column.type,
              allowNull: true,
            });
          } else {
            console.log(`Column ${column.name} already exists, skipping...`);
          }
        } catch (err) {
          if (err.name === 'SequelizeDatabaseError' && err.parent.code === 'ER_DUP_FIELDNAME') {
            console.log(`Column ${column.name} already exists (from error), skipping...`);
            continue;
          }
          throw err;
        }
      }
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableInfo = await queryInterface.describeTable("users");
      
      const columnsToRemove = [
        "phone_verification_code",
        "verification_code_expires",
        "pending_phone",
        "last_phone_change",
        "email_verification_code",
        "email_verification_expires",
        "pending_email",
        "last_email_change",
      ];

      for (const columnName of columnsToRemove) {
        try {
          if (tableInfo[columnName]) {
            console.log(`Removing column: ${columnName}`);
            await queryInterface.removeColumn("users", columnName);
          } else {
            console.log(`Column ${columnName} does not exist, skipping...`);
          }
        } catch (err) {
          console.error(`Error removing column ${columnName}:`, err.message);
          continue;
        }
      }
    } catch (error) {
      console.error('Rollback failed:', error);
      throw error;
    }
  },
}; 