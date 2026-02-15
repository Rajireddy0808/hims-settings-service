-- Add user_status_id column to attendance table
-- This creates a foreign key relationship with user_status table

-- Add the column
ALTER TABLE attendance ADD COLUMN user_status_id INTEGER;

-- Add foreign key constraint
ALTER TABLE attendance 
ADD CONSTRAINT fk_attendance_user_status 
FOREIGN KEY (user_status_id) REFERENCES user_status(id);

-- Create index for better performance
CREATE INDEX idx_attendance_user_status_id ON attendance(user_status_id);

-- Set default user_status_id to 'Available' for existing records
UPDATE attendance 
SET user_status_id = (
    SELECT id FROM user_status 
    WHERE status_name = 'Available' 
    AND is_active = true
    LIMIT 1
)
WHERE user_status_id IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN attendance.user_status_id IS 'Foreign key reference to user_status table';