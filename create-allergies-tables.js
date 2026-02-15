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
    // Create allergies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allergies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create allergies_options table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS allergies_options (
        id SERIAL PRIMARY KEY,
        allergies_id INTEGER REFERENCES allergies(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create patient_allergies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS patient_allergies (
        id SERIAL PRIMARY KEY,
        patient_id INTEGER NOT NULL,
        allergies_id INTEGER REFERENCES allergies(id) ON DELETE CASCADE,
        allergies_option_id INTEGER REFERENCES allergies_options(id) ON DELETE CASCADE,
        category_title VARCHAR(255),
        option_title VARCHAR(255),
        location_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(patient_id, allergies_option_id, location_id)
      );
    `);

    // Insert sample data
    await pool.query(`
      INSERT INTO allergies (title, description) VALUES
      ('Food Allergies', 'Food-related allergic reactions'),
      ('Drug Allergies', 'Medication allergic reactions'),
      ('Environmental', 'Environmental allergens'),
      ('Seasonal', 'Seasonal allergic reactions'),
      ('Contact Allergies', 'Skin contact allergies'),
      ('Respiratory', 'Airborne allergens')
      ON CONFLICT DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO allergies_options (allergies_id, title) VALUES
      (1, 'Mild'), (1, 'Moderate'), (1, 'Severe'), (1, 'No Allergy'),
      (2, 'Mild'), (2, 'Moderate'), (2, 'Severe'), (2, 'No Allergy'),
      (3, 'Mild'), (3, 'Moderate'), (3, 'Severe'), (3, 'No Allergy'),
      (4, 'Mild'), (4, 'Moderate'), (4, 'Severe'), (4, 'No Allergy'),
      (5, 'Mild'), (5, 'Moderate'), (5, 'Severe'), (5, 'No Allergy'),
      (6, 'Mild'), (6, 'Moderate'), (6, 'Severe'), (6, 'No Allergy')
      ON CONFLICT DO NOTHING;
    `);

    console.log('Allergies tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables();