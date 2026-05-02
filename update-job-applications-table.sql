-- Run this query in your PostgreSQL database to update the job_applications table

-- 1. Add job_id column if it doesn't exist
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS job_id INTEGER;

-- 2. Add foreign key constraint (optional but recommended)
-- ALTER TABLE job_applications ADD CONSTRAINT fk_job_application_job FOREIGN KEY (job_id) REFERENCES jobs(id);

-- 3. Verify the final structure
-- SELECT * FROM job_applications LIMIT 1;
