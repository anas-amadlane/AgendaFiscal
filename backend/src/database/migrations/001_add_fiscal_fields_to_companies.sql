-- Migration: Add fiscal fields to companies table
-- Date: 2024-01-XX
-- Description: Add fiscal and legal information fields to companies table

-- Add new columns to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS categorie_personnes VARCHAR(100),
ADD COLUMN IF NOT EXISTS sous_categorie VARCHAR(100),
ADD COLUMN IF NOT EXISTS is_tva_assujetti BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS regime_tva VARCHAR(50),
ADD COLUMN IF NOT EXISTS prorata_deduction BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN companies.categorie_personnes IS 'Type of taxpayer: Personne Physique or Personne Morale';
COMMENT ON COLUMN companies.sous_categorie IS 'Legal form: SARL, SA, SAS, etc.';
COMMENT ON COLUMN companies.is_tva_assujetti IS 'Whether the company is subject to VAT';
COMMENT ON COLUMN companies.regime_tva IS 'VAT regime: Mensuel or Trimestriel';
COMMENT ON COLUMN companies.prorata_deduction IS 'Whether subject to prorata deduction';




