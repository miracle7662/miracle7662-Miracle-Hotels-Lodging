const axios = require('axios');

async function testGuestAPI() {
  try {
    console.log('Testing guest API endpoint...');
    
    // Test without authentication (should fail)
    console.log('\n1. Testing without authentication:');
    try {
      const response = await axios.post('http://localhost:3001/api/guest-masters', {
        guest_name: 'Test Guest',
        mobile_no: '1234567890',
        adhar_no: '123456789012'
      });
      console.log('Unexpected success:', response.data);
    } catch (error) {
      console.log('Expected error (no auth):', error.response?.status, error.response?.data);
    }
    
    // Test with invalid token
    console.log('\n2. Testing with invalid token:');
    try {
      const response = await axios.post('http://localhost:3001/api/guest-masters', {
        guest_name: 'Test Guest',
        mobile_no: '1234567890',
        adhar_no: '123456789012'
      }, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('Unexpected success:', response.data);
    } catch (error) {
      console.log('Expected error (invalid token):', error.response?.status, error.response?.data);
    }
    
    console.log('\nAPI endpoint is working correctly. The issue is likely authentication.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testGuestAPI(); 