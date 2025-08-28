const fiscalObligationService = require('./fiscalObligationService');
const { pool } = require('../config/database');
const cron = require('node-cron');

class AutomatedObligationService {
  constructor() {
    this.isRunning = false;
    this.lastRun = null;
  }

  /**
   * Initialize the automated service
   */
  async initialize() {
    console.log('🚀 Initializing Automated Obligation Service...');
    
    // Schedule monthly obligation generation (runs on the 1st of each month at 2:00 AM)
    cron.schedule('0 2 1 * *', async () => {
      console.log('📅 Monthly obligation generation triggered by cron');
      await this.runMonthlyGeneration();
    }, {
      scheduled: true,
      timezone: "Europe/Paris"
    });

    console.log('✅ Automated Obligation Service initialized');
  }

  /**
   * Run monthly obligation generation for all companies
   */
  async runMonthlyGeneration() {
    if (this.isRunning) {
      console.log('⚠️ Monthly generation already running, skipping...');
      return;
    }

    try {
      this.isRunning = true;
      console.log('🔄 Starting monthly obligation generation...');

      // Get system admin user for automated generation
      const adminResult = await pool.query(`
        SELECT id, email, first_name, last_name 
        FROM users 
        WHERE role = 'admin' 
        ORDER BY created_at ASC 
        LIMIT 1
      `);

      if (adminResult.rows.length === 0) {
        throw new Error('No admin user found for automated generation');
      }

      const admin = adminResult.rows[0];
      console.log(`👤 Using admin user: ${admin.email} for automated generation`);

      // Generate obligations for all companies
      const summary = await fiscalObligationService.generateObligationsForAllCompaniesDynamic(admin.email);
      
      this.lastRun = new Date();
      
      console.log(`✅ Monthly generation completed: ${summary.totalObligations} obligations generated for ${summary.companiesWithObligations} companies`);
      
      // Log the generation summary
      await this.logGenerationSummary('monthly', summary, admin.email);
      
    } catch (error) {
      console.error('❌ Error during monthly generation:', error);
      await this.logGenerationError('monthly', error, null);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Trigger obligation generation for a newly created company
   * @param {string} companyId - The newly created company ID
   * @param {string} userId - The user ID who created the company
   */
  async triggerNewCompanyGeneration(companyId, userId) {
    try {
      console.log(`🏢 Triggering obligation generation for new company: ${companyId}`);
      
      const obligations = await fiscalObligationService.generateObligationsForNewCompany(companyId, userId);
      
      console.log(`✅ Generated ${obligations.length} obligations for new company: ${companyId}`);
      
      // Log the generation
      await this.logGenerationSummary('new_company', {
        totalObligations: obligations.length,
        companyId: companyId,
        userId: userId
      }, null);
      
    } catch (error) {
      console.error('❌ Error generating obligations for new company:', error);
      await this.logGenerationError('new_company', error, { companyId, userId });
    }
  }

  /**
   * Trigger obligation regeneration when fiscal calendar is updated
   * @param {string} managerEmail - Manager email who triggered the update
   */
  async triggerCalendarUpdateRegeneration(managerEmail) {
    try {
      console.log('📅 Triggering obligation regeneration due to fiscal calendar update...');
      
      const summary = await fiscalObligationService.regenerateObligationsOnCalendarUpdate(managerEmail);
      
      console.log(`✅ Calendar update regeneration completed: ${summary.totalObligations} obligations regenerated`);
      
      // Log the regeneration
      await this.logGenerationSummary('calendar_update', summary, managerEmail);
      
    } catch (error) {
      console.error('❌ Error regenerating obligations on calendar update:', error);
      await this.logGenerationError('calendar_update', error, { managerEmail });
    }
  }

  /**
   * Manual trigger for obligation generation (for testing or immediate execution)
   * @param {string} managerEmail - Manager email who triggered the generation
   */
  async triggerManualGeneration(managerEmail) {
    try {
      console.log('🔧 Manual obligation generation triggered...');
      
      const summary = await fiscalObligationService.generateObligationsForAllCompaniesDynamic(managerEmail);
      
      console.log(`✅ Manual generation completed: ${summary.totalObligations} obligations generated`);
      
      // Log the generation
      await this.logGenerationSummary('manual', summary, managerEmail);
      
      return summary;
      
    } catch (error) {
      console.error('❌ Error during manual generation:', error);
      await this.logGenerationError('manual', error, { managerEmail });
      throw error;
    }
  }

  /**
   * Log generation summary to database
   * @param {string} triggerType - Type of trigger (monthly, new_company, calendar_update, manual)
   * @param {Object} summary - Generation summary
   * @param {string} managerEmail - Manager email who triggered the generation
   */
  async logGenerationSummary(triggerType, summary, managerEmail) {
    try {
      await pool.query(`
        INSERT INTO audit_logs (
          user_id, action, table_name, new_values, created_at
        ) VALUES (
          (SELECT id FROM users WHERE email = $1),
          $2,
          'fiscal_obligations',
          $3,
          NOW()
        )
      `, [
        managerEmail || 'system',
        `AUTOMATED_OBLIGATION_GENERATION_${triggerType.toUpperCase()}`,
        JSON.stringify({
          triggerType,
          summary,
          timestamp: new Date().toISOString(),
          success: true
        })
      ]);
    } catch (error) {
      console.error('Error logging generation summary:', error);
    }
  }

  /**
   * Log generation error to database
   * @param {string} triggerType - Type of trigger
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  async logGenerationError(triggerType, error, context) {
    try {
      await pool.query(`
        INSERT INTO audit_logs (
          action, table_name, new_values, created_at
        ) VALUES (
          $1,
          'fiscal_obligations',
          $2,
          NOW()
        )
      `, [
        `AUTOMATED_OBLIGATION_GENERATION_${triggerType.toUpperCase()}_ERROR`,
        JSON.stringify({
          triggerType,
          error: error.message,
          stack: error.stack,
          context,
          timestamp: new Date().toISOString(),
          success: false
        })
      ]);
    } catch (logError) {
      console.error('Error logging generation error:', logError);
    }
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      isInitialized: true
    };
  }

  /**
   * Stop the automated service
   */
  stop() {
    console.log('🛑 Stopping Automated Obligation Service...');
    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('✅ Automated Obligation Service stopped');
  }
}

// Create singleton instance
const automatedObligationService = new AutomatedObligationService();

module.exports = automatedObligationService;
