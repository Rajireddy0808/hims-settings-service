const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'hims_user_settings',
    user: 'postgres',
    password: 'password'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sqlFile = path.join(__dirname, 'create_consultations.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    await client.query(sql);
    console.log('Migration executed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration();