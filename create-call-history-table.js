const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function createCallHistoryTable() {
  const client = await pool.connect();
  
  try {
    console.log('Creating call_history table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS call_history (
          id SERIAL PRIMARY KEY,
          patient_id VARCHAR(50) NOT NULL,
          next_call_date DATE,
          caller_by VARCHAR(100),
          patient_feeling VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_call_history_patient_id ON call_history(patient_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_call_history_created_at ON call_history(created_at);
    `);
    
    console.log('Call history table created successfully!');
    
  } catch (error) {
    console.error('Error creating call history table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

createCallHistoryTable();