const { pool } = require('./src/config/database');

async function testFrontendSimulation() {
  console.log('🧪 Testing Frontend Simulation...\n');
  
  try {
    // Simulate the frontend API call to get obligations
    console.log('📅 Simulating frontend API call to get obligations:');
    
    // Get a user ID for testing (using the admin user)
    const user = await pool.query(`
      SELECT id FROM users 
      WHERE email = 'anas@gmail.com' 
      LIMIT 1
    `);
    
    if (user.rows.length === 0) {
      console.log('❌ No user found for testing');
      return;
    }
    
    const userId = user.rows[0].id;
    console.log(`Using user ID: ${userId}`);
    
    // Simulate the obligations query that the frontend would make
    const obligations = await pool.query(`
      SELECT 
        fo.*,
        c.name as company_name,
        c.categorie_personnes,
        c.sous_categorie
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
      ORDER BY fo.due_date ASC
      LIMIT 50
    `, [userId]);
    
    console.log(`✅ Found ${obligations.rows.length} obligations for user`);
    
    if (obligations.rows.length > 0) {
      console.log('\n📋 Sample obligations:');
      obligations.rows.slice(0, 5).forEach((obligation, index) => {
        console.log(`${index + 1}. ${obligation.title}`);
        console.log(`   Company: ${obligation.company_name}`);
        console.log(`   Type: ${obligation.obligation_type}`);
        console.log(`   Due Date: ${obligation.due_date}`);
        console.log(`   Status: ${obligation.status}`);
        console.log(`   Priority: ${obligation.priority}`);
        console.log('');
      });
    }
    
    // Simulate getting companies
    console.log('🏢 Simulating frontend API call to get companies:');
    const companies = await pool.query(`
      SELECT DISTINCT c.* 
      FROM companies c
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
      ORDER BY c.created_at DESC
    `, [userId]);
    
    console.log(`✅ Found ${companies.rows.length} companies for user`);
    
    if (companies.rows.length > 0) {
      console.log('\n📋 Companies:');
      companies.rows.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name} (${company.categorie_personnes})`);
      });
    }
    
    // Test filtering by company
    if (companies.rows.length > 0) {
      const testCompanyId = companies.rows[0].id;
      console.log(`\n🔍 Testing filter by company: ${companies.rows[0].name}`);
      
      const filteredObligations = await pool.query(`
        SELECT 
          fo.*,
          c.name as company_name,
          c.categorie_personnes,
          c.sous_categorie
        FROM fiscal_obligations fo
        INNER JOIN companies c ON fo.company_id = c.id
        INNER JOIN company_user_roles cur ON c.id = cur.company_id
        WHERE cur.user_id = $1 AND cur.status = 'active' AND fo.company_id = $2
        ORDER BY fo.due_date ASC
        LIMIT 10
      `, [userId, testCompanyId]);
      
      console.log(`✅ Found ${filteredObligations.rows.length} obligations for this company`);
    }
    
    // Test filtering by status
    console.log('\n🔍 Testing filter by status (pending):');
    const pendingObligations = await pool.query(`
      SELECT 
        fo.*,
        c.name as company_name,
        c.categorie_personnes,
        c.sous_categorie
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active' AND fo.status = 'pending'
      ORDER BY fo.due_date ASC
      LIMIT 10
    `, [userId]);
    
    console.log(`✅ Found ${pendingObligations.rows.length} pending obligations`);
    
    // Test filtering by type
    console.log('\n🔍 Testing filter by type (TVA):');
    const tvaObligations = await pool.query(`
      SELECT 
        fo.*,
        c.name as company_name,
        c.categorie_personnes,
        c.sous_categorie
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active' AND fo.obligation_type = 'TVA'
      ORDER BY fo.due_date ASC
      LIMIT 10
    `, [userId]);
    
    console.log(`✅ Found ${tvaObligations.rows.length} TVA obligations`);
    
    console.log('\n✅ Frontend simulation completed successfully!');
    console.log('📊 Summary:');
    console.log(`  - Total obligations available: ${obligations.rows.length}`);
    console.log(`  - Companies available: ${companies.rows.length}`);
    console.log(`  - Pending obligations: ${pendingObligations.rows.length}`);
    console.log(`  - TVA obligations: ${tvaObligations.rows.length}`);
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await pool.end();
  }
}

testFrontendSimulation();
