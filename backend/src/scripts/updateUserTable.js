const { sequelize } = require("../config/db.config");

const updateUserTable = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log("Database connection established.");

    // Add new columns
    await sequelize.query(`
      ALTER TABLE users
      ADD COLUMN phone VARCHAR(20) DEFAULT NULL,
      ADD COLUMN account_type VARCHAR(50) DEFAULT 'Individual Account',
      ADD COLUMN korpor_since DATETIME DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN intro TEXT,
      ADD COLUMN investment_used_pct FLOAT DEFAULT 0,
      ADD COLUMN investment_total DECIMAL(15,2) DEFAULT 0,
      ADD COLUMN global_users INT DEFAULT 0,
      ADD COLUMN global_countries INT DEFAULT 0
    `);

    console.log("Successfully updated users table with new columns!");

  } catch (error) {
    console.error("Error updating users table:", error);
  } finally {
    // Close database connection
    await sequelize.close();
  }
};

// Run the update function
updateUserTable(); 