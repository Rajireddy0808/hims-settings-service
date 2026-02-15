-- Create patient_source table
CREATE TABLE IF NOT EXISTS patient_source (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO patient_source (title, code, status) VALUES
('Walk-in', 'WALK_IN', true),
('Referral', 'REFERRAL', true),
('Online', 'ONLINE', true),
('Emergency', 'EMERGENCY', true),
('Insurance', 'INSURANCE', true)
ON CONFLICT (code) DO NOTHING;

-- Add source column to patients table (rename from referred_by if it exists)
DO $$
BEGIN
    -- Check if referred_by column exists and rename it
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'patients' AND column_name = 'referred_by') THEN
        ALTER TABLE patients RENAME COLUMN referred_by TO source;
    ELSE
        -- Add source column if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'patients' AND column_name = 'source') THEN
            ALTER TABLE patients ADD COLUMN source VARCHAR(50);
        END IF;
    END IF;
END $$;