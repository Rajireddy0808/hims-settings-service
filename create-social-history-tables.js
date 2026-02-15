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
    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_history (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS social_history_options (
        id SERIAL PRIMARY KEY,
        social_history_id INTEGER REFERENCES social_history(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_social_history (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        social_history_id INTEGER REFERENCES social_history(id) ON DELETE CASCADE,
        social_history_option_id INTEGER REFERENCES social_history_options(id) ON DELETE CASCADE,
        category_title VARCHAR(255),
        option_title VARCHAR(255),
        location_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, social_history_option_id, location_id)
      );
    `);

    await pool.query(`
      INSERT INTO social_history (title, description) VALUES
      ('Education', 'Educational background'),
      ('Occupation', 'Work and employment status'),
      ('Living Situation', 'Housing and living arrangements'),
      ('Support System', 'Family and social support'),
      ('Financial Status', 'Economic situation'),
      ('Cultural Background', 'Cultural and ethnic background')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO social_history_options (social_history_id, title) VALUES
      (1, 'Primary'), (1, 'Secondary'), (1, 'Graduate'), (1, 'Post Graduate'),
      (2, 'Employed'), (2, 'Unemployed'), (2, 'Retired'), (2, 'Student'),
      (3, 'Alone'), (3, 'With Family'), (3, 'With Friends'), (3, 'Assisted Living'),
      (4, 'Strong'), (4, 'Moderate'), (4, 'Weak'), (4, 'None'),
      (5, 'Good'), (5, 'Average'), (5, 'Poor'), (5, 'Critical'),
      (6, 'Asian'), (6, 'European'), (6, 'African'), (6, 'American')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Social history tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables();