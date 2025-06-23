const { neon } = require('@neondatabase/serverless');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const sql = neon(process.env.DATABASE_URL);

async function checkAnnouncements() {
    try {
        console.log('🔍 Checking announcements in database...');

        // Check if announcements table exists and its structure
        const tableInfo = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'announcements' 
            ORDER BY ordinal_position
        `;

        console.log('📊 Announcements table structure:');
        tableInfo.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'}) ${col.column_default ? `default: ${col.column_default}` : ''}`);
        });

        // Count total announcements
        const count = await sql`SELECT COUNT(*) as total FROM announcements`;
        console.log(`\n📈 Total announcements in database: ${count[0].total}`);

        if (count[0].total > 0) {
            // Get all announcements with author info
            const announcements = await sql`
                SELECT a.*, u.full_name as author_name, u.role as author_role
                FROM announcements a
                LEFT JOIN users u ON a.author_id = u.id
                ORDER BY a.created_at DESC
                LIMIT 5
            `;

            console.log('\n📝 Recent announcements:');
            announcements.forEach((ann, index) => {
                console.log(`\n${index + 1}. ID: ${ann.id}`);
                console.log(`   Title: ${ann.title}`);
                console.log(`   Message: ${ann.message?.substring(0, 50)}...`);
                console.log(`   Author: ${ann.author_name} (${ann.author_role})`);
                console.log(`   Recipient: ${ann.recipient}`);
                console.log(`   Priority: ${ann.priority || 'normal'}`);
                console.log(`   Created: ${ann.created_at}`);
                console.log(`   Scheduled: ${ann.scheduled_date || 'none'}`);
                console.log(`   Expires: ${ann.expiry_date || 'never'}`);
                console.log(`   Attachments: ${ann.attachments ? JSON.stringify(ann.attachments) : '[]'}`);
            });

            // Test the API query that the frontend uses
            console.log('\n🧪 Testing API query for "all" role:');
            const apiTestAll = await sql`
                SELECT a.*, u.full_name as author_name, u.role as author_role
                FROM announcements a
                LEFT JOIN users u ON a.author_id = u.id
                WHERE (a.recipient = 'all')
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
            console.log(`   Found ${apiTestAll.length} announcements for "all" recipients`);

            console.log('\n🧪 Testing API query for "student" role:');
            const apiTestStudent = await sql`
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
            console.log(`   Found ${apiTestStudent.length} announcements for "student" role`);

        } else {
            console.log('\n⚠️  No announcements found in database');
            console.log('Creating a test announcement...');

            // Get a faculty user to create test announcement
            const facultyUser = await sql`SELECT id, full_name FROM users WHERE role = 'faculty' LIMIT 1`;

            if (facultyUser.length > 0) {
                const testAnnouncement = await sql`
                    INSERT INTO announcements (
                        title, 
                        message, 
                        author_id, 
                        recipient, 
                        priority,
                        attachments
                    )
                    VALUES (
                        'Welcome to Enhanced Announcements!',
                        'This is a test announcement to demonstrate the new enhanced features including priority levels, file attachments, and scheduling capabilities.',
                        ${facultyUser[0].id},
                        'all',
                        'normal',
                        '[]'
                    )
                    RETURNING *
                `;
                console.log(`✅ Created test announcement with ID: ${testAnnouncement[0].id}`);
            } else {
                console.log('❌ No faculty users found to create test announcement');
            }
        }

        // Check users table for context
        const userCount = await sql`SELECT role, COUNT(*) as count FROM users GROUP BY role`;
        console.log('\n👥 Users by role:');
        userCount.forEach(u => {
            console.log(`   ${u.role}: ${u.count} users`);
        });

    } catch (error) {
        console.error('❌ Error checking announcements:', error);
    }
}

checkAnnouncements(); 