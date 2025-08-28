import { FiscalCalendarEntry, FISCAL_CATEGORIES, FISCAL_SUB_CATEGORIES, FISCAL_TYPES, FISCAL_TAGS, FREQUENCE_DECLARATION } from '@/types/fiscal';

// Mock fiscal calendar entries for testing
export const mockFiscalCalendarEntries: FiscalCalendarEntry[] = [
  // IS (Impôt sur les Sociétés) - Corporate Tax
  {
    id: 1,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.SOCIETE_IS,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.IS,
    frequence_declaration: FREQUENCE_DECLARATION.TRIMESTRIEL,
    periode_declaration: 'T1-T2-T3-T4',
    mois: '03',
    jours: 31,
    detail_declaration: 'Acompte IS - 1er trimestre',
    formulaire: 'IS205',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Acompte de 25% du montant de l\'IS de l\'exercice précédent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.SOCIETE_IS,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.IS,
    frequence_declaration: FREQUENCE_DECLARATION.TRIMESTRIEL,
    periode_declaration: 'T1-T2-T3-T4',
    mois: '06',
    jours: 30,
    detail_declaration: 'Acompte IS - 2ème trimestre',
    formulaire: 'IS205',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Acompte de 25% du montant de l\'IS de l\'exercice précédent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.SOCIETE_IS,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.IS,
    frequence_declaration: FREQUENCE_DECLARATION.ANNUEL,
    periode_declaration: 'Exercice fiscal',
    mois: '03',
    jours: 31,
    detail_declaration: 'Déclaration IS - Exercice précédent',
    formulaire: 'IS205',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Déclaration définitive de l\'IS de l\'exercice écoulé',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // TVA (Taxe sur la Valeur Ajoutée) - VAT
  {
    id: 4,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.ASSUJETTI_TVA,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.TVA,
    frequence_declaration: FREQUENCE_DECLARATION.MENSUEL,
    periode_declaration: 'Mois précédent',
    mois: '20',
    jours: 20,
    detail_declaration: 'Déclaration TVA mensuelle',
    formulaire: 'TVA-CAD',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Déclaration de la TVA collectée et déductible du mois précédent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 5,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.ASSUJETTI_TVA,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.TVA,
    frequence_declaration: FREQUENCE_DECLARATION.TRIMESTRIEL,
    periode_declaration: 'T1-T2-T3-T4',
    mois: '20',
    jours: 20,
    detail_declaration: 'Déclaration TVA trimestrielle',
    formulaire: 'TVA-CAD',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Déclaration de la TVA collectée et déductible du trimestre précédent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // IR (Impôt sur le Revenu) - Income Tax
  {
    id: 6,
    categorie_personnes: FISCAL_CATEGORIES.PARTICULIER,
    sous_categorie: FISCAL_SUB_CATEGORIES.SALARIE,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.IR,
    frequence_declaration: FREQUENCE_DECLARATION.ANNUEL,
    periode_declaration: 'Année précédente',
    mois: '03',
    jours: 31,
    detail_declaration: 'Déclaration IR - Salaires',
    formulaire: 'IR100',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Déclaration des revenus salariaux de l\'année précédente',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 7,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.EMPLOYEUR,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.IR,
    frequence_declaration: FREQUENCE_DECLARATION.MENSUEL,
    periode_declaration: 'Mois précédent',
    mois: '20',
    jours: 20,
    detail_declaration: 'Retenue IR sur salaires',
    formulaire: 'IR100',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Retenue à la source de l\'IR sur les salaires versés',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // CNSS (Caisse Nationale de Sécurité Sociale) - Social Security
  {
    id: 8,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.EMPLOYEUR,
    type: FISCAL_TYPES.SOCIAL,
    tag: FISCAL_TAGS.CNSS,
    frequence_declaration: FREQUENCE_DECLARATION.MENSUEL,
    periode_declaration: 'Mois précédent',
    mois: '20',
    jours: 20,
    detail_declaration: 'Cotisations CNSS employeur',
    formulaire: 'CNSS-EMPLOYEUR',
    lien: 'https://www.cnss.ma',
    commentaire: 'Cotisations patronales CNSS du mois précédent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 9,
    categorie_personnes: FISCAL_CATEGORIES.PARTICULIER,
    sous_categorie: FISCAL_SUB_CATEGORIES.SALARIE,
    type: FISCAL_TYPES.SOCIAL,
    tag: FISCAL_TAGS.CNSS,
    frequence_declaration: FREQUENCE_DECLARATION.MENSUEL,
    periode_declaration: 'Mois précédent',
    mois: '20',
    jours: 20,
    detail_declaration: 'Cotisations CNSS salarié',
    formulaire: 'CNSS-SALARIE',
    lien: 'https://www.cnss.ma',
    commentaire: 'Cotisations salariales CNSS du mois précédent',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // CPU (Contribution Patronale Unique) - Unique Employer Contribution
  {
    id: 10,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.EMPLOYEUR,
    type: FISCAL_TYPES.SOCIAL,
    tag: FISCAL_TAGS.CPU,
    frequence_declaration: FREQUENCE_DECLARATION.MENSUEL,
    periode_declaration: 'Mois précédent',
    mois: '20',
    jours: 20,
    detail_declaration: 'Contribution Patronale Unique',
    formulaire: 'CPU-FORM',
    lien: 'https://www.cnss.ma',
    commentaire: 'Contribution patronale unique sur les salaires',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // TP (Taxe Professionnelle) - Professional Tax
  {
    id: 11,
    categorie_personnes: FISCAL_CATEGORIES.ENTREPRISE,
    sous_categorie: FISCAL_SUB_CATEGORIES.TOUTES,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.TP,
    frequence_declaration: FREQUENCE_DECLARATION.ANNUEL,
    periode_declaration: 'Année en cours',
    mois: '02',
    jours: 28,
    detail_declaration: 'Déclaration Taxe Professionnelle',
    formulaire: 'TP-FORM',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Déclaration de la taxe professionnelle pour l\'année en cours',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Auto-entrepreneur
  {
    id: 12,
    categorie_personnes: FISCAL_CATEGORIES.AUTO_ENTREPRENEUR,
    sous_categorie: FISCAL_SUB_CATEGORIES.MICRO_ENTREPRISE,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.IR,
    frequence_declaration: FREQUENCE_DECLARATION.TRIMESTRIEL,
    periode_declaration: 'T1-T2-T3-T4',
    mois: '15',
    jours: 15,
    detail_declaration: 'Déclaration revenus auto-entrepreneur',
    formulaire: 'AUTO-ENTREPRENEUR',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Déclaration trimestrielle des revenus pour auto-entrepreneur',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },

  // Association
  {
    id: 13,
    categorie_personnes: FISCAL_CATEGORIES.ASSOCIATION,
    sous_categorie: FISCAL_SUB_CATEGORIES.ASSOCIATION_LOI_1901,
    type: FISCAL_TYPES.FISCAL,
    tag: FISCAL_TAGS.IS,
    frequence_declaration: FREQUENCE_DECLARATION.ANNUEL,
    periode_declaration: 'Exercice fiscal',
    mois: '03',
    jours: 31,
    detail_declaration: 'Déclaration IS association',
    formulaire: 'IS205',
    lien: 'https://www.tax.gov.ma',
    commentaire: 'Déclaration IS pour associations soumises à l\'impôt',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock fiscal calendar statistics
export const mockFiscalCalendarStats = {
  totalEntries: 13,
  byType: {
    'Fiscal': 9,
    'Social': 4
  },
  byFrequency: {
    'Mensuel': 5,
    'Trimestriel': 4,
    'Annuel': 4
  },
  byCategory: {
    'Entreprise': 8,
    'Particulier': 2,
    'Auto-entrepreneur': 1,
    'Association': 1
  },
  byTag: {
    'IS': 4,
    'TVA': 2,
    'IR': 3,
    'CNSS': 2,
    'CPU': 1,
    'TP': 1
  }
};

// Mock filter options
export const mockFilterOptions = {
  categories: ['Entreprise', 'Particulier', 'Auto-entrepreneur', 'Association'],
  subCategories: ['Société IS', 'Assujetti TVA', 'Employeur', 'Toutes', 'Salarié', 'Micro-entreprise', 'Association loi 1901'],
  types: ['Fiscal', 'Social'],
  tags: ['IS', 'IR', 'TVA', 'CNSS', 'CPU', 'TP'],
  frequencies: ['Mensuel', 'Trimestriel', 'Annuel'],
  formulas: ['IS205', 'TVA-CAD', 'IR100', 'CNSS-EMPLOYEUR', 'CNSS-SALARIE', 'CPU-FORM', 'TP-FORM', 'AUTO-ENTREPRENEUR']
};

// Mock enterprises for backward compatibility
import { Enterprise, FormeJuridique, RegimeFiscal } from '@/types/fiscal';

export const mockEnterprises: Enterprise[] = [
  {
    id: '1',
    nom: 'Tech Solutions SARL',
    formeJuridique: FormeJuridique.SARL,
    regimeFiscal: RegimeFiscal.IS,
    secteurActivite: 'Technologie',
    adresse: '123 Rue Mohammed V, Casablanca',
    telephone: '+212 5 22 123 456',
    email: 'contact@techsolutions.ma',
    siret: 'MA123456789',
    tva: 'MA123456789',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    nom: 'Consulting Pro SA',
    formeJuridique: FormeJuridique.SA,
    regimeFiscal: RegimeFiscal.IS,
    secteurActivite: 'Conseil',
    adresse: '456 Avenue Hassan II, Rabat',
    telephone: '+212 5 37 789 012',
    email: 'info@consultingpro.ma',
    siret: 'MA987654321',
    tva: 'MA987654321',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];