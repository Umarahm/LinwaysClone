import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
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

        const { submissionId, grade, feedback } = await request.json()

        // Validate input
        if (!submissionId || grade === undefined || grade === null) {
            return NextResponse.json(
                { success: false, message: "Submission ID and grade are required" },
                { status: 400 }
            )
        }

        if (typeof grade !== 'number' || grade < 0) {
            return NextResponse.json(
                { success: false, message: "Grade must be a valid number >= 0" },
                { status: 400 }
            )
        }

        // Verify the submission belongs to an assignment taught by this faculty
        const submissionCheck = await safeQuery(
            () => sql`
        SELECT s.id, a.max_marks, a.title, c.code, c.name, u.full_name
        FROM submissions s
        JOIN assignments a ON s.assignment_id = a.id
        JOIN courses c ON a.course_id = c.id
        JOIN course_faculty cf ON c.id = cf.course_id
        JOIN users u ON s.student_id = u.id
        WHERE s.id = ${submissionId} AND cf.faculty_id = ${user.id}
      `,
            "Failed to verify submission access"
        )

        if (submissionCheck.length === 0) {
            return NextResponse.json(
                { success: false, message: "Submission not found or you don't have permission to grade it" },
                { status: 404 }
            )
        }

        const submission = submissionCheck[0]

        // Validate grade is within max marks
        if (grade > submission.max_marks) {
            return NextResponse.json(
                { success: false, message: `Grade cannot exceed maximum marks (${submission.max_marks})` },
                { status: 400 }
            )
        }

        // Update the submission with grade and feedback
        const updatedSubmission = await safeQuery(
            () => sql`
        UPDATE submissions 
        SET grade = ${grade}, feedback = ${feedback || null}
        WHERE id = ${submissionId}
        RETURNING id, grade, feedback
      `,
            "Failed to update submission grade"
        )

        return NextResponse.json({
            success: true,
            submission: {
                id: updatedSubmission[0].id,
                grade: updatedSubmission[0].grade,
                feedback: updatedSubmission[0].feedback
            },
            message: `Successfully graded submission for ${submission.full_name}`
        })
    } catch (error) {
        console.error("Grade submission error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to grade submission" },
            { status: 500 }
        )
    }
} 