const { pool } = require('./src/config/database');

async function testPaginationFix() {
  console.log('🧪 Testing Pagination Fix...\n');
  
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
    console.log(`Testing for user: anasr@gmail.com (${userId})`);
    
    // Test with default limit (should now be 20000)
    console.log('\n📅 Testing with default limit:');
    const defaultResult = await pool.query(`
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
    
    console.log(`✅ Default limit returned: ${defaultResult.rows.length} obligations`);
    
    // Test with explicit high limit
    console.log('\n📅 Testing with explicit high limit:');
    const highLimitResult = await pool.query(`
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
      LIMIT 50000
    `, [userId]);
    
    console.log(`✅ High limit returned: ${highLimitResult.rows.length} obligations`);
    
    // Get total count without limit
    const totalCount = await pool.query(`
      SELECT COUNT(*) as count
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
    `, [userId]);
    
    const total = totalCount.rows[0].count;
    console.log(`📊 Total obligations user can access: ${total}`);
    
    // Check if we're getting all obligations
    if (defaultResult.rows.length >= total) {
      console.log('✅ SUCCESS: Default limit now returns all obligations!');
    } else {
      console.log(`⚠️  WARNING: Default limit returns ${defaultResult.rows.length}/${total} obligations`);
    }
    
    // Test pagination parameters
    console.log('\n📄 Testing pagination parameters:');
    const page1Result = await pool.query(`
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
      LIMIT 100 OFFSET 0
    `, [userId]);
    
    const page2Result = await pool.query(`
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
      LIMIT 100 OFFSET 100
    `, [userId]);
    
    console.log(`Page 1 (100 items): ${page1Result.rows.length} obligations`);
    console.log(`Page 2 (100 items): ${page2Result.rows.length} obligations`);
    
    // Verify no duplicates between pages
    const page1Ids = new Set(page1Result.rows.map(row => row.id));
    const page2Ids = new Set(page2Result.rows.map(row => row.id));
    const intersection = new Set([...page1Ids].filter(x => page2Ids.has(x)));
    
    if (intersection.size === 0) {
      console.log('✅ Pagination working correctly - no duplicates between pages');
    } else {
      console.log(`⚠️  WARNING: ${intersection.size} duplicates found between pages`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testPaginationFix();
