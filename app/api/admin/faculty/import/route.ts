import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { hash } from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

interface ImportFaculty {
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
        const { faculty }: { faculty: ImportFaculty[] } = await request.json();

        if (!faculty || !Array.isArray(faculty)) {
            return NextResponse.json(
                { message: 'Invalid data format' },
                { status: 400 }
            );
        }

        let imported = 0;
        let errors = 0;
        const errorDetails: string[] = [];

        // Get the highest current roll number for faculty
        const highestRollResult = await sql`
            SELECT roll_no FROM users 
            WHERE role = 'faculty' AND roll_no LIKE 'FAC%' 
            ORDER BY roll_no DESC 
            LIMIT 1
        `;

        let rollCounter = 1;
        if (highestRollResult.length > 0) {
            const lastRoll = highestRollResult[0].roll_no;
            const match = lastRoll.match(/FAC(\d+)/);
            if (match) {
                rollCounter = parseInt(match[1]) + 1;
            }
        }

        for (const facultyMember of faculty) {
            try {
                // Extract data from both possible formats
                const fullName = facultyMember['Full Name'] || facultyMember.full_name;
                const email = facultyMember['Email'] || facultyMember.email;
                const department = facultyMember['Department'] || facultyMember.department;
                let rollNo = facultyMember['Roll Number'] || facultyMember.roll_no;
                const password = facultyMember['Password'] || facultyMember.password || 'defaultpassword123';

                if (!fullName || !email || !department) {
                    errorDetails.push(`Missing required fields for ${email || 'unknown'}`);
                    errors++;
                    continue;
                }

                // Generate roll number if not provided
                if (!rollNo) {
                    rollNo = `FAC${rollCounter.toString().padStart(4, '0')}`;
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

                // Insert faculty
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
                        'faculty',
                        ${department},
                        ${rollNo},
                        NOW()
                    )
                `;

                imported++;
            } catch (error) {
                console.error('Error importing faculty:', error);
                errorDetails.push(`Failed to import ${facultyMember['Email'] || facultyMember.email || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                errors++;
            }
        }

        return NextResponse.json({
            message: `Import completed: ${imported} faculty imported, ${errors} errors`,
            imported,
            errors,
            errorDetails: errorDetails.slice(0, 10) // Limit error details to first 10
        });

    } catch (error) {
        console.error('Error importing faculty:', error);
        return NextResponse.json(
            { message: 'Failed to import faculty', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 