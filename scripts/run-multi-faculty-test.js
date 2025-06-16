const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addMultiFacultyTestData() {
    try {
        console.log('🔄 Adding multi-faculty test data...');

        // Execute statements individually for better error handling
        console.log('Adding additional faculty assignments...');

        // Assign multiple faculty to CSE2001
        await sql`
            INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
            SELECT c.id, u.id, false
            FROM courses c, users u 
            WHERE c.code = 'CSE2001' 
            AND u.email = 'jamil.ahmed@presidency.edu'
            AND NOT EXISTS (
                SELECT 1 FROM course_faculty cf 
                WHERE cf.course_id = c.id AND cf.faculty_id = u.id
            )
        `;

        // Assign multiple faculty to CSE2006
        await sql`
            INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
            SELECT c.id, u.id, false
            FROM courses c, users u 
            WHERE c.code = 'CSE2006' 
            AND u.email = 'nagaraja.sr@presidency.edu'
            AND NOT EXISTS (
                SELECT 1 FROM course_faculty cf 
                WHERE cf.course_id = c.id AND cf.faculty_id = u.id
            )
        `;

        // Add more faculty assignments
        console.log('Adding more faculty assignments...');

        await sql`
            INSERT INTO course_faculty (course_id, faculty_id, is_primary)
            SELECT 
                (SELECT id FROM courses WHERE code = 'CSE3001'),
                (SELECT id FROM users WHERE email = 'praveen.pravaskar@presidency.edu'),
                false
            WHERE NOT EXISTS (
                SELECT 1 FROM course_faculty cf 
                WHERE cf.course_id = (SELECT id FROM courses WHERE code = 'CSE3001')
                AND cf.faculty_id = (SELECT id FROM users WHERE email = 'praveen.pravaskar@presidency.edu')
            )
        `;

        await sql`
            INSERT INTO course_faculty (course_id, faculty_id, is_primary)
            SELECT 
                (SELECT id FROM courses WHERE code = 'CSE4001'),
                (SELECT id FROM users WHERE email = 'dr.sarah@presidency.edu'),
                false
            WHERE NOT EXISTS (
                SELECT 1 FROM course_faculty cf 
                WHERE cf.course_id = (SELECT id FROM courses WHERE code = 'CSE4001')
                AND cf.faculty_id = (SELECT id FROM users WHERE email = 'dr.sarah@presidency.edu')
            )
        `;

        // Fix missing primary faculty for CSE4001
        console.log('Fixing primary faculty assignments...');

        await sql`
            INSERT INTO course_faculty (course_id, faculty_id, is_primary)
            SELECT 
                (SELECT id FROM courses WHERE code = 'CSE4001'),
                (SELECT id FROM users WHERE email = 'jamil.ahmed@presidency.edu'),
                true
            WHERE NOT EXISTS (
                SELECT 1 FROM course_faculty cf 
                WHERE cf.course_id = (SELECT id FROM courses WHERE code = 'CSE4001')
                AND cf.faculty_id = (SELECT id FROM users WHERE email = 'jamil.ahmed@presidency.edu')
            )
        `;

        // Check the results
        console.log('\n📋 Checking updated course-faculty relationships...');
        const relationships = await sql`
            SELECT 
                c.code,
                c.name,
                u.full_name as faculty_name,
                u.email as faculty_email,
                cf.is_primary,
                COUNT(*) OVER (PARTITION BY c.id) as faculty_count
            FROM course_faculty cf
            JOIN courses c ON cf.course_id = c.id
            JOIN users u ON cf.faculty_id = u.id
            ORDER BY c.code, cf.is_primary DESC, u.full_name
        `;

        console.log(`\n✅ Found ${relationships.length} course-faculty relationships:`);
        let currentCourse = '';
        relationships.forEach((rel) => {
            if (rel.code !== currentCourse) {
                console.log(`\n📚 ${rel.code} - ${rel.name} (${rel.faculty_count} faculty):`);
                currentCourse = rel.code;
            }
            const primaryText = rel.is_primary ? ' (PRIMARY)' : '';
            console.log(`   - ${rel.faculty_name} (${rel.faculty_email})${primaryText}`);
        });

        console.log('\n✅ Multi-faculty test data added successfully!');

    } catch (error) {
        console.error('❌ Error adding test data:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

addMultiFacultyTestData(); 