const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'postgres',
});

async function runMigration() {
  try {
    console.log('Running lifestyle migration...');
    const sql = fs.readFileSync('lifestyle-tables.sql', 'utf8');
    await pool.query(sql);
    console.log('Lifestyle migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration();