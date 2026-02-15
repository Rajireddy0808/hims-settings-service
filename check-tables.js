const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '12345'
});

async function checkTables() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check mobile_numbers table
    const mobileResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'mobile_numbers' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== MOBILE_NUMBERS TABLE ===');
    mobileResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check call_history table
    const callResult = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'call_history' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n=== CALL_HISTORY TABLE ===');
    callResult.rows.forEach(row => {
      console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Sample data from mobile_numbers
    const sampleData = await client.query('SELECT * FROM mobile_numbers LIMIT 3');
    console.log('\n=== SAMPLE MOBILE_NUMBERS DATA ===');
    console.log(sampleData.rows);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkTables();