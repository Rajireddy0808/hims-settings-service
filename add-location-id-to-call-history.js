const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function addLocationIdColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Adding location_id column to call_history table...');
    
    await client.query(`
      ALTER TABLE call_history 
      ADD COLUMN IF NOT EXISTS location_id INTEGER;
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_call_history_location_id ON call_history(location_id);
    `);
    
    console.log('Location_id column added successfully!');
    
  } catch (error) {
    console.error('Error adding location_id column:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

addLocationIdColumn();