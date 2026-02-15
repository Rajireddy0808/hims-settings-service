-- Fix null usernames in users table
UPDATE users SET username = 'user_' || id WHERE username IS NULL;

-- Make username column NOT NULL if it isn't already
ALTER TABLE users ALTER COLUMN username SET NOT NULL;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_username_key' 
        AND conrelid = 'users'::regclass
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_username_key UNIQUE (username);
    END IF;
END $$;