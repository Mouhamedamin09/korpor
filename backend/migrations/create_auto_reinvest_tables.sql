-- Migration: Create auto-reinvest related tables
-- This creates tables for auto-reinvest functionality and rental income tracking

-- Create auto_reinvest_plans table
CREATE TABLE IF NOT EXISTS auto_reinvest_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('active', 'paused', 'cancelled') DEFAULT 'active' NOT NULL,
    minimum_reinvest_amount DECIMAL(15, 2) DEFAULT 100.0,
    reinvest_percentage DECIMAL(5, 2) DEFAULT 100.0,
    theme ENUM('growth', 'income', 'index', 'balanced', 'diversified') DEFAULT 'balanced' NOT NULL,
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'medium',
    preferred_regions JSON NULL,
    excluded_property_types JSON NULL,
    total_rental_income DECIMAL(15, 2) DEFAULT 0,
    total_reinvested DECIMAL(15, 2) DEFAULT 0,
    pending_reinvest_amount DECIMAL(15, 2) DEFAULT 0,
    last_reinvest_date TIMESTAMP NULL,
    reinvestment_frequency ENUM('immediate', 'weekly', 'monthly') DEFAULT 'monthly',
    auto_approval_enabled BOOLEAN DEFAULT TRUE,
    max_reinvest_percentage_per_project DECIMAL(5, 2) DEFAULT 25.0,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_auto_reinvest_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_reinvest_percentage CHECK (reinvest_percentage >= 0 AND reinvest_percentage <= 100),
    CONSTRAINT chk_max_project_percentage CHECK (max_reinvest_percentage_per_project >= 1 AND max_reinvest_percentage_per_project <= 100),
    
    -- Indexes
    INDEX idx_auto_reinvest_user (user_id),
    INDEX idx_auto_reinvest_status (status),
    INDEX idx_auto_reinvest_active (user_id, status)
);

-- Create rental_payouts table
CREATE TABLE IF NOT EXISTS rental_payouts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    project_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    currency ENUM('TND', 'EUR') DEFAULT 'TND' NOT NULL,
    payout_date TIMESTAMP NOT NULL,
    is_reinvested BOOLEAN DEFAULT FALSE,
    reinvested_amount DECIMAL(15, 2) DEFAULT 0,
    reinvest_transaction_id INT NULL,
    auto_reinvest_plan_id INT NULL,
    status ENUM('pending', 'paid', 'reinvested', 'partially_reinvested') DEFAULT 'pending' NOT NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_rental_payout_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_rental_payout_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_rental_payout_auto_reinvest FOREIGN KEY (auto_reinvest_plan_id) REFERENCES auto_reinvest_plans(id) ON DELETE SET NULL,
    CONSTRAINT fk_rental_payout_transaction FOREIGN KEY (reinvest_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_rental_payout_user (user_id),
    INDEX idx_rental_payout_project (project_id),
    INDEX idx_rental_payout_date (payout_date),
    INDEX idx_rental_payout_status (status),
    INDEX idx_rental_payout_reinvested (is_reinvested),
    INDEX idx_rental_payout_auto_reinvest (auto_reinvest_plan_id),
    INDEX idx_rental_payout_user_status (user_id, status),
    INDEX idx_rental_payout_user_date (user_id, payout_date DESC)
);

-- Add auto_reinvest_plan_id column to transactions table if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS auto_reinvest_plan_id INT NULL,
ADD CONSTRAINT fk_transaction_auto_reinvest 
    FOREIGN KEY (auto_reinvest_plan_id) REFERENCES auto_reinvest_plans(id) ON DELETE SET NULL;

-- Add index for auto_reinvest_plan_id in transactions
CREATE INDEX IF NOT EXISTS idx_transaction_auto_reinvest ON transactions(auto_reinvest_plan_id);

-- Insert some sample data for testing (optional - remove in production)
-- This simulates rental payouts for testing auto-reinvest functionality

-- Example rental payouts for user_id 1 (adjust as needed)
INSERT IGNORE INTO rental_payouts (user_id, project_id, amount, currency, payout_date, status, notes)
VALUES 
    (1, 1, 250.00, 'TND', DATE_SUB(NOW(), INTERVAL 30 DAY), 'paid', 'Monthly rental payout - Property A'),
    (1, 2, 180.00, 'TND', DATE_SUB(NOW(), INTERVAL 60 DAY), 'paid', 'Monthly rental payout - Property B'),
    (1, 1, 260.00, 'TND', DATE_SUB(NOW(), INTERVAL 90 DAY), 'paid', 'Monthly rental payout - Property A'),
    (1, 3, 320.00, 'TND', DATE_SUB(NOW(), INTERVAL 15 DAY), 'paid', 'Monthly rental payout - Property C');

COMMIT; 