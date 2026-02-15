const axios = require('axios');

const BASE_URL = 'http://10.41.251.242:3002/api';

async function testTriggerMobileCall() {
  try {
    console.log('Testing Trigger Mobile Call API...\n');
    
    // 1. Trigger a mobile call (simulate web interface click)
    console.log('1. Triggering mobile call request...');
    const triggerResponse = await axios.post(`${BASE_URL}/trigger-mobile-call`, {
      phone_number: '9876543210',
      patient_name: 'John Doe',
      patient_id: 123,
      requested_by: 'Web User'
    });
    
    console.log('✓ Trigger response:', triggerResponse.data);
    
    // 2. Get mobile call requests (what mobile app polls)
    console.log('\n2. Getting mobile call requests...');
    const requestsResponse = await axios.get(`${BASE_URL}/mobile-call-requests`);
    
    console.log('✓ Call requests:', requestsResponse.data);
    console.log(`✓ Found ${requestsResponse.data.length} call requests`);
    
    // 3. Delete a call request (simulate mobile app making the call)
    if (requestsResponse.data.length > 0) {
      const firstRequest = requestsResponse.data[0];
      console.log(`\n3. Deleting call request ${firstRequest.id}...`);
      
      const deleteResponse = await axios.delete(`${BASE_URL}/mobile-call-requests/${firstRequest.id}`);
      console.log('✓ Delete response status:', deleteResponse.status);
      
      // Check requests again
      const updatedRequestsResponse = await axios.get(`${BASE_URL}/mobile-call-requests`);
      console.log(`✓ Remaining requests: ${updatedRequestsResponse.data.length}`);
    }
    
    console.log('\n✅ Trigger mobile call API working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testTriggerMobileCall();