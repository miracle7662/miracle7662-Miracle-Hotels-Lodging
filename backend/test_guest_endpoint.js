const axios = require('axios');

async function testGuestEndpoint() {
  try {
    console.log('Testing GET /api/guest-masters endpoint...');
    
    // Test GET request without authentication
    try {
      const response = await axios.get('http://localhost:3001/api/guest-masters');
      console.log('GET Response:', response.status, response.data);
    } catch (error) {
      console.log('GET Error:', error.response?.status, error.response?.data);
    }
    
    console.log('\nTesting POST /api/guest-masters endpoint...');
    
    // Test POST request without authentication
    try {
      const response = await axios.post('http://localhost:3001/api/guest-masters', {
        guest_name: 'Test Guest',
        mobile_no: '1234567890',
        adhar_no: '123456789012'
      });
      console.log('POST Response:', response.status, response.data);
    } catch (error) {
      console.log('POST Error:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testGuestEndpoint(); 