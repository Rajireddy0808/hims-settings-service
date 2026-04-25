const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to database.');
    
    console.log('\n--- LOCATIONS ---');
    const locations = await client.query('SELECT id, name, location_code, is_active FROM locations ORDER BY id');
    console.table(locations.rows);

    console.log('\n--- BRANCHES ---');
    const branches = await client.query('SELECT id, name, slug, status FROM branches ORDER BY id');
    console.table(branches.rows);

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
