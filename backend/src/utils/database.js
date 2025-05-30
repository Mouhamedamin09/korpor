const { Sequelize } = require("sequelize");
require("dotenv").config();

// Get database credentials from environment variables
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || process.env["korpor-db-user"] || "root";
const DB_PASSWORD =
  process.env.DB_PASSWORD || process.env["korpor-db-password"] || "";
const DB_NAME =
  process.env.DB_NAME || process.env["korpor-db-name"] || "korpor_dev";
const DB_PORT = process.env.DB_PORT || 3306;
const INSTANCE_CONNECTION_NAME =
  process.env.INSTANCE_CONNECTION_NAME ||
  process.env["korpor-db-instance-connection-name"];

// Create a proper configuration for Sequelize
const config = {
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  timezone: "+00:00",
  define: {
    underscored: true,
    timestamps: true,
    paranoid: false,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    decimalNumbers: true,
    connectTimeout: 60000,
  },
  retry: {
    max: 3,
  },
};

// Configure for Cloud SQL if instance name is provided
if (INSTANCE_CONNECTION_NAME) {
  console.log(
    `[database.js] Using Cloud SQL instance: ${INSTANCE_CONNECTION_NAME}`,
  );
  config.dialectOptions = {
    ...config.dialectOptions,
    socketPath: `/cloudsql/${INSTANCE_CONNECTION_NAME}`,
  };
} else {
  console.log("[database.js] Using direct database connection");
  config.host = DB_HOST;
  config.port = DB_PORT;
}

// Initialize Sequelize with configuration
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, config);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      "[database.js] Database connection has been established successfully.",
    );
    return true;
  } catch (error) {
    console.error("[database.js] Unable to connect to the database:", error);
    return false;
  }
};

// Export the sequelize instance and connection tester
module.exports = {
  sequelize,
  testConnection,
  Sequelize,
};
