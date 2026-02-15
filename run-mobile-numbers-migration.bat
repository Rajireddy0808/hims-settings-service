@echo off
echo Creating mobile_numbers table...
node -e "
const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  host: 'localhost',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'password'
});

async function createTable() {
  try {
    await client.connect();
    const sql = fs.readFileSync('create-mobile-numbers-table.sql', 'utf8');
    await client.query(sql);
    console.log('Mobile numbers table created successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

createTable();
"
pause