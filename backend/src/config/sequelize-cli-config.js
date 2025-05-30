require('dotenv').config();

module.exports = {
  development: {
    username: process.env["korpor-db-user"] || process.env.DB_USER || "root",
    password: process.env["korpor-db-password"] || process.env.DB_PASSWORD || "",
    database: process.env["korpor-db-name"] || process.env.DB_NAME || "korpor_dev",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql"
  }
  // You can add test and production configs here if needed
}; 