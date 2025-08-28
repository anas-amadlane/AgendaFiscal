const { pool } = require('./src/config/database');
const fiscalObligationService = require('./src/services/fiscalObligationService');

async function debugObligationGeneration() {
  console.log('🔍 Debugging Obligation Generation...\n');
  
  try {
    // 1. Check companies
    console.log('📊 Checking Companies:');
    const companiesResult = await pool.query(`
      SELECT 
        id, name, categorie_personnes, sous_categorie, 
        is_tva_assujetti, regime_tva, prorata_deduction, status
      FROM companies 
      WHERE status = 'active'
      ORDER BY name
    `);
    
    console.log(`Found ${companiesResult.rows.length} active companies:`);
    companiesResult.rows.forEach((company, index) => {
      console.log(`  ${index + 1}. ${company.name} (${company.categorie_personnes})`);
    });
    console.log('');

    // 2. Check fiscal calendar entries
    console.log('📅 Checking Fiscal Calendar Entries:');
    const calendarResult = await pool.query(`
      SELECT 
        id, categorie_personnes, sous_categorie, type, tag, 
        frequence_declaration, mois, jours
      FROM fiscal_calendar 
      ORDER BY categorie_personnes, type
    `);
    
    console.log(`Found ${calendarResult.rows.length} fiscal calendar entries:`);
    calendarResult.rows.forEach((entry, index) => {
      console.log(`  ${index + 1}. ${entry.categorie_personnes} - ${entry.type} (${entry.tag}) - ${entry.frequence_declaration}`);
    });
    console.log('');

    // 3. Check unique categories
    console.log('🏷️ Unique Categories:');
    const categoriesResult = await pool.query(`
      SELECT DISTINCT categorie_personnes 
      FROM fiscal_calendar 
      ORDER BY categorie_personnes
    `);
    
    console.log('Calendar categories:');
    categoriesResult.rows.forEach(cat => console.log(`  - ${cat.categorie_personnes}`));
    
    const companyCategoriesResult = await pool.query(`
      SELECT DISTINCT categorie_personnes 
      FROM companies 
      WHERE status = 'active' AND categorie_personnes IS NOT NULL
      ORDER BY categorie_personnes
    `);
    
    console.log('Company categories:');
    companyCategoriesResult.rows.forEach(cat => console.log(`  - ${cat.categorie_personnes}`));
    console.log('');

    // 4. Test matching for each company
    console.log('🔗 Testing Company-Calendar Matching:');
    for (const company of companiesResult.rows) {
      console.log(`\nTesting company: ${company.name} (${company.categorie_personnes})`);
      
      // Get relevant calendar entries for this company
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

      const matchingEntries = await pool.query(query, params);
      console.log(`  Found ${matchingEntries.rows.length} matching calendar entries`);
      
      if (matchingEntries.rows.length > 0) {
        matchingEntries.rows.forEach(entry => {
          console.log(`    - ${entry.tag} (${entry.frequence_declaration}) - ${entry.type}`);
        });
      } else {
        console.log(`    ❌ No matching entries found for category: ${company.categorie_personnes}`);
      }
    }

    // 5. Test obligation generation for one company
    if (companiesResult.rows.length > 0) {
      console.log('\n🧪 Testing Obligation Generation for First Company:');
      const testCompany = companiesResult.rows[0];
      console.log(`Testing with company: ${testCompany.name}`);
      
      try {
        const obligations = await fiscalObligationService.generateObligationsForCompanyDynamic(
          testCompany.id, 
          '238b679b-fe0c-460a-8394-0bbfcb107eb9' // Your admin user ID
        );
        
        console.log(`Generated ${obligations.length} obligations for ${testCompany.name}`);
        
        if (obligations.length > 0) {
          obligations.slice(0, 3).forEach((obligation, index) => {
            console.log(`  ${index + 1}. ${obligation.title} - Due: ${obligation.due_date}`);
          });
        }
      } catch (error) {
        console.error(`Error generating obligations for ${testCompany.name}:`, error.message);
      }
    }

    // 6. Check existing obligations
    console.log('\n📋 Checking Existing Obligations:');
    const existingObligations = await pool.query(`
      SELECT COUNT(*) as count 
      FROM fiscal_obligations
    `);
    console.log(`Total existing obligations: ${existingObligations.rows[0].count}`);

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await pool.end();
  }
}

// Run the debug
debugObligationGeneration();
