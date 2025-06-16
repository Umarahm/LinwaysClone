import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
    try {
        // Get user from session
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const user = JSON.parse(userCookie.value)

        if (user.role !== "faculty") {
            return NextResponse.json({ success: false, message: "Access denied. Faculty only." }, { status: 403 })
        }

        // Get total students enrolled in faculty's courses using new relationship
        const studentCountResult = await safeQuery(
            () => sql`
        SELECT COUNT(DISTINCT e.student_id) as total_students
        FROM enrollments e
        JOIN course_faculty cf ON e.course_id = cf.course_id
        WHERE cf.faculty_id = ${user.id}
      `,
            "Failed to fetch student count"
        )

        // Get total assignments created by faculty using new relationship
        const assignmentCountResult = await safeQuery(
            () => sql`
        SELECT COUNT(*) as total_assignments
        FROM assignments a
        JOIN course_faculty cf ON a.course_id = cf.course_id
        WHERE cf.faculty_id = ${user.id}
      `,
            "Failed to fetch assignment count"
        )

        // Get pending assignments (submissions that need grading) using new relationship
        const pendingAssignmentsResult = await safeQuery(
            () => sql`
        SELECT COUNT(*) as pending_assignments
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN course_faculty cf ON a.course_id = cf.course_id
        WHERE cf.faculty_id = ${user.id} AND s.grade IS NULL
      `,
            "Failed to fetch pending assignments count"
        )

        const stats = {
            totalStudents: studentCountResult[0]?.total_students || 0,
            totalAssignments: assignmentCountResult[0]?.total_assignments || 0,
            pendingAssignments: pendingAssignmentsResult[0]?.pending_assignments || 0,
        }

        return NextResponse.json({
            success: true,
            stats: stats,
        })
    } catch (error) {
        console.error("Faculty stats error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch faculty stats" },
            { status: 500 }
        )
    }
} 