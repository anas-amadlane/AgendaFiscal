const fetch = require('node-fetch');

async function testCalendarAPI() {
  console.log('🧪 Testing Calendar API...\n');
  
  try {
    // Test the obligations endpoint
    console.log('📅 Testing GET /obligations endpoint:');
    
    const response = await fetch('http://localhost:3001/api/v1/obligations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will be handled by middleware
      }
    });
    
    const result = await response.json();
    console.log('API Response Status:', response.status);
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ API call successful!');
      console.log(`📊 Total obligations: ${result.data?.length || 0}`);
      
      if (result.data && result.data.length > 0) {
        console.log('\n📋 Sample obligations:');
        result.data.slice(0, 3).forEach((obligation, index) => {
          console.log(`${index + 1}. ${obligation.title} - Due: ${obligation.due_date} - Status: ${obligation.status}`);
        });
      } else {
        console.log('❌ No obligations found');
      }
      
      if (result.pagination) {
        console.log(`📄 Pagination: Page ${result.pagination.page} of ${result.pagination.pages} (${result.pagination.total} total)`);
      }
    } else {
      console.log('❌ API call failed:', result.message);
    }
    
    // Test with filters
    console.log('\n🔍 Testing with filters:');
    const filteredResponse = await fetch('http://localhost:3001/api/v1/obligations?status=pending&limit=10', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    const filteredResult = await filteredResponse.json();
    console.log('Filtered Response Status:', filteredResponse.status);
    
    if (filteredResult.success) {
      console.log(`✅ Filtered API call successful! Found ${filteredResult.data?.length || 0} pending obligations`);
    } else {
      console.log('❌ Filtered API call failed:', filteredResult.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Wait a bit for the server to start
setTimeout(() => {
  testCalendarAPI();
}, 2000);
