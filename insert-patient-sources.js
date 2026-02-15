const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

async function insertPatientSources() {
  try {
    // Create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_source (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          code VARCHAR(50) UNIQUE NOT NULL,
          status BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert sample data
    const sources = [
      { title: 'Walk-in', code: 'WALK_IN' },
      { title: 'Referral', code: 'REFERRAL' },
      { title: 'Online', code: 'ONLINE' },
      { title: 'Emergency', code: 'EMERGENCY' },
      { title: 'Insurance', code: 'INSURANCE' }
    ];

    for (const source of sources) {
      await pool.query(`
        INSERT INTO patient_source (title, code, status) 
        VALUES ($1, $2, true) 
        ON CONFLICT (code) DO NOTHING
      `, [source.title, source.code]);
    }

    // Check if patients table has source column
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name = 'source'
    `);

    if (columnCheck.rows.length === 0) {
      // Add source column to patients table
      await pool.query(`ALTER TABLE patients ADD COLUMN source VARCHAR(50)`);
      console.log('Added source column to patients table');
    }

    // Verify data
    const result = await pool.query('SELECT * FROM patient_source ORDER BY id');
    console.log('Patient sources inserted successfully:');
    result.rows.forEach(row => {
      console.log(`- ${row.title} (${row.code})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertPatientSources();