-- Update payments table to support multiple payment methods
-- Run this migration to add new columns for comprehensive payment support

-- Add new columns if they don't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'payme',
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'TND',
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS crypto_address VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS crypto_currency VARCHAR(10) NULL,
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
-- PayMe specific fields
ADD COLUMN IF NOT EXISTS payme_token VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS payme_order_id VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS payme_transaction_id INT NULL,
ADD COLUMN IF NOT EXISTS received_amount DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS transaction_fee DECIMAL(10,2) NULL,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS webhook_data JSON NULL;

-- Update existing status enum to include more states
ALTER TABLE payments 
MODIFY COLUMN status ENUM('pending', 'confirmed', 'completed', 'failed', 'expired', 'cancelled', 'refunded') DEFAULT 'pending';

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_address ON payments(user_address);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer ON payments(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_crypto_currency ON payments(crypto_currency);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
-- PayMe indexes
CREATE INDEX IF NOT EXISTS idx_payments_payme_token ON payments(payme_token);
CREATE INDEX IF NOT EXISTS idx_payments_payme_order_id ON payments(payme_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payme_transaction_id ON payments(payme_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);

-- Create investments table if it doesn't exist (for backward compatibility)
CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL,
    user_address VARCHAR(42) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    paymee_ref VARCHAR(100) NULL,
    payment_id VARCHAR(100) NULL,
    tx_hash VARCHAR(66) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_investments_project (project_id),
    INDEX idx_investments_user (user_address),
    INDEX idx_investments_status (status),
    INDEX idx_investments_paymee_ref (paymee_ref),
    INDEX idx_investments_payment_id (payment_id)
);

-- Sample data to test the new structure (optional - remove in production)
-- INSERT INTO payments (
--     payment_id, payment_method, amount, currency, status, 
--     user_address, project_id, created_at
-- ) VALUES 
-- ('test_stripe_001', 'stripe', 100.00, 'USD', 'pending', '0x742d35cc6634c0532925a3b844bc454e4438f44e', 1, NOW()),
-- ('test_crypto_001', 'crypto', 0.05, 'ETH', 'pending', '0x742d35cc6634c0532925a3b844bc454e4438f44e', 1, NOW()),
-- ('test_payme_001', 'payme', 150.00, 'TND', 'confirmed', '0x742d35cc6634c0532925a3b844bc454e4438f44e', 1, NOW());

-- Show the updated table structure
DESCRIBE payments; 