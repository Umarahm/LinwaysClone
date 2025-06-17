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

        // Fetch all submissions for assignments created by this faculty
        const submissions = await safeQuery(
            () => sql`
        SELECT 
          s.id,
          s.assignment_id as "assignmentId",
          s.student_id as "studentId",
          s.file_url as "fileUrl",
          s.grade,
          s.feedback,
          s.submitted_at as "submittedAt",
          a.title as "assignmentTitle",
          a.due_date as "dueDate",
          a.max_marks as "maxMarks",
          c.code as "courseCode",
          c.name as "courseName",
          u.full_name as "studentName",
          u.email as "studentEmail"
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN courses c ON a.course_id = c.id
        JOIN course_faculty cf ON c.id = cf.course_id
        JOIN users u ON s.student_id = u.id
        WHERE cf.faculty_id = ${user.id}
        ORDER BY s.submitted_at DESC
      `,
            "Failed to fetch submissions"
        )

        // Format the submissions
        const formattedSubmissions = submissions.map(submission => {
            let status: 'submitted' | 'late_submitted' | 'graded' = 'submitted'

            if (submission.grade !== null && submission.grade !== undefined) {
                status = 'graded'
            } else {
                const dueDate = new Date(submission.dueDate)
                const submittedDate = new Date(submission.submittedAt)
                if (submittedDate > dueDate) {
                    status = 'late_submitted'
                }
            }

            return {
                id: submission.id,
                assignmentId: submission.assignmentId,
                assignmentTitle: submission.assignmentTitle,
                courseCode: submission.courseCode,
                courseName: submission.courseName,
                studentId: submission.studentId,
                studentName: submission.studentName,
                studentEmail: submission.studentEmail,
                submittedAt: submission.submittedAt,
                fileUrl: submission.fileUrl,
                fileName: submission.fileUrl ? submission.fileUrl.split('/').pop() : undefined,
                grade: submission.grade,
                maxMarks: submission.maxMarks,
                feedback: submission.feedback,
                status,
                dueDate: submission.dueDate
            }
        })

        return NextResponse.json({
            success: true,
            submissions: formattedSubmissions,
        })
    } catch (error) {
        console.error("Faculty submissions error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch submissions" },
            { status: 500 }
        )
    }
} 