const { pool } = require('./src/config/database');

async function testCalendarData() {
  console.log('🧪 Testing Calendar Data...\n');
  
  try {
    // Check total fiscal obligations
    console.log('📊 Checking fiscal obligations data:');
    const totalObligations = await pool.query(`
      SELECT COUNT(*) as count 
      FROM fiscal_obligations
    `);
    console.log(`Total fiscal obligations: ${totalObligations.rows[0].count}`);
    
    // Check obligations by status
    const statusCounts = await pool.query(`
      SELECT status, COUNT(*) as count 
      FROM fiscal_obligations 
      GROUP BY status
    `);
    console.log('\n📈 Obligations by status:');
    statusCounts.rows.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });
    
    // Check obligations by type
    const typeCounts = await pool.query(`
      SELECT obligation_type, COUNT(*) as count 
      FROM fiscal_obligations 
      GROUP BY obligation_type
      ORDER BY count DESC
      LIMIT 10
    `);
    console.log('\n🏷️  Obligations by type (top 10):');
    typeCounts.rows.forEach(row => {
      console.log(`  ${row.obligation_type}: ${row.count}`);
    });
    
    // Check obligations by company
    const companyCounts = await pool.query(`
      SELECT c.name, COUNT(*) as count 
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      GROUP BY c.id, c.name
      ORDER BY count DESC
    `);
    console.log('\n🏢 Obligations by company:');
    companyCounts.rows.forEach(row => {
      console.log(`  ${row.name}: ${row.count}`);
    });
    
    // Check date range
    const dateRange = await pool.query(`
      SELECT 
        MIN(due_date) as earliest_due,
        MAX(due_date) as latest_due
      FROM fiscal_obligations
    `);
    console.log('\n📅 Date range:');
    console.log(`  Earliest due date: ${dateRange.rows[0].earliest_due}`);
    console.log(`  Latest due date: ${dateRange.rows[0].latest_due}`);
    
    // Sample obligations for current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentMonthObligations = await pool.query(`
      SELECT 
        fo.title,
        fo.due_date,
        fo.status,
        fo.obligation_type,
        c.name as company_name
      FROM fiscal_obligations fo
      INNER JOIN companies c ON fo.company_id = c.id
      WHERE EXTRACT(MONTH FROM fo.due_date) = $1 
      AND EXTRACT(YEAR FROM fo.due_date) = $2
      ORDER BY fo.due_date
      LIMIT 5
    `, [currentMonth, currentYear]);
    
    console.log(`\n📅 Sample obligations for ${currentMonth}/${currentYear}:`);
    if (currentMonthObligations.rows.length > 0) {
      currentMonthObligations.rows.forEach((obligation, index) => {
        console.log(`  ${index + 1}. ${obligation.title} - ${obligation.company_name} - Due: ${obligation.due_date} - Status: ${obligation.status}`);
      });
    } else {
      console.log('  No obligations for current month');
    }
    
    // Check if there are any generated obligations
    const generatedObligations = await pool.query(`
      SELECT COUNT(*) as count 
      FROM fiscal_obligations 
      WHERE obligation_details->>'generated_from_calendar' = 'true'
    `);
    console.log(`\n🔄 Generated obligations: ${generatedObligations.rows[0].count}`);
    
    if (totalObligations.rows[0].count > 0) {
      console.log('\n✅ Calendar has data to display!');
    } else {
      console.log('\n❌ No fiscal obligations found in database');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    await pool.end();
  }
}

testCalendarData();
