const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkFaculty() {
    try {
        console.log('📋 Checking all faculty users...');

        const facultyUsers = await sql`
            SELECT email, full_name, role, department 
            FROM users 
            WHERE role = 'faculty' 
            ORDER BY email
        `;

        console.log(`\n✅ Found ${facultyUsers.length} faculty members:`);
        facultyUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} (${user.full_name}) - ${user.department}`);
        });

        console.log('\n🔑 All faculty can login with password: password');

        // Check courses
        const courses = await sql`
            SELECT c.code, c.name, u.email as faculty_email
            FROM courses c
            LEFT JOIN users u ON c.faculty_id = u.id AND u.role = 'faculty'
            ORDER BY c.code
        `;

        console.log(`\n📚 Found ${courses.length} courses:`);
        courses.forEach((course, index) => {
            console.log(`   ${index + 1}. ${course.code} - ${course.name} (${course.faculty_email || 'No faculty assigned'})`);
        });

    } catch (error) {
        console.error('❌ Error checking faculty:', error);
        process.exit(1);
    }
}

checkFaculty(); 