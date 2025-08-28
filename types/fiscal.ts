// Fiscal Calendar Types based on new comprehensive schema

export interface FiscalCalendarEntry {
  id: number; // Simple sequential numbering
  categorie_personnes: string; // Type of taxpayer (Entreprise, Particulier, Auto-entrepreneur, Association...)
  sous_categorie?: string; // Sub-category precision (Société IS, Salarié, Profession libérale, Micro-entreprise...)
  type: 'Fiscal' | 'Social' | 'Para-fiscal' | 'Réglementaire'; // Nature of declaration
  tag: string; // Code or keyword (IS, IR, TVA, CNSS, CPU, TP...)
  frequence_declaration: 'Mensuel' | 'Trimestriel' | 'Annuel' | 'Autre'; // Declaration frequency
  periode_declaration?: string; // Periods concerned (T1-T2-T3-T4, or specific months)
  mois?: string; // Month when due (03 for March, 06 for June...)
  jours?: number; // Day limit of the month (20, 31...)
  detail_declaration?: string; // Description of content or object
  formulaire?: string; // Form reference or service name (IS205, TVA-CAD, DAMANCOM, etc.)
  lien?: string; // Link to online declaration portal
  commentaire?: string; // Additional information, clarifications, conditions
  created_at?: string;
  updated_at?: string;
}

export interface FiscalCalendarFilter {
  categorie_personnes?: string;
  sous_categorie?: string;
  type?: string;
  tag?: string;
  frequence_declaration?: string;
  mois?: string;
  formulaire?: string;
}

export interface FiscalCalendarStats {
  totalEntries: number;
  byType: Record<string, number>;
  byFrequency: Record<string, number>;
  byCategory: Record<string, number>;
  byTag: Record<string, number>;
}

export interface FiscalCalendarFormData {
  categorie_personnes: string;
  sous_categorie?: string;
  type: string;
  tag: string;
  frequence_declaration: string;
  periode_declaration?: string;
  mois?: string;
  jours?: number;
  detail_declaration?: string;
  formulaire?: string;
  lien?: string;
  commentaire?: string;
}

// Predefined categories and sub-categories for consistency
export const FISCAL_CATEGORIES = {
  ENTREPRISE: 'Entreprise',
  PARTICULIER: 'Particulier',
  AUTO_ENTREPRENEUR: 'Auto-entrepreneur',
  ASSOCIATION: 'Association'
} as const;

export const FISCAL_SUB_CATEGORIES = {
  // Entreprise
  SOCIETE_IS: 'Société IS',
  ASSUJETTI_TVA: 'Assujetti TVA',
  EMPLOYEUR: 'Employeur',
  TOUTES: 'Toutes',
  
  // Particulier
  SALARIE: 'Salarié',
  PROFESSION_LIBERALE: 'Profession libérale',
  
  // Auto-entrepreneur
  MICRO_ENTREPRISE: 'Micro-entreprise',
  
  // Association
  ASSOCIATION_LOI_1901: 'Association loi 1901'
} as const;

export const FISCAL_TYPES = {
  FISCAL: 'Fiscal',
  SOCIAL: 'Social',
  PARA_FISCAL: 'Para-fiscal',
  REGLEMENTAIRE: 'Réglementaire'
} as const;

export const FISCAL_TAGS = {
  IS: 'IS', // Impôt sur les Sociétés
  IR: 'IR', // Impôt sur le Revenu
  TVA: 'TVA', // Taxe sur la Valeur Ajoutée
  CNSS: 'CNSS', // Caisse Nationale de Sécurité Sociale
  CPU: 'CPU', // Contribution Patronale Unique
  TP: 'TP' // Taxe Professionnelle
} as const;

export const FREQUENCE_DECLARATION = {
  MENSUEL: 'Mensuel',
  TRIMESTRIEL: 'Trimestriel',
  ANNUEL: 'Annuel',
  AUTRE: 'Autre'
} as const;

// Legacy enums for backward compatibility with existing components
export enum FormeJuridique {
  SARL = 'SARL',
  SA = 'SA',
  SAS = 'SAS',
  ENTREPRENEUR_INDIVIDUEL = 'Entrepreneur Individuel',
  AUTO_ENTREPRENEUR = 'Auto-entrepreneur',
  ASSOCIATION = 'Association'
}

export enum RegimeFiscal {
  IS = 'IS',
  IR = 'IR',
  TVA = 'TVA',
  MICRO_FISCAL = 'Micro-fiscal',
  MICRO_SOCIAL = 'Micro-social'
}

// Legacy Enterprise interface for backward compatibility
export interface Enterprise {
  id: string;
  nom: string;
  formeJuridique: FormeJuridique;
  regimeFiscal: RegimeFiscal;
  secteurActivite: string;
  adresse: string;
  telephone: string;
  email: string;
  siret?: string;
  tva?: string;
  created_at?: string;
  updated_at?: string;
}

// Database FiscalObligation interface (from fiscal_obligations table)
export interface FiscalObligation {
  id: string;
  company_id: string;
  title: string;
  description?: string;
  obligation_type: string;
  amount?: number;
  currency?: string;
  due_date: string;
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  periode_declaration?: string;
  lien?: string;
  obligation_details?: any;
  created_by: string;
  last_edited?: string;
  edited_by?: string;
  created_at?: string;
  updated_at?: string;
  // Joined fields from companies table
  company_name?: string;
  categorie_personnes?: string;
  sous_categorie?: string;
}

// Legacy FiscalObligation interface for backward compatibility
export interface LegacyFiscalObligation {
  id: string;
  enterpriseId: string;
  type: TypeObligation;
  status: StatusObligation;
  category: CategoryObligation;
  description: string;
  dueDate: string;
  amount?: number;
  currency?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

// Legacy enums for backward compatibility
export enum TypeObligation {
  IS = 'IS',
  IR = 'IR',
  TVA = 'TVA',
  CNSS = 'CNSS',
  CPU = 'CPU',
  TP = 'TP'
}

export enum StatusObligation {
  PENDING = 'pending',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum CategoryObligation {
  FISCAL = 'fiscal',
  SOCIAL = 'social',
  PARA_FISCAL = 'para_fiscal',
  REGLEMENTAIRE = 'reglementaire'
}

// Utility functions
export const getFiscalCalendarEntryDueDate = (entry: FiscalCalendarEntry, year: number): Date | null => {
  if (!entry.mois || !entry.jours) return null;
  
  const month = parseInt(entry.mois) - 1; // JavaScript months are 0-indexed
  const day = entry.jours;
  
  return new Date(year, month, day);
};

export const isFiscalCalendarEntryOverdue = (entry: FiscalCalendarEntry, referenceDate: Date = new Date()): boolean => {
  const dueDate = getFiscalCalendarEntryDueDate(entry, referenceDate.getFullYear());
  if (!dueDate) return false;
  
  return dueDate < referenceDate;
};

export const getFiscalCalendarEntryStatus = (entry: FiscalCalendarEntry, referenceDate: Date = new Date()): 'upcoming' | 'due' | 'overdue' => {
  const dueDate = getFiscalCalendarEntryDueDate(entry, referenceDate.getFullYear());
  if (!dueDate) return 'upcoming';
  
  const daysUntilDue = Math.ceil((dueDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due';
  return 'upcoming';
};