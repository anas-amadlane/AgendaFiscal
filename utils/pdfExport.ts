import { Enterprise, FiscalObligation, StatusObligation } from '@/types/fiscal';

export interface ComplianceReport {
  enterprise: Enterprise;
  obligations: FiscalObligation[];
  period: {
    start: Date;
    end: Date;
  };
  summary: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    complianceRate: number;
  };
}

export const generateComplianceReport = (
  enterprise: Enterprise,
  obligations: FiscalObligation[],
  startDate: Date,
  endDate: Date
): ComplianceReport => {
  const filteredObligations = obligations.filter(
    obligation => 
      obligation.enterpriseId === enterprise.id &&
      obligation.dueDate >= startDate &&
      obligation.dueDate <= endDate
  );

  const total = filteredObligations.length;
  const completed = filteredObligations.filter(o => o.status === StatusObligation.COMPLETED).length;
  const pending = filteredObligations.filter(o => o.status === StatusObligation.PENDING).length;
  const overdue = filteredObligations.filter(o => o.status === StatusObligation.OVERDUE).length;
  const complianceRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    enterprise,
    obligations: filteredObligations,
    period: { start: startDate, end: endDate },
    summary: {
      total,
      completed,
      pending,
      overdue,
      complianceRate,
    },
  };
};

export const exportComplianceReportPDF = async (report: ComplianceReport): Promise<string> => {
  // Cette fonction simule l'export PDF
  // Dans une vraie application, vous utiliseriez une bibliothèque comme react-native-html-to-pdf
  // ou expo-print pour générer le PDF
  
  const pdfContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rapport de Conformité Fiscale</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .company-info { margin-bottom: 20px; }
        .summary { margin-bottom: 30px; }
        .obligations-table { width: 100%; border-collapse: collapse; }
        .obligations-table th, .obligations-table td { 
          border: 1px solid #ddd; padding: 8px; text-align: left; 
        }
        .obligations-table th { background-color: #f2f2f2; }
        .status-completed { color: green; }
        .status-pending { color: orange; }
        .status-overdue { color: red; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rapport de Conformité Fiscale</h1>
        <h2>Agenda Fiscal Marocain</h2>
      </div>
      
      <div class="company-info">
        <h3>Informations de l'entreprise</h3>
        <p><strong>Raison sociale:</strong> ${report.enterprise.raisonSociale}</p>
        <p><strong>Identifiant fiscal:</strong> ${report.enterprise.identifiantFiscal}</p>
        <p><strong>Forme juridique:</strong> ${report.enterprise.formeJuridique}</p>
        <p><strong>Régime fiscal:</strong> ${report.enterprise.regimeFiscal}</p>
        <p><strong>Période:</strong> ${report.period.start.toLocaleDateString('fr-FR')} - ${report.period.end.toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div class="summary">
        <h3>Résumé de conformité</h3>
        <p><strong>Taux de conformité:</strong> ${report.summary.complianceRate}%</p>
        <p><strong>Total des obligations:</strong> ${report.summary.total}</p>
        <p><strong>Obligations terminées:</strong> ${report.summary.completed}</p>
        <p><strong>Obligations en attente:</strong> ${report.summary.pending}</p>
        <p><strong>Obligations en retard:</strong> ${report.summary.overdue}</p>
      </div>
      
      <div class="obligations">
        <h3>Détail des obligations</h3>
        <table class="obligations-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Titre</th>
              <th>Date d'échéance</th>
              <th>Statut</th>
              <th>Catégorie</th>
            </tr>
          </thead>
          <tbody>
            ${report.obligations.map(obligation => `
              <tr>
                <td>${obligation.type}</td>
                <td>${obligation.title}</td>
                <td>${obligation.dueDate.toLocaleDateString('fr-FR')}</td>
                <td class="status-${obligation.status.toLowerCase().replace(' ', '-')}">${obligation.status}</td>
                <td>${obligation.category}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
        <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</p>
        <p>Agenda Fiscal Marocain - Application de gestion des échéances fiscales</p>
      </div>
    </body>
    </html>
  `;

  // Simuler la génération du PDF
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('rapport_conformite_' + report.enterprise.identifiantFiscal + '_' + 
             report.period.start.toISOString().split('T')[0] + '.pdf');
    }, 1000);
  });
};

export const shareComplianceReport = async (report: ComplianceReport): Promise<void> => {
  try {
    const fileName = await exportComplianceReportPDF(report);
    
    // Dans une vraie application, vous utiliseriez expo-sharing pour partager le fichier
    console.log(`Rapport exporté: ${fileName}`);
    
    // Simuler le partage
    alert(`Rapport de conformité exporté avec succès: ${fileName}`);
  } catch (error) {
    console.error('Erreur lors de l\'export du rapport:', error);
    alert('Erreur lors de l\'export du rapport');
  }
};

