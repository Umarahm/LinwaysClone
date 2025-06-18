import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface ImportCourse {
    'Course Code'?: string;
    'Course Name'?: string;
    'Description'?: string;
    'Credits'?: number | string;
    'Primary Faculty Email'?: string;
    code?: string;
    name?: string;
    description?: string;
    credits?: number | string;
    primary_faculty_email?: string;
}

export async function POST(request: NextRequest) {
    try {
        const { courses }: { courses: ImportCourse[] } = await request.json();

        if (!courses || !Array.isArray(courses)) {
            return NextResponse.json(
                { message: 'Invalid data format' },
                { status: 400 }
            );
        }

        let imported = 0;
        let errors = 0;
        const errorDetails: string[] = [];

        for (const course of courses) {
            try {
                // Extract data from both possible formats
                const code = course['Course Code'] || course.code;
                const name = course['Course Name'] || course.name;
                const description = course['Description'] || course.description || '';
                const creditsValue = course['Credits'] || course.credits;
                const primaryFacultyEmail = course['Primary Faculty Email'] || course.primary_faculty_email;

                if (!code || !name || !creditsValue || !primaryFacultyEmail) {
                    errorDetails.push(`Missing required fields for course ${code || 'unknown'}`);
                    errors++;
                    continue;
                }

                // Parse credits to number
                const credits = typeof creditsValue === 'string' ? parseInt(creditsValue) : creditsValue;
                if (isNaN(credits) || credits < 1 || credits > 6) {
                    errorDetails.push(`Invalid credits value for course ${code}: must be between 1 and 6`);
                    errors++;
                    continue;
                }

                // Check if course already exists
                const existingCourse = await sql`
                    SELECT id FROM courses WHERE code = ${code}
                `;

                if (existingCourse.length > 0) {
                    errorDetails.push(`Course with code ${code} already exists`);
                    errors++;
                    continue;
                }

                // Find faculty by email
                const facultyResult = await sql`
                    SELECT id FROM users WHERE email = ${primaryFacultyEmail} AND role = 'faculty'
                `;

                if (facultyResult.length === 0) {
                    errorDetails.push(`Faculty with email ${primaryFacultyEmail} not found for course ${code}`);
                    errors++;
                    continue;
                }

                const facultyId = facultyResult[0].id;

                // Insert course
                const newCourse = await sql`
                    INSERT INTO courses (
                        code, 
                        name, 
                        description, 
                        credits, 
                        faculty_id,
                        created_at
                    ) VALUES (
                        ${code},
                        ${name},
                        ${description},
                        ${credits},
                        ${facultyId},
                        NOW()
                    )
                    RETURNING id
                `;

                const courseId = newCourse[0].id;

                // Add faculty to course_faculty table
                await sql`
                    INSERT INTO course_faculty (course_id, faculty_id, is_primary)
                    VALUES (${courseId}, ${facultyId}, true)
                    ON CONFLICT (course_id, faculty_id) DO UPDATE SET is_primary = true
                `;

                imported++;
            } catch (error) {
                console.error('Error importing course:', error);
                errorDetails.push(`Failed to import course ${course['Course Code'] || course.code || 'unknown'}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                errors++;
            }
        }

        return NextResponse.json({
            message: `Import completed: ${imported} courses imported, ${errors} errors`,
            imported,
            errors,
            errorDetails: errorDetails.slice(0, 10) // Limit error details to first 10
        });

    } catch (error) {
        console.error('Error importing courses:', error);
        return NextResponse.json(
            { message: 'Failed to import courses', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 