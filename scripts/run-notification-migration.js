const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runNotificationMigration() {
    try {
        console.log('🔄 Running notification migration...');

        // Read the migration file
        const migrationPath = path.join(__dirname, '006-add-notification-fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Execute statements in specific order
        const statements = [
            `ALTER TABLE announcements ADD COLUMN IF NOT EXISTS target_user_email VARCHAR(255)`,
            `ALTER TABLE announcements ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal'`,
            `CREATE INDEX IF NOT EXISTS idx_announcements_target_user_email ON announcements(target_user_email)`,
            `CREATE INDEX IF NOT EXISTS idx_announcements_recipient ON announcements(recipient)`
        ];

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 60)}...`);
            await sql.query(statement);
        }

        console.log('✅ Notification migration completed successfully!');

        // Test the new columns
        console.log('🔍 Testing new columns...');
        const testResult = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'announcements' 
      AND column_name IN ('target_user_email', 'priority')
      ORDER BY column_name;
    `;

        console.log('New columns:', testResult);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runNotificationMigration(); 