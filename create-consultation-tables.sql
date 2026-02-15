-- Create consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    consultation_id VARCHAR UNIQUE NOT NULL,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL,
    location_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create enum type for payment methods
DO $$ BEGIN
    CREATE TYPE consultation_payment_type AS ENUM ('cash', 'card', 'upi');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create consultation_payments table
CREATE TABLE IF NOT EXISTS consultation_payments (
    id SERIAL PRIMARY KEY,
    consultation_id INTEGER NOT NULL,
    payment_type consultation_payment_type NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id)
);