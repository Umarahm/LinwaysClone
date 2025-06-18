const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

const dbSql = neon(process.env.DATABASE_URL);

async function runReadFieldMigration() {
    try {
        console.log('🚀 Starting read field migration...');

        // Read the migration file
        const migrationPath = path.join(__dirname, '008-add-read-field.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        // Split by semicolons and execute each statement
        const statements = migrationSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await dbSql(statement);
        }

        console.log('✅ Read field migration completed successfully!');
        console.log('📊 The announcements table now has:');
        console.log('   - read BOOLEAN column for tracking notification read status');
        console.log('   - Indexes for performance optimization');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runReadFieldMigration(); 