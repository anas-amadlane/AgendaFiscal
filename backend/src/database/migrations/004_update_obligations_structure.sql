-- Migration 004: Update fiscal_obligations table structure
-- Remove amount and currency columns, add periode_declaration and lien

-- Remove amount and currency columns
ALTER TABLE fiscal_obligations 
DROP COLUMN IF EXISTS amount,
DROP COLUMN IF EXISTS currency;

-- Add new columns
ALTER TABLE fiscal_obligations
ADD COLUMN periode_declaration VARCHAR(100),
ADD COLUMN lien TEXT;

-- Create index for periode_declaration for better performance
CREATE INDEX idx_fiscal_obligations_periode_declaration ON fiscal_obligations(periode_declaration);

-- Create index for lien for better performance
CREATE INDEX idx_fiscal_obligations_lien ON fiscal_obligations(lien);

