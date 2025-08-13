import { Enterprise, FiscalObligation, TypeObligation, StatusObligation, CategoryObligation, RegimeFiscal } from '@/types/fiscal';

export const generateFiscalObligations = (enterprise: Enterprise, year: number): FiscalObligation[] => {
  const obligations: FiscalObligation[] = [];
  
  // Obligations IS (si applicable)
  if (enterprise.regimeFiscal === RegimeFiscal.IS_TVA || enterprise.regimeFiscal === RegimeFiscal.IS_EXONERE) {
    // Déclaration IS annuelle
    obligations.push({
      id: `${enterprise.id}-is-annual-${year}`,
      enterpriseId: enterprise.id,
      type: TypeObligation.IS,
      title: 'Déclaration IS Annuelle',
      description: 'Déclaration de l\'impôt sur les sociétés',
      dueDate: new Date(year + 1, 2, 31), // 31 mars
      status: StatusObligation.UPCOMING,
      alertDays: [15, 7, 3, 1],
      category: CategoryObligation.DECLARATION
    });

    // Acomptes IS trimestriels
    for (let quarter = 1; quarter <= 4; quarter++) {
      const month = quarter * 3;
      obligations.push({
        id: `${enterprise.id}-is-q${quarter}-${year}`,
        enterpriseId: enterprise.id,
        type: TypeObligation.IS,
        title: `Acompte IS T${quarter}`,
        description: `Acompte trimestriel IS - T${quarter}`,
        dueDate: new Date(year, month, 31),
        status: StatusObligation.UPCOMING,
        alertDays: [15, 7, 3, 1],
        category: CategoryObligation.PAIEMENT
      });
    }
  }

  // Obligations IR (si applicable)
  if (enterprise.regimeFiscal === RegimeFiscal.IR_TVA || enterprise.regimeFiscal === RegimeFiscal.IR_EXONERE) {
    obligations.push({
      id: `${enterprise.id}-ir-annual-${year}`,
      enterpriseId: enterprise.id,
      type: TypeObligation.IR,
      title: 'Déclaration IR Annuelle',
      description: 'Déclaration de l\'impôt sur le revenu',
      dueDate: new Date(year + 1, 2, 31), // 31 mars
      status: StatusObligation.UPCOMING,
      alertDays: [15, 7, 3, 1],
      category: CategoryObligation.DECLARATION
    });
  }

  // Obligations TVA (si applicable)
  if (enterprise.regimeFiscal === RegimeFiscal.IS_TVA || enterprise.regimeFiscal === RegimeFiscal.IR_TVA) {
    // TVA mensuelle
    for (let month = 1; month <= 12; month++) {
      const dueDate = new Date(year, month, 20); // 20 du mois suivant
      obligations.push({
        id: `${enterprise.id}-tva-${month}-${year}`,
        enterpriseId: enterprise.id,
        type: TypeObligation.TVA,
        title: `Déclaration TVA ${month}/${year}`,
        description: `Déclaration TVA du mois ${month}/${year}`,
        dueDate,
        status: StatusObligation.UPCOMING,
        alertDays: [7, 3, 1],
        category: CategoryObligation.DECLARATION
      });
    }
  }

  // Obligations CNSS (toutes les entreprises)
  for (let month = 1; month <= 12; month++) {
    const dueDate = new Date(year, month, 10); // 10 du mois suivant
    obligations.push({
      id: `${enterprise.id}-cnss-${month}-${year}`,
      enterpriseId: enterprise.id,
      type: TypeObligation.CNSS,
      title: `Déclaration CNSS ${month}/${year}`,
      description: `Déclaration et paiement CNSS du mois ${month}/${year}`,
      dueDate,
      status: StatusObligation.UPCOMING,
      alertDays: [7, 3, 1],
      category: CategoryObligation.DECLARATION
    });
  }

  // Taxe professionnelle annuelle
  obligations.push({
    id: `${enterprise.id}-taxe-pro-${year}`,
    enterpriseId: enterprise.id,
    type: TypeObligation.TAXE_PROFESSIONNELLE,
    title: 'Taxe Professionnelle',
    description: 'Déclaration et paiement taxe professionnelle',
    dueDate: new Date(year, 11, 31), // 31 décembre
    status: StatusObligation.UPCOMING,
    alertDays: [30, 15, 7, 3, 1],
    category: CategoryObligation.PAIEMENT
  });

  return obligations;
};

export const getObligationColor = (type: TypeObligation): string => {
  switch (type) {
    case TypeObligation.IS:
      return '#3B82F6'; // Bleu
    case TypeObligation.IR:
      return '#10B981'; // Vert
    case TypeObligation.TVA:
      return '#F59E0B'; // Orange
    case TypeObligation.CNSS:
      return '#8B5CF6'; // Violet
    case TypeObligation.AMO:
      return '#EC4899'; // Rose
    case TypeObligation.TAXE_PROFESSIONNELLE:
      return '#EF4444'; // Rouge
    case TypeObligation.TAXE_HABITATION:
      return '#6B7280'; // Gris
    case TypeObligation.DROITS_DOUANE:
      return '#14B8A6'; // Teal
    default:
      return '#6B7280'; // Gris par défaut
  }
};

export const getStatusColor = (status: StatusObligation): string => {
  switch (status) {
    case StatusObligation.PENDING:
      return '#F59E0B'; // Orange
    case StatusObligation.COMPLETED:
      return '#10B981'; // Vert
    case StatusObligation.OVERDUE:
      return '#EF4444'; // Rouge
    case StatusObligation.UPCOMING:
      return '#3B82F6'; // Bleu
    default:
      return '#6B7280'; // Gris
  }
};

export const calculateDaysRemaining = (dueDate: Date): number => {
  const today = new Date();
  const timeDiff = dueDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const updateObligationStatus = (obligation: FiscalObligation): StatusObligation => {
  const daysRemaining = calculateDaysRemaining(obligation.dueDate);
  
  if (daysRemaining < 0) {
    return StatusObligation.OVERDUE;
  } else if (daysRemaining <= 7) {
    return StatusObligation.PENDING;
  } else {
    return StatusObligation.UPCOMING;
  }
};