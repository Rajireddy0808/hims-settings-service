const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

async function checkTable() {
  try {
    console.log('Checking appointments table structure...');
    
    // Check table structure
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'appointments'
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Appointments Table Structure:');
    columns.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable}, default: ${row.column_default})`);
    });
    
    // Check if table has data
    const count = await pool.query('SELECT COUNT(*) FROM appointments');
    console.log(`\n📊 Total appointments: ${count.rows[0].count}`);
    
    // Check sample data
    const sample = await pool.query('SELECT * FROM appointments LIMIT 3');
    if (sample.rows.length > 0) {
      console.log('\n📋 Sample Data:');
      sample.rows.forEach((row, index) => {
        console.log(`  Record ${index + 1}:`, JSON.stringify(row, null, 2));
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTable();