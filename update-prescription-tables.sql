-- Drop existing table if exists
DROP TABLE IF EXISTS patient_prescriptions;

-- Create main prescription table
CREATE TABLE IF NOT EXISTS patient_prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    medicine_days INTEGER,
    next_appointment_date DATE,
    notes_to_pro TEXT,
    notes_to_pharmacy TEXT,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medicines table with foreign key to prescriptions
CREATE TABLE IF NOT EXISTS prescription_medicines (
    id SERIAL PRIMARY KEY,
    patient_prescriptions_id INTEGER NOT NULL,
    medicine_type VARCHAR(100),
    medicine VARCHAR(100),
    potency VARCHAR(50),
    dosage VARCHAR(50),
    morning BOOLEAN DEFAULT FALSE,
    afternoon BOOLEAN DEFAULT FALSE,
    night BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_prescriptions_id) REFERENCES patient_prescriptions(id) ON DELETE CASCADE
);