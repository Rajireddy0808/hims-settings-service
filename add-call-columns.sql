-- Add call tracking columns to mobile_numbers table
ALTER TABLE mobile_numbers 
ADD COLUMN IF NOT EXISTS next_call_date DATE,
ADD COLUMN IF NOT EXISTS disposition VARCHAR(50),
ADD COLUMN IF NOT EXISTS patient_feeling VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS caller_by INTEGER,
ADD COLUMN IF NOT EXISTS caller_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS caller_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;