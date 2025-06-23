const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function runAnnouncementEnhancement() {
    try {
        console.log('🚀 Starting announcement enhancement migration...');

        // Add priority column
        console.log('⚡ Adding priority column...');
        try {
            await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent'))`;
            console.log('✅ Priority column added successfully');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Priority column already exists');
            } else {
                throw error;
            }
        }

        // Add scheduled_date column
        console.log('⚡ Adding scheduled_date column...');
        try {
            await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP`;
            console.log('✅ Scheduled_date column added successfully');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Scheduled_date column already exists');
            } else {
                throw error;
            }
        }

        // Add expiry_date column
        console.log('⚡ Adding expiry_date column...');
        try {
            await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP`;
            console.log('✅ Expiry_date column added successfully');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Expiry_date column already exists');
            } else {
                throw error;
            }
        }

        // Add attachments column
        console.log('⚡ Adding attachments column...');
        try {
            await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'`;
            console.log('✅ Attachments column added successfully');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Attachments column already exists');
            } else {
                throw error;
            }
        }

        // Add updated_at column
        console.log('⚡ Adding updated_at column...');
        try {
            await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
            console.log('✅ Updated_at column added successfully');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Updated_at column already exists');
            } else {
                throw error;
            }
        }

        // Add target_user_email column if not exists
        console.log('⚡ Adding target_user_email column...');
        try {
            await sql`ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_user_email VARCHAR(255)`;
            console.log('✅ Target_user_email column added successfully');
        } catch (error) {
            if (error.message.includes('already exists')) {
                console.log('⚠️  Target_user_email column already exists');
            } else {
                throw error;
            }
        }

        // Create indexes
        console.log('⚡ Creating indexes...');
        try {
            await sql`CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_announcements_scheduled_date ON announcements(scheduled_date)`;
            await sql`CREATE INDEX IF NOT EXISTS idx_announcements_author_id ON announcements(author_id)`;
            console.log('✅ Indexes created successfully');
        } catch (error) {
            console.log('⚠️  Some indexes may already exist:', error.message);
        }

        // Test the new structure
        console.log('🔍 Testing enhanced announcements table...');
        const testResult = await sql`
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'announcements' 
            ORDER BY ordinal_position
        `;

        console.log('📊 Current announcements table structure:');
        testResult.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });

        console.log('✅ Announcement enhancement migration completed successfully!');
        console.log('🎉 New features available:');
        console.log('   - Priority levels (low, normal, high, urgent)');
        console.log('   - Scheduled announcements');
        console.log('   - Expiry dates');
        console.log('   - File attachments');
        console.log('   - Edit/delete functionality for admins and faculty');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runAnnouncementEnhancement(); 