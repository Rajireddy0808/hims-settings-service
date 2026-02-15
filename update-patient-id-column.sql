-- Update patient_examination table to change patient_id from varchar to integer
ALTER TABLE patient_examination 
ALTER COLUMN patient_id TYPE INTEGER USING patient_id::INTEGER;