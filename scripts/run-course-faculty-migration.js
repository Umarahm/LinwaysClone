const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function migrateCourseFactory() {
    try {
        console.log('🔄 Starting course-faculty relationship migration...');

        // Execute statements individually for better error handling
        console.log('Creating course_faculty table...');
        await sql`
            CREATE TABLE IF NOT EXISTS course_faculty (
                id SERIAL PRIMARY KEY,
                course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
                faculty_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                is_primary BOOLEAN DEFAULT FALSE,
                UNIQUE(course_id, faculty_id)
            )
        `;

        console.log('Migrating existing course-faculty relationships...');
        await sql`
            INSERT INTO course_faculty (course_id, faculty_id, is_primary)
            SELECT id, faculty_id, TRUE
            FROM courses 
            WHERE faculty_id IS NOT NULL
            ON CONFLICT (course_id, faculty_id) DO NOTHING
        `;

        console.log('Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_course_faculty_course_id ON course_faculty(course_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_course_faculty_faculty_id ON course_faculty(faculty_id)`;

        // Check the results
        console.log('\n📋 Checking course-faculty relationships...');
        const relationships = await sql`
            SELECT 
                c.code,
                c.name,
                u.full_name as faculty_name,
                u.email as faculty_email,
                cf.is_primary
            FROM course_faculty cf
            JOIN courses c ON cf.course_id = c.id
            JOIN users u ON cf.faculty_id = u.id
            ORDER BY c.code, cf.is_primary DESC
        `;

        console.log(`\n✅ Found ${relationships.length} course-faculty relationships:`);
        let currentCourse = '';
        relationships.forEach((rel) => {
            if (rel.code !== currentCourse) {
                console.log(`\n📚 ${rel.code} - ${rel.name}:`);
                currentCourse = rel.code;
            }
            const primaryText = rel.is_primary ? ' (Primary)' : '';
            console.log(`   - ${rel.faculty_name} (${rel.faculty_email})${primaryText}`);
        });

        console.log('\n✅ Course-faculty relationship migration completed successfully!');

    } catch (error) {
        console.error('❌ Error during migration:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
}

migrateCourseFactory(); 