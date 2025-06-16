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

        // Get enrollment count for the course
        const enrollmentResult = await safeQuery(
            () => sql`
        SELECT COUNT(*) as enrollment_count
        FROM enrollments
        WHERE course_id = ${courseId}
      `,
            "Failed to fetch enrollment count"
        )

        const count = parseInt(enrollmentResult[0]?.enrollment_count || 0)

        return NextResponse.json({
            success: true,
            count: count,
        })
    } catch (error) {
        console.error("Enrollment count error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch enrollment count" },
            { status: 500 }
        )
    }
} 