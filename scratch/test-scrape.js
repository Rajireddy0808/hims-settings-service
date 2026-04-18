
const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    try {
        const url = 'https://www.google.com/search?q=unicare+homeopathy+miryalaguda';
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        console.log('Title:', $('title').text());
        // Try to find the review count or some reviewer names
        const names = [];
        $('.d4r7Q').each((i, el) => {
            names.push($(el).text());
        });
        console.log('Found names:', names);
        
        // If names are empty, maybe it's the simple search result page structure
        if (names.length === 0) {
            console.log('No names found with .d4r7Q. Trying other selectors...');
            // Google often serves different HTML to non-JS clients
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testScrape();
