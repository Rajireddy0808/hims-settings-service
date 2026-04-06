const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration based on existing migration scripts
const pool = new Pool({
  user: 'postgres',
  host: 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
  database: 'postgres',
  password: 'web1234U',
  port: 5432,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('🚀 Running blogs table migration...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-blogs-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Blogs table created successfully!');
    console.log('✅ Initial blogs data inserted!');
    
    // Verify the data
    const result = await pool.query('SELECT id, title FROM blogs ORDER BY id');
    console.log('\n📋 Current Blogs in Database:');
    result.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error running blogs migration:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
