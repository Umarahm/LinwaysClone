const { neon } = require('@neondatabase/serverless');

// Use the DATABASE_URL directly from environment
const sql = neon('postgres://neondb_owner:npg_80QoYasxqjrJ@ep-old-cell-a130pc5q-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function deleteUserSafely() {
    try {
        console.log('🗑️  Attempting to delete dr.sarah@presidency.edu safely');
        console.log('========================================================\n');

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

        if (user[0].role === 'admin') {
            console.log('❌ Cannot delete admin users');
            return;
        }

        // Check what files are associated with this user
        console.log('\n🔍 Checking files associated with this user...');
        const files = await sql`
            SELECT id, filename, original_name, file_size, created_at 
            FROM files 
            WHERE created_by = ${userId}
        `;
        console.log(`   Found ${files.length} files created by this user:`);
        files.forEach(file => {
            console.log(`   - ${file.original_name} (stored as: ${file.filename}) - ${file.file_size} bytes - ${file.created_at}`);
        });

        console.log('\n🧹 Cleaning up related records...');

        // Delete related records in the correct order to avoid foreign key violations
        try {
            // 0. Delete files created by this user (THIS WAS MISSING!)
            console.log('   Deleting files created by user...');
            const filesDeleted = await sql`DELETE FROM files WHERE created_by = ${userId}`;
            console.log(`     ✅ Deleted ${filesDeleted.count || 0} files`);

            // 1. Delete course_faculty relationships (if table exists)
            console.log('   Deleting course_faculty relationships...');
            await sql`DELETE FROM course_faculty WHERE faculty_id = ${userId}`.catch(() => {
                console.log('     ⚠️  course_faculty table does not exist or no records found');
            });

            // 2. Delete timetable entries
            console.log('   Deleting timetable entries...');
            await sql`DELETE FROM timetable WHERE faculty_id = ${userId}`.catch(() => {
                console.log('     ⚠️  timetable table does not exist or no records found');
            });

            // 3. Delete attendance records where this user marked attendance
            console.log('   Deleting attendance records marked by user...');
            const attendanceDeleted = await sql`DELETE FROM attendance WHERE marked_by = ${userId}`;
            console.log(`     ✅ Deleted ${attendanceDeleted.count || 0} attendance records`);

            // 4. Delete attendance records for this user (if student)
            console.log('   Deleting attendance records for user...');
            const studentAttendanceDeleted = await sql`DELETE FROM attendance WHERE student_id = ${userId}`;
            console.log(`     ✅ Deleted ${studentAttendanceDeleted.count || 0} student attendance records`);

            // 5. Delete submissions by this user
            console.log('   Deleting submissions by user...');
            const submissionsDeleted = await sql`DELETE FROM submissions WHERE student_id = ${userId}`;
            console.log(`     ✅ Deleted ${submissionsDeleted.count || 0} submissions`);

            // 6. Delete submissions for assignments created by this faculty
            console.log('   Deleting submissions for assignments by this faculty...');
            const assignmentSubmissionsDeleted = await sql`
                DELETE FROM submissions 
                WHERE assignment_id IN (
                    SELECT id FROM assignments WHERE faculty_id = ${userId}
                )
            `;
            console.log(`     ✅ Deleted ${assignmentSubmissionsDeleted.count || 0} assignment submissions`);

            // 7. Delete assignments created by this faculty
            console.log('   Deleting assignments created by user...');
            const assignmentsDeleted = await sql`DELETE FROM assignments WHERE faculty_id = ${userId}`;
            console.log(`     ✅ Deleted ${assignmentsDeleted.count || 0} assignments`);

            // 8. Delete enrollments for this student
            console.log('   Deleting enrollments for user...');
            const enrollmentsDeleted = await sql`DELETE FROM enrollments WHERE student_id = ${userId}`;
            console.log(`     ✅ Deleted ${enrollmentsDeleted.count || 0} enrollments`);

            // 9. Update courses to remove faculty reference
            console.log('   Updating courses to remove faculty reference...');
            const coursesUpdated = await sql`UPDATE courses SET faculty_id = NULL WHERE faculty_id = ${userId}`;
            console.log(`     ✅ Updated ${coursesUpdated.count || 0} courses`);

            // 10. Delete announcements by this user
            console.log('   Deleting announcements by user...');
            const announcementsDeleted = await sql`DELETE FROM announcements WHERE author_id = ${userId}`;
            console.log(`     ✅ Deleted ${announcementsDeleted.count || 0} announcements`);

            // 11. Handle any additional foreign key relationships that might exist
            try {
                // Delete from notifications if the table exists
                console.log('   Deleting notifications...');
                await sql`DELETE FROM notifications WHERE user_id = ${userId}`.catch(() => {
                    console.log('     ⚠️  notifications table does not exist');
                });
            } catch (err) {
                console.log('     ⚠️  notifications cleanup not applicable');
            }

            console.log('\n🗑️  Deleting user record...');
            // Finally, delete the user
            const userDeleted = await sql`DELETE FROM users WHERE id = ${userId}`;

            if (userDeleted.count > 0) {
                console.log('✅ User deleted successfully!');
                console.log(`   ${user[0].full_name} (${user[0].email}) has been removed from the database`);
            } else {
                console.log('❌ User deletion failed - user may not exist');
            }

        } catch (deleteError) {
            console.error('❌ Error during deletion process:', deleteError);
            console.log('\n🔍 Detailed error information:');
            console.log('   Error name:', deleteError.name);
            console.log('   Error message:', deleteError.message);
            if (deleteError.code) {
                console.log('   Error code:', deleteError.code);
            }
            if (deleteError.detail) {
                console.log('   Error detail:', deleteError.detail);
            }
        }

    } catch (error) {
        console.error('❌ Error in deletion script:', error);
    }
}

deleteUserSafely(); 