-- Add enhanced fields to announcements table
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'));
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_user_email VARCHAR(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled_date ON announcements(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id); 