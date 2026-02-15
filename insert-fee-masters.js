const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'postgres',
  password: '12345',
  port: 5432,
});

async function insertFeeMasters() {
  try {
    const sql = fs.readFileSync('create-fee-masters-table.sql', 'utf8');
    await pool.query(sql);
    
    // Verify data
    const result = await pool.query('SELECT * FROM fee_masters ORDER BY id');
    console.log('Fee masters inserted successfully:');
    result.rows.forEach(row => {
      console.log(`- ${row.title} (${row.code}) - $${row.amount}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

insertFeeMasters();