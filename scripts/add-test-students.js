#!/usr/bin/env node

/**
 * Add Test Students Script
 * Adds sample students to the database for testing enrollment management
 */

// Import from lib/db.ts which has the correct setup
import { sql } from '../lib/db.js';
import bcrypt from 'bcryptjs';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function addTestStudents() {
    console.log('🎓 Adding Test Students to Database');
    console.log('===================================\n');

    try {
        const hashedPassword = await bcrypt.hash('student123', 10);

        const testStudents = [
            {
                email: 'alice.johnson@presidency.edu',
                full_name: 'Alice Johnson',
                role: 'student',
                department: 'Computer Science',
                password: hashedPassword
            },
            {
                email: 'bob.smith@presidency.edu',
                full_name: 'Bob Smith',
                role: 'student',
                department: 'Information Technology',
                password: hashedPassword
            },
            {
                email: 'carol.davis@presidency.edu',
                full_name: 'Carol Davis',
                role: 'student',
                department: 'Computer Science',
                password: hashedPassword
            },
            {
                email: 'david.wilson@presidency.edu',
                full_name: 'David Wilson',
                role: 'student',
                department: 'Electronics',
                password: hashedPassword
            },
            {
                email: 'emma.brown@presidency.edu',
                full_name: 'Emma Brown',
                role: 'student',
                department: 'Information Technology',
                password: hashedPassword
            }
        ];

        console.log('Adding students...');

        for (const student of testStudents) {
            try {
                // Check if student already exists
                const existing = await sql`
                    SELECT id FROM users WHERE email = ${student.email}
                `;

                if (existing.length > 0) {
                    console.log(`   ⏭️  ${student.full_name} (${student.email}) already exists`);
                    continue;
                }

                // Insert new student
                await sql`
                    INSERT INTO users (email, full_name, role, department, password)
                    VALUES (${student.email}, ${student.full_name}, ${student.role}, ${student.department}, ${student.password})
                `;

                console.log(`   ✅ Added ${student.full_name} (${student.email})`);

            } catch (error) {
                console.log(`   ❌ Failed to add ${student.full_name}: ${error.message}`);
            }
        }

        // Check total students count
        const totalStudents = await sql`
            SELECT COUNT(*) as count FROM users WHERE role = 'student'
        `;

        console.log(`\n📊 Total students in database: ${totalStudents[0].count}`);
        console.log('\n🎉 Test students setup complete!');
        console.log('\nLogin credentials for test students:');
        console.log('Password: student123');
        console.log('\nYou can now test the enrollment management with these students.');

    } catch (error) {
        console.error('Error adding test students:', error);
        console.log('\n❌ Failed to add test students. Please check your database connection.');
    }
}

addTestStudents().catch(console.error); 