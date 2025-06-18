import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hash } from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

interface ImportStudent {
    'Full Name'?: string;
    'Email'?: string;
    'Department'?: string;
    'Roll Number'?: string;
    'Password'?: string;
    full_name?: string;
    email?: string;
    department?: string;
    roll_no?: string;
    password?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { students }: { students: ImportStudent[] } = await request.json();

        if (!students || !Array.isArray(students)) {
            return NextResponse.json(
                { message: 'Invalid data format' },
                { status: 400 }
            );
        }

        let imported = 0;
        let errors = 0;
        const errorDetails: string[] = [];

        // Get the highest current roll number for students
        const highestRollResult = await sql`
            SELECT roll_no FROM users 
            WHERE role = 'student' AND roll_no LIKE 'STU%' 
            ORDER BY roll_no DESC 
            LIMIT 1
        `;

        let rollCounter = 1;
        if (highestRollResult.length > 0) {
            const lastRoll = highestRollResult[0].roll_no;
            const match = lastRoll.match(/STU(\d+)/);
            if (match) {
                rollCounter = parseInt(match[1]) + 1;
            }
        }

        for (const student of students) {
            try {
                // Extract data from both possible formats
                const fullName = student['Full Name'] || student.full_name;
                const email = student['Email'] || student.email;
                const department = student['Department'] || student.department;
                let rollNo = student['Roll Number'] || student.roll_no;
                const password = student['Password'] || student.password || 'defaultpassword123';

                if (!fullName || !email || !department) {
                    errorDetails.push(`Missing required fields for ${email || 'unknown'}`);
                    errors++;
                    continue;
                }

                // Generate roll number if not provided
                if (!rollNo) {
                    rollNo = `STU${rollCounter.toString().padStart(4, '0')}`;
                    rollCounter++;
                }

                // Check if user already exists
                const existingUser = await sql`
                    SELECT id FROM users WHERE email = ${email}
                `;

                if (existingUser.length > 0) {
                    errorDetails.push(`User with email ${email} already exists`);
                    errors++;
                    continue;
                }

                // Hash password
                const hashedPassword = await hash(password, 12);

                // Insert student
                await sql`
                    INSERT INTO users (
                        email, 
                        password_hash, 
                        full_name, 
                        role, 
                        department, 
                        roll_no,
                        created_at
                    ) VALUES (
                        ${email},
                        ${hashedPassword},
                        ${fullName},
                        'student',
                        ${department},
                        ${rollNo},
                        NOW()
                    )
                `;

                imported++;
            } catch (error) {
                console.error('Error importing student:', error);
                errorDetails.push(`Failed to import ${student['Email'] || student.email || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                errors++;
            }
        }

        return NextResponse.json({
            message: `Import completed: ${imported} students imported, ${errors} errors`,
            imported,
            errors,
            errorDetails: errorDetails.slice(0, 10) // Limit error details to first 10
        });

    } catch (error) {
        console.error('Error importing students:', error);
        return NextResponse.json(
            { message: 'Failed to import students', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 