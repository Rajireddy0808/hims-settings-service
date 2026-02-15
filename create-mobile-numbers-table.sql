-- Create mobile_numbers table
CREATE TABLE IF NOT EXISTS mobile_numbers (
    id SERIAL PRIMARY KEY,
    mobile VARCHAR(20) NOT NULL,
    user_id INTEGER,
    location_id INTEGER,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mobile_numbers_user_id ON mobile_numbers(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_numbers_location_id ON mobile_numbers(location_id);
CREATE INDEX IF NOT EXISTS idx_mobile_numbers_mobile ON mobile_numbers(mobile);