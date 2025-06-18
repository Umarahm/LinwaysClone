import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Get user from session
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const user = JSON.parse(userCookie.value)
        const resolvedParams = await params
        const courseId = parseInt(resolvedParams.id)

        // Check if user has access to this course (faculty teaching it or student enrolled)
        let hasAccess = false

        if (user.role === "faculty") {
            const facultyCheck = await safeQuery(
                () => sql`
                    SELECT c.id
                    FROM courses c
                    JOIN course_faculty cf ON c.id = cf.course_id
                    WHERE c.id = ${courseId} AND cf.faculty_id = ${user.id}
                `,
                "Failed to verify faculty access"
            )
            hasAccess = facultyCheck.length > 0
        } else if (user.role === "student") {
            const studentCheck = await safeQuery(
                () => sql`
                    SELECT e.id
                    FROM enrollments e
                    WHERE e.course_id = ${courseId} AND e.student_id = ${user.id}
                `,
                "Failed to verify student access"
            )
            hasAccess = studentCheck.length > 0
        } else if (user.role === "admin") {
            hasAccess = true
        }

        if (!hasAccess) {
            return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 })
        }

        // Fetch assignments for the course
        const assignments = await safeQuery(
            () => sql`
                SELECT 
                    a.id,
                    a.title,
                    a.description,
                    a.max_marks,
                    a.due_date,
                    a.created_at,
                    c.code as course_code,
                    c.name as course_name,
                    u.full_name as faculty_name,
                    COUNT(s.id) as submission_count
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                JOIN course_faculty cf ON c.id = cf.course_id
                JOIN users u ON cf.faculty_id = u.id
                LEFT JOIN submissions s ON a.id = s.assignment_id
                WHERE a.course_id = ${courseId}
                GROUP BY a.id, c.code, c.name, u.full_name
                ORDER BY a.due_date DESC
            `,
            "Failed to fetch assignments"
        )

        // Get total enrolled students for submission statistics
        const enrollmentCount = await safeQuery(
            () => sql`
                SELECT COUNT(*) as total_students
                FROM enrollments
                WHERE course_id = ${courseId}
            `,
            "Failed to fetch enrollment count"
        )

        const totalStudents = enrollmentCount[0]?.total_students || 0

        const formattedAssignments = assignments.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            maxMarks: assignment.max_marks,
            dueDate: assignment.due_date,
            createdAt: assignment.created_at,
            courseCode: assignment.course_code,
            courseName: assignment.course_name,
            facultyName: assignment.faculty_name,
            submissionCount: assignment.submission_count,
            totalStudents: totalStudents,
            submissionRate: totalStudents > 0 ? Math.round((assignment.submission_count / totalStudents) * 100) : 0
        }))

        return NextResponse.json({
            success: true,
            assignments: formattedAssignments
        })

    } catch (error) {
        console.error("Course assignments error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch assignments" },
            { status: 500 }
        )
    }
} 