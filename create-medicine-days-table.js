const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '12345',
  database: 'postgres',
});

async function createTables() {
  try {
    console.log('Creating medicine_days table...');
    
    // Create medicine_days table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicine_days (
        id SERIAL PRIMARY KEY,
        days VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert initial medicine days options
    await pool.query(`
      INSERT INTO medicine_days (days) VALUES
      ('1'), ('3'), ('5'), ('7'), ('10'), ('13'), ('14'), ('15'), ('28'), ('30'), ('60'), ('90'), ('180'), ('360')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Medicine days table created and seeded successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables();
