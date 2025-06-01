const { rawQuery } = require("./src/config/db.config");

async function createTables() {
  try {
    console.log("Creating saved_payment_methods table...");

    // Create saved_payment_methods table
    const createSavedPaymentMethodsSQL = `
      CREATE TABLE IF NOT EXISTS saved_payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(100) NOT NULL,
        type ENUM('stripe', 'payme', 'apple_pay', 'google_pay') NOT NULL DEFAULT 'stripe',
        
        -- Stripe specific fields
        stripe_payment_method_id VARCHAR(100) NULL,
        stripe_customer_id VARCHAR(100) NULL,
        
        -- Card details for display
        card_brand VARCHAR(20) NULL,
        card_last4 VARCHAR(4) NULL,
        card_exp_month INT NULL,
        card_exp_year INT NULL,
        
        -- PayMe specific fields (for future use)
        payme_phone_number VARCHAR(20) NULL,
        payme_account_name VARCHAR(100) NULL,
        
        -- Google Pay specific fields (for future use)
        google_pay_token TEXT NULL,
        
        -- Apple Pay specific fields (for future use)
        apple_pay_token TEXT NULL,
        
        -- Settings
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        
        -- Timestamps
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        
        -- Indexes
        INDEX idx_user_id (user_id),
        INDEX idx_stripe_payment_method (stripe_payment_method_id),
        INDEX idx_stripe_customer (stripe_customer_id),
        INDEX idx_user_default (user_id, is_default),
        INDEX idx_active (is_active),
        INDEX idx_deleted (deleted_at),
        
        -- Constraints
        UNIQUE KEY unique_stripe_payment_method (stripe_payment_method_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await rawQuery(createSavedPaymentMethodsSQL, []);
    console.log("✅ saved_payment_methods table created successfully");

    // Create index for better performance
    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_user_active_methods 
      ON saved_payment_methods (user_id, is_active, deleted_at);
    `;
    await rawQuery(createIndexSQL, []);
    console.log("✅ Additional index created successfully");

    console.log("Creating payments table if not exists...");

    // Create payments table if it doesn't exist
    const createPaymentsSQL = `
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        payment_id VARCHAR(100) NOT NULL UNIQUE,
        payment_method ENUM('stripe', 'payme', 'crypto') NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) NOT NULL,
        status ENUM('pending', 'confirmed', 'failed', 'expired', 'cancelled', 'refunded') DEFAULT 'pending',
        user_address VARCHAR(42) NOT NULL,
        user_id VARCHAR(100) NULL,
        project_id INT NULL,
        
        -- Stripe specific
        stripe_customer_id VARCHAR(100) NULL,
        stripe_payment_intent_id VARCHAR(100) NULL,
        saved_payment_method_id INT NULL,
        
        -- PayMe specific
        paymee_ref VARCHAR(100) NULL,
        
        -- Crypto specific
        crypto_address VARCHAR(100) NULL,
        crypto_currency VARCHAR(10) NULL,
        crypto_tx_hash VARCHAR(100) NULL,
        
        expires_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        -- Indexes
        INDEX idx_payment_id (payment_id),
        INDEX idx_user_address (user_address),
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
        INDEX idx_saved_payment_method (saved_payment_method_id),
        INDEX idx_crypto_tx (crypto_tx_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await rawQuery(createPaymentsSQL, []);
    console.log("✅ payments table created/verified successfully");

    // Check if tables exist now
    const [tables] = await rawQuery("SHOW TABLES LIKE ?", [
      "saved_payment_methods",
    ]);
    console.log("Tables check result:", tables);

    if (tables.length > 0) {
      console.log("✅ saved_payment_methods table verified!");
    } else {
      console.log("❌ saved_payment_methods table still not found");
    }

    console.log("🎉 All tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    process.exit();
  }
}

createTables();
