const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'web1234U',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    const res = await client.query('SELECT id, title, excerpt, content, short_description, long_description, slug FROM "blogs" LIMIT 10');
    console.log('--- Blog Data Audit ---');
    res.rows.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Title: ${row.title}`);
      console.log(`Slug: ${row.slug}`);
      console.log(`Excerpt (old): ${row.excerpt ? row.excerpt.substring(0, 50) + '...' : 'NULL'}`);
      console.log(`Content (old): ${row.content ? row.content.substring(0, 50) + '...' : 'NULL'}`);
      console.log(`Short Desc (new): ${row.short_description ? row.short_description.substring(0, 50) + '...' : 'NULL'}`);
      console.log(`Long Desc (new): ${row.long_description ? row.long_description.substring(0, 50) + '...' : 'NULL'}`);
      console.log('-----------------------');
    });
    await client.end();
  } catch (err) {
    console.error('Error auditing data:', err);
  }
}

run();
