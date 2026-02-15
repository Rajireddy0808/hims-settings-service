-- Add mobile app related columns to call_history table
ALTER TABLE call_history 
ADD COLUMN IF NOT EXISTS mobile_number_id INTEGER,
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_call_history_mobile_number_id ON call_history(mobile_number_id);
CREATE INDEX IF NOT EXISTS idx_call_history_user_id ON call_history(user_id);

-- Update mobile_numbers table to ensure it has the mobile_number column (some might have 'mobile')
ALTER TABLE mobile_numbers 
ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(20);

-- Copy data from mobile to mobile_number if mobile_number is null
UPDATE mobile_numbers 
SET mobile_number = mobile 
WHERE mobile_number IS NULL AND mobile IS NOT NULL;

-- Add index on mobile_number for better performance
CREATE INDEX IF NOT EXISTS idx_mobile_numbers_mobile_number ON mobile_numbers(mobile_number);
CREATE INDEX IF NOT EXISTS idx_mobile_numbers_user_id ON mobile_numbers(user_id);