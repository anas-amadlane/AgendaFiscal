import { FiscalCalendarEntry } from '@/types/fiscal';

export interface FiscalReport {
  title: string;
  period: string;
  entries: FiscalCalendarEntry[];
  generatedAt: Date;
}

// Generate HTML content for fiscal calendar report
export const generateFiscalCalendarReportHTML = (report: FiscalReport): string => {
  const formatDate = (date: Date) => date.toLocaleDateString('fr-FR');
  
  const entriesHTML = report.entries.map(entry => `
    <tr>
      <td>${entry.id}</td>
      <td>${entry.categorie_personnes}</td>
      <td>${entry.sous_categorie || '-'}</td>
      <td>${entry.type}</td>
      <td>${entry.tag}</td>
      <td>${entry.frequence_declaration}</td>
      <td>${entry.periode_declaration || '-'}</td>
      <td>${entry.mois || '-'}</td>
      <td>${entry.jours || '-'}</td>
      <td>${entry.detail_declaration || '-'}</td>
      <td>${entry.formulaire || '-'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${report.title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #3B82F6;
          padding-bottom: 20px;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1E293B;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 16px;
          color: #64748B;
        }
        .report-info {
          margin-bottom: 30px;
          padding: 15px;
          background-color: #F8FAFC;
          border-radius: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
        }
        .info-value {
          color: #6B7280;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #E5E7EB;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #F3F4F6;
          font-weight: bold;
          color: #374151;
        }
        tr:nth-child(even) {
          background-color: #F9FAFB;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        .summary {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #EFF6FF;
          border-radius: 8px;
          border-left: 4px solid #3B82F6;
        }
        .summary-title {
          font-weight: bold;
          color: #1E40AF;
          margin-bottom: 10px;
        }
        .summary-stats {
          display: flex;
          gap: 20px;
        }
        .stat-item {
          text-align: center;
        }
        .stat-number {
          font-size: 18px;
          font-weight: bold;
          color: #1E40AF;
        }
        .stat-label {
          font-size: 12px;
          color: #6B7280;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">${report.title}</div>
        <div class="subtitle">Calendrier Fiscal - Période: ${report.period}</div>
      </div>

      <div class="report-info">
        <div class="info-row">
          <span class="info-label">Période:</span>
          <span class="info-value">${report.period}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Nombre d'entrées:</span>
          <span class="info-value">${report.entries.length}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Généré le:</span>
          <span class="info-value">${formatDate(report.generatedAt)}</span>
        </div>
      </div>

      <div class="summary">
        <div class="summary-title">Résumé par catégorie</div>
        <div class="summary-stats">
          ${generateSummaryStats(report.entries)}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Catégorie</th>
            <th>Sous-Catégorie</th>
            <th>Type</th>
            <th>Tag</th>
            <th>Fréquence</th>
            <th>Période</th>
            <th>Mois</th>
            <th>Jours</th>
            <th>Détail</th>
            <th>Formulaire</th>
          </tr>
        </thead>
        <tbody>
          ${entriesHTML}
        </tbody>
      </table>

      <div class="footer">
        <p>Rapport généré automatiquement par Agenda Fiscal</p>
        <p>© ${new Date().getFullYear()} - Tous droits réservés</p>
      </div>
    </body>
    </html>
  `;
};

// Generate summary statistics for the report
const generateSummaryStats = (entries: FiscalCalendarEntry[]): string => {
  const byCategory: Record<string, number> = {};
  const byType: Record<string, number> = {};
  const byTag: Record<string, number> = {};

  entries.forEach(entry => {
    byCategory[entry.categorie_personnes] = (byCategory[entry.categorie_personnes] || 0) + 1;
    byType[entry.type] = (byType[entry.type] || 0) + 1;
    byTag[entry.tag] = (byTag[entry.tag] || 0) + 1;
  });

  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  const topType = Object.entries(byType).sort((a, b) => b[1] - a[1])[0];
  const topTag = Object.entries(byTag).sort((a, b) => b[1] - a[1])[0];

  return `
    <div class="stat-item">
      <div class="stat-number">${topCategory ? topCategory[1] : 0}</div>
      <div class="stat-label">${topCategory ? topCategory[0] : 'Aucune'}</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${topType ? topType[1] : 0}</div>
      <div class="stat-label">${topType ? topType[0] : 'Aucun'}</div>
    </div>
    <div class="stat-item">
      <div class="stat-number">${topTag ? topTag[1] : 0}</div>
      <div class="stat-label">${topTag ? topTag[0] : 'Aucun'}</div>
    </div>
  `;
};

// Generate a simple text report
export const generateFiscalCalendarTextReport = (report: FiscalReport): string => {
  const formatDate = (date: Date) => date.toLocaleDateString('fr-FR');
  
  let text = `${report.title}\n`;
  text += `Période: ${report.period}\n`;
  text += `Généré le: ${formatDate(report.generatedAt)}\n`;
  text += `Nombre d'entrées: ${report.entries.length}\n\n`;
  
  text += 'Résumé par catégorie:\n';
  const byCategory: Record<string, number> = {};
  report.entries.forEach(entry => {
    byCategory[entry.categorie_personnes] = (byCategory[entry.categorie_personnes] || 0) + 1;
  });
  
  Object.entries(byCategory).forEach(([category, count]) => {
    text += `  - ${category}: ${count} entrée(s)\n`;
  });
  
  text += '\nDétail des entrées:\n';
  text += '='.repeat(80) + '\n';
  
  report.entries.forEach(entry => {
    text += `ID: ${entry.id}\n`;
    text += `Catégorie: ${entry.categorie_personnes}\n`;
    if (entry.sous_categorie) text += `Sous-catégorie: ${entry.sous_categorie}\n`;
    text += `Type: ${entry.type}\n`;
    text += `Tag: ${entry.tag}\n`;
    text += `Fréquence: ${entry.frequence_declaration}\n`;
    if (entry.periode_declaration) text += `Période: ${entry.periode_declaration}\n`;
    if (entry.mois && entry.jours) text += `Échéance: ${entry.jours}/${entry.mois}\n`;
    if (entry.detail_declaration) text += `Détail: ${entry.detail_declaration}\n`;
    if (entry.formulaire) text += `Formulaire: ${entry.formulaire}\n`;
    if (entry.commentaire) text += `Commentaire: ${entry.commentaire}\n`;
    text += '-'.repeat(40) + '\n';
  });
  
  return text;
};

