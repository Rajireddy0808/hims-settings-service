-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    consultation_id VARCHAR(50) UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    location_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create consultation_payments table
CREATE TYPE IF NOT EXISTS consultation_payments_payment_type_enum AS ENUM ('cash', 'card', 'upi');

CREATE TABLE IF NOT EXISTS consultation_payments (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER NOT NULL,
    payment_type consultation_payments_payment_type_enum NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_consultation_payment FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultation_payments_consultation_id ON consultation_payments(consultation_id);