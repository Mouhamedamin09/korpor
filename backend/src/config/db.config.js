require("dotenv").config();
//let nodejs interact with Myql
const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");

// Get database credentials from GCP Secret Manager environment variables
const DB_USER = process.env["korpor-db-user"] || process.env.DB_USER || "root";
const DB_PASSWORD =
  process.env["korpor-db-password"] || process.env.DB_PASSWORD || "";
const DB_NAME =
  process.env["korpor-db-name"] || process.env.DB_NAME || "korpor_dev";
const INSTANCE_CONNECTION_NAME =
  process.env["korpor-db-instance-connection-name"] ||
  process.env.INSTANCE_CONNECTION_NAME;

// Only set direct connection variables if not using Cloud SQL
const DB_HOST = !INSTANCE_CONNECTION_NAME ? process.env.DB_HOST : null;
const DB_PORT = !INSTANCE_CONNECTION_NAME ? process.env.DB_PORT || 3306 : null;

// Log database connection attempt
console.log("Initializing database connection with the following settings:");
console.log(`- Database: ${DB_NAME}`);
console.log(`- User: ${DB_USER}`);
if (INSTANCE_CONNECTION_NAME) {
  console.log(`- Cloud SQL Instance: ${INSTANCE_CONNECTION_NAME}`);
} else {
  console.log(`- Host: ${DB_HOST}`);
  console.log(`- Port: ${DB_PORT}`);
  console.log("- Using direct database connection ");
}

// Sequelize setup with improved configuration
const sequelizeConfig = {
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 60000, // 60 second timeout for acquiring connection
    idle: 10000,
  },
  define: {
    underscored: true, // Converts camelCase field names to snake_case in the DB exp(createdAt,createdat)
    timestamps: true, // Adds createdAt and updatedAt columns to the table
    paranoid: false, // Adds deletedAt column to the table
  },
  dialectOptions: {
    connectTimeout: 60000, // 60 second timeout
  },
  retry: {
    max: 3, // Retry connection up to 3 times
  },
};

// Configure for Cloud SQL if instance name is provided
if (INSTANCE_CONNECTION_NAME) {
  console.log(`Using Cloud SQL instance: ${INSTANCE_CONNECTION_NAME}`);
  sequelizeConfig.dialectOptions = {
    ...sequelizeConfig.dialectOptions,
    socketPath: `/cloudsql/${INSTANCE_CONNECTION_NAME}`,
  };
} else {
  console.log("Using direct database connection");
  sequelizeConfig.host = DB_HOST;
  sequelizeConfig.port = DB_PORT;
}

// Create Sequelize instance with proper configuration
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, sequelizeConfig);

// Create raw SQL pool only when needed
const createPool = () => {
  const poolConfig = {
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // 60 second timeout
  };

  // Configure for Cloud SQL if instance name is provided
  if (INSTANCE_CONNECTION_NAME) {
    poolConfig.socketPath = `/cloudsql/${INSTANCE_CONNECTION_NAME}`;
  } else {
    poolConfig.host = DB_HOST;
    poolConfig.port = DB_PORT;
  }

  return mysql.createPool(poolConfig);
};

// Initialize pool lazily when needed
let pool;

// Enhanced test connection method for Sequelize with more detailed logging
const testConnection = async () => {
  try {
    console.log("Testing database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    return true;
  } catch (error) {
    console.error("❌ Unable to connect to the database:");
    console.error(`- Error type: ${error.name}`);
    console.error(`- Error message: ${error.message}`);

    // Add specific error handling for common issues
    if (error.name === "SequelizeConnectionRefusedError") {
      console.error(
        "The database server refused the connection. Please check if the database server is running."
      );
    } else if (error.name === "SequelizeHostNotFoundError") {
      console.error(
        "The database host could not be found. Please check your DB_HOST setting."
      );
    } else if (error.name === "SequelizeAccessDeniedError") {
      console.error(
        "Access denied. Please check your database username and password."
      );
    } else if (error.name === "SequelizeConnectionTimedOutError") {
      console.error(
        "Connection timed out. Please check network connectivity to the database."
      );
    }

    // Recommend checking Cloud SQL proxy if using Cloud SQL
    if (INSTANCE_CONNECTION_NAME) {
      console.error(
        "For Cloud SQL connections, verify that the instance connection name is correct and the service account has proper permissions."
      );
    }

    throw error;
  }
};

// Execute raw SQL query
//to ghassen(hethi taamel execute lel query lel raw) , in normal ways when user called a data base connection it creates new connection but in pool we create 5 ready connection to reuse them with multiple request this will help to reduce the time of connection and improve the performance
const rawQuery = async (sql, params) => {
  try {
    // Initialize pool if not already created
    if (!pool) {
      pool = createPool();
    }
    return await pool.execute(sql, params);
  } catch (error) {
    console.error(`❌ Raw query error: ${error.message}`);
    throw error;
  }
};

// Export database connection and utility functions
module.exports = {
  sequelize,
  testConnection,
  rawQuery,
  ormQuery: (...args) => sequelize.query(...args),
  // Export connection details for health check
  connectionDetails: {
    database: DB_NAME,
    user: DB_USER,
    instance: INSTANCE_CONNECTION_NAME,
    usingCloudSQL: !!INSTANCE_CONNECTION_NAME,
  },
};
