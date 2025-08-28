-- Migration: Remove old unused fields from companies table
-- Date: 2024-01-XX
-- Description: Remove fields that are not used in the new company creation form

-- Remove old columns that are no longer used
ALTER TABLE companies 
DROP COLUMN IF EXISTS registration_number,
DROP COLUMN IF EXISTS tax_id,
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS website,
DROP COLUMN IF EXISTS industry,
DROP COLUMN IF EXISTS size;

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Companies table - streamlined for fiscal agenda requirements';
