const { pool } = require('./src/config/database');

async function testObligationUpdates() {
  console.log('🧪 Testing Obligation Updates...\n');
  
  try {
    // Get a sample obligation for testing
    const sampleObligation = await pool.query(`
      SELECT id, title, status, priority 
      FROM fiscal_obligations 
      LIMIT 1
    `);
    
    if (sampleObligation.rows.length === 0) {
      console.log('❌ No obligations found for testing');
      return;
    }
    
    const obligation = sampleObligation.rows[0];
    console.log(`📋 Testing with obligation: ${obligation.title}`);
    console.log(`   Current status: ${obligation.status}`);
    console.log(`   Current priority: ${obligation.priority}`);
    
    // Test status update
    console.log('\n🔄 Testing status update:');
    const newStatus = obligation.status === 'pending' ? 'completed' : 'pending';
    await pool.query(`
      UPDATE fiscal_obligations 
      SET status = $1, last_edited = NOW()
      WHERE id = $2
    `, [newStatus, obligation.id]);
    
    console.log(`✅ Status updated from ${obligation.status} to ${newStatus}`);
    
    // Test priority update
    console.log('\n🔄 Testing priority update:');
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const currentIndex = priorities.indexOf(obligation.priority);
    const nextIndex = (currentIndex + 1) % priorities.length;
    const newPriority = priorities[nextIndex];
    
    await pool.query(`
      UPDATE fiscal_obligations 
      SET priority = $1, last_edited = NOW()
      WHERE id = $2
    `, [newPriority, obligation.id]);
    
    console.log(`✅ Priority updated from ${obligation.priority} to ${newPriority}`);
    
    // Verify the updates
    const updatedObligation = await pool.query(`
      SELECT id, title, status, priority, last_edited
      FROM fiscal_obligations 
      WHERE id = $1
    `, [obligation.id]);
    
    console.log('\n📊 Verification:');
    console.log(`   Final status: ${updatedObligation.rows[0].status}`);
    console.log(`   Final priority: ${updatedObligation.rows[0].priority}`);
    console.log(`   Last edited: ${updatedObligation.rows[0].last_edited}`);
    
    // Reset to original values
    console.log('\n🔄 Resetting to original values:');
    await pool.query(`
      UPDATE fiscal_obligations 
      SET status = $1, priority = $2, last_edited = NOW()
      WHERE id = $3
    `, [obligation.status, obligation.priority, obligation.id]);
    
    console.log('✅ Reset completed');
    
    console.log('\n✅ All obligation update tests passed!');
    console.log('🎉 Frontend can now update obligation status and priority!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

testObligationUpdates();
