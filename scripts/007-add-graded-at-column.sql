-- Add graded_at column to submissions table
-- This column tracks when an assignment was graded

ALTER TABLE submissions 
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP;

-- Update existing graded submissions to have a graded_at timestamp
-- We'll use submitted_at + 1 day as a reasonable estimate for existing data
UPDATE submissions 
SET graded_at = submitted_at + INTERVAL '1 day'
WHERE grade IS NOT NULL AND graded_at IS NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_graded_at ON submissions(graded_at);
CREATE INDEX IF NOT EXISTS idx_submissions_student_graded ON submissions(student_id, graded_at) WHERE grade IS NOT NULL; 