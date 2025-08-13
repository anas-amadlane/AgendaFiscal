const fetch = require('node-fetch');

async function testEmailCheck() {
  try {
    console.log('Testing email check endpoint...');
    
    const response = await fetch('http://localhost:3001/api/v1/auth/check-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    const data = await response.text();
    console.log('Response body:', data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmailCheck();
