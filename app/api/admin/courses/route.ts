import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        const courses = await sql`
      SELECT c.*, u.full_name as faculty_name
      FROM courses c
      LEFT JOIN users u ON c.faculty_id = u.id
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
        const { code, name, description, credits, faculty_id } = await request.json();

        // Validate required fields
        if (!code || !name || !credits || !faculty_id) {
            return NextResponse.json(
                { error: 'Course code, name, credits, and faculty are required' },
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

        // Verify faculty exists
        const faculty = await sql`
      SELECT id FROM users WHERE id = ${faculty_id} AND role = 'faculty'
    `;

        if (faculty.length === 0) {
            return NextResponse.json(
                { error: 'Invalid faculty member selected' },
                { status: 400 }
            );
        }

        // Create course
        const newCourse = await sql`
      INSERT INTO courses (code, name, description, credits, faculty_id)
      VALUES (${code}, ${name}, ${description}, ${credits}, ${faculty_id})
      RETURNING *
    `;

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