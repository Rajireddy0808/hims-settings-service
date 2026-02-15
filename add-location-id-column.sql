-- Add location_id column to patient_medical_history table
ALTER TABLE patient_medical_history 
ADD COLUMN IF NOT EXISTS location_id INTEGER;