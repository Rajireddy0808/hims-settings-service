const axios = require('axios');

const BASE_URL = 'http://localhost:3002/api';

async function testMobileAPIs() {
  try {
    console.log('Testing Mobile APIs...\n');
    
    // First, login to get token
    console.log('1. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginResponse.data.access_token;
    const userId = loginResponse.data.data.UserInfo.id;
    console.log(`✓ Login successful. User ID: ${userId}`);
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // 2. Assign mobile numbers to user
    console.log('\n2. Assigning mobile numbers to user...');
    const assignResponse = await axios.post(
      `${BASE_URL}/settings/users/mobile-test/${userId}/assign-numbers`,
      { count: 3 },
      { headers }
    );
    console.log('✓ Assign response:', assignResponse.data);
    
    // 3. Get mobile numbers for user
    console.log('\n3. Getting mobile numbers for user...');
    const numbersResponse = await axios.get(
      `${BASE_URL}/settings/users/mobile-test/${userId}`,
      { headers }
    );
    console.log('✓ Mobile numbers:', numbersResponse.data);
    
    // 4. Submit a call record (if we have numbers)
    if (numbersResponse.data && numbersResponse.data.length > 0) {
      const firstNumber = numbersResponse.data[0];
      console.log('\n4. Submitting call record...');
      
      const callRecord = {
        mobileNumberId: firstNumber.id,
        disposition: 'Answered',
        patientFeeling: 'Good',
        notes: 'Patient is feeling better',
        nextCallDate: '2025-01-15'
      };
      
      const callResponse = await axios.post(
        `${BASE_URL}/settings/users/mobile-test/${userId}/call-record`,
        callRecord,
        { headers }
      );
      console.log('✓ Call record response:', callResponse.data);
    }
    
    console.log('\n✅ All mobile APIs working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing APIs:', error.response?.data || error.message);
  }
}

testMobileAPIs();