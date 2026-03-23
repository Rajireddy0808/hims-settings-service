const { Pool } = require('pg');

const pool = new Pool({
  host: 'unicare-1.cjioaoua8wgw.eu-north-1.rds.amazonaws.com',
  port: 5432,
  user: 'postgres',
  password: 'web1234U',
  database: 'postgres',
});

async function migrate() {
  try {
    console.log('Connecting to AWS RDS...');
    await pool.connect();
    console.log('Connected!');
    
    console.log('Creating medicine_days table on AWS...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS medicine_days (
        id SERIAL PRIMARY KEY,
        days VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      INSERT INTO medicine_days (days) VALUES
      ('1'), ('3'), ('5'), ('7'), ('10'), ('13'), ('14'), ('15'), ('28'), ('30'), ('60'), ('90'), ('180'), ('360')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Migration successful on AWS!');
  } catch (error) {
    console.error('Migration failed on AWS:', error.message);
  } finally {
    await pool.end();
  }
}

migrate();
