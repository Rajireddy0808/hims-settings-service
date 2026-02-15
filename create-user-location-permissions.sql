-- Create user_location_permissions table
CREATE TABLE IF NOT EXISTS user_location_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,
    department_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_location_permissions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_location_permissions_location_id FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_location_permissions_role_id FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_location_permissions_department_id FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate user-location combinations
    CONSTRAINT unique_user_location UNIQUE (user_id, location_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_location_permissions_user_id ON user_location_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_location_permissions_location_id ON user_location_permissions(location_id);
CREATE INDEX IF NOT EXISTS idx_user_location_permissions_role_id ON user_location_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_user_location_permissions_department_id ON user_location_permissions(department_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_location_permissions_updated_at BEFORE UPDATE
    ON user_location_permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();