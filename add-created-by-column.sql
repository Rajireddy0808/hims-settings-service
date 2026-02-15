-- Add created_by column to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS created_by INTEGER;

-- Add foreign key constraint to users table
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_created_by 
FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_appointments_created_by ON appointments(created_by);