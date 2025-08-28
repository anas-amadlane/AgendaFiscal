import { FiscalCalendarEntry, getFiscalCalendarEntryStatus, Enterprise, FiscalObligation, LegacyFiscalObligation, TypeObligation, StatusObligation, CategoryObligation } from '@/types/fiscal';

// Generate fiscal calendar entries for a specific year
export const generateFiscalCalendarEntries = (year: number): FiscalCalendarEntry[] => {
  // This function would generate entries based on the fiscal calendar template
  // For now, return an empty array as the entries are managed through the database
  return [];
};

// Get fiscal calendar entries for a specific month
export const getFiscalCalendarEntriesForMonth = (entries: FiscalCalendarEntry[], year: number, month: number): FiscalCalendarEntry[] => {
  return entries.filter(entry => {
    if (!entry.mois) return false;
    const entryMonth = parseInt(entry.mois);
    return entryMonth === month;
  }).sort((a, b) => {
    const dayA = a.jours || 0;
    const dayB = b.jours || 0;
    return dayA - dayB;
  });
};

// Get overdue fiscal calendar entries
export const getOverdueFiscalCalendarEntries = (entries: FiscalCalendarEntry[]): FiscalCalendarEntry[] => {
  return entries.filter(entry => {
    const status = getFiscalCalendarEntryStatus(entry, new Date());
    return status === 'overdue';
  });
};

// Get due fiscal calendar entries (within 7 days)
export const getDueFiscalCalendarEntries = (entries: FiscalCalendarEntry[]): FiscalCalendarEntry[] => {
  return entries.filter(entry => {
    const status = getFiscalCalendarEntryStatus(entry, new Date());
    return status === 'due';
  });
};

// Get upcoming fiscal calendar entries
export const getUpcomingFiscalCalendarEntries = (entries: FiscalCalendarEntry[]): FiscalCalendarEntry[] => {
  return entries.filter(entry => {
    const status = getFiscalCalendarEntryStatus(entry, new Date());
    return status === 'upcoming';
  });
};

// Filter fiscal calendar entries by category
export const filterFiscalCalendarEntriesByCategory = (entries: FiscalCalendarEntry[], category: string): FiscalCalendarEntry[] => {
  return entries.filter(entry => entry.categorie_personnes === category);
};

// Filter fiscal calendar entries by type
export const filterFiscalCalendarEntriesByType = (entries: FiscalCalendarEntry[], type: string): FiscalCalendarEntry[] => {
  return entries.filter(entry => entry.type === type);
};

// Filter fiscal calendar entries by tag
export const filterFiscalCalendarEntriesByTag = (entries: FiscalCalendarEntry[], tag: string): FiscalCalendarEntry[] => {
  return entries.filter(entry => entry.tag === tag);
};

// Filter fiscal calendar entries by frequency
export const filterFiscalCalendarEntriesByFrequency = (entries: FiscalCalendarEntry[], frequency: string): FiscalCalendarEntry[] => {
  return entries.filter(entry => entry.frequence_declaration === frequency);
};

// Get fiscal calendar statistics
export const getFiscalCalendarStatistics = (entries: FiscalCalendarEntry[]) => {
  const total = entries.length;
  const overdue = getOverdueFiscalCalendarEntries(entries).length;
  const due = getDueFiscalCalendarEntries(entries).length;
  const upcoming = getUpcomingFiscalCalendarEntries(entries).length;

  const byType: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const byTag: Record<string, number> = {};
  const byFrequency: Record<string, number> = {};

  entries.forEach(entry => {
    // Count by type
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    
    // Count by category
    byCategory[entry.categorie_personnes] = (byCategory[entry.categorie_personnes] || 0) + 1;
    
    // Count by tag
    byTag[entry.tag] = (byTag[entry.tag] || 0) + 1;
    
    // Count by frequency
    byFrequency[entry.frequence_declaration] = (byFrequency[entry.frequence_declaration] || 0) + 1;
  });

  return {
    total,
    overdue,
    due,
    upcoming,
    byType,
    byCategory,
    byTag,
    byFrequency
  };
};

// Legacy functions for backward compatibility with existing components

// Generate fiscal obligations for an enterprise (legacy function)
export const generateFiscalObligations = (enterprise: Enterprise, year: number): LegacyFiscalObligation[] => {
  // This is a legacy function that generates mock obligations
  // In the new system, obligations are managed through the fiscal calendar
  const obligations: LegacyFiscalObligation[] = [];
  
  // Generate some mock obligations based on the enterprise type
  const baseDate = new Date(year, 0, 1);
  
  // IS obligations (quarterly)
  for (let i = 0; i < 4; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(i * 3 + 2); // March, June, September, December
    dueDate.setDate(31);
    
    obligations.push({
      id: `is-${year}-${i + 1}`,
      enterpriseId: enterprise.id,
      type: TypeObligation.IS,
      status: StatusObligation.PENDING,
      category: CategoryObligation.FISCAL,
      description: `Acompte IS - ${i + 1}er trimestre ${year}`,
      dueDate: dueDate.toISOString(),
      amount: 50000,
      currency: 'MAD'
    });
  }
  
  // TVA obligations (monthly)
  for (let i = 0; i < 12; i++) {
    const dueDate = new Date(baseDate);
    dueDate.setMonth(i);
    dueDate.setDate(20);
    
    obligations.push({
      id: `tva-${year}-${i + 1}`,
      enterpriseId: enterprise.id,
      type: TypeObligation.TVA,
      status: StatusObligation.PENDING,
      category: CategoryObligation.FISCAL,
      description: `Déclaration TVA - ${dueDate.toLocaleDateString('fr-FR', { month: 'long' })} ${year}`,
      dueDate: dueDate.toISOString(),
      amount: 15000,
      currency: 'MAD'
    });
  }
  
  return obligations;
};

// Get obligation color (legacy function)
export const getObligationColor = (type: TypeObligation): string => {
  switch (type) {
    case TypeObligation.IS:
      return '#EF4444'; // Red
    case TypeObligation.IR:
      return '#F59E0B'; // Amber
    case TypeObligation.TVA:
      return '#10B981'; // Green
    case TypeObligation.CNSS:
      return '#3B82F6'; // Blue
    case TypeObligation.CPU:
      return '#8B5CF6'; // Purple
    case TypeObligation.TP:
      return '#F97316'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};

// New utility functions for FiscalObligation (from database)

// Get fiscal obligation status
export const getFiscalObligationStatus = (obligation: FiscalObligation, referenceDate: Date = new Date()): 'upcoming' | 'due' | 'overdue' => {
  const dueDate = new Date(obligation.due_date);
  const daysUntilDue = Math.ceil((dueDate.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'due';
  return 'upcoming';
};

// Get fiscal obligations for a specific period
export const getFiscalObligationsForPeriod = (obligations: FiscalObligation[], year: number, month?: number, week?: number, day?: number): FiscalObligation[] => {
  return obligations.filter(obligation => {
    const dueDate = new Date(obligation.due_date);
    
    if (dueDate.getFullYear() !== year) return false;
    
    if (month !== undefined && dueDate.getMonth() !== month) return false;
    
    if (week !== undefined) {
      const weekOfYear = getWeekOfYear(dueDate);
      if (weekOfYear !== week) return false;
    }
    
    if (day !== undefined && dueDate.getDate() !== day) return false;
    
    return true;
  }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
};

// Helper function to get week of year
const getWeekOfYear = (date: Date) => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

// Get fiscal obligation statistics
export const getFiscalObligationStatistics = (obligations: FiscalObligation[]) => {
  const total = obligations.length;
  const overdue = obligations.filter(obligation => getFiscalObligationStatus(obligation) === 'overdue').length;
  const due = obligations.filter(obligation => getFiscalObligationStatus(obligation) === 'due').length;
  const upcoming = obligations.filter(obligation => getFiscalObligationStatus(obligation) === 'upcoming').length;

  const byType: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byPriority: Record<string, number> = {};
  const byCompany: Record<string, number> = {};

  obligations.forEach(obligation => {
    // Count by type
    byType[obligation.obligation_type] = (byType[obligation.obligation_type] || 0) + 1;
    
    // Count by status
    byStatus[obligation.status] = (byStatus[obligation.status] || 0) + 1;
    
    // Count by priority
    byPriority[obligation.priority] = (byPriority[obligation.priority] || 0) + 1;
    
    // Count by company
    if (obligation.company_name) {
      byCompany[obligation.company_name] = (byCompany[obligation.company_name] || 0) + 1;
    }
  });

  return {
    total,
    overdue,
    due,
    upcoming,
    byType,
    byStatus,
    byPriority,
    byCompany
  };
};

// Get obligation color by type
export const getObligationTypeColor = (type: string): string => {
  switch (type) {
    case 'IS':
      return '#EF4444'; // Red
    case 'IR':
      return '#F59E0B'; // Amber
    case 'TVA':
      return '#10B981'; // Green
    case 'CNSS':
      return '#3B82F6'; // Blue
    case 'CPU':
      return '#8B5CF6'; // Purple
    case 'TP':
      return '#F97316'; // Orange
    default:
      return '#6B7280'; // Gray
  }
};

// Get priority color
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'urgent':
      return '#EF4444'; // Red
    case 'high':
      return '#F59E0B'; // Amber
    case 'medium':
      return '#3B82F6'; // Blue
    case 'low':
      return '#10B981'; // Green
    default:
      return '#6B7280'; // Gray
  }
};