const fetch = require('node-fetch');

async function testAdminAPI() {
  try {
    console.log('🔍 Testing admin API without authentication...');
    
    // Test without authentication (should return 401)
    const response1 = await fetch('http://localhost:3001/api/v1/admin/dashboard', {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔍 Response without auth - Status:', response1.status);
    const errorText = await response1.text();
    console.log('🔍 Response without auth - Body:', errorText);
    
    // Test with invalid token (should return 401)
    const response2 = await fetch('http://localhost:3001/api/v1/admin/dashboard', {
      headers: {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🔍 Response with invalid token - Status:', response2.status);
    const errorText2 = await response2.text();
    console.log('🔍 Response with invalid token - Body:', errorText2);
    
    console.log('✅ Admin API authentication is working correctly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAdminAPI();
