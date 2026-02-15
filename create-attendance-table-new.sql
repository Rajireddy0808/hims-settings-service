-- Create Attendance Table for Multiple Check-ins/Check-outs with Duration Calculation
-- This table supports multiple attendance entries per user per day with location-based storage

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    duration INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Present',
    remarks TEXT,
    leave_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_attendance_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attendance_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_attendance_user_id ON attendance(user_id);
CREATE INDEX idx_attendance_location_id ON attendance(location_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_status ON attendance(status);
CREATE INDEX idx_attendance_user_location_date ON attendance(user_id, location_id, date);

-- Add comments for documentation
COMMENT ON TABLE attendance IS 'Employee attendance tracking with multiple check-ins/check-outs per day';
COMMENT ON COLUMN attendance.id IS 'Primary key for attendance record';
COMMENT ON COLUMN attendance.user_id IS 'Foreign key reference to users table';
COMMENT ON COLUMN attendance.location_id IS 'Foreign key reference to locations table for global location-based storage';
COMMENT ON COLUMN attendance.date IS 'Date of attendance';
COMMENT ON COLUMN attendance.check_in IS 'Check-in time';
COMMENT ON COLUMN attendance.check_out IS 'Check-out time';
COMMENT ON COLUMN attendance.duration IS 'Duration in minutes between check-in and check-out';
COMMENT ON COLUMN attendance.status IS 'Attendance status (Present, Absent, Late, etc.)';
COMMENT ON COLUMN attendance.remarks IS 'Additional remarks or notes';
COMMENT ON COLUMN attendance.leave_status IS 'Leave status if applicable (Sick Leave, Casual Leave, etc.)';