const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

async function testPatientSource() {
  try {
    console.log('Testing patient_source table...');
    
    // Check if table exists and get data
    const result = await pool.query('SELECT * FROM patient_source ORDER BY id');
    console.log('Patient sources found:', result.rows.length);
    result.rows.forEach(row => {
      console.log(`- ${row.title} (${row.code})`);
    });
    
    // Check patients table for source column
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'patients' AND column_name IN ('source', 'referred_by')
    `);
    console.log('\nPatients table columns:', columnCheck.rows.map(r => r.column_name));
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testPatientSource();