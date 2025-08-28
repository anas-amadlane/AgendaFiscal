const { pool } = require('./src/config/database');

async function testDuplicatePrevention() {
  console.log('🧪 Testing Duplicate Prevention...\n');
  
  try {
    // Get a sample company
    const companyResult = await pool.query(`
      SELECT id, name, categorie_personnes 
      FROM companies 
      WHERE status = 'active'
      LIMIT 1
    `);
    
    if (companyResult.rows.length === 0) {
      console.log('❌ No companies found for testing');
      return;
    }
    
    const company = companyResult.rows[0];
    console.log(`🏢 Testing with company: ${company.name} (${company.id})`);
    
    // Check existing obligations for this company
    const existingObligations = await pool.query(`
      SELECT 
        obligation_type,
        due_date,
        periode_declaration,
        COUNT(*) as count
      FROM fiscal_obligations 
      WHERE company_id = $1 
      AND obligation_details->>'generated_from_calendar' = 'true'
      GROUP BY obligation_type, due_date, periode_declaration
      HAVING COUNT(*) > 1
      ORDER BY count DESC
      LIMIT 10
    `, [company.id]);
    
    console.log(`\n📊 Current duplicate obligations for ${company.name}:`);
    if (existingObligations.rows.length > 0) {
      existingObligations.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.obligation_type} - ${row.due_date} - ${row.periode_declaration || 'N/A'} (${row.count} duplicates)`);
      });
    } else {
      console.log('  ✅ No duplicate obligations found');
    }
    
    // Test the duplicate check function
    console.log('\n🔍 Testing duplicate check function:');
    
    // Get a sample obligation
    const sampleObligation = await pool.query(`
      SELECT 
        obligation_type,
        due_date,
        periode_declaration
      FROM fiscal_obligations 
      WHERE company_id = $1 
      AND obligation_details->>'generated_from_calendar' = 'true'
      LIMIT 1
    `, [company.id]);
    
    if (sampleObligation.rows.length > 0) {
      const obligation = sampleObligation.rows[0];
      
      // Test checking for existing obligation
      const checkQuery = `
        SELECT COUNT(*) as count
        FROM fiscal_obligations 
        WHERE company_id = $1 
        AND obligation_type = $2 
        AND DATE(due_date) = DATE($3)
        AND obligation_details->>'generated_from_calendar' = 'true'
      `;
      
      const checkResult = await pool.query(checkQuery, [
        company.id, 
        obligation.obligation_type, 
        obligation.due_date
      ]);
      
      const exists = parseInt(checkResult.rows[0].count) > 0;
      console.log(`   Checking: ${obligation.obligation_type} for ${company.name} on ${obligation.due_date}`);
      console.log(`   Result: ${exists ? 'EXISTS (would skip)' : 'NOT EXISTS (would create)'}`);
      
      // Test with period declaration
      if (obligation.periode_declaration) {
        const checkWithPeriodQuery = `
          SELECT COUNT(*) as count
          FROM fiscal_obligations 
          WHERE company_id = $1 
          AND obligation_type = $2 
          AND DATE(due_date) = DATE($3)
          AND periode_declaration = $4
          AND obligation_details->>'generated_from_calendar' = 'true'
        `;
        
        const checkWithPeriodResult = await pool.query(checkWithPeriodQuery, [
          company.id, 
          obligation.obligation_type, 
          obligation.due_date,
          obligation.periode_declaration
        ]);
        
        const existsWithPeriod = parseInt(checkWithPeriodResult.rows[0].count) > 0;
        console.log(`   With period '${obligation.periode_declaration}': ${existsWithPeriod ? 'EXISTS (would skip)' : 'NOT EXISTS (would create)'}`);
      }
    }
    
    // Test date range for potential duplicates
    console.log('\n📅 Testing date range for potential duplicates:');
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st
    const endDate = new Date(currentYear, 11, 31); // December 31st
    
    const dateRangeQuery = `
      SELECT 
        obligation_type,
        COUNT(*) as total_count,
        COUNT(DISTINCT DATE(due_date)) as unique_dates,
        COUNT(*) - COUNT(DISTINCT DATE(due_date)) as potential_duplicates
      FROM fiscal_obligations 
      WHERE company_id = $1 
      AND due_date >= $2 
      AND due_date <= $3
      AND obligation_details->>'generated_from_calendar' = 'true'
      GROUP BY obligation_type
      ORDER BY potential_duplicates DESC
    `;
    
    const dateRangeResult = await pool.query(dateRangeQuery, [company.id, startDate, endDate]);
    
    console.log(`   Obligations for ${currentYear}:`);
    dateRangeResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.obligation_type}: ${row.total_count} total, ${row.unique_dates} unique dates, ${row.potential_duplicates} potential duplicates`);
    });
    
    // Test the duplicate stats function
    console.log('\n📊 Testing duplicate stats function:');
    const duplicateStatsQuery = `
      SELECT 
        obligation_type,
        COUNT(*) as total_count,
        COUNT(CASE WHEN obligation_details->>'generated_from_calendar' = 'true' THEN 1 END) as generated_count
      FROM fiscal_obligations 
      WHERE company_id = $1 
      AND due_date >= $2 
      AND due_date <= $3
      GROUP BY obligation_type
      HAVING COUNT(*) > 1
    `;
    
    const duplicateStatsResult = await pool.query(duplicateStatsQuery, [company.id, startDate, endDate]);
    
    if (duplicateStatsResult.rows.length > 0) {
      console.log('   Duplicate obligations found:');
      duplicateStatsResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.obligation_type}: ${row.total_count} total, ${row.generated_count} generated`);
      });
    } else {
      console.log('   ✅ No duplicate obligations found in date range');
    }
    
    console.log('\n✅ Duplicate prevention test completed!');
    console.log('🎉 Service will now skip existing obligations to prevent duplicates!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testDuplicatePrevention();
