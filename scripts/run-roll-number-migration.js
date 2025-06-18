const { neon } = require('@neondatabase/serverless');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runRollNumberMigration() {
    console.log('🚀 Starting roll number migration...');

    try {
        // Add roll_no column if it doesn't exist
        await sql`
      DO $$ 
      BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name = 'users' AND column_name = 'roll_no') THEN
              ALTER TABLE users ADD COLUMN roll_no VARCHAR(20) UNIQUE;
          END IF;
      END $$;
    `;

        // Generate roll numbers for existing users based on their role and id
        await sql`
      UPDATE users 
      SET roll_no = CASE 
          WHEN role = 'student' THEN CONCAT('STU', LPAD(id::text, 4, '0'))
          WHEN role = 'faculty' THEN CONCAT('FAC', LPAD(id::text, 4, '0'))
          WHEN role = 'admin' THEN CONCAT('ADM', LPAD(id::text, 4, '0'))
          ELSE CONCAT('USR', LPAD(id::text, 4, '0'))
      END
      WHERE roll_no IS NULL;
    `;

        // Add indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_users_roll_no ON users(roll_no);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`;

        console.log('✅ Roll number migration completed successfully!');

        // Verify the migration by checking a few users
        const users = await sql`
      SELECT id, email, full_name, role, roll_no 
      FROM users 
      ORDER BY id 
      LIMIT 5
    `;

        console.log('📋 Sample users after migration:');
        users.forEach(user => {
            console.log(`  - ${user.full_name} (${user.role}): ${user.roll_no}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runRollNumberMigration(); 