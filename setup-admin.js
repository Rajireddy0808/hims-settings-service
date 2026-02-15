const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'postgres',
});

async function checkAndCreateAdmin() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for admin user...');
    
    // Check if admin exists
    const result = await client.query(
      "SELECT id, username, is_active FROM users WHERE username = 'admin'"
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Admin user found:', result.rows[0]);
      
      // Update password to admin123
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(
        'UPDATE users SET password = $1, is_active = true WHERE username = $2',
        [hashedPassword, 'admin']
      );
      console.log('✅ Password updated to: admin123');
      
    } else {
      console.log('❌ Admin user not found. Creating...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await client.query(`
        INSERT INTO users (username, password, email, phone, is_active, primary_location_id)
        VALUES ('admin', $1, 'admin@hospital.com', '9542510709', true, 1)
      `, [hashedPassword]);
      
      console.log('✅ Admin user created with password: admin123');
    }
    
    // Check user_location_permissions
    const permCheck = await client.query(
      "SELECT * FROM user_location_permissions WHERE user_id = (SELECT id FROM users WHERE username = 'admin')"
    );
    
    if (permCheck.rows.length === 0) {
      console.log('⚠️  No permissions found. Creating superadmin permissions...');
      
      const adminId = await client.query("SELECT id FROM users WHERE username = 'admin'");
      await client.query(`
        INSERT INTO user_location_permissions (user_id, role_id, location_id, department_id)
        VALUES ($1, 1, NULL, NULL)
      `, [adminId.rows[0].id]);
      
      console.log('✅ Superadmin permissions created');
    } else {
      console.log('✅ Permissions exist:', permCheck.rows);
    }
    
    console.log('\n✅ Setup complete! Login with:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAndCreateAdmin();
