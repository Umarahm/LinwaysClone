import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params
        const courseId = parseInt(resolvedParams.id)

        if (isNaN(courseId)) {
            return NextResponse.json(
                { success: false, message: "Invalid course ID" },
                { status: 400 }
            )
        }

        // Get all students enrolled in the course
        const students = await safeQuery(
            () => sql`
        SELECT 
          u.id,
          u.email,
          u.full_name,
          u.department
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        WHERE e.course_id = ${courseId} AND u.role = 'student'
        ORDER BY u.full_name
      `,
            "Failed to fetch enrolled students"
        )

        return NextResponse.json({
            success: true,
            students: students,
        })
    } catch (error) {
        console.error("Students fetch error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch students" },
            { status: 500 }
        )
    }
} 