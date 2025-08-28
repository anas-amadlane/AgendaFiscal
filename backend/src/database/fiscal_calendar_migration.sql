-- Migration script to update fiscal_calendar table to new schema
-- This migration replaces the old fiscal_calendar structure with the new comprehensive one

-- Backup existing data
CREATE TABLE fiscal_calendar_backup AS SELECT * FROM fiscal_calendar;

-- Drop existing table and recreate with new schema
DROP TABLE IF EXISTS fiscal_calendar CASCADE;

-- Recreate fiscal_calendar table with new schema
CREATE TABLE fiscal_calendar (
    id SERIAL PRIMARY KEY, -- Simple sequential numbering for unique identification
    categorie_personnes VARCHAR(100) NOT NULL, -- Type of taxpayer (Entreprise, Particulier, Auto-entrepreneur, Association...)
    sous_categorie VARCHAR(100), -- Sub-category precision (Société IS, Salarié, Profession libérale, Micro-entreprise...)
    type VARCHAR(50) NOT NULL, -- Nature of declaration: Fiscal, Social, or other (para-fiscal, réglementaire, etc.)
    tag VARCHAR(50) NOT NULL, -- Code or keyword representing the declaration (IS, IR, TVA, CNSS, CPU, TP...)
    frequence_declaration VARCHAR(50) NOT NULL, -- Declaration frequency: Mensuel, Trimestriel, Annuel
    periode_declaration VARCHAR(200), -- Periods concerned by the declaration (T1-T2-T3-T4, or specific months)
    mois VARCHAR(10), -- Month when declaration or payment is due (03 for March, 06 for June...)
    jours INTEGER, -- Day limit of the month for declaration or payment (20, 31...)
    detail_declaration TEXT, -- Description of content or object of declaration (TVA collectée, IR sur salaires, acompte IS...)
    formulaire VARCHAR(100), -- Form reference or service name used (IS205, TVA-CAD, DAMANCOM, etc.)
    lien VARCHAR(500), -- Link to online declaration portal or tool (www.tax.gov.ma, DAMANCOM...)
    commentaire TEXT, -- Additional information, clarifications, specific conditions, thresholds, reminders or practical remarks
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_fiscal_calendar_categorie ON fiscal_calendar(categorie_personnes);
CREATE INDEX idx_fiscal_calendar_sous_categorie ON fiscal_calendar(sous_categorie);
CREATE INDEX idx_fiscal_calendar_type ON fiscal_calendar(type);
CREATE INDEX idx_fiscal_calendar_tag ON fiscal_calendar(tag);
CREATE INDEX idx_fiscal_calendar_frequence ON fiscal_calendar(frequence_declaration);
CREATE INDEX idx_fiscal_calendar_mois ON fiscal_calendar(mois);
CREATE INDEX idx_fiscal_calendar_jours ON fiscal_calendar(jours);
CREATE INDEX idx_fiscal_calendar_formulaire ON fiscal_calendar(formulaire);

-- Insert sample data for the new schema
INSERT INTO fiscal_calendar (
    categorie_personnes, 
    sous_categorie, 
    type, 
    tag, 
    frequence_declaration, 
    periode_declaration, 
    mois, 
    jours, 
    detail_declaration, 
    formulaire, 
    lien, 
    commentaire
) VALUES 
-- IS (Impôt sur les Sociétés) - Corporate Tax
('Entreprise', 'Société IS', 'Fiscal', 'IS', 'Trimestriel', 'T1-T2-T3-T4', '03', 31, 'Acompte IS - 1er trimestre', 'IS205', 'https://www.tax.gov.ma', 'Acompte de 25% du montant de l''IS de l''exercice précédent'),
('Entreprise', 'Société IS', 'Fiscal', 'IS', 'Trimestriel', 'T1-T2-T3-T4', '06', 30, 'Acompte IS - 2ème trimestre', 'IS205', 'https://www.tax.gov.ma', 'Acompte de 25% du montant de l''IS de l''exercice précédent'),
('Entreprise', 'Société IS', 'Fiscal', 'IS', 'Trimestriel', 'T1-T2-T3-T4', '09', 30, 'Acompte IS - 3ème trimestre', 'IS205', 'https://www.tax.gov.ma', 'Acompte de 25% du montant de l''IS de l''exercice précédent'),
('Entreprise', 'Société IS', 'Fiscal', 'IS', 'Trimestriel', 'T1-T2-T3-T4', '12', 31, 'Acompte IS - 4ème trimestre', 'IS205', 'https://www.tax.gov.ma', 'Acompte de 25% du montant de l''IS de l''exercice précédent'),
('Entreprise', 'Société IS', 'Fiscal', 'IS', 'Annuel', 'Exercice fiscal', '03', 31, 'Déclaration IS - Exercice précédent', 'IS205', 'https://www.tax.gov.ma', 'Déclaration définitive de l''IS de l''exercice écoulé'),

-- TVA (Taxe sur la Valeur Ajoutée) - VAT
('Entreprise', 'Assujetti TVA', 'Fiscal', 'TVA', 'Mensuel', 'Mois précédent', '20', 20, 'Déclaration TVA mensuelle', 'TVA-CAD', 'https://www.tax.gov.ma', 'Déclaration de la TVA collectée et déductible du mois précédent'),
('Entreprise', 'Assujetti TVA', 'Fiscal', 'TVA', 'Trimestriel', 'T1-T2-T3-T4', '20', 20, 'Déclaration TVA trimestrielle', 'TVA-CAD', 'https://www.tax.gov.ma', 'Déclaration de la TVA collectée et déductible du trimestre précédent'),

-- IR (Impôt sur le Revenu) - Income Tax
('Particulier', 'Salarié', 'Fiscal', 'IR', 'Annuel', 'Année précédente', '03', 31, 'Déclaration IR - Salaires', 'IR100', 'https://www.tax.gov.ma', 'Déclaration des revenus salariaux de l''année précédente'),
('Entreprise', 'Employeur', 'Fiscal', 'IR', 'Mensuel', 'Mois précédent', '20', 20, 'Retenue IR sur salaires', 'IR100', 'https://www.tax.gov.ma', 'Retenue à la source de l''IR sur les salaires versés'),

-- CNSS (Caisse Nationale de Sécurité Sociale) - Social Security
('Entreprise', 'Employeur', 'Social', 'CNSS', 'Mensuel', 'Mois précédent', '20', 20, 'Cotisations CNSS employeur', 'CNSS-EMPLOYEUR', 'https://www.cnss.ma', 'Cotisations patronales CNSS du mois précédent'),
('Particulier', 'Salarié', 'Social', 'CNSS', 'Mensuel', 'Mois précédent', '20', 20, 'Cotisations CNSS salarié', 'CNSS-SALARIE', 'https://www.cnss.ma', 'Cotisations salariales CNSS du mois précédent'),

-- CPU (Contribution Patronale Unique) - Unique Employer Contribution
('Entreprise', 'Employeur', 'Social', 'CPU', 'Mensuel', 'Mois précédent', '20', 20, 'Contribution Patronale Unique', 'CPU-FORM', 'https://www.cnss.ma', 'Contribution patronale unique sur les salaires'),

-- TP (Taxe Professionnelle) - Professional Tax
('Entreprise', 'Toutes', 'Fiscal', 'TP', 'Annuel', 'Année en cours', '02', 28, 'Déclaration Taxe Professionnelle', 'TP-FORM', 'https://www.tax.gov.ma', 'Déclaration de la taxe professionnelle pour l''année en cours'),

-- Auto-entrepreneur
('Auto-entrepreneur', 'Micro-entreprise', 'Fiscal', 'IR', 'Trimestriel', 'T1-T2-T3-T4', '15', 15, 'Déclaration revenus auto-entrepreneur', 'AUTO-ENTREPRENEUR', 'https://www.tax.gov.ma', 'Déclaration trimestrielle des revenus pour auto-entrepreneur'),

-- Association
('Association', 'Association loi 1901', 'Fiscal', 'IS', 'Annuel', 'Exercice fiscal', '03', 31, 'Déclaration IS association', 'IS205', 'https://www.tax.gov.ma', 'Déclaration IS pour associations soumises à l''impôt');

-- Clean up backup (optional - uncomment when you're sure everything works)
-- DROP TABLE fiscal_calendar_backup;
