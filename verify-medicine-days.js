const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '12345'
});

async function verify() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check if table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'medicine_days'
      );
    `);
    
    console.log('Table medicine_days exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Check columns
      const columnResult = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'medicine_days' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n=== Columns ===');
      columnResult.rows.forEach(row => {
        console.log(`${row.column_name}: ${row.data_type}`);
      });
      
      // Check data
      const dataResult = await client.query('SELECT * FROM medicine_days');
      console.log('\n=== DataCount ===', dataResult.rowCount);
      console.log('\n=== Data ===');
      console.log(dataResult.rows);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

verify();
