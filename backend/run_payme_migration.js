const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function runPaymeMigration() {
  try {
    console.log("🚀 Running PayMe migration...");

    // Use the same database config as the app
    const DB_NAME = process.env.DB_NAME || "korpor_dev";
    const DB_USER = process.env.DB_USER || "root";
    const DB_PASSWORD = process.env.DB_PASSWORD || "";
    const DB_HOST = process.env.DB_HOST || "localhost";
    const DB_PORT = process.env.DB_PORT || 3306;

    console.log(`Connecting to database: ${DB_NAME} at ${DB_HOST}:${DB_PORT}`);

    // Database connection (using same config as app)
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,
      multipleStatements: true,
    });

    console.log("✅ Connected to database");

    // Read the migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "add_payme_columns.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("📖 Migration SQL loaded");

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(";")
      .filter((stmt) => stmt.trim().length > 0);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        try {
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} completed`);
        } catch (error) {
          if (
            error.message.includes("Duplicate column name") ||
            error.message.includes("Duplicate key name")
          ) {
            console.log(
              `⚠️  Column/Index already exists (skipping): ${error.message}`
            );
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }

    await connection.end();
    console.log("🎉 PayMe migration completed successfully!");
    console.log("\n📋 PayMe columns added to payments table:");
    console.log("- payme_token (VARCHAR(255)) - PayMe payment token");
    console.log("- payme_order_id (VARCHAR(255)) - PayMe order ID");
    console.log(
      "- payme_transaction_id (INT) - PayMe transaction ID from webhook"
    );
    console.log(
      "- received_amount (DECIMAL(10,2)) - Amount received after fees"
    );
    console.log("- transaction_fee (DECIMAL(10,2)) - PayMe transaction fee");
    console.log("- customer_email (VARCHAR(255)) - Customer email");
    console.log("- customer_phone (VARCHAR(50)) - Customer phone");
    console.log("- customer_name (VARCHAR(255)) - Customer full name");
    console.log("- webhook_data (JSON) - Raw webhook data from PayMe");

    console.log("\n🚀 Ready to test PayMe payments!");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
}

runPaymeMigration();
