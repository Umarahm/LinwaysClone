-- Add roll_no field to users table if it doesn't exist

-- Add roll_no column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'roll_no') THEN
        ALTER TABLE users ADD COLUMN roll_no VARCHAR(20) UNIQUE;
    END IF;
END $$;

-- Generate roll numbers for existing users based on their role and id
UPDATE users 
SET roll_no = CASE 
    WHEN role = 'student' THEN CONCAT('STU', LPAD(id::text, 4, '0'))
    WHEN role = 'faculty' THEN CONCAT('FAC', LPAD(id::text, 4, '0'))
    WHEN role = 'admin' THEN CONCAT('ADM', LPAD(id::text, 4, '0'))
    ELSE CONCAT('USR', LPAD(id::text, 4, '0'))
END
WHERE roll_no IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_users_roll_no ON users(roll_no);

-- Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role); 