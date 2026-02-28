const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
});

async function setupAdmin() {
  try {
    await client.connect();
    console.log('✅ Database connected');

    // Check if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist');
      console.log('Please run database migrations first');
      process.exit(1);
    }

    // Create or update admin user
    const hashedPassword = await bcrypt.hash('admin', 10);
    
    await client.query(`
      INSERT INTO users (username, password, email, "isActive", "primaryLocationId")
      VALUES ('admin', $1, 'admin@hospital.com', true, 1)
      ON CONFLICT (username) 
      DO UPDATE SET password = $1, "isActive" = true
    `, [hashedPassword]);

    console.log('✅ Admin user created/updated');
    console.log('   Username: admin');
    console.log('   Password: admin');

    // Create superadmin permissions
    await client.query(`
      INSERT INTO user_location_permissions (user_id, role_id, location_id, department_id)
      SELECT u.id, 1, NULL, NULL
      FROM users u
      WHERE u.username = 'admin'
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Admin permissions set');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

setupAdmin();
