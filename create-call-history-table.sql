CREATE TABLE IF NOT EXISTS call_history (
    id SERIAL PRIMARY KEY,
    patient_id VARCHAR(50) NOT NULL,
    next_call_date DATE,
    caller_by VARCHAR(100),
    patient_feeling VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_call_history_patient_id ON call_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_call_history_created_at ON call_history(created_at);