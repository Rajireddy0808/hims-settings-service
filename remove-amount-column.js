const { Client } = require('pg');
require('dotenv').config();

async function removeAmountColumn() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'postgres'
  });

  await client.connect();

  try {
    console.log('Removing amount column from treatment_plans table...');
    
    await client.query(`ALTER TABLE treatment_plans DROP COLUMN IF EXISTS amount`);
    
    console.log('Amount column removed successfully');

  } catch (error) {
    console.error('Error removing amount column:', error);
  } finally {
    await client.end();
  }
}

removeAmountColumn();