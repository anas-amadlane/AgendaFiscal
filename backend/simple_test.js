const { pool } = require('./src/config/database');
const fiscalObligationService = require('./src/services/fiscalObligationService');

async function simpleTest() {
  console.log('🧪 Simple Test of Obligation Generation...\n');
  
  try {
    // Test the calculateDueDateDynamic function
    console.log('📅 Testing calculateDueDateDynamic:');
    
    const testEntry = {
      mois: '12',
      jours: '15',
      frequence_declaration: 'Mensuel'
    };
    
    const currentDate = new Date(2024, 0, 1); // January 1, 2024
    const dueDate = fiscalObligationService.calculateDueDateDynamic(testEntry, currentDate);
    
    console.log(`Test entry: ${testEntry.frequence_declaration}`);
    console.log(`Current date: ${currentDate.toISOString()}`);
    console.log(`Calculated due date: ${dueDate?.toISOString()}`);
    
    if (dueDate) {
      console.log('✅ Date calculation works!');
    } else {
      console.log('❌ Date calculation failed!');
    }
    
    // Test with a real company
    console.log('\n🏢 Testing with real company:');
    const companies = await pool.query(`
      SELECT id, name, categorie_personnes 
      FROM companies 
      WHERE status = 'active' 
      LIMIT 1
    `);
    
    if (companies.rows.length > 0) {
      const company = companies.rows[0];
      console.log(`Testing with company: ${company.name}`);
      
      // Get user ID for admin
      const users = await pool.query(`
        SELECT id FROM users 
        WHERE email = 'anas@gmail.com' 
        LIMIT 1
      `);
      
      if (users.rows.length > 0) {
        const userId = users.rows[0].id;
        console.log(`Using user ID: ${userId}`);
        
        // Test generation for this company
        const obligations = await fiscalObligationService.generateObligationsForCompanyDynamic(company.id, userId);
        console.log(`Generated ${obligations.length} obligations for ${company.name}`);
        
        if (obligations.length > 0) {
          console.log('✅ Obligation generation works!');
          console.log('Sample obligation:', obligations[0]);
        } else {
          console.log('❌ No obligations generated');
        }
      } else {
        console.log('❌ Admin user not found');
      }
    } else {
      console.log('❌ No companies found');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await pool.end();
  }
}

simpleTest();
