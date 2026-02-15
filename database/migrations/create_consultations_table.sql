-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    consultation_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    location_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints (optional, depends on your existing table structure)
    CONSTRAINT fk_consultation_patient FOREIGN KEY (patient_id) REFERENCES patients(id),
    CONSTRAINT fk_consultation_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);

-- Create consultation_payments table for multiple payment methods
CREATE TABLE IF NOT EXISTS consultation_payments (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('cash', 'card', 'upi')),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_consultation_payment FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_location_id ON consultations(location_id);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_payments_consultation_id ON consultation_payments(consultation_id);

-- Insert sample data (optional)
INSERT INTO consultations (consultation_id, patient_id, doctor_id, consultation_fee, location_id) 
VALUES 
    ('CON0001', 1, 1, 500.00, 1),
    ('CON0002', 2, 1, 750.00, 1),
    ('CON0003', 3, 2, 600.00, 1)
ON CONFLICT (consultation_id) DO NOTHING;

-- Insert sample payment data
INSERT INTO consultation_payments (consultation_id, payment_type, amount)
VALUES 
    (1, 'cash', 500.00),
    (2, 'cash', 400.00),
    (2, 'card', 350.00),
    (3, 'upi', 600.00)
ON CONFLICT DO NOTHING;