const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

async function runMigration() {
  try {
    console.log('Running appointment types migration...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-appointment-types-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Appointment types table created successfully!');
    console.log('✅ Default appointment types inserted!');
    
    // Verify the data
    const result = await pool.query('SELECT * FROM appointment_types ORDER BY id');
    console.log('\n📋 Appointment Types:');
    result.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.name} (${row.code})`);
    });
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();