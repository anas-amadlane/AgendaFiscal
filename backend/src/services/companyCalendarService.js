const { pool } = require('../config/database');
const fiscalObligationService = require('./fiscalObligationService');

class CompanyCalendarService {
  /**
   * Assign calendar entries to a newly created company
   * @param {string} companyId - The company ID
   * @param {string} userId - The user ID creating the company
   * @returns {Promise<Array>} Array of generated obligations
   */
  async assignCalendarToCompany(companyId, userId) {
    try {
      console.log(`📅 Assigning calendar to company ${companyId}`);
      
      // Generate obligations for the company
      const obligations = await fiscalObligationService.generateObligationsForCompany(companyId, userId);
      
      if (obligations.length > 0) {
        // Save the obligations to database
        const savedObligations = await fiscalObligationService.saveObligations(obligations);
        console.log(`✅ Assigned ${savedObligations.length} calendar entries to company ${companyId}`);
        return savedObligations;
      } else {
        console.log(`⚠️ No calendar entries found for company ${companyId}`);
        return [];
      }
    } catch (error) {
      console.error('Error assigning calendar to company:', error);
      throw error;
    }
  }

  /**
   * Assign calendar entries to all companies (admin function)
   * @param {string} userId - The user ID (admin)
   * @returns {Promise<Object>} Summary of assignments
   */
  async assignCalendarToAllCompanies(userId) {
    try {
      console.log('📅 Assigning calendar to all companies...');
      
      // Get all active companies
      const companiesResult = await pool.query(`
        SELECT id, name, categorie_personnes 
        FROM companies 
        WHERE status = 'active'
        ORDER BY created_at DESC
      `);

      const results = {
        total: companiesResult.rows.length,
        processed: 0,
        success: 0,
        failed: 0,
        details: []
      };

      for (const company of companiesResult.rows) {
        try {
          const obligations = await this.assignCalendarToCompany(company.id, userId);
          results.processed++;
          results.success++;
          results.details.push({
            companyId: company.id,
            companyName: company.name,
            obligationsCount: obligations.length,
            status: 'success'
          });
        } catch (error) {
          results.processed++;
          results.failed++;
          results.details.push({
            companyId: company.id,
            companyName: company.name,
            error: error.message,
            status: 'failed'
          });
        }
      }

      console.log(`✅ Calendar assignment completed: ${results.success}/${results.total} companies processed successfully`);
      return results;
    } catch (error) {
      console.error('Error assigning calendar to all companies:', error);
      throw error;
    }
  }

  /**
   * Check if a company has calendar entries assigned
   * @param {string} companyId - The company ID
   * @returns {Promise<boolean>} True if company has obligations
   */
  async hasCalendarAssigned(companyId) {
    try {
      const result = await pool.query(`
        SELECT COUNT(*) as count 
        FROM fiscal_obligations 
        WHERE company_id = $1
      `, [companyId]);
      
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      console.error('Error checking calendar assignment:', error);
      return false;
    }
  }

  /**
   * Get calendar assignment summary for a company
   * @param {string} companyId - The company ID
   * @returns {Promise<Object>} Summary of calendar assignments
   */
  async getCalendarAssignmentSummary(companyId) {
    try {
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_obligations,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_obligations,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_obligations,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_obligations,
          MIN(due_date) as earliest_due_date,
          MAX(due_date) as latest_due_date
        FROM fiscal_obligations 
        WHERE company_id = $1
      `, [companyId]);
      
      return result.rows[0];
    } catch (error) {
      console.error('Error getting calendar assignment summary:', error);
      throw error;
    }
  }
}

module.exports = new CompanyCalendarService();

