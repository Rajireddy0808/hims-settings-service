-- Add appointment_type_id column to appointments table
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_type_id INTEGER;

-- Update existing records to map appointment_type to appointment_type_id
UPDATE appointments 
SET appointment_type_id = (
    SELECT id FROM appointment_types 
    WHERE code = appointments.appointment_type::text
)
WHERE appointment_type_id IS NULL;

-- Set default appointment_type_id for any remaining NULL values
UPDATE appointments 
SET appointment_type_id = (SELECT id FROM appointment_types WHERE code = 'consultation' LIMIT 1)
WHERE appointment_type_id IS NULL;

-- Make appointment_type_id NOT NULL after data migration
ALTER TABLE appointments ALTER COLUMN appointment_type_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE appointments 
ADD CONSTRAINT fk_appointments_appointment_type 
FOREIGN KEY (appointment_type_id) REFERENCES appointment_types(id);