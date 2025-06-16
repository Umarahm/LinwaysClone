const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addMissingFaculty() {
    try {
        console.log('🔄 Adding missing faculty members...');

        // Read the script
        const addScript = fs.readFileSync(path.join(__dirname, 'add-missing-faculty.sql'), 'utf8');

        // Split the script into individual statements
        const statements = addScript
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

        // Check all faculty users now
        console.log('\n📋 All faculty users now in database:');
        const facultyUsers = await sql`
            SELECT email, full_name, role, department 
            FROM users 
            WHERE role = 'faculty' 
            ORDER BY email
        `;

        facultyUsers.forEach(user => {
            console.log(`   - ${user.email} (${user.full_name}) - ${user.department}`);
        });

        console.log('\n🔑 All faculty can login with password: password');
        console.log('\n✅ Missing faculty members added successfully!');

    } catch (error) {
        console.error('❌ Error adding faculty:', error);
        process.exit(1);
    }
}

addMissingFaculty(); 