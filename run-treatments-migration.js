const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration based on existing migration scripts
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

async function runMigration() {
  try {
    console.log('🚀 Running treatments table migration...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-treatments-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Treatments table created successfully!');
    console.log('✅ Initial treatments data inserted!');
    
    // Verify the data
    const result = await pool.query('SELECT id, name FROM treatments ORDER BY id');
    console.log('\n📋 Current Treatments in Database:');
    result.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error running treatments migration:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
