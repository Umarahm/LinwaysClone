import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const courseId = parseInt(id);

        if (isNaN(courseId)) {
            return NextResponse.json(
                { error: 'Invalid course ID' },
                { status: 400 }
            );
        }

        // Get all faculty assigned to this course
        const faculty = await sql`
            SELECT 
                u.id,
                u.full_name,
                u.email,
                u.department,
                cf.is_primary,
                cf.assigned_at
            FROM course_faculty cf
            JOIN users u ON cf.faculty_id = u.id
            WHERE cf.course_id = ${courseId} AND u.role = 'faculty'
            ORDER BY cf.is_primary DESC, u.full_name
        `;

        return NextResponse.json({ faculty });
    } catch (error) {
        console.error('Error fetching course faculty:', error);
        return NextResponse.json(
            { error: 'Failed to fetch course faculty' },
            { status: 500 }
        );
    }
} 