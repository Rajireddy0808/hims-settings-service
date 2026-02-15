-- Update Attendance Table for Multiple Check-ins/Check-outs with Duration Calculation
-- This script modifies the existing attendance table to support the new requirements

-- First, drop the unique constraint to allow multiple entries per user per date
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS unique_user_date;

-- Add location_id column if it doesn't exist
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS location_id INTEGER;

-- Add duration column to store calculated duration in minutes
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;

-- Add foreign key constraint for location_id (check if exists first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_attendance_location') THEN
        ALTER TABLE attendance ADD CONSTRAINT fk_attendance_location 
            FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes (check if exists first)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_location_id') THEN
        CREATE INDEX idx_attendance_location_id ON attendance(location_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_user_location_date') THEN
        CREATE INDEX idx_attendance_user_location_date ON attendance(user_id, location_id, date);
    END IF;
END $$;

-- Update comments
COMMENT ON COLUMN attendance.location_id IS 'Foreign key reference to locations table for global location-based storage';
COMMENT ON COLUMN attendance.duration IS 'Duration in minutes between check-in and check-out';

-- Sample data update (optional) - calculate duration for existing records
UPDATE attendance 
SET duration = CASE 
    WHEN check_in IS NOT NULL AND check_out IS NOT NULL THEN
        EXTRACT(EPOCH FROM (check_out::time - check_in::time)) / 60
    ELSE 0
END
WHERE duration = 0 AND check_in IS NOT NULL AND check_out IS NOT NULL;