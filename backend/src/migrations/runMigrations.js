const { sequelize } = require("../utils/database");
const path = require("path");
const fs = require("fs");

async function runMigrations() {
  try {
    // Get all migration files
    const migrationFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith(".js") && file !== "runMigrations.js")
      .sort();

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(__dirname, file));
      await migration.up(sequelize.getQueryInterface(), sequelize);
      console.log(`Completed migration: ${file}`);
    }

    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations(); 