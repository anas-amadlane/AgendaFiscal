const fiscalObligationService = require('./src/services/fiscalObligationService');
const { pool } = require('./src/config/database');

async function testFullGeneration() {
  console.log('🧪 Testing Full Obligation Generation for All Companies...\n');
  
  try {
    // Get admin user ID
    const users = await pool.query(`
      SELECT id FROM users 
      WHERE email = 'anas@gmail.com' 
      LIMIT 1
    `);
    
    if (users.rows.length === 0) {
      console.log('❌ Admin user not found');
      return;
    }
    
    const userId = users.rows[0].id;
    console.log(`Using admin user ID: ${userId}`);
    
    // Test the full generation
    console.log('🚀 Starting full obligation generation...');
    const summary = await fiscalObligationService.generateObligationsForAllCompaniesDynamic('anas@gmail.com');
    
    console.log('\n📊 Generation Summary:');
    console.log(`✅ Total companies with obligations: ${summary.companiesWithObligations}`);
    console.log(`📈 Total obligations generated: ${summary.totalObligations}`);
    console.log(`⏱️  Generation time: ${summary.generationTime}ms`);
    
    if (summary.companyDetails) {
      console.log('\n🏢 Company Details:');
      summary.companyDetails.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name}: ${company.obligationCount} obligations`);
      });
    }
    
    // Verify in database
    console.log('\n🔍 Verifying in database...');
    const totalObligations = await pool.query(`
      SELECT COUNT(*) as count 
      FROM fiscal_obligations 
      WHERE obligation_details->>'generated_from_calendar' = 'true'
    `);
    
    console.log(`📋 Total obligations in database: ${totalObligations.rows[0].count}`);
    
    if (summary.totalObligations > 0) {
      console.log('\n🎉 SUCCESS! Obligation generation is working correctly!');
    } else {
      console.log('\n❌ No obligations were generated');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await pool.end();
  }
}

testFullGeneration();
