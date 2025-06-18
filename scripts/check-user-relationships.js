const { neon } = require('@neondatabase/serverless');

// Use the DATABASE_URL directly from environment
const sql = neon('postgres://neondb_owner:npg_80QoYasxqjrJ@ep-old-cell-a130pc5q-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function checkUserRelationships() {
    try {
        console.log('🔍 Checking relationships for dr.sarah@presidency.edu');
        console.log('===================================================\n');

        // First, get the user details
        const user = await sql`
            SELECT id, email, full_name, role, department 
            FROM users 
            WHERE email = 'dr.sarah@presidency.edu'
        `;

        if (user.length === 0) {
            console.log('❌ User dr.sarah@presidency.edu not found in database');
            return;
        }

        const userId = user[0].id;
        console.log(`✅ Found user: ${user[0].full_name} (ID: ${userId})`);
        console.log(`   Role: ${user[0].role}`);
        console.log(`   Department: ${user[0].department}\n`);

        // Check courses where this user is faculty
        console.log('📚 Courses where dr.sarah is faculty:');
        const courses = await sql`
            SELECT id, code, name 
            FROM courses 
            WHERE faculty_id = ${userId}
        `;
        console.log(`   Found ${courses.length} courses:`);
        courses.forEach(course => {
            console.log(`   - ${course.code}: ${course.name} (ID: ${course.id})`);
        });

        // Check course_faculty relationships
        console.log('\n🎓 Course-faculty relationships:');
        try {
            const courseFaculty = await sql`
                SELECT cf.*, c.code, c.name 
                FROM course_faculty cf
                JOIN courses c ON cf.course_id = c.id
                WHERE cf.faculty_id = ${userId}
            `;
            console.log(`   Found ${courseFaculty.length} relationships:`);
            courseFaculty.forEach(rel => {
                console.log(`   - ${rel.code}: ${rel.name} (Primary: ${rel.is_primary})`);
            });
        } catch (err) {
            console.log('   ⚠️  Course-faculty table may not exist');
        }

        // Check assignments
        console.log('\n📝 Assignments created by dr.sarah:');
        const assignments = await sql`
            SELECT id, title, course_id 
            FROM assignments 
            WHERE faculty_id = ${userId}
        `;
        console.log(`   Found ${assignments.length} assignments:`);
        assignments.forEach(assignment => {
            console.log(`   - ${assignment.title} (ID: ${assignment.id}, Course: ${assignment.course_id})`);
        });

        // Check timetable entries
        console.log('\n🕐 Timetable entries for dr.sarah:');
        try {
            const timetable = await sql`
                SELECT t.*, c.code, c.name 
                FROM timetable t
                JOIN courses c ON t.course_id = c.id
                WHERE t.faculty_id = ${userId}
            `;
            console.log(`   Found ${timetable.length} timetable entries:`);
            timetable.forEach(entry => {
                console.log(`   - ${entry.code}: ${entry.day} ${entry.start_time}-${entry.end_time} (${entry.room})`);
            });
        } catch (err) {
            console.log('   ⚠️  No timetable entries or table may not exist');
        }

        // Check attendance records marked by this faculty
        console.log('\n✅ Attendance records marked by dr.sarah:');
        const attendance = await sql`
            SELECT COUNT(*) as count 
            FROM attendance 
            WHERE marked_by = ${userId}
        `;
        console.log(`   Found ${attendance[0].count} attendance records marked by dr.sarah`);

        // Check announcements
        console.log('\n📢 Announcements created by dr.sarah:');
        const announcements = await sql`
            SELECT id, title, recipient 
            FROM announcements 
            WHERE author_id = ${userId}
        `;
        console.log(`   Found ${announcements.length} announcements:`);
        announcements.forEach(announcement => {
            console.log(`   - ${announcement.title} (To: ${announcement.recipient})`);
        });

        // Check submissions graded by this faculty (indirect relationship)
        console.log('\n📋 Submissions for assignments by dr.sarah:');
        const submissions = await sql`
            SELECT COUNT(*) as count
            FROM submissions s
            JOIN assignments a ON s.assignment_id = a.id
            WHERE a.faculty_id = ${userId}
        `;
        console.log(`   Found ${submissions[0].count} submissions for dr.sarah's assignments`);

        console.log('\n⚠️  DELETION WILL FAIL due to these foreign key constraints:');
        if (courses.length > 0) console.log(`   ❌ ${courses.length} courses reference this faculty`);
        if (assignments.length > 0) console.log(`   ❌ ${assignments.length} assignments reference this faculty`);
        if (attendance[0].count > 0) console.log(`   ❌ ${attendance[0].count} attendance records marked by this faculty`);
        if (announcements.length > 0) console.log(`   ❌ ${announcements.length} announcements by this faculty`);
        if (submissions[0].count > 0) console.log(`   ❌ ${submissions[0].count} submissions for this faculty's assignments`);

    } catch (error) {
        console.error('❌ Error checking user relationships:', error);
    }
}

checkUserRelationships(); 