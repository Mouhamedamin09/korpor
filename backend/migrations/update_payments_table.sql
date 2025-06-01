-- Migration: Update payments table to add user_id and saved_payment_method_id columns
-- This allows linking payments to users and saved payment methods

-- Add user_id column if it doesn't exist
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS user_id VARCHAR(100) NULL AFTER user_address,
ADD COLUMN IF NOT EXISTS saved_payment_method_id INT NULL AFTER stripe_payment_intent_id;

-- Add indexes for better performance
ALTER TABLE payments 
ADD INDEX IF NOT EXISTS idx_user_id (user_id),
ADD INDEX IF NOT EXISTS idx_saved_payment_method (saved_payment_method_id);

-- Add foreign key constraint for saved_payment_method_id (optional, uncomment if needed)
-- ALTER TABLE payments 
-- ADD CONSTRAINT fk_payments_saved_method 
-- FOREIGN KEY (saved_payment_method_id) REFERENCES saved_payment_methods(id) 
-- ON DELETE SET NULL; 