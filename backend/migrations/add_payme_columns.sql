-- Migration: Add PayMe columns to payments table
-- Based on PayMe.tn API documentation at https://www.paymee.tn/paymee-integration-without-redirection/

-- Add PayMe-specific columns
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS payme_token VARCHAR(255) NULL AFTER crypto_currency,
ADD COLUMN IF NOT EXISTS payme_order_id VARCHAR(255) NULL AFTER payme_token,
ADD COLUMN IF NOT EXISTS payme_transaction_id INT NULL AFTER payme_order_id,
ADD COLUMN IF NOT EXISTS received_amount DECIMAL(10,2) NULL AFTER payme_transaction_id,
ADD COLUMN IF NOT EXISTS transaction_fee DECIMAL(10,2) NULL AFTER received_amount,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) NULL AFTER transaction_fee,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50) NULL AFTER customer_email,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) NULL AFTER customer_phone,
ADD COLUMN IF NOT EXISTS webhook_data JSON NULL AFTER customer_name;

-- Add indexes for PayMe columns
ALTER TABLE payments 
ADD INDEX IF NOT EXISTS idx_payme_token (payme_token),
ADD INDEX IF NOT EXISTS idx_payme_order_id (payme_order_id),
ADD INDEX IF NOT EXISTS idx_customer_email (customer_email);

-- Add comments for PayMe columns
ALTER TABLE payments 
MODIFY COLUMN payme_token VARCHAR(255) NULL COMMENT 'PayMe payment token from API response',
MODIFY COLUMN payme_order_id VARCHAR(255) NULL COMMENT 'PayMe order ID',
MODIFY COLUMN payme_transaction_id INT NULL COMMENT 'PayMe transaction ID from webhook',
MODIFY COLUMN received_amount DECIMAL(10,2) NULL COMMENT 'Amount received after fees',
MODIFY COLUMN transaction_fee DECIMAL(10,2) NULL COMMENT 'PayMe transaction fee',
MODIFY COLUMN customer_email VARCHAR(255) NULL COMMENT 'Customer email address',
MODIFY COLUMN customer_phone VARCHAR(50) NULL COMMENT 'Customer phone number',
MODIFY COLUMN customer_name VARCHAR(255) NULL COMMENT 'Customer full name',
MODIFY COLUMN webhook_data JSON NULL COMMENT 'Raw webhook data from PayMe'; 