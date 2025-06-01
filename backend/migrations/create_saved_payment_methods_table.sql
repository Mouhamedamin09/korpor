-- Migration: Create saved_payment_methods table
-- This table stores user's saved payment methods for easy reuse

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
    UNIQUE KEY unique_stripe_payment_method (stripe_payment_method_id),
    UNIQUE KEY unique_user_default (user_id, is_default) -- Only one default per user
);

-- Create index for better performance on queries
CREATE INDEX idx_user_active_methods ON saved_payment_methods (user_id, is_active, deleted_at);

-- Add comment to table
ALTER TABLE saved_payment_methods COMMENT = 'Stores user saved payment methods for reuse across different screens';

-- Sample data for testing (optional - remove in production)
-- INSERT INTO saved_payment_methods 
-- (user_id, type, stripe_payment_method_id, stripe_customer_id, card_brand, card_last4, card_exp_month, card_exp_year, is_default) 
-- VALUES 
-- ('test_user_1', 'stripe', 'pm_test_123', 'cus_test_123', 'visa', '4242', 12, 2025, TRUE),
-- ('test_user_1', 'stripe', 'pm_test_456', 'cus_test_123', 'mastercard', '4444', 6, 2026, FALSE); 