const fetch = require('node-fetch');

async function testApiEndpoint() {
  console.log('🧪 Testing API Endpoint...\n');
  
  try {
    const response = await fetch('http://localhost:3001/api/v1/fiscal/obligations/generate/all-companies-dynamic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token' // This will be handled by the middleware
      },
      body: JSON.stringify({
        managerEmail: 'anas@gmail.com'
      })
    });
    
    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ API call successful!');
      console.log(`📊 Generated obligations: ${result.data.totalObligations}`);
      console.log(`🏢 Companies with obligations: ${result.data.companiesWithObligations}`);
    } else {
      console.log('❌ API call failed:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Wait a bit for the server to start
setTimeout(() => {
  testApiEndpoint();
}, 3000);
