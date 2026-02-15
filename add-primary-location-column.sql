-- Add primary_location_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS primary_location_id INTEGER;

-- Add foreign key constraint
ALTER TABLE users ADD CONSTRAINT fk_users_primary_location_id 
FOREIGN KEY (primary_location_id) REFERENCES locations(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_primary_location_id ON users(primary_location_id);