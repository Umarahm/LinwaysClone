import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { code, name, description, credits, faculty_id } = await request.json();
        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.id);

        // Validate required fields
        if (!code || !name || !credits || !faculty_id) {
            return NextResponse.json(
                { error: 'Course code, name, credits, and faculty are required' },
                { status: 400 }
            );
        }

        // Check if course exists
        const existingCourse = await sql`
      SELECT id FROM courses WHERE id = ${courseId}
    `;

        if (existingCourse.length === 0) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Check if course code is already taken by another course
        const codeCheck = await sql`
      SELECT id FROM courses WHERE code = ${code} AND id != ${courseId}
    `;

        if (codeCheck.length > 0) {
            return NextResponse.json(
                { error: 'Course code is already taken by another course' },
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

        // Update course
        const updatedCourse = await sql`
      UPDATE courses 
      SET code = ${code}, name = ${name}, description = ${description}, 
          credits = ${credits}, faculty_id = ${faculty_id}
      WHERE id = ${courseId}
      RETURNING *
    `;

        return NextResponse.json({
            message: 'Course updated successfully',
            course: updatedCourse[0]
        });
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json(
            { error: 'Failed to update course' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const courseId = parseInt(resolvedParams.id);

        // Check if course exists
        const course = await sql`
      SELECT id FROM courses WHERE id = ${courseId}
    `;

        if (course.length === 0) {
            return NextResponse.json(
                { error: 'Course not found' },
                { status: 404 }
            );
        }

        // Delete related records first (due to foreign key constraints)
        await sql`DELETE FROM attendance WHERE course_id = ${courseId}`;
        await sql`DELETE FROM submissions s USING assignments a WHERE s.assignment_id = a.id AND a.course_id = ${courseId}`;
        await sql`DELETE FROM assignments WHERE course_id = ${courseId}`;
        await sql`DELETE FROM enrollments WHERE course_id = ${courseId}`;

        // Delete the course
        await sql`DELETE FROM courses WHERE id = ${courseId}`;

        return NextResponse.json({
            message: 'Course deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json(
            { error: 'Failed to delete course' },
            { status: 500 }
        );
    }
} 