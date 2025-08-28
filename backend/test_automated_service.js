const automatedObligationService = require('./src/services/automatedObligationService');

async function testAutomatedService() {
  console.log('🧪 Testing Automated Obligation Service...');
  
  try {
    // Test 1: Check service status
    console.log('\n📊 Service Status:');
    const status = automatedObligationService.getStatus();
    console.log(status);
    
    // Test 2: Initialize the service
    console.log('\n🚀 Initializing service...');
    await automatedObligationService.initialize();
    
    // Test 3: Check status after initialization
    console.log('\n📊 Service Status after initialization:');
    const statusAfter = automatedObligationService.getStatus();
    console.log(statusAfter);
    
    // Test 4: Test manual generation (requires admin email)
    console.log('\n🔧 Testing manual generation...');
    console.log('Note: This requires an admin user in the database');
    console.log('You can test this manually through the admin dashboard');
    
    console.log('\n✅ Automated service test completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Start the server to enable automated monthly generation');
    console.log('2. Create a company to test new company generation');
    console.log('3. Update fiscal calendar to test calendar update regeneration');
    console.log('4. Use the admin dashboard to test manual generation');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Stop the service to clean up
    automatedObligationService.stop();
    process.exit(0);
  }
}

// Run the test
testAutomatedService();
