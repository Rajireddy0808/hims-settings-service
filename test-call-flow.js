const axios = require('axios');

const BASE_URL = 'http://10.41.251.242:3002/api';

async function testCallRequestFlow() {
  try {
    console.log('Testing Call Request Flow...\n');
    
    // 1. Check current call requests
    console.log('1. Checking existing call requests...');
    try {
      const existingRequests = await axios.get(`${BASE_URL}/mobile-call-requests`);
      console.log(`✓ Current requests: ${existingRequests.data.length}`);
      console.log('Existing requests:', JSON.stringify(existingRequests.data, null, 2));
    } catch (error) {
      console.log('❌ Error getting existing requests:', error.response?.data || error.message);
    }
    
    // 2. Trigger a new call request
    console.log('\n2. Triggering new call request...');
    try {
      const triggerResponse = await axios.post(`${BASE_URL}/trigger-mobile-call`, {
        phone_number: '9876543210',
        patient_name: 'Test Patient',
        patient_id: 999
      });
      console.log('✓ Trigger response:', triggerResponse.data);
    } catch (error) {
      console.log('❌ Error triggering call:', error.response?.data || error.message);
    }
    
    // 3. Check call requests again
    console.log('\n3. Checking call requests after trigger...');
    try {
      const updatedRequests = await axios.get(`${BASE_URL}/mobile-call-requests`);
      console.log(`✓ Updated requests: ${updatedRequests.data.length}`);
      console.log('Updated requests:', JSON.stringify(updatedRequests.data, null, 2));
    } catch (error) {
      console.log('❌ Error getting updated requests:', error.response?.data || error.message);
    }
    
    console.log('\n✅ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCallRequestFlow();