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
    
    // Check if the column exists first
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='treatments' AND column_name='slug'
    `);

    if (res.rowCount === 0) {
      console.log('Column "slug" does not exist. Adding it...');
      await client.query('ALTER TABLE "treatments" ADD COLUMN "slug" VARCHAR(255) UNIQUE');
      console.log('Column "slug" added.');
    } else {
      console.log('Column "slug" already exists.');
    }

    // Populate slugs if they are null
    await client.query(`
      UPDATE "treatments" 
      SET "slug" = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
      WHERE "slug" IS NULL
    `);
    console.log('Slugs populated.');

    await client.end();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
