const axios = require('axios');

async function verifyApi() {
  try {
    const response = await axios.get('http://localhost:3002/api/medicine-days');
    console.log('Status Code:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.log('Status Code:', error.response.status);
      console.log('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

verifyApi();
