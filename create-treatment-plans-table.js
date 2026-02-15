const { Client } = require('pg');
require('dotenv').config();

async function createTreatmentPlansTable() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '12345',
    database: process.env.DB_NAME || 'postgres'
  });

  await client.connect();

  try {
    console.log('Creating treatment_plans table...');
    
    // Create treatment_plans table
    await client.query(`
      CREATE TABLE IF NOT EXISTS treatment_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        months INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Treatment plans table created successfully');

    // Check if data already exists
    const existingData = await client.query('SELECT COUNT(*) FROM treatment_plans');
    
    if (existingData.rows[0].count == 0) {
      // Insert sample data
      await client.query(`
        INSERT INTO treatment_plans (name, months, amount, description, status) VALUES
        ('Basic Package', 1, 5000.00, '1 Month Basic Treatment Plan', 'active'),
        ('Standard Package', 3, 14000.00, '3 Months Standard Treatment Plan', 'active'),
        ('Premium Package', 6, 26000.00, '6 Months Premium Treatment Plan', 'active'),
        ('Annual Package', 12, 48000.00, '12 Months Annual Treatment Plan', 'active'),
        ('Extended Package', 18, 65000.00, '18 Months Extended Treatment Plan', 'active')
      `);
      console.log('Sample treatment plans inserted successfully');
    } else {
      console.log('Treatment plans data already exists, skipping insert');
    }

  } catch (error) {
    console.error('Error creating treatment_plans table:', error);
  } finally {
    await client.end();
  }
}

createTreatmentPlansTable();