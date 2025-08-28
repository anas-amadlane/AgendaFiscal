-- Migration 003: Update fiscal_obligations table structure
-- Add obligation_details, last_edited, and edited_by fields

-- Add new columns to fiscal_obligations table
ALTER TABLE fiscal_obligations 
ADD COLUMN obligation_details JSONB DEFAULT '{}',
ADD COLUMN last_edited TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN edited_by UUID REFERENCES users(id);

-- Create index for better performance on obligation_details
CREATE INDEX idx_fiscal_obligations_details ON fiscal_obligations USING GIN (obligation_details);

-- Create index for last_edited for sorting
CREATE INDEX idx_fiscal_obligations_last_edited ON fiscal_obligations(last_edited);

-- Create index for edited_by for tracking changes
CREATE INDEX idx_fiscal_obligations_edited_by ON fiscal_obligations(edited_by);

-- Update existing records to set last_edited to created_at and edited_by to created_by
UPDATE fiscal_obligations 
SET last_edited = created_at, 
    edited_by = created_by 
WHERE last_edited IS NULL OR edited_by IS NULL;

