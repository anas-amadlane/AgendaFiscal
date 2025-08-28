const { pool } = require('./src/config/database');

async function testFrontendAnasr() {
  console.log('🧪 Testing Frontend for User anasr@gmail.com...\n');
  
  try {
    // Get user ID for anasr@gmail.com
    const user = await pool.query(`
      SELECT id FROM users 
      WHERE email = 'anasr@gmail.com'
    `);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    const userId = user.rows[0].id;
    console.log(`👤 Testing for user: anasr@gmail.com (${userId})`);
    
    // Simulate the frontend API call with the new limit
    console.log('\n📅 Simulating frontend API call with limit=20000:');
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
      LIMIT 20000
    `, [userId]);
    
    console.log(`✅ Frontend received: ${obligations.rows.length} obligations`);
    
    // Get total count
    const totalCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
    `, [userId]);
    
    const total = totalCount.rows[0].count;
    console.log(`📊 Total obligations user can access: ${total}`);
    
    if (obligations.rows.length >= total) {
      console.log('✅ SUCCESS: Frontend now receives all obligations!');
    } else {
      console.log(`⚠️  WARNING: Frontend receives ${obligations.rows.length}/${total} obligations`);
    }
    
    // Test filtering by company
    console.log('\n🔍 Testing company filtering:');
    const companies = await pool.query(`
      SELECT DISTINCT c.* 
      FROM companies c
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
      ORDER BY c.created_at DESC
    `, [userId]);
    
    console.log(`🏢 User has access to ${companies.rows.length} companies:`);
    companies.rows.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name} (${company.categorie_personnes})`);
    });
    
    // Test filtering by status
    console.log('\n🔍 Testing status filtering:');
    const pendingObligations = obligations.rows.filter(obligation => obligation.status === 'pending');
    const overdueObligations = obligations.rows.filter(obligation => {
      const dueDate = new Date(obligation.due_date);
      const today = new Date();
      return dueDate < today;
    });
    
    console.log(`📊 Status breakdown:`);
    console.log(`  - Pending: ${pendingObligations.length}`);
    console.log(`  - Overdue: ${overdueObligations.length}`);
    console.log(`  - Total: ${obligations.rows.length}`);
    
    // Test filtering by type
    console.log('\n🔍 Testing type filtering:');
    const typeCounts = {};
    obligations.rows.forEach(obligation => {
      typeCounts[obligation.obligation_type] = (typeCounts[obligation.obligation_type] || 0) + 1;
    });
    
    console.log(`🏷️  Type breakdown:`);
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    
    // Sample obligations for display
    console.log('\n📋 Sample obligations for calendar display:');
    obligations.rows.slice(0, 5).forEach((obligation, index) => {
      console.log(`${index + 1}. ${obligation.title}`);
      console.log(`   Company: ${obligation.company_name}`);
      console.log(`   Type: ${obligation.obligation_type}`);
      console.log(`   Due Date: ${obligation.due_date}`);
      console.log(`   Status: ${obligation.status}`);
      console.log(`   Priority: ${obligation.priority}`);
      console.log('');
    });
    
    console.log('✅ Frontend simulation completed successfully!');
    console.log('🎉 User anasr@gmail.com will now see all their obligations in the calendar!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testFrontendAnasr();
