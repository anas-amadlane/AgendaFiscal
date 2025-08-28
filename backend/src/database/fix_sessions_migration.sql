-- Fix user_sessions table for connect-pg-simple compatibility
-- This migration only updates the user_sessions table

-- Backup existing sessions data
CREATE TABLE IF NOT EXISTS user_sessions_backup AS SELECT * FROM user_sessions;

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

-- Clean up backup (optional - uncomment when you're sure everything works)
-- DROP TABLE user_sessions_backup;
