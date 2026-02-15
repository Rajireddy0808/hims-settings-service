const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '12345'
});

async function checkTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    const result = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'user_info'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current user_info table structure:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

checkTable();