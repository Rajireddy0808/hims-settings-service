const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '12345'
});

async function fixUserInfoTable() {
  try {
    await client.connect();
    console.log('Connected to database');

    const sql = `
      -- Add user_id column
      ALTER TABLE user_info ADD COLUMN user_id INTEGER;
      
      -- Update user_id for existing records
      UPDATE user_info SET user_id = (
        SELECT id FROM users WHERE users.user_info_id = user_info.id
      );
      
      -- Delete orphaned records
      DELETE FROM user_info WHERE user_id IS NULL;
      
      -- Drop the existing primary key constraint
      ALTER TABLE user_info DROP CONSTRAINT user_info_pkey;
      
      -- Drop the id column
      ALTER TABLE user_info DROP COLUMN id;
      
      -- Set user_id as primary key
      ALTER TABLE user_info ADD CONSTRAINT user_info_pkey PRIMARY KEY (user_id);
      
      -- Add foreign key constraint
      ALTER TABLE user_info ADD CONSTRAINT fk_user_info_user_id 
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    `;

    await client.query(sql);
    console.log('User info table structure fixed successfully');
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await client.end();
  }
}

fixUserInfoTable();