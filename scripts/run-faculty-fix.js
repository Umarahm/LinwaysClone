const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixFacultyAuth() {
    try {
        console.log('🔄 Fixing faculty authentication...');

        // Read the fix script
        const fixScript = fs.readFileSync(path.join(__dirname, 'fix-faculty-auth.sql'), 'utf8');

        // Split the script into individual statements
        const statements = fixScript
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

        // Check what faculty users exist now
        console.log('\n📋 Checking faculty users...');
        const facultyUsers = await sql`
            SELECT email, full_name, role, department 
            FROM users 
            WHERE role = 'faculty' 
            ORDER BY email
        `;

        console.log('✅ Faculty users in database:');
        facultyUsers.forEach(user => {
            console.log(`   - ${user.email} (${user.full_name}) - ${user.department}`);
        });

        console.log('\n🔑 All faculty can now login with:');
        console.log('   Password: password');
        console.log('\n✅ Faculty authentication fix completed successfully!');

    } catch (error) {
        console.error('❌ Error during faculty fix:', error);
        process.exit(1);
    }
}

fixFacultyAuth(); 