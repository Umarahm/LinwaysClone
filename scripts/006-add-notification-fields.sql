-- Add notification fields to announcements table
-- This migration adds support for user-specific notifications and priority levels

-- Add target_user_email column for user-specific notifications
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS target_user_email VARCHAR(255);

-- Add priority column for notification importance
ALTER TABLE announcements 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal';

-- Add index for better performance on user-specific queries
CREATE INDEX IF NOT EXISTS idx_announcements_target_user_email 
ON announcements(target_user_email);

-- Add index for recipient queries
CREATE INDEX IF NOT EXISTS idx_announcements_recipient 
ON announcements(recipient);

-- Add check constraint for priority values
ALTER TABLE announcements 
ADD CONSTRAINT IF NOT EXISTS chk_priority 
CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- Add comments for documentation
COMMENT ON COLUMN announcements.target_user_email IS 'Email of specific user for targeted notifications';
COMMENT ON COLUMN announcements.priority IS 'Priority level: low, normal, high, urgent'; 