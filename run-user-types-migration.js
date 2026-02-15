const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '12345'
});

async function runMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      CREATE TABLE IF NOT EXISTS user_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO user_types (name, code, description) VALUES
      ('Call Center', 'cc', 'Call center executive'),
      ('Call Center Lead', 'ccl', 'Call center team lead'),
      ('Customer Relations Officer', 'cro', 'Customer relations officer'),
      ('Doctor', 'doctor', 'Medical doctor'),
      ('Staff', 'staff', 'General staff member')
      ON CONFLICT (code) DO NOTHING;
    `;

    await client.query(sql);
    console.log('User types table created and data inserted successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.end();
  }
}

runMigration();