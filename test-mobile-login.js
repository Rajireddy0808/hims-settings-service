const axios = require('axios');

const BASE_URL = 'http://10.41.251.242:3002/api';

async function testMobileLogin() {
  try {
    console.log('Testing Mobile Login with Settings Service...\n');
    
    // Test login like mobile app would do
    console.log('1. Testing mobile login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    console.log('✓ Login Response Status:', loginResponse.status);
    console.log('✓ Login Response Data:', JSON.stringify(loginResponse.data, null, 2));
    
    const userData = loginResponse.data.data?.UserInfo;
    if (userData) {
      console.log(`✓ Login successful for user: ${userData.user_name} (ID: ${userData.id})`);
      
      // Test getting mobile numbers
      console.log('\n2. Testing mobile numbers fetch...');
      const numbersResponse = await axios.get(
        `${BASE_URL}/settings/users/mobile-test/${userData.id}`
      );
      
      console.log('✓ Mobile numbers count:', numbersResponse.data.length);
      console.log('✓ Sample mobile numbers:', numbersResponse.data.slice(0, 3));
      
    } else {
      console.log('❌ No user data in response');
    }
    
    console.log('\n✅ Mobile login test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing mobile login:', error.response?.data || error.message);
  }
}

testMobileLogin();