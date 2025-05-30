-- Migration script to add 'email_verified_pending_approval' status to users table

-- First, modify the approval_status enum type to include the new status
ALTER TABLE users 
MODIFY COLUMN approval_status 
ENUM('unverified','pending','approved','rejected','email_verified_pending_approval') 
DEFAULT 'unverified';

-- Add a comment explaining the new status
ALTER TABLE users 
MODIFY COLUMN approval_status 
ENUM('unverified','pending','approved','rejected','email_verified_pending_approval') 
COMMENT 'Status of user account approval. email_verified_pending_approval is for users who have verified their email but still need admin approval.';

-- Update any existing users who have verified email but are pending approval
-- UPDATE users 
-- SET approval_status = 'email_verified_pending_approval'
-- WHERE is_verified = 1 AND approval_status = 'pending';

-- Uncomment the above statement if you want to migrate existing users automatically

-- Migration script to enhance pending users with email verification

-- Add a comment explaining the is_verified flag meaning for pending users
ALTER TABLE users 
MODIFY COLUMN is_verified TINYINT(1) DEFAULT 0
COMMENT 'When true, indicates user has verified their email. For users with approval_status=pending, this flag indicates they have verified their email but still need admin approval.';

-- Add a comment explaining the approval_status
ALTER TABLE users 
MODIFY COLUMN approval_status ENUM('unverified','pending','approved','rejected')
COMMENT 'Status of user account approval. A pending user with is_verified=1 has verified their email but still needs admin approval.';

-- Update any existing users who need to be marked as verified
-- UPDATE users 
-- SET is_verified = 1
-- WHERE approval_status = 'pending' AND password IS NOT NULL;

-- Uncomment the above statement if you want to update existing pending users 