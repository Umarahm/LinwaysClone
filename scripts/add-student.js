#!/usr/bin/env node

/**
 * Add Individual Student Script
 * Quickly add a single student to the database with default password
 */

import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize SQL from environment
const sql = neon(process.env.DATABASE_URL);

async function addStudent(email, fullName, department) {
    console.log(`🎓 Adding Student: ${fullName}`);
    console.log('==============================\n');

    try {
        // Create a default password hash for new students
        const defaultPassword = 'student123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Check if student already exists
        const existing = await sql`
            SELECT id FROM users WHERE email = ${email}
        `;

        if (existing.length > 0) {
            console.log(`   ⏭️  Student ${fullName} (${email}) already exists`);
            return;
        }

        // Insert new student with password_hash
        await sql`
            INSERT INTO users (email, full_name, role, department, password_hash)
            VALUES (${email}, ${fullName}, 'student', ${department}, ${hashedPassword})
        `;

        console.log(`   ✅ Added ${fullName} (${email})`);
        console.log(`   🔑 Default password: ${defaultPassword}`);
        console.log('\n📝 Important: Please remind the student to change their password after first login.');

    } catch (error) {
        console.error('Error adding student:', error);
        console.log('\n❌ Failed to add student. Please check your database connection.');
    }
}

// Command line usage
const args = process.argv.slice(2);

if (args.length !== 3) {
    console.log('Usage: node scripts/add-student.js <email> <full_name> <department>');
    console.log('Example: node scripts/add-student.js "jane.doe@presidency.edu" "Jane Doe" "Computer Science"');
    process.exit(1);
}

const [email, fullName, department] = args;

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.error('❌ Invalid email format');
    process.exit(1);
}

// Run the script
addStudent(email, fullName, department); 