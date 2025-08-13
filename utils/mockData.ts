import { Enterprise, FiscalObligation, Notification, FormeJuridique, RegimeFiscal } from '@/types/fiscal';
import { generateFiscalObligations } from './fiscalCalculations';

export const mockEnterprises: Enterprise[] = [
  {
    id: '1',
    raisonSociale: 'SARL Tech Innovation',
    identifiantFiscal: '12345678',
    formeJuridique: FormeJuridique.SARL,
    regimeFiscal: RegimeFiscal.IS_TVA,
    secteurActivite: 'Technologies de l\'information',
    dateCreation: new Date('2020-01-15'),
    isActive: true
  },
  {
    id: '2',
    raisonSociale: 'Consulting & Services',
    identifiantFiscal: '87654321',
    formeJuridique: FormeJuridique.SA,
    regimeFiscal: RegimeFiscal.IS_TVA,
    secteurActivite: 'Services aux entreprises',
    dateCreation: new Date('2019-06-20'),
    isActive: true
  },
  {
    id: '3',
    raisonSociale: 'Boutique El Baraka',
    identifiantFiscal: '11223344',
    formeJuridique: FormeJuridique.ENTREPRENEUR_INDIVIDUEL,
    regimeFiscal: RegimeFiscal.IR_TVA,
    secteurActivite: 'Commerce de détail',
    dateCreation: new Date('2021-03-10'),
    isActive: true
  }
];

export const generateMockObligations = (): FiscalObligation[] => {
  const currentYear = new Date().getFullYear();
  const obligations: FiscalObligation[] = [];
  
  mockEnterprises.forEach(enterprise => {
    const enterpriseObligations = generateFiscalObligations(enterprise, currentYear);
    obligations.push(...enterpriseObligations);
  });
  
  return obligations;
};

export const generateMockNotifications = (): Notification[] => {
  const obligations = generateMockObligations();
  const notifications: Notification[] = [];
  
  obligations.slice(0, 10).forEach((obligation, index) => {
    const daysRemaining = Math.floor(Math.random() * 15) + 1;
    notifications.push({
      id: `notif-${index}`,
      obligationId: obligation.id,
      enterpriseId: obligation.enterpriseId,
      title: `Échéance proche: ${obligation.title}`,
      message: `${daysRemaining} jours restants pour ${obligation.title}`,
      dueDate: obligation.dueDate,
      daysRemaining,
      isRead: index > 3,
      createdAt: new Date()
    });
  });
  
  return notifications;
};