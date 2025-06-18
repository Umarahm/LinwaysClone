-- Add read field to announcements table for notification read status
-- This migration adds support for tracking whether notifications have been read

-- Add read column for notification read status
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;

-- Add index for better performance on read status queries
CREATE INDEX IF NOT EXISTS idx_announcements_read 
ON announcements(read);

-- Add index for user-specific read queries
CREATE INDEX IF NOT EXISTS idx_announcements_user_read 
ON announcements(target_user_email, read);

-- Add comments for documentation
COMMENT ON COLUMN announcements.read IS 'Whether the notification has been read by the target user'; 