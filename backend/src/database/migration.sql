-- Migration script to update database to new role structure
-- Run this after updating the schema.sql

-- 1. Update existing users table to new structure
-- First, backup existing data
CREATE TABLE users_backup AS SELECT * FROM users;

-- 2. Update role values in users table
UPDATE users SET role = 'regular' WHERE role IN ('user', 'agent', 'manager');

-- 3. Remove company column from users table (if it exists)
ALTER TABLE users DROP COLUMN IF EXISTS company;

-- 4. Update role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('regular', 'admin'));

-- 5. Update manager_agent_assignments table to include company_id
-- First, backup existing data
CREATE TABLE manager_agent_assignments_backup AS SELECT * FROM manager_agent_assignments;

-- Add company_id column if it doesn't exist
ALTER TABLE manager_agent_assignments ADD COLUMN IF NOT EXISTS company_id UUID;

-- Update the unique constraint
ALTER TABLE manager_agent_assignments DROP CONSTRAINT IF EXISTS manager_agent_assignments_manager_id_agent_id_key;
ALTER TABLE manager_agent_assignments ADD CONSTRAINT manager_agent_assignments_company_id_manager_id_agent_id_key UNIQUE (company_id, manager_id, agent_id);

-- 6. Create index for company_id in manager_agent_assignments
CREATE INDEX IF NOT EXISTS idx_manager_agent_company_id ON manager_agent_assignments(company_id);

-- 7. Fix user_sessions table for connect-pg-simple compatibility
-- Backup existing sessions data
CREATE TABLE user_sessions_backup AS SELECT * FROM user_sessions;

-- Drop existing table and recreate with correct column name
DROP TABLE IF EXISTS user_sessions CASCADE;

-- Recreate user_sessions table with 'expire' column
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address INET,
    user_agent TEXT,
    expire TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for user_sessions
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expire ON user_sessions(expire);

-- 8. Update any existing references to old roles
-- This will depend on your specific data and requirements

-- 9. Clean up (optional - uncomment when you're sure everything works)
-- DROP TABLE users_backup;
-- DROP TABLE manager_agent_assignments_backup;
-- DROP TABLE user_sessions_backup;
