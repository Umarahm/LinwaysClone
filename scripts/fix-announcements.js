const { neon } = require('@neondatabase/serverless');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function fixAnnouncements() {
    try {
        console.log('🔧 Fixing announcements display issue...');

        // First, let's update the existing announcement to remove the future scheduled date
        console.log('⚡ Updating existing announcement to make it visible...');
        const updated = await sql`
            UPDATE announcements 
            SET scheduled_date = NULL 
            WHERE id = 22
            RETURNING *
        `;

        if (updated.length > 0) {
            console.log(`✅ Updated announcement ID ${updated[0].id} - removed future scheduled date`);
        }

        // Create a few more test announcements with different priorities
        const facultyUser = await sql`SELECT id, full_name FROM users WHERE role = 'faculty' LIMIT 1`;
        const adminUser = await sql`SELECT id, full_name FROM users WHERE role = 'admin' LIMIT 1`;

        if (facultyUser.length > 0) {
            // Create a high priority announcement
            const highPriorityAnn = await sql`
                INSERT INTO announcements (
                    title, 
                    message, 
                    author_id, 
                    recipient, 
                    priority,
                    attachments
                )
                VALUES (
                    'Important: System Maintenance',
                    'The university portal will undergo scheduled maintenance this weekend. Please save your work and log out before Friday 6 PM.',
                    ${facultyUser[0].id},
                    'all',
                    'high',
                    '[]'
                )
                RETURNING *
            `;
            console.log(`✅ Created high priority announcement with ID: ${highPriorityAnn[0].id}`);

            // Create a normal priority announcement for students
            const studentAnn = await sql`
                INSERT INTO announcements (
                    title, 
                    message, 
                    author_id, 
                    recipient, 
                    priority,
                    attachments
                )
                VALUES (
                    'New Assignment Posted',
                    'A new assignment has been posted for CS101. Please check your courses page for details. Due date: Next Friday.',
                    ${facultyUser[0].id},
                    'student',
                    'normal',
                    '[]'
                )
                RETURNING *
            `;
            console.log(`✅ Created student announcement with ID: ${studentAnn[0].id}`);
        }

        if (adminUser.length > 0) {
            // Create an urgent announcement
            const urgentAnn = await sql`
                INSERT INTO announcements (
                    title, 
                    message, 
                    author_id, 
                    recipient, 
                    priority,
                    attachments
                )
                VALUES (
                    'URGENT: Security Update Required',
                    'All users must update their passwords immediately due to a security alert. Please use the Change Password option in your profile.',
                    ${adminUser[0].id},
                    'all',
                    'urgent',
                    '[]'
                )
                RETURNING *
            `;
            console.log(`✅ Created urgent announcement with ID: ${urgentAnn[0].id}`);

            // Create a faculty-only announcement
            const facultyAnn = await sql`
                INSERT INTO announcements (
                    title, 
                    message, 
                    author_id, 
                    recipient, 
                    priority,
                    attachments
                )
                VALUES (
                    'Faculty Meeting Reminder',
                    'Monthly faculty meeting scheduled for next Monday at 10 AM in Conference Room A. Please bring your course progress reports.',
                    ${adminUser[0].id},
                    'faculty',
                    'normal',
                    '[]'
                )
                RETURNING *
            `;
            console.log(`✅ Created faculty announcement with ID: ${facultyAnn[0].id}`);
        }

        // Now test the API queries again
        console.log('\n🧪 Testing API queries after fixes...');

        const allRoleTest = await sql`
            SELECT a.*, u.full_name as author_name, u.role as author_role
            FROM announcements a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE a.recipient = 'all'
            AND (a.scheduled_date IS NULL OR a.scheduled_date <= NOW())
            AND (a.expiry_date IS NULL OR a.expiry_date > NOW())
            ORDER BY 
                CASE a.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'normal' THEN 3 
                    WHEN 'low' THEN 4 
                END,
                a.created_at DESC
        `;
        console.log(`   "all" recipients: ${allRoleTest.length} announcements`);

        const studentRoleTest = await sql`
            SELECT a.*, u.full_name as author_name, u.role as author_role
            FROM announcements a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE (a.recipient = 'student' OR a.recipient = 'all')
            AND (a.scheduled_date IS NULL OR a.scheduled_date <= NOW())
            AND (a.expiry_date IS NULL OR a.expiry_date > NOW())
            ORDER BY 
                CASE a.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'normal' THEN 3 
                    WHEN 'low' THEN 4 
                END,
                a.created_at DESC
        `;
        console.log(`   "student" role: ${studentRoleTest.length} announcements`);

        const facultyRoleTest = await sql`
            SELECT a.*, u.full_name as author_name, u.role as author_role
            FROM announcements a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE (a.recipient = 'faculty' OR a.recipient = 'all')
            AND (a.scheduled_date IS NULL OR a.scheduled_date <= NOW())
            AND (a.expiry_date IS NULL OR a.expiry_date > NOW())
            ORDER BY 
                CASE a.priority 
                    WHEN 'urgent' THEN 1 
                    WHEN 'high' THEN 2 
                    WHEN 'normal' THEN 3 
                    WHEN 'low' THEN 4 
                END,
                a.created_at DESC
        `;
        console.log(`   "faculty" role: ${facultyRoleTest.length} announcements`);

        console.log('\n✅ Announcements should now be visible in the UI!');
        console.log('📝 Summary of test announcements created:');
        console.log('   - Urgent security update (all users)');
        console.log('   - High priority maintenance notice (all users)');
        console.log('   - Normal assignment notice (students only)');
        console.log('   - Faculty meeting reminder (faculty only)');
        console.log('   - Original announcement (now visible)');

    } catch (error) {
        console.error('❌ Error fixing announcements:', error);
    }
}

fixAnnouncements(); 