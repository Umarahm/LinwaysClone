import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        // Get courses with their primary faculty (for backward compatibility)
        const courses = await sql`
            SELECT 
                c.*,
                u.full_name as faculty_name
            FROM courses c
            LEFT JOIN course_faculty cf ON c.id = cf.course_id AND cf.is_primary = true
            LEFT JOIN users u ON cf.faculty_id = u.id
            ORDER BY c.created_at DESC
        `;

        return NextResponse.json({ courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { code, name, description, credits, faculty_ids, primary_faculty_id } = await request.json();

        // Validate required fields
        if (!code || !name || !credits || !faculty_ids || !Array.isArray(faculty_ids) || faculty_ids.length === 0) {
            return NextResponse.json(
                { error: 'Course code, name, credits, and at least one faculty member are required' },
                { status: 400 }
            );
        }

        if (!primary_faculty_id || !faculty_ids.includes(primary_faculty_id)) {
            return NextResponse.json(
                { error: 'Primary faculty must be one of the assigned faculty members' },
                { status: 400 }
            );
        }

        // Check if course code already exists
        const existingCourse = await sql`
            SELECT id FROM courses WHERE code = ${code}
        `;

        if (existingCourse.length > 0) {
            return NextResponse.json(
                { error: 'Course with this code already exists' },
                { status: 409 }
            );
        }

        // Verify all faculty members exist
        const facultyCheck = await sql`
            SELECT id FROM users 
            WHERE id = ANY(${faculty_ids}) AND role = 'faculty'
        `;

        if (facultyCheck.length !== faculty_ids.length) {
            return NextResponse.json(
                { error: 'One or more selected faculty members are invalid' },
                { status: 400 }
            );
        }

        // Create course (keep faculty_id for backward compatibility with primary faculty)
        const newCourse = await sql`
            INSERT INTO courses (code, name, description, credits, faculty_id)
            VALUES (${code}, ${name}, ${description}, ${credits}, ${primary_faculty_id})
            RETURNING *
        `;

        const courseId = newCourse[0].id;

        // Create faculty assignments in course_faculty table
        for (const facultyId of faculty_ids) {
            await sql`
                INSERT INTO course_faculty (course_id, faculty_id, is_primary)
                VALUES (${courseId}, ${facultyId}, ${facultyId === primary_faculty_id})
            `;
        }

        return NextResponse.json({
            message: 'Course created successfully',
            course: newCourse[0]
        });
    } catch (error) {
        console.error('Error creating course:', error);
        return NextResponse.json(
            { error: 'Failed to create course' },
            { status: 500 }
        );
    }
} 