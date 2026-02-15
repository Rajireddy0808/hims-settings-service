-- Create appointment_types master table
CREATE TABLE IF NOT EXISTS appointment_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    location_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default appointment types
INSERT INTO appointment_types (name, code, description) VALUES
('Consultation', 'consultation', 'Regular consultation appointment'),
('Follow-up', 'follow-up', 'Follow-up appointment for existing patients'),
('Emergency', 'emergency', 'Emergency appointment'),
('Check-up', 'check-up', 'Routine health check-up'),
('Vaccination', 'vaccination', 'Vaccination appointment'),
('Lab Test', 'lab-test', 'Laboratory test appointment'),
('Procedure', 'procedure', 'Medical procedure appointment'),
('Therapy', 'therapy', 'Therapy session appointment')
ON CONFLICT (code) DO NOTHING;