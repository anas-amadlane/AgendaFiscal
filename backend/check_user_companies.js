const { pool } = require('./src/config/database');

async function checkUserCompanies() {
  console.log('🔍 Checking User Company Associations...\n');
  
  try {
    // Check the user
    const user = await pool.query(`
      SELECT id, email, role FROM users 
      WHERE email = 'anas@gmail.com'
    `);
    
    if (user.rows.length === 0) {
      console.log('❌ User not found');
      return;
    }
    
    console.log(`👤 User: ${user.rows[0].email} (${user.rows[0].role})`);
    
    // Check company_user_roles
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
      
      // Get all companies
      const companies = await pool.query(`
        SELECT id, name, categorie_personnes 
        FROM companies 
        WHERE status = 'active'
      `);
      
      console.log(`\n📋 Available companies: ${companies.rows.length}`);
      companies.rows.forEach((company, index) => {
        console.log(`${index + 1}. ${company.name} (${company.categorie_personnes})`);
      });
      
      // Create associations for admin user
      if (user.rows[0].role === 'admin') {
        console.log('\n🔧 Creating company associations for admin user...');
        
        for (const company of companies.rows) {
          await pool.query(`
            INSERT INTO company_user_roles (user_id, company_id, role, status, created_at)
            VALUES ($1, $2, 'owner', 'active', NOW())
            ON CONFLICT (user_id, company_id) DO NOTHING
          `, [user.rows[0].id, company.id]);
        }
        
        console.log('✅ Company associations created for admin user');
        
        // Verify the associations
        const newUserRoles = await pool.query(`
          SELECT 
            cur.*,
            c.name as company_name,
            c.categorie_personnes
          FROM company_user_roles cur
          INNER JOIN companies c ON cur.company_id = c.id
          WHERE cur.user_id = $1
        `, [user.rows[0].id]);
        
        console.log(`\n✅ User now has ${newUserRoles.rows.length} company associations`);
        newUserRoles.rows.forEach((role, index) => {
          console.log(`${index + 1}. ${role.company_name} (${role.role})`);
        });
      }
    } else {
      console.log('\n📋 Current company associations:');
      userRoles.rows.forEach((role, index) => {
        console.log(`${index + 1}. ${role.company_name} (${role.role}) - Status: ${role.status}`);
      });
    }
    
    // Test obligations access after fixing
    console.log('\n🧪 Testing obligations access:');
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
      LIMIT 10
    `, [user.rows[0].id]);
    
    console.log(`✅ User can access ${obligations.rows.length} obligations`);
    
    if (obligations.rows.length > 0) {
      console.log('\n📋 Sample accessible obligations:');
      obligations.rows.slice(0, 3).forEach((obligation, index) => {
        console.log(`${index + 1}. ${obligation.title} - ${obligation.company_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

checkUserCompanies();
