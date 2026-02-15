-- Settings Service Database Setup
-- Ensure all required tables and data exist
-- Includes attendance tracking functionality

-- Create roles table if not exists
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(250),
    location_id INTEGER,
    is_active VARCHAR(255) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create modules table if not exists
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    path VARCHAR(250),
    name VARCHAR(250),
    icon VARCHAR(1000),
    "order" INTEGER,
    status INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sub_modules table if not exists
CREATE TABLE IF NOT EXISTS sub_modules (
    id SERIAL PRIMARY KEY,
    module_id INTEGER,
    subcat_name VARCHAR(250),
    subcat_path VARCHAR(250),
    icon VARCHAR(1000),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_access table if not exists
CREATE TABLE IF NOT EXISTS user_access (
    id SERIAL PRIMARY KEY,
    role_id INTEGER,
    module_id INTEGER,
    sub_module_id INTEGER,
    add INTEGER DEFAULT 0,
    edit INTEGER DEFAULT 0,
    delete INTEGER DEFAULT 0,
    view INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample roles if not exists
INSERT INTO roles (id, name, location_id, is_active) VALUES
(1, 'Super Admin', 1, 'Active'),
(2, 'Admin', 1, 'Active'),
(3, 'Doctor', 1, 'Active'),
(7, 'Front Office', 1, 'Active')
ON CONFLICT (id) DO NOTHING;

-- Insert modules if not exists
INSERT INTO modules (id, path, name, icon, "order", status) VALUES
(1, 'dashboard', 'Dashboard', 'home', 1, 1),
(2, 'front-office', 'Front Office', 'users', 2, 1),
(17, 'settings', 'Settings', 'user-cog', 17, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert sub_modules if not exists
INSERT INTO sub_modules (id, module_id, subcat_name, subcat_path, icon) VALUES
(1, 2, 'Dashboard', 'front-office', 'layout-dashboard'),
(2, 2, 'Patient Registration', 'front-office/registration', 'user-plus'),
(3, 2, 'Appointments', 'front-office/appointments', 'calendar')
ON CONFLICT (id) DO NOTHING;

-- Insert user_access for Admin role (role_id = 2)
INSERT INTO user_access (role_id, module_id, sub_module_id, add, edit, delete, view) VALUES
(2, 1, NULL, 0, 0, 0, 1),
(2, 2, NULL, 1, 1, 1, 1),
(2, 17, NULL, 1, 1, 1, 1),
(2, 2, 1, 0, 0, 0, 1),
(2, 2, 2, 1, 1, 1, 1),
(2, 2, 3, 1, 1, 1, 1)
ON CONFLICT DO NOTHING;

-- Insert user_access for Front Office role (role_id = 7)
INSERT INTO user_access (role_id, module_id, sub_module_id, add, edit, delete, view) VALUES
(7, 2, NULL, 1, 1, 0, 1),
(7, 2, 1, 0, 0, 0, 1),
(7, 2, 2, 1, 1, 0, 1),
(7, 2, 3, 1, 1, 0, 1)
ON CONFLICT DO NOTHING;

-- Ensure users table has role_id column
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INTEGER;

-- Update existing users with role_id if null
UPDATE users SET role_id = 2 WHERE role_id IS NULL AND username = 'admin';
UPDATE users SET role_id = 7 WHERE role_id IS NULL AND username != 'admin';

-- Fix null usernames
UPDATE users SET username = 'user_' || id WHERE username IS NULL;

-- Ensure password is hashed for admin user
UPDATE users SET password = '$2b$10$rOzJqQjQjQjQjQjQjQjQjO' WHERE username = 'admin' AND password = 'admin';

-- Create admin user if not exists
INSERT INTO users (username, email, password, first_name, last_name, role_id, is_active, phone)
SELECT 'admin', 'admin@hospital.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjO', 'Admin', 'User', 2, true, '9876543210'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Create front office user if not exists
INSERT INTO users (username, email, password, first_name, last_name, role_id, is_active, phone)
SELECT 'frontoffice', 'frontoffice@hospital.com', '$2b$10$rOzJqQjQjQjQjQjQjQjQjO', 'Front', 'Office', 7, true, '9876543217'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'frontoffice');

-- Create Attendance Table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Present',
    remarks TEXT,
    leave_status VARCHAR(50),
    
    -- Foreign key constraint
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate entries for same user on same date
    CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Create indexes for attendance table
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
CREATE INDEX IF NOT EXISTS idx_attendance_leave_status ON attendance(leave_status);