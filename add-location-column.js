const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'postgres',
});

async function addLocationColumn() {
  try {
    console.log('Adding location_id column...');
    
    await pool.query('ALTER TABLE patient_medical_history ADD COLUMN IF NOT EXISTS location_id INTEGER');
    
    console.log('Location_id column added successfully!');
    
  } catch (error) {
    console.error('Failed to add column:', error);
  } finally {
    await pool.end();
  }
}

addLocationColumn();