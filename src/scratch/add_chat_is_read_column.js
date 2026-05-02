const { Client } = require('pg');
require('dotenv').config();

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
    console.log('Connected to database');

    console.log('Adding isRead column to chat_sessions...');
    await client.query(`
      ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "isRead" boolean DEFAULT true;
    `);
    console.log('Added isRead column');

    await client.end();
    console.log('Database migration completed');
  } catch (err) {
    console.error('Error migrating database:', err);
    process.exit(1);
  }
}

run();
