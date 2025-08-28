const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function migrateFiscalCalendar() {
  try {
    console.log('🔧 Migrating fiscal calendar to new schema...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'fiscal_calendar_migration.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    console.log('📋 Applying fiscal calendar schema update...');
    await pool.query(migration);
    console.log('✅ Fiscal calendar migration completed successfully');

    // Verify the new structure
    console.log('🔍 Verifying new table structure...');
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'fiscal_calendar' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 New fiscal_calendar table structure:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check sample data
    const sampleData = await pool.query('SELECT COUNT(*) as count FROM fiscal_calendar');
    console.log(`📈 Sample data inserted: ${sampleData.rows[0].count} records`);

    console.log('🎉 Fiscal calendar migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  migrateFiscalCalendar();
}

module.exports = { migrateFiscalCalendar };
