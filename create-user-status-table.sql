-- Create User Status Table with Color Code
-- This table manages user status configurations with associated color codes

CREATE TABLE user_status (
    id SERIAL PRIMARY KEY,
    status_name VARCHAR(50) NOT NULL UNIQUE,
    color_code VARCHAR(7) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_user_status_active ON user_status(is_active);
CREATE INDEX idx_user_status_name ON user_status(status_name);

-- Insert default user status with color codes
INSERT INTO user_status (status_name, color_code, description) VALUES
('Available', '#10b981', 'User is available for work'),
('Busy', '#ef4444', 'User is busy and unavailable'),
('Emergency', '#ef4444', 'User is handling an emergency'),
('Be right back', '#f59e0b', 'User will be back shortly'),
('Break', '#6b7280', 'User is on break'),
('Consulting', '#f97316', 'User is in consultation');

-- Add comments for documentation
COMMENT ON TABLE user_status IS 'User status configurations with color codes';
COMMENT ON COLUMN user_status.id IS 'Primary key for user status';
COMMENT ON COLUMN user_status.status_name IS 'Name of the status';
COMMENT ON COLUMN user_status.color_code IS 'Hex color code for the status';
COMMENT ON COLUMN user_status.description IS 'Description of the status';
COMMENT ON COLUMN user_status.is_active IS 'Whether the status is active';