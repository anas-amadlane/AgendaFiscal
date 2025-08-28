const { pool } = require('./src/config/database');

async function checkUserAnasr() {
  console.log('🔍 Checking User anasr@gmail.com...\n');
  
  try {
    // Check the user
    const user = await pool.query(`
      SELECT id, email, role FROM users 
      WHERE email = 'anasr@gmail.com'
    `);
    
    if (user.rows.length === 0) {
      console.log('❌ User anasr@gmail.com not found');
      return;
    }
    
    console.log(`👤 User: ${user.rows[0].email} (${user.rows[0].role})`);
    
    // Check company_user_roles for this user
    const userRoles = await pool.query(`
      SELECT 
        cur.*,
        c.name as company_name,
        c.categorie_personnes
      FROM company_user_roles cur
      INNER JOIN companies c ON cur.company_id = c.id
      WHERE cur.user_id = $1
    `, [user.rows[0].id]);
    
    console.log(`\n🏢 User company roles: ${userRoles.rows.length}`);
    
    if (userRoles.rows.length === 0) {
      console.log('❌ User has no company associations');
    } else {
      console.log('\n📋 Company associations:');
      userRoles.rows.forEach((role, index) => {
        console.log(`${index + 1}. ${role.company_name} (${role.role}) - Status: ${role.status}`);
      });
    }
    
    // Check total obligations this user can access
    const totalObligations = await pool.query(`
      SELECT COUNT(*) as count
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
    `, [user.rows[0].id]);
    
    console.log(`\n📊 Total obligations user can access: ${totalObligations.rows[0].count}`);
    
    // Check obligations by company
    const obligationsByCompany = await pool.query(`
      SELECT 
        c.name as company_name,
        COUNT(*) as obligation_count
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY obligation_count DESC
    `, [user.rows[0].id]);
    
    console.log('\n🏢 Obligations by company:');
    obligationsByCompany.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.company_name}: ${row.obligation_count} obligations`);
    });
    
    // Check obligations by type
    const obligationsByType = await pool.query(`
      SELECT 
        fo.obligation_type,
        COUNT(*) as count
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
      GROUP BY fo.obligation_type
      ORDER BY count DESC
    `, [user.rows[0].id]);
    
    console.log('\n🏷️ Obligations by type:');
    obligationsByType.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.obligation_type}: ${row.count}`);
    });
    
    // Sample obligations
    const sampleObligations = await pool.query(`
      SELECT 
        fo.title,
        fo.due_date,
        fo.status,
        fo.obligation_type,
        c.name as company_name
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      INNER JOIN company_user_roles cur ON c.id = cur.company_id
      WHERE cur.user_id = $1 AND cur.status = 'active'
      ORDER BY fo.due_date ASC
      LIMIT 10
    `, [user.rows[0].id]);
    
    console.log('\n📋 Sample obligations:');
    sampleObligations.rows.forEach((obligation, index) => {
      console.log(`${index + 1}. ${obligation.title} - ${obligation.company_name} - Due: ${obligation.due_date}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkUserAnasr();
