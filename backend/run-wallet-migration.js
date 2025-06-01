const { sequelize } = require("./src/config/db.config");
const migration = require("./src/migrations/create-wallet-transactions-table.js");

async function runWalletMigration() {
  try {
    console.log("🔄 Starting wallet_transactions table migration...");

    await migration.up(sequelize.getQueryInterface(), sequelize);

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runWalletMigration();
