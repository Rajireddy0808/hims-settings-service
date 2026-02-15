const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '12345'
});

async function fixSequences() {
  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      -- Fix users sequence
      SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
    `;

    await client.query(sql);
    console.log('Database sequences fixed successfully');
  } catch (error) {
    console.error('Fix sequences error:', error);
  } finally {
    await client.end();
  }
}

fixSequences();