const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runEnrollments() {
    try {
        console.log('🔄 Adding student enrollments...');

        // Read the enrollments script
        const enrollmentsScript = fs.readFileSync(path.join(__dirname, 'add-enrollments.sql'), 'utf8');

        // Split the script into individual statements
        const statements = enrollmentsScript
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

        console.log('✅ Student enrollments added successfully!');
        console.log('📋 Summary:');
        console.log('   - Additional enrollments added for existing students');
        console.log('   - Faculty courses now have enrolled students');

    } catch (error) {
        console.error('❌ Error during enrollments:', error);
        process.exit(1);
    }
}

runEnrollments(); 