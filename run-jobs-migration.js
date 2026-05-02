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
    console.log('🚀 Running jobs table migration...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'create-jobs-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Jobs table created successfully!');
    
    // Insert some sample data if table is empty
    const countResult = await pool.query('SELECT count(*) FROM jobs');
    if (parseInt(countResult.rows[0].count) === 0) {
      console.log('📝 Inserting sample jobs...');
      await pool.query(`
        INSERT INTO jobs (title, location, type, description, requirements) VALUES 
        ('Senior Consultant', 'Hyderabad, Telangana', 'Full-time', 'We are looking for an experienced Homeopathy Consultant to lead our clinical team.', 'MD in Homeopathy, 10+ years experience'),
        ('Clinic Coordinator', 'Vijayawada, AP', 'Full-time', 'Manage daily operations of our branch and ensure patient satisfaction.', 'Bachelor degree, excellent communication'),
        ('Tele-Consultation Expert', 'Remote / Hyderabad', 'Contract', 'Provide expert consultation to our international patients via video calls.', 'BHMS, 5+ years experience, fluent English');
      `);
      console.log('✅ Sample jobs inserted!');
    }
    
    // Verify the data
    const result = await pool.query('SELECT id, title FROM jobs ORDER BY id');
    console.log('\n📋 Current Jobs in Database:');
    result.rows.forEach(row => {
      console.log(`  ${row.id}. ${row.title}`);
    });
    
  } catch (error) {
    console.error('❌ Error running jobs migration:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
