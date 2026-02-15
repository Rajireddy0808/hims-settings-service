const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '12345'
});

async function createTable() {
  try {
    await client.connect();
    console.log('Connected to database');
    
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS mobile_numbers (
        id SERIAL PRIMARY KEY,
        mobile VARCHAR(20) NOT NULL,
        user_id INTEGER,
        location_id INTEGER,
        created_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createTableQuery);
    console.log('mobile_numbers table created successfully!');
    
  } catch (error) {
    console.error('Error creating table:', error.message);
  } finally {
    await client.end();
  }
}

createTable();