-- Create fee_masters table
CREATE TABLE IF NOT EXISTS fee_masters (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2) DEFAULT 0.00,
    status BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO fee_masters (title, code, amount, status) VALUES
('Consultation Fee', 'CONSULTATION', 500.00, true),
('Deduction Fee', 'DEDUCTION', 100.00, true),
('Co-Pay', 'COPAY', 200.00, true),
('Follow Up', 'FOLLOWUP', 300.00, true),
('Emergency Fee', 'EMERGENCY', 1000.00, true),
('Specialist Consultation', 'SPECIALIST', 800.00, true)
ON CONFLICT (code) DO NOTHING;