const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'postgres',
});

async function insertData() {
  try {
    // Insert medical history
    await pool.query(`
      INSERT INTO medical_history (id, title, description) VALUES
      (1, 'Diabetes', 'History of diabetes'),
      (2, 'Hypertension', 'History of high blood pressure'),
      (3, 'Heart Disease', 'History of cardiovascular disease'),
      (4, 'Asthma', 'History of asthma'),
      (5, 'Cancer', 'History of cancer')
      ON CONFLICT (id) DO NOTHING
    `);

    // Insert family history
    await pool.query(`
      INSERT INTO family_history (id, title, description) VALUES
      (1, 'Diabetes', 'Family history of diabetes'),
      (2, 'Hypertension', 'Family history of high blood pressure'),
      (3, 'Heart Disease', 'Family history of cardiovascular disease'),
      (4, 'Cancer', 'Family history of cancer')
      ON CONFLICT (id) DO NOTHING
    `);

    console.log('✓ Data inserted successfully');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertData();
