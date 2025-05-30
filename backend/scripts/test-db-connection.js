#!/usr/bin/env node
require("dotenv").config();

/**
 * Database Connection Test Script
 *
 * This script tests the connection to the database using the configured
 * environment variables. It helps verify that your database connection
 * is working correctly.
 *
 * Usage:
 *   node scripts/test-db-connection.js
 */

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...");
  console.log("═════════════════════════════════════════\n");

  try {
    // Import the database configuration
    const {
      testConnection,
      connectionDetails,
      sequelize,
    } = require("../src/config/db.config");

    // Display the current configuration
    console.log("📋 Current Configuration:");
    console.log("───────────────────────────");

    // Connection type
    if (connectionDetails.usingCloudSQL) {
      console.log("🔹 Connection Type: Cloud SQL");
      console.log(`🔹 Instance: ${connectionDetails.instance}`);
    } else {
      console.log("🔹 Connection Type: Direct");
      console.log(`🔹 Host: ${process.env.DB_HOST || "localhost"}`);
      console.log(`🔹 Port: ${process.env.DB_PORT || "3306"}`);
    }

    console.log(`🔹 Database: ${connectionDetails.database}`);
    console.log(`🔹 User: ${connectionDetails.user}`);
    console.log("");

    // Log which environment variables are being used
    console.log("📋 Environment Variables:");
    console.log("───────────────────────────");

    const cloudSqlVars = [
      "korpor-db-instance-connection-name",
      "korpor-db-name",
      "korpor-db-user",
      "korpor-db-password",
    ];

    const directVars = [
      "DB_HOST",
      "DB_PORT",
      "DB_NAME",
      "DB_USER",
      "DB_PASSWORD",
    ];

    const allVars = [...cloudSqlVars, ...directVars];

    allVars.forEach((varName) => {
      const value = process.env[varName];
      const displayValue = varName.includes("password")
        ? value
          ? "********"
          : "❌ Not set"
        : value || "❌ Not set";

      console.log(`🔹 ${varName}: ${displayValue}`);
    });

    console.log("");

    // Test the connection
    console.log("🔄 Attempting connection...");
    await testConnection();

    // Log success
    console.log("\n✅ Connection successful!");

    // Get database version
    const [results] = await sequelize.query("SELECT version() as version");
    console.log(`\n📊 Database Version: ${results[0].version}`);

    // Get tables
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = :dbName AND table_type = 'BASE TABLE'",
      {
        replacements: { dbName: connectionDetails.database },
      },
    );

    console.log(
      `\n📊 Found ${tables.length} tables in database "${connectionDetails.database}":`,
    );
    console.log("───────────────────────────");

    // Get row counts for each table
    for (const table of tables) {
      const tableName = table.table_name || table.TABLE_NAME;
      try {
        const [result] = await sequelize.query(
          `SELECT COUNT(*) as count FROM \`${tableName}\``,
        );
        const count = result[0].count;
        console.log(`🔹 ${tableName}: ${count} rows`);
      } catch (err) {
        console.log(`🔹 ${tableName}: Error counting rows - ${err.message}`);
      }
    }

    // Exit successfully
    process.exit(0);
  } catch (error) {
    // Log error details
    console.error("\n❌ Connection failed!");
    console.error(`\nError: ${error.message}`);

    if (error.name) {
      console.error(`Error Type: ${error.name}`);
    }

    // Provide guidance based on error
    console.log("\n🔍 Troubleshooting Tips:");
    console.log("───────────────────────────");

    if (error.name === "SequelizeConnectionRefusedError") {
      console.log("• Check if your database server is running");
      console.log(
        "• Verify your firewall allows connections to the database port",
      );
    } else if (error.name === "SequelizeHostNotFoundError") {
      console.log("• Verify your DB_HOST environment variable is correct");
      console.log("• Check network connectivity to the database host");
    } else if (error.name === "SequelizeAccessDeniedError") {
      console.log("• Verify your database username and password are correct");
      console.log("• Check if the user has permission to access the database");
    } else if (error.name === "SequelizeConnectionTimedOutError") {
      console.log("• Check network connectivity to the database");
      console.log(
        "• Verify that the database server allows connections from your IP",
      );
    } else if (error.original && error.original.code === "ENOENT") {
      console.log(
        "• For Cloud SQL connections, check that the socket path exists",
      );
      console.log(
        "• Verify you have the Cloud SQL Auth Proxy running if testing locally",
      );
    }

    console.log(
      "\n• Double check your environment variables (GCP Secret Manager or .env file)",
    );
    console.log("• Check database server logs for more details");

    // Exit with error
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
