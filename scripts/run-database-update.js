const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runUpdate() {
    try {
        console.log('🔄 Starting database update...');

        // Read the update script
        const updateScript = fs.readFileSync(path.join(__dirname, 'update-seed-data.sql'), 'utf8');

        // Split the script into individual statements
        const statements = updateScript
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

        console.log('✅ Database update completed successfully!');
        console.log('📋 Summary:');
        console.log('   - Faculty passwords updated to "password"');
        console.log('   - Additional faculty members added');
        console.log('   - Course assignments updated');
        console.log('   - New courses added for faculty members');
        console.log('');
        console.log('🔑 Faculty can now login with:');
        console.log('   Email: dr.sarah@presidency.edu, prof.mike@presidency.edu, etc.');
        console.log('   Password: password');

    } catch (error) {
        console.error('❌ Error during update:', error);
        process.exit(1);
    }
}

runUpdate(); 