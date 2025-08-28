const { pool } = require('../config/database');

class FiscalObligationService {
  /**
   * Generate fiscal obligations for a company based on fiscal calendar
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID creating the obligations
   * @param {number} year - The year to generate obligations for (default: 2025)
   * @returns {Promise<Array>} Array of generated obligations
   */
  async generateObligationsForCompany(companyId, userId, year = 2025) {
    try {
      // Get company details
      const companyResult = await pool.query(`
        SELECT 
          id, name, categorie_personnes, sous_categorie, 
          is_tva_assujetti, regime_tva, prorata_deduction, created_at
        FROM companies 
        WHERE id = $1
      `, [companyId]);

      if (companyResult.rows.length === 0) {
        throw new Error('Company not found');
      }

      const company = companyResult.rows[0];
      
      // Set date range for the specified year
      const startDate = new Date(year, 0, 1); // January 1st of the year
      const endDate = new Date(year, 11, 31); // December 31st of the year

      // Get fiscal calendar entries based on company characteristics
      const calendarEntries = await this.getRelevantCalendarEntries(company);
      
      // Generate obligations for each calendar entry
      const obligations = [];
      
      for (const entry of calendarEntries) {
        const entryObligations = await this.generateObligationsFromEntry(
          entry, 
          company, 
          startDate, 
          endDate,
          userId,
          year
        );
        obligations.push(...entryObligations);
      }

      return obligations;
    } catch (error) {
      console.error('Error generating obligations for company:', error);
      throw error;
    }
  }

  /**
   * Generate obligations for a company with dynamic date range (current year + 12 months forward)
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID creating the obligations
   * @returns {Promise<Array>} Array of generated obligations
   */
  async generateObligationsForCompanyDynamic(companyId, userId) {
    try {
      // Get company details
      const companyResult = await pool.query(`
        SELECT 
          id, name, categorie_personnes, sous_categorie, 
          is_tva_assujetti, regime_tva, prorata_deduction, created_at
        FROM companies 
        WHERE id = $1
      `, [companyId]);

      if (companyResult.rows.length === 0) {
        throw new Error('Company not found');
      }

      const company = companyResult.rows[0];
      
      // Calculate dynamic date range
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      // Start from January 1st of current year
      const startDate = new Date(currentYear, 0, 1);
      
      // End 12 months from current month
      const endDate = new Date(currentYear, currentMonth + 12, 0); // Last day of the month
      
      console.log(`Generating obligations for company ${company.name} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

      // Get fiscal calendar entries based on company characteristics
      const calendarEntries = await this.getRelevantCalendarEntries(company);
      
      // Generate obligations for each calendar entry
      const obligations = [];
      
      for (const entry of calendarEntries) {
        const entryObligations = await this.generateObligationsFromEntryDynamic(
          entry, 
          company, 
          startDate, 
          endDate,
          userId
        );
        obligations.push(...entryObligations);
      }

      return obligations;
    } catch (error) {
      console.error('Error generating obligations for company:', error);
      throw error;
    }
  }

  /**
   * Generate obligations for all companies with dynamic date range
   * @param {string} managerEmail - Manager email who is creating the obligations
   * @returns {Promise<Object>} Summary of generated obligations
   */
  async generateObligationsForAllCompaniesDynamic(managerEmail) {
    try {
      // Get manager user by email
      const managerResult = await pool.query(`
        SELECT id, first_name, last_name, email 
        FROM users 
        WHERE email = $1 AND role = 'admin'
      `, [managerEmail]);

      if (managerResult.rows.length === 0) {
        throw new Error('Manager not found or not authorized');
      }

      const manager = managerResult.rows[0];

      // Get all active companies
      const companiesResult = await pool.query(`
        SELECT 
          id, name, categorie_personnes, sous_categorie, 
          is_tva_assujetti, regime_tva, prorata_deduction, created_at
        FROM companies 
        WHERE status = 'active'
        ORDER BY name
      `);

      const summary = {
        manager: {
          id: manager.id,
          name: `${manager.first_name} ${manager.last_name}`,
          email: manager.email
        },
        totalCompanies: companiesResult.rows.length,
        totalObligations: 0,
        totalDuplicatesSkipped: 0,
        companiesProcessed: 0,
        companiesWithObligations: 0,
        errors: [],
        companyDetails: []
      };

      for (const company of companiesResult.rows) {
        try {
          console.log(`Generating obligations for company: ${company.name} (${company.id})`);
          
          const companyObligations = await this.generateObligationsForCompanyDynamic(
            company.id, 
            manager.id
          );

          const companyDetail = {
            companyId: company.id,
            companyName: company.name,
            categorie_personnes: company.categorie_personnes,
            sous_categorie: company.sous_categorie,
            obligationsGenerated: companyObligations.length,
            obligationsByType: this.groupObligationsByType(companyObligations)
          };

          summary.companyDetails.push(companyDetail);
          summary.totalObligations += companyObligations.length;
          summary.companiesProcessed++;

          if (companyObligations.length > 0) {
            summary.companiesWithObligations++;
            // Save obligations to database
            await this.saveObligations(companyObligations);
            console.log(`Saved ${companyObligations.length} obligations for company: ${company.name}`);
          }

        } catch (error) {
          console.error(`Error generating obligations for company ${company.name}:`, error);
          summary.errors.push({
            companyId: company.id,
            companyName: company.name,
            error: error.message
          });
        }
      }

      return summary;
    } catch (error) {
      console.error('Error generating obligations for all companies:', error);
      throw error;
    }
  }

  /**
   * Generate obligations for a specific calendar entry with dynamic date range
   * @param {Object} entry - Fiscal calendar entry
   * @param {Object} company - Company object
   * @param {Date} startDate - Start date for obligations
   * @param {Date} endDate - End date for obligations
   * @param {string} userId - User ID creating the obligations
   * @returns {Promise<Array>} Array of obligations
   */
  async generateObligationsFromEntryDynamic(entry, company, startDate, endDate, userId) {
    const obligations = [];
    let currentDate = new Date(startDate);
    let duplicatesSkipped = 0;

    while (currentDate <= endDate) {
      const dueDate = this.calculateDueDateDynamic(entry, currentDate);
      
      if (dueDate && dueDate <= endDate) {
        // Check if obligation already exists before creating
        const obligationExists = await this.checkObligationExists(
          company.id, 
          entry.tag, 
          dueDate, 
          entry.periode_declaration
        );
        
        if (obligationExists) {
          duplicatesSkipped++;
          console.log(`Skipping duplicate obligation: ${entry.tag} for ${company.name} on ${dueDate.toISOString().split('T')[0]}`);
        } else {
          const obligation = {
            company_id: company.id,
            title: this.generateTitle(entry, dueDate),
            description: entry.detail_declaration || entry.commentaire || '',
            obligation_type: entry.tag,
            due_date: dueDate,
            status: 'pending',
            priority: this.calculatePriority(entry, dueDate),
            created_by: userId,
            periode_declaration: entry.periode_declaration,
            lien: entry.lien,
            obligation_details: {
              calendar_entry_id: entry.id,
              categorie_personnes: entry.categorie_personnes,
              type: entry.type,
              frequence_declaration: entry.frequence_declaration,
              periode_declaration: entry.periode_declaration,
              formulaire: entry.formulaire,
              lien: entry.lien,
              commentaire: entry.commentaire,
              generated_from_calendar: true,
              generation_date: new Date().toISOString(),
              generation_trigger: 'dynamic_range'
            }
          };

          obligations.push(obligation);
        }
      }

      // Move to next period based on frequency
      currentDate = this.getNextPeriodDate(currentDate, entry.frequence_declaration);
    }

    if (duplicatesSkipped > 0) {
      console.log(`Skipped ${duplicatesSkipped} duplicate obligations for ${company.name} - ${entry.tag}`);
    }

    return obligations;
  }

  /**
   * Check if an obligation already exists for a company, type, and specific date
   * @param {string} companyId - Company ID
   * @param {string} obligationType - Type of obligation (e.g., 'TVA', 'CNSS')
   * @param {Date} dueDate - Due date to check
   * @param {string} periodeDeclaration - Period declaration (optional)
   * @returns {Promise<boolean>} True if obligation exists, false otherwise
   */
  async checkObligationExists(companyId, obligationType, dueDate, periodeDeclaration = null) {
    try {
      let query = `
        SELECT COUNT(*) as count
        FROM fiscal_obligations 
        WHERE company_id = $1 
        AND obligation_type = $2 
        AND DATE(due_date) = DATE($3)
      `;
      
      const params = [companyId, obligationType, dueDate];
      
      // Add period declaration check if provided
      if (periodeDeclaration) {
        query += ` AND periode_declaration = $4`;
        params.push(periodeDeclaration);
      }
      
      // Also check if it was generated from calendar
      query += ` AND obligation_details->>'generated_from_calendar' = 'true'`;
      
      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking obligation existence:', error);
      return false; // Default to false to avoid blocking generation
    }
  }

  /**
   * Get duplicate obligation statistics for a company
   * @param {string} companyId - Company ID
   * @param {Date} startDate - Start date for checking
   * @param {Date} endDate - End date for checking
   * @returns {Promise<Object>} Duplicate statistics
   */
  async getDuplicateObligationStats(companyId, startDate, endDate) {
    try {
      const query = `
        SELECT 
          obligation_type,
          COUNT(*) as total_count,
          COUNT(CASE WHEN obligation_details->>'generated_from_calendar' = 'true' THEN 1 END) as generated_count
        FROM fiscal_obligations 
        WHERE company_id = $1 
        AND due_date >= $2 
        AND due_date <= $3
        GROUP BY obligation_type
        HAVING COUNT(*) > 1
      `;
      
      const result = await pool.query(query, [companyId, startDate, endDate]);
      return result.rows;
    } catch (error) {
      console.error('Error getting duplicate obligation stats:', error);
      return [];
    }
  }

  /**
   * Calculate the due date for an obligation with dynamic year handling
   * @param {Object} entry - Fiscal calendar entry
   * @param {Date} currentDate - Current date
   * @returns {Date|null} Due date or null if not applicable
   */
  calculateDueDateDynamic(entry, currentDate) {
    if (!entry.mois || !entry.jours) {
      return null;
    }

    const dueDate = new Date();
    dueDate.setFullYear(currentDate.getFullYear());
    dueDate.setDate(entry.jours);

    // Handle different frequencies
    switch (entry.frequence_declaration) {
      case 'Mensuel':
        // Use the current month from the iteration
        dueDate.setMonth(currentDate.getMonth());
        break;
      case 'Trimestriel':
        // Map quarters to months: Q1=March, Q2=June, Q3=September, Q4=December
        const quarterMonths = [2, 5, 8, 11]; // 0-indexed months
        const currentQuarter = Math.floor(currentDate.getMonth() / 3);
        dueDate.setMonth(quarterMonths[currentQuarter]);
        break;
      case 'Annuel':
        // Use the fixed month from the calendar entry
        const month = parseInt(entry.mois) - 1; // JavaScript months are 0-indexed
        dueDate.setMonth(month);
        break;
      default:
        // Default to current month
        dueDate.setMonth(currentDate.getMonth());
    }

    return dueDate;
  }

  /**
   * Generate obligations for a newly created company
   * @param {string} companyId - The newly created company ID
   * @param {string} userId - The user ID who created the company
   * @returns {Promise<Array>} Array of generated obligations
   */
  async generateObligationsForNewCompany(companyId, userId) {
    try {
      console.log(`Generating obligations for newly created company: ${companyId}`);
      const obligations = await this.generateObligationsForCompanyDynamic(companyId, userId);
      
      if (obligations.length > 0) {
        await this.saveObligations(obligations);
        console.log(`Generated and saved ${obligations.length} obligations for new company: ${companyId}`);
      }
      
      return obligations;
    } catch (error) {
      console.error('Error generating obligations for new company:', error);
      throw error;
    }
  }

  /**
   * Regenerate obligations for all companies when fiscal calendar is updated
   * @param {string} managerEmail - Manager email who triggered the update
   * @returns {Promise<Object>} Summary of regenerated obligations
   */
  async regenerateObligationsOnCalendarUpdate(managerEmail) {
    try {
      console.log('Regenerating obligations due to fiscal calendar update...');
      
      // First, delete existing obligations that were generated from calendar
      await this.deleteGeneratedObligations();
      
      // Then generate new obligations
      const summary = await this.generateObligationsForAllCompaniesDynamic(managerEmail);
      
      console.log(`Regenerated obligations: ${summary.totalObligations} total obligations for ${summary.companiesWithObligations} companies`);
      
      return summary;
    } catch (error) {
      console.error('Error regenerating obligations on calendar update:', error);
      throw error;
    }
  }

  /**
   * Delete obligations that were generated from fiscal calendar
   * @returns {Promise<number>} Number of deleted obligations
   */
  async deleteGeneratedObligations() {
    try {
      const result = await pool.query(`
        DELETE FROM fiscal_obligations 
        WHERE obligation_details->>'generated_from_calendar' = 'true'
        RETURNING id
      `);
      
      const deletedCount = result.rows.length;
      console.log(`Deleted ${deletedCount} previously generated obligations`);
      
      return deletedCount;
    } catch (error) {
      console.error('Error deleting generated obligations:', error);
      throw error;
    }
  }

  /**
   * Get relevant fiscal calendar entries based on company characteristics
   * @param {Object} company - Company object
   * @returns {Promise<Array>} Array of calendar entries
   */
  async getRelevantCalendarEntries(company) {
    let query = `
      SELECT * FROM fiscal_calendar 
      WHERE categorie_personnes = $1
    `;
    let params = [company.categorie_personnes];

    // Special handling for TVA based on company settings
    if (company.is_tva_assujetti) {
      query += ` AND (
        (tag = 'TVA' AND frequence_declaration = $2)
        OR (tag = 'TVA' AND frequence_declaration = 'Annuel' AND $3 = true)
        OR tag != 'TVA'
      )`;
      params.push(company.regime_tva, company.prorata_deduction);
    } else {
      query += ` AND tag != 'TVA'`;
    }

    query += ` ORDER BY tag, frequence_declaration, mois, jours`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Generate obligations for a specific calendar entry
   * @param {Object} entry - Fiscal calendar entry
   * @param {Object} company - Company object
   * @param {Date} startDate - Start date for obligations
   * @param {Date} endDate - End date for obligations
   * @param {string} userId - User ID creating the obligations
   * @param {number} year - The year to generate obligations for
   * @returns {Promise<Array>} Array of obligations
   */
  async generateObligationsFromEntry(entry, company, startDate, endDate, userId, year) {
    const obligations = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dueDate = this.calculateDueDate(entry, currentDate, year);
      
      if (dueDate && dueDate <= endDate) {
        const obligation = {
          company_id: company.id,
          title: this.generateTitle(entry, dueDate),
          description: entry.detail_declaration || entry.commentaire || '',
          obligation_type: entry.tag,
          due_date: dueDate,
          status: 'pending',
          priority: this.calculatePriority(entry, dueDate),
          created_by: userId,
          periode_declaration: entry.periode_declaration,
          lien: entry.lien,
          obligation_details: {
            calendar_entry_id: entry.id,
            categorie_personnes: entry.categorie_personnes,
            type: entry.type,
            frequence_declaration: entry.frequence_declaration,
            periode_declaration: entry.periode_declaration,
            formulaire: entry.formulaire,
            lien: entry.lien,
            commentaire: entry.commentaire,
            generated_from_calendar: true,
            generation_year: year
          }
        };

        obligations.push(obligation);
      }

      // Move to next period based on frequency
      currentDate = this.getNextPeriodDate(currentDate, entry.frequence_declaration);
    }

    return obligations;
  }

  /**
   * Calculate the due date for an obligation
   * @param {Object} entry - Fiscal calendar entry
   * @param {Date} currentDate - Current date
   * @param {number} year - The year to generate obligations for
   * @returns {Date|null} Due date or null if not applicable
   */
  calculateDueDate(entry, currentDate, year) {
    if (!entry.mois || !entry.jours) {
      return null;
    }

    const dueDate = new Date();
    const month = parseInt(entry.mois) - 1; // JavaScript months are 0-indexed
    dueDate.setFullYear(year);
    dueDate.setMonth(month);
    dueDate.setDate(entry.jours);

    // For quarterly obligations, adjust based on the quarter
    if (entry.frequence_declaration === 'Trimestriel') {
      // Map quarters to months: Q1=March, Q2=June, Q3=September, Q4=December
      const quarterMonths = [2, 5, 8, 11]; // 0-indexed months
      const currentQuarter = Math.floor(currentDate.getMonth() / 3);
      dueDate.setMonth(quarterMonths[currentQuarter]);
    }

    return dueDate;
  }

  /**
   * Get the next period date based on frequency
   * @param {Date} currentDate - Current date
   * @param {string} frequency - Declaration frequency
   * @returns {Date} Next period date
   */
  getNextPeriodDate(currentDate, frequency) {
    const nextDate = new Date(currentDate);
    
    switch (frequency) {
      case 'Mensuel':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'Trimestriel':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'Annuel':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }
    
    return nextDate;
  }

  /**
   * Generate title for obligation
   * @param {Object} entry - Fiscal calendar entry
   * @param {Date} dueDate - Due date
   * @returns {string} Generated title
   */
  generateTitle(entry, dueDate) {
    const period = this.getPeriodText(entry, dueDate);
    return `${entry.tag} - ${entry.detail_declaration || 'Déclaration'} ${period}`;
  }

  /**
   * Get period text for title
   * @param {Object} entry - Fiscal calendar entry
   * @param {Date} dueDate - Due date
   * @returns {string} Period text
   */
  getPeriodText(entry, dueDate) {
    const year = dueDate.getFullYear();
    
    switch (entry.frequence_declaration) {
      case 'Mensuel':
        const month = dueDate.toLocaleDateString('fr-FR', { month: 'long' });
        return `${month} ${year}`;
      case 'Trimestriel':
        const quarter = Math.floor(dueDate.getMonth() / 3) + 1;
        return `T${quarter} ${year}`;
      case 'Annuel':
        return year.toString();
      default:
        return year.toString();
    }
  }

  /**
   * Calculate priority based on entry and due date
   * @param {Object} entry - Fiscal calendar entry
   * @param {Date} dueDate - Due date
   * @returns {string} Priority level
   */
  calculatePriority(entry, dueDate) {
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      return 'urgent'; // Overdue
    } else if (daysUntilDue <= 7) {
      return 'high';
    } else if (daysUntilDue <= 30) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generate obligations for all companies of a user
   * @param {string} userId - User ID
   * @param {number} year - The year to generate obligations for (default: 2025)
   * @returns {Promise<Array>} Array of all obligations
   */
  async generateObligationsForUser(userId, year = 2025) {
    try {
      // Get all companies the user has access to
      const companiesResult = await pool.query(`
        SELECT DISTINCT c.* 
        FROM companies c
        INNER JOIN company_user_roles cur ON c.id = cur.company_id
        WHERE cur.user_id = $1 AND cur.status = 'active'
        ORDER BY c.created_at DESC
      `, [userId]);

      const allObligations = [];
      
      for (const company of companiesResult.rows) {
        const companyObligations = await this.generateObligationsForCompany(company.id, userId, year);
        allObligations.push(...companyObligations);
      }

      return allObligations;
    } catch (error) {
      console.error('Error generating obligations for user:', error);
      throw error;
    }
  }

  /**
   * Generate obligations for all companies for a specific year (admin function)
   * @param {string} managerEmail - Manager email who is creating the obligations
   * @param {number} year - The year to generate obligations for (default: 2025)
   * @returns {Promise<Object>} Summary of generated obligations
   */
  async generateObligationsForAllCompanies(managerEmail, year = 2025) {
    try {
      // Get manager user by email
      const managerResult = await pool.query(`
        SELECT id, first_name, last_name, email 
        FROM users 
        WHERE email = $1 AND role = 'admin'
      `, [managerEmail]);

      if (managerResult.rows.length === 0) {
        throw new Error('Manager not found or not authorized');
      }

      const manager = managerResult.rows[0];

      // Get all active companies
      const companiesResult = await pool.query(`
        SELECT 
          id, name, categorie_personnes, sous_categorie, 
          is_tva_assujetti, regime_tva, prorata_deduction, created_at
        FROM companies 
        WHERE status = 'active'
        ORDER BY name
      `);

      const summary = {
        manager: {
          id: manager.id,
          name: `${manager.first_name} ${manager.last_name}`,
          email: manager.email
        },
        year: year,
        totalCompanies: companiesResult.rows.length,
        totalObligations: 0,
        companiesProcessed: 0,
        companiesWithObligations: 0,
        errors: [],
        companyDetails: []
      };

      for (const company of companiesResult.rows) {
        try {
          console.log(`Generating obligations for company: ${company.name} (${company.id})`);
          
          const companyObligations = await this.generateObligationsForCompany(
            company.id, 
            manager.id, 
            year
          );

          const companyDetail = {
            companyId: company.id,
            companyName: company.name,
            categorie_personnes: company.categorie_personnes,
            sous_categorie: company.sous_categorie,
            obligationsGenerated: companyObligations.length,
            obligationsByType: this.groupObligationsByType(companyObligations)
          };

          summary.companyDetails.push(companyDetail);
          summary.totalObligations += companyObligations.length;
          summary.companiesProcessed++;

          if (companyObligations.length > 0) {
            summary.companiesWithObligations++;
            // Save obligations to database
            await this.saveObligations(companyObligations);
            console.log(`Saved ${companyObligations.length} obligations for company: ${company.name}`);
          }

        } catch (error) {
          console.error(`Error generating obligations for company ${company.name}:`, error);
          summary.errors.push({
            companyId: company.id,
            companyName: company.name,
            error: error.message
          });
        }
      }

      return summary;
    } catch (error) {
      console.error('Error generating obligations for all companies:', error);
      throw error;
    }
  }

  /**
   * Group obligations by type for summary
   * @param {Array} obligations - Array of obligations
   * @returns {Object} Grouped obligations by type
   */
  groupObligationsByType(obligations) {
    const grouped = {};
    obligations.forEach(obligation => {
      const type = obligation.obligation_type;
      grouped[type] = (grouped[type] || 0) + 1;
    });
    return grouped;
  }

  /**
   * Save generated obligations to database
   * @param {Array} obligations - Array of obligations to save
   * @returns {Promise<Array>} Array of saved obligations
   */
  async saveObligations(obligations) {
    if (obligations.length === 0) {
      return [];
    }

    const values = [];
    const placeholders = [];
    let paramIndex = 1;

    for (const obligation of obligations) {
      placeholders.push(`($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`);
      
      values.push(
        obligation.company_id,
        obligation.title,
        obligation.description,
        obligation.obligation_type,
        obligation.due_date,
        obligation.status,
        obligation.priority,
        obligation.created_by,
        obligation.periode_declaration,
        obligation.lien,
        JSON.stringify(obligation.obligation_details),
        new Date(), // last_edited
        obligation.created_by, // edited_by
        new Date() // created_at
      );
    }

    const query = `
      INSERT INTO fiscal_obligations (
        company_id, title, description, obligation_type, due_date, 
        status, priority, created_by, periode_declaration, lien, obligation_details, last_edited, edited_by, created_at
      ) VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }
}

module.exports = new FiscalObligationService();
