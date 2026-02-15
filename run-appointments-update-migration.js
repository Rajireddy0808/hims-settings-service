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
    console.log('Running appointments table update migration...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'update-appointments-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    await pool.query(sql);
    
    console.log('✅ Appointments table updated successfully!');
    console.log('✅ appointment_type_id column added with foreign key constraint!');
    
    // Verify the structure
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'appointments' 
      AND column_name IN ('appointment_type', 'appointment_type_id')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Appointments Table Columns:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check sample data
    const sampleData = await pool.query(`
      SELECT a.id, a.appointment_type, a.appointment_type_id, at.name as type_name
      FROM appointments a
      LEFT JOIN appointment_types at ON a.appointment_type_id = at.id
      LIMIT 5
    `);
    
    if (sampleData.rows.length > 0) {
      console.log('\n📋 Sample Appointment Data:');
      sampleData.rows.forEach(row => {
        console.log(`  ID: ${row.id}, Old Type: ${row.appointment_type}, New Type ID: ${row.appointment_type_id}, Type Name: ${row.type_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error running migration:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();