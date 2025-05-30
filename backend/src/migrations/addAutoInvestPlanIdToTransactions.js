const { sequelize } = require("../config/db.config");

/**
 * Migration to add auto_invest_plan_id column to transactions table
 * This handles the case where the column doesn't exist in existing databases
 */
async function addAutoInvestPlanIdColumn() {
  try {
    console.log(
      "🔄 Checking if auto_invest_plan_id column exists in transactions table..."
    );

    // Check if column already exists
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'transactions' 
      AND COLUMN_NAME = 'auto_invest_plan_id'
    `);

    const columnExists = results[0].count > 0;

    if (columnExists) {
      console.log(
        "✅ auto_invest_plan_id column already exists in transactions table"
      );
      return;
    }

    console.log(
      "📝 Adding auto_invest_plan_id column to transactions table..."
    );

    // Add the column
    await sequelize.query(`
      ALTER TABLE transactions 
      ADD COLUMN auto_invest_plan_id INT NULL 
      AFTER wallet_id
    `);

    console.log("✅ Successfully added auto_invest_plan_id column");

    // Add foreign key constraint
    console.log("📝 Adding foreign key constraint...");
    await sequelize.query(`
      ALTER TABLE transactions 
      ADD CONSTRAINT fk_transactions_auto_invest_plan 
      FOREIGN KEY (auto_invest_plan_id) 
      REFERENCES auto_invest_plans(id) 
      ON DELETE SET NULL 
      ON UPDATE CASCADE
    `);

    console.log("✅ Successfully added foreign key constraint");

    // Add index
    console.log("📝 Adding index on auto_invest_plan_id...");
    await sequelize.query(`
      CREATE INDEX idx_transactions_auto_invest_plan_id 
      ON transactions(auto_invest_plan_id)
    `);

    console.log("✅ Successfully added index on auto_invest_plan_id");
  } catch (error) {
    console.error("❌ Error in auto_invest_plan_id migration:", error);

    // Check if it's just a duplicate key/constraint error (which is fine)
    if (
      error.original &&
      (error.original.code === "ER_DUP_KEYNAME" ||
        error.original.code === "ER_FK_DUP_NAME" ||
        error.original.sqlMessage?.includes("Duplicate key name") ||
        error.original.sqlMessage?.includes(
          "Duplicate foreign key constraint name"
        ))
    ) {
      console.log("✅ Column/constraint already exists - skipping");
      return;
    }

    throw error;
  }
}

module.exports = { addAutoInvestPlanIdColumn };
