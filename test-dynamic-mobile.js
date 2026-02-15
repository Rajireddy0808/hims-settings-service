const axios = require('axios');

const BASE_URL = 'http://10.41.251.242:3002/api';

async function testDynamicMobileAPIs() {
  try {
    console.log('Testing Dynamic Mobile APIs...\n');
    
    // Login
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const userData = loginResponse.data.data?.UserInfo;
    console.log(`✓ Login successful. User: ${userData.user_name} (ID: ${userData.id})`);
    
    // Get mobile numbers
    console.log('\n2. Getting mobile numbers...');
    const numbersResponse = await axios.get(
      `${BASE_URL}/settings/users/mobile/${userData.id}`
    );
    
    console.log(`✓ Found ${numbersResponse.data.length} mobile numbers`);
    
    // Submit call record if numbers exist
    if (numbersResponse.data.length > 0) {
      const firstNumber = numbersResponse.data[0];
      console.log('\n3. Submitting call record...');
      
      const callRecord = {
        mobileNumberId: firstNumber.id,
        disposition: 'Answered',
        patientFeeling: 'Good',
        notes: 'Test call from dynamic API',
        nextCallDate: '2025-01-20'
      };
      
      const callResponse = await axios.post(
        `${BASE_URL}/settings/users/mobile/${userData.id}/call-record`,
        callRecord
      );
      console.log('✓ Call record response:', callResponse.data);
    }
    
    console.log('\n✅ Dynamic mobile APIs working correctly!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testDynamicMobileAPIs();