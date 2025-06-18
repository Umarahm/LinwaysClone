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

        if (user.role !== "faculty") {
            return NextResponse.json({ success: false, message: "Access denied. Faculty only." }, { status: 403 })
        }

        const resolvedParams = await params
        const courseId = parseInt(resolvedParams.id)

        // Verify faculty teaches this course
        const courseCheck = await safeQuery(
            () => sql`
                SELECT c.id, c.name, c.code
                FROM courses c
                JOIN course_faculty cf ON c.id = cf.course_id
                WHERE c.id = ${courseId} AND cf.faculty_id = ${user.id}
            `,
            "Failed to verify course access"
        )

        if (courseCheck.length === 0) {
            return NextResponse.json({ success: false, message: "Course not found or access denied" }, { status: 404 })
        }

        // Get all assignments for this course
        const assignments = await safeQuery(
            () => sql`
                SELECT id, title, max_marks, due_date, created_at
                FROM assignments
                WHERE course_id = ${courseId}
                ORDER BY due_date ASC
            `,
            "Failed to fetch assignments"
        )

        // Get all students enrolled in this course
        const students = await safeQuery(
            () => sql`
                SELECT u.id, u.full_name, u.email
                FROM users u
                JOIN enrollments e ON u.id = e.student_id
                WHERE e.course_id = ${courseId} AND u.role = 'student'
                ORDER BY u.full_name ASC
            `,
            "Failed to fetch students"
        )

        // Get all submissions/grades for this course
        const submissions = await safeQuery(
            () => sql`
                SELECT 
                    s.student_id,
                    s.assignment_id,
                    s.grade,
                    s.feedback,
                    s.submitted_at,
                    s.graded_at
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                WHERE a.course_id = ${courseId}
            `,
            "Failed to fetch submissions"
        )

        // Process data to create gradebook structure
        const studentGrades = students.map(student => {
            const assignmentGrades: { [assignmentId: number]: { grade: number | null; feedback: string } } = {}
            let totalGraded = 0
            let totalPossible = 0
            let totalEarned = 0

            assignments.forEach(assignment => {
                const submission = submissions.find(s =>
                    s.student_id === student.id && s.assignment_id === assignment.id
                )

                assignmentGrades[assignment.id] = {
                    grade: submission?.grade || null,
                    feedback: submission?.feedback || ""
                }

                if (submission?.grade !== null && submission?.grade !== undefined) {
                    totalGraded++
                    totalEarned += submission.grade
                    totalPossible += assignment.max_marks
                }
            })

            const averagePercentage = totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0
            const letterGrade = getLetterGrade(averagePercentage)

            return {
                studentId: student.id,
                studentName: student.full_name,
                studentEmail: student.email,
                assignmentGrades,
                totalGrade: totalEarned,
                averagePercentage: Math.round(averagePercentage * 10) / 10,
                letterGrade
            }
        })

        // Calculate course statistics
        const totalStudents = students.length
        const totalAssignments = assignments.length
        const gradedSubmissions = submissions.filter(s => s.grade !== null).length
        const totalPossibleSubmissions = totalStudents * totalAssignments
        const pendingSubmissions = totalPossibleSubmissions - gradedSubmissions

        const averageGrade = studentGrades.length > 0
            ? studentGrades.reduce((sum, student) => sum + student.averagePercentage, 0) / studentGrades.length
            : 0

        const stats = {
            totalStudents,
            totalAssignments,
            averageGrade: Math.round(averageGrade * 10) / 10,
            gradedSubmissions,
            pendingSubmissions
        }

        return NextResponse.json({
            success: true,
            studentGrades,
            assignments: assignments.map(a => ({
                id: a.id,
                title: a.title,
                maxMarks: a.max_marks,
                dueDate: a.due_date,
                submissionCount: submissions.filter(s => s.assignment_id === a.id).length,
                totalStudents
            })),
            stats
        })

    } catch (error) {
        console.error("Gradebook error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch gradebook data" },
            { status: 500 }
        )
    }
}

function getLetterGrade(percentage: number): string {
    if (percentage >= 97) return 'A+';
    if (percentage >= 93) return 'A';
    if (percentage >= 90) return 'A-';
    if (percentage >= 87) return 'B+';
    if (percentage >= 83) return 'B';
    if (percentage >= 80) return 'B-';
    if (percentage >= 77) return 'C+';
    if (percentage >= 73) return 'C';
    if (percentage >= 70) return 'C-';
    if (percentage >= 67) return 'D+';
    if (percentage >= 65) return 'D';
    return 'F';
} 