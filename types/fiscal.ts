export interface Enterprise {
  id: string;
  raisonSociale: string;
  identifiantFiscal: string;
  formeJuridique: FormeJuridique;
  regimeFiscal: RegimeFiscal;
  secteurActivite: string;
  dateCreation: Date;
  isActive: boolean;
}

export interface FiscalObligation {
  id: string;
  enterpriseId: string;
  type: TypeObligation;
  title: string;
  description: string;
  dueDate: Date;
  status: StatusObligation;
  alertDays: number[];
  category: CategoryObligation;
}

export interface Notification {
  id: string;
  obligationId: string;
  enterpriseId: string;
  title: string;
  message: string;
  dueDate: Date;
  daysRemaining: number;
  isRead: boolean;
  createdAt: Date;
}

export enum FormeJuridique {
  SARL = 'SARL',
  SA = 'SA',
  SNC = 'SNC',
  SCS = 'SCS',
  SCA = 'SCA',
  SUARL = 'SUARL',
  ENTREPRENEUR_INDIVIDUEL = 'Entrepreneur Individuel',
  ASSOCIATION = 'Association',
  COOPERATIVE = 'Coopérative'
}

export enum RegimeFiscal {
  IS_TVA = 'IS + TVA',
  IR_TVA = 'IR + TVA',
  IS_EXONERE = 'IS Exonéré',
  IR_EXONERE = 'IR Exonéré',
  AUTO_ENTREPRENEUR = 'Auto-Entrepreneur'
}

export enum TypeObligation {
  IS = 'IS',
  IR = 'IR',
  TVA = 'TVA',
  CNSS = 'CNSS',
  AMO = 'AMO',
  TAXE_PROFESSIONNELLE = 'Taxe Professionnelle',
  TAXE_HABITATION = 'Taxe d\'Habitation',
  DROITS_DOUANE = 'Droits de Douane'
}

export enum StatusObligation {
  PENDING = 'En attente',
  COMPLETED = 'Terminé',
  OVERDUE = 'En retard',
  UPCOMING = 'À venir'
}

export enum CategoryObligation {
  DECLARATION = 'Déclaration',
  PAIEMENT = 'Paiement',
  DEPOT = 'Dépôt',
  REGULARISATION = 'Régularisation'
}