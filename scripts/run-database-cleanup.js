const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runCleanup() {
    try {
        console.log('🔄 Starting database cleanup...');

        // Read the cleanup script
        const cleanupScript = fs.readFileSync(path.join(__dirname, 'clear-data.sql'), 'utf8');

        // Split the script into individual statements
        const statements = cleanupScript
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`Executing: ${statement.substring(0, 50)}...`);
                await sql.unsafe(statement);
            }
        }

        console.log('✅ Database cleanup completed successfully!');
        console.log('📋 Summary:');
        console.log('   - All users except admin have been removed');
        console.log('   - All courses have been removed');
        console.log('   - All announcements have been removed');
        console.log('   - All related data (enrollments, assignments, etc.) have been cleared');
        console.log('');
        console.log('🔑 Admin credentials:');
        console.log('   Email: admin@presidency.edu');
        console.log('   Password: password (default - should be changed)');
        console.log('');
        console.log('Now you can use the admin dashboard to add new users and courses!');

    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
}

runCleanup(); 