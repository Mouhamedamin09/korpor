require('dotenv').config();
const mysql = require('mysql2/promise');

async function addColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'korpor_db',
  });

  const sql = `ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(10),
    ADD COLUMN IF NOT EXISTS pending_phone VARCHAR(32),
    ADD COLUMN IF NOT EXISTS verification_code_expires DATETIME,
    ADD COLUMN IF NOT EXISTS last_phone_change DATETIME;`;

  try {
    await connection.query(sql);
    console.log('✅ Columns added successfully!');
  } catch (err) {
    console.error('❌ Failed to add columns:', err.message);
  } finally {
    await connection.end();
  }
}

addColumns(); 