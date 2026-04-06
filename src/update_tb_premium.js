const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'web1234U',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
});

const detailedContent = `
<h2>Tuberculosis (TB): Understanding Medical and Homeopathy Treatment</h2>
<p>Tuberculosis (TB) is a serious but treatable infectious disease that continues to affect millions of people worldwide. Hearing the word "tuberculosis" can feel overwhelming, but with timely diagnosis and appropriate treatment, most individuals recover fully.</p>
<p>While conventional antibiotic therapy remains the foundation of treatment, some patients also explore complementary approaches such as homeopathy to support overall health during recovery.</p>

<h2>What is Tuberculosis?</h2>
<p>Tuberculosis (TB) is a contagious bacterial infection that most commonly affects the lungs. However, it can also involve other parts of the body, such as the spine, brain, kidneys, lymph nodes, or bones.</p>
<p>TB spreads through the air when a person with active lung tuberculosis coughs, sneezes, speaks, laughs, or sings. Not everyone exposed to TB bacteria becomes sick. The outcome depends largely on the immune system's ability to control the infection.</p>

<h2>Tuberculosis is Caused By Which Bacteria?</h2>
<p>Tuberculosis is caused by <strong>Mycobacterium tuberculosis</strong>, a slow-growing bacterium that enters the body through inhaled air droplets. Once inside the lungs, the bacteria may remain dormant or begin multiplying depending on the strength of the immune system.</p>

<h2>What are the stages of tuberculosis?</h2>
<p>TB infection develops in stages. Knowing the difference between each stage of TB helps reduce unnecessary fear. The primary stages include Exposure, Latent Infection, and Active Disease.</p>
`;

const shortDesc = "Tuberculosis (TB) is a serious but treatable infectious disease that continues to affect millions worldwide. Proper structuring of content and homeopathy support can aid in a comprehensive recovery.";

async function run() {
  try {
    await client.connect();
    console.log('Connected to database');

    const query = `
      UPDATE "blogs" 
      SET "short_description" = $1, "long_description" = $2 
      WHERE "title" ILIKE '%Tuberculosis%'
    `;
    const res = await client.query(query, [shortDesc, detailedContent]);
    console.log(`Updated ${res.rowCount} blog(s) to match the structured UI of Image 1.`);

    await client.end();
  } catch (err) {
    console.error('Error updating blog content:', err);
  }
}

run();
