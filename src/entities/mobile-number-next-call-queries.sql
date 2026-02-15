-- Create table
CREATE TABLE mobile_number_next_call_ob (
    id SERIAL PRIMARY KEY,
    mobile_number_id INTEGER NOT NULL,
    next_call_date DATE NOT NULL,
    disposition VARCHAR(50),
    patient_feeling VARCHAR(50),
    notes TEXT,
    caller_by INTEGER,
    caller_created_at TIMESTAMP,
    caller_updated_at TIMESTAMP,
    FOREIGN KEY (mobile_number_id) REFERENCES mobile_numbers(id)
);

-- Insert sample data
INSERT INTO mobile_number_next_call_ob (mobile_number_id, next_call_date, disposition, patient_feeling, notes, caller_by, caller_created_at, caller_updated_at)
VALUES (1, '2026-02-15', 'Answered', 'Better', 'Patient is doing well', 1, NOW(), NOW());

-- Insert without call details (for upcoming calls)
INSERT INTO mobile_number_next_call_ob (mobile_number_id, next_call_date)
VALUES (2, '2026-02-20');

-- Update call details after call is made
UPDATE mobile_number_next_call_ob 
SET disposition = 'Answered', 
    patient_feeling = 'Same', 
    notes = 'Follow up needed',
    caller_by = 1,
    caller_updated_at = NOW()
WHERE id = 2;
