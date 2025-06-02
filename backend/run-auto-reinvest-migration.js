const fs = require("fs");
const path = require("path");
const { sequelize } = require("./src/config/db.config");

async function runAutoReinvestMigration() {
  try {
    console.log("🔄 Running auto-reinvest migration...");

    // Read the migration SQL file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "create_auto_reinvest_tables.sql"
    );
    const migrationSql = fs.readFileSync(migrationPath, "utf8");

    // Split by semicolon and filter out empty statements
    const statements = migrationSql
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        console.log("Executing:", statement.trim().substring(0, 100) + "...");
        await sequelize.query(statement);
      }
    }

    console.log("✅ Auto-reinvest migration completed successfully!");

    // Test the new tables by checking if they exist
    const [results] = await sequelize.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('auto_reinvest_plans', 'rental_payouts')
    `);

    console.log(
      "📋 Created tables:",
      results.map((r) => r.TABLE_NAME).join(", ")
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the migration
runAutoReinvestMigration().catch((error) => {
  console.error("Migration error:", error);
  process.exit(1);
});
