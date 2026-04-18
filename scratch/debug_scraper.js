const axios = require('axios');
const fs = require('fs');

async function debug() {
  const url = 'https://www.google.com/search?q=unicare+homeopathy+miryalaguda&lrd=0x3a352500008cc9b3:0x7dec762296313fd7,1';
  console.log(`URL: ${url}`);
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    fs.writeFileSync('google_debug.html', response.data);
    console.log('HTML saved to google_debug.html');
    console.log(`Length: ${response.data.length} bytes`);
    
    // Test some common patterns
    const patterns = [
      /class="TSv7u"/g,
      /class="Jsh78"/g,
      /class="dehYct"/g,
      /class="gws-local-reviews__google-review"/g,
      /class="d4r55"/g
    ];
    
    patterns.forEach(p => {
      const matches = response.data.match(p);
      console.log(`Pattern ${p}: ${matches ? matches.length : 0} matches`);
    });

  } catch (e) {
    console.error(`Error: ${e.message}`);
    if (e.response) {
       console.error(`Status: ${e.response.status}`);
    }
  }
}

debug();
