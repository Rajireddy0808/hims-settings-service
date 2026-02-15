-- Add disposition column to call_history table
ALTER TABLE call_history ADD COLUMN disposition VARCHAR(50);

-- Update existing records with default disposition
UPDATE call_history SET disposition = 'Completed' WHERE disposition IS NULL;