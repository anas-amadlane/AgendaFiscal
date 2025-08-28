const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

async function fixSessionsTable() {
  try {
    console.log('🔧 Fixing user_sessions table...');

    // Read the migration file
    const migrationPath = path.join(__dirname, 'fix_sessions_migration.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    console.log('📋 Applying sessions table fix...');
    await pool.query(migration);
    console.log('✅ Sessions table fixed successfully');

    console.log('🎉 Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  fixSessionsTable();
}

module.exports = { fixSessionsTable };
