const { pool } = require('./src/config/database');

async function debugCalendarDetails() {
  console.log('🔍 Debugging Calendar Entry Details...\n');
  
  try {
    // Check a few calendar entries in detail
    console.log('📅 Sample Calendar Entries:');
    const sampleEntries = await pool.query(`
      SELECT 
        id, categorie_personnes, type, tag, frequence_declaration, 
        mois, jours, detail_declaration, commentaire
      FROM fiscal_calendar 
      LIMIT 10
    `);
    
    sampleEntries.rows.forEach((entry, index) => {
      console.log(`\n${index + 1}. Entry ID: ${entry.id}`);
      console.log(`   Category: ${entry.categorie_personnes}`);
      console.log(`   Type: ${entry.type}`);
      console.log(`   Tag: ${entry.tag}`);
      console.log(`   Frequency: ${entry.frequence_declaration}`);
      console.log(`   Month: ${entry.mois} (type: ${typeof entry.mois})`);
      console.log(`   Day: ${entry.jours} (type: ${typeof entry.jours})`);
      console.log(`   Detail: ${entry.detail_declaration}`);
    });

    // Check for entries with missing mois/jours
    console.log('\n🔍 Checking for entries with missing mois/jours:');
    const missingDates = await pool.query(`
      SELECT COUNT(*) as count 
      FROM fiscal_calendar 
      WHERE mois IS NULL OR jours IS NULL OR mois = '' OR jours = ''
    `);
    console.log(`Entries with missing mois/jours: ${missingDates.rows[0].count}`);

    // Check data types
    console.log('\n🔍 Checking data types:');
    const dataTypes = await pool.query(`
      SELECT 
        mois, jours,
        pg_typeof(mois) as mois_type,
        pg_typeof(jours) as jours_type
      FROM fiscal_calendar 
      LIMIT 5
    `);
    
    dataTypes.rows.forEach((row, index) => {
      console.log(`${index + 1}. mois: ${row.mois} (${row.mois_type}), jours: ${row.jours} (${row.jours_type})`);
    });

    // Test date calculation with a sample entry
    console.log('\n🧪 Testing Date Calculation:');
    const testEntry = await pool.query(`
      SELECT * FROM fiscal_calendar 
      WHERE mois IS NOT NULL AND jours IS NOT NULL 
      AND mois != '' AND jours != ''
      LIMIT 1
    `);
    
    if (testEntry.rows.length > 0) {
      const entry = testEntry.rows[0];
      console.log(`Test entry: ${entry.tag} - Month: ${entry.mois}, Day: ${entry.jours}`);
      
      // Test the date calculation logic
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      console.log(`Current date: ${currentDate.toISOString()}`);
      console.log(`Current year: ${currentYear}, Current month: ${currentMonth}`);
      
      // Test the calculateDueDateDynamic logic
      const month = parseInt(entry.mois) - 1; // JavaScript months are 0-indexed
      console.log(`Parsed month: ${month} (from ${entry.mois})`);
      console.log(`Parsed day: ${entry.jours}`);
      
      const dueDate = new Date();
      dueDate.setFullYear(currentYear);
      dueDate.setMonth(month);
      dueDate.setDate(entry.jours);
      
      console.log(`Calculated due date: ${dueDate.toISOString()}`);
      
      // Check if the date is valid
      console.log(`Is valid date: ${!isNaN(dueDate.getTime())}`);
    }

    // Check the date range calculation
    console.log('\n📅 Testing Date Range:');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    // Start from January 1st of current year
    const startDate = new Date(currentYear, 0, 1);
    
    // End 12 months from current month
    const endDate = new Date(currentYear, currentMonth + 12, 0); // Last day of the month
    
    console.log(`Start date: ${startDate.toISOString()}`);
    console.log(`End date: ${endDate.toISOString()}`);
    console.log(`Date range: ${Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days`);

  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await pool.end();
  }
}

// Run the debug
debugCalendarDetails();
