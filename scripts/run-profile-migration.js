const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function runProfileMigration() {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not set');
        }

        const sql = neon(process.env.DATABASE_URL);

        console.log('🔄 Running profile fields migration...');

        // Read the migration SQL file
        const migrationPath = path.join(__dirname, '005-add-user-profile-fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Split the SQL file by semicolons and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);

        for (const statement of statements) {
            if (statement.trim()) {
                await sql.unsafe(statement);
            }
        }

        console.log('✅ Profile fields migration completed successfully!');
        console.log('📋 Added columns:');
        console.log('   - phone_number (VARCHAR(20))');
        console.log('   - avatar (TEXT)');
        console.log('   - updated_at (TIMESTAMP)');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run the migration
runProfileMigration(); 