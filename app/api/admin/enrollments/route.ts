import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateAdminAccess } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
    try {
        console.log('Enrollments API called');

        const { user, error } = await validateAdminAccess(request)
        console.log('Current user:', user?.role);

        if (!user) {
            console.log('Unauthorized access attempt:', error);
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }

        // Get all enrollments with student and course information
        console.log('Fetching enrollments from database...');
        const enrollments = await sql`
            SELECT 
                e.id,
                u.full_name as student_name,
                u.email as student_email,
                c.code as course_code,
                c.name as course_name,
                e.enrolled_at
            FROM enrollments e
            JOIN users u ON e.student_id = u.id
            JOIN courses c ON e.course_id = c.id
            WHERE u.role = 'student'
            ORDER BY e.enrolled_at DESC
        `

        console.log(`Found ${enrollments.length} enrollments`);

        const result = {
            enrollments: enrollments.map(enrollment => ({
                id: enrollment.id,
                student_name: enrollment.student_name,
                student_email: enrollment.student_email,
                course_code: enrollment.course_code,
                course_name: enrollment.course_name,
                enrolled_at: enrollment.enrolled_at
            }))
        };

        console.log('Returning enrollments data:', result);
        return NextResponse.json(result)

    } catch (error) {
        console.error("Error fetching enrollments:", error)
        return NextResponse.json(
            { error: "Failed to fetch enrollments. Please check database connection." },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        console.log('Enrollments POST API called');

        const { user, error } = await validateAdminAccess(request)

        if (!user) {
            console.log('Unauthorized enrollment attempt:', error);
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { student_id, course_id } = body

        if (!student_id || !course_id) {
            return NextResponse.json(
                { error: "Student ID and Course ID are required" },
                { status: 400 }
            )
        }

        // Check if enrollment already exists
        const existingEnrollment = await sql`
            SELECT id FROM enrollments 
            WHERE student_id = ${student_id} AND course_id = ${course_id}
        `

        if (existingEnrollment.length > 0) {
            return NextResponse.json(
                { error: "Student is already enrolled in this course" },
                { status: 400 }
            )
        }

        // Create new enrollment
        await sql`
            INSERT INTO enrollments (student_id, course_id, enrolled_at)
            VALUES (${student_id}, ${course_id}, NOW())
        `

        console.log(`Successfully enrolled student ${student_id} in course ${course_id}`);

        return NextResponse.json({
            message: "Student enrolled successfully"
        })

    } catch (error) {
        console.error("Error creating enrollment:", error)
        return NextResponse.json(
            { error: "Failed to enroll student" },
            { status: 500 }
        )
    }
} 