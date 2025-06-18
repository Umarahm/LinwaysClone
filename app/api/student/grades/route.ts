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

        if (user.role !== "student") {
            return NextResponse.json({ success: false, message: "Access denied. Students only." }, { status: 403 })
        }

        // Fetch all grades for this student
        const grades = await safeQuery(
            () => sql`
                SELECT 
                    s.id,
                    s.grade,
                    s.feedback,
                    s.submitted_at,
                    s.graded_at,
                    a.title as assignment_title,
                    a.max_marks,
                    a.due_date,
                    c.code as course_code,
                    c.name as course_name,
                    c.credits,
                    u.full_name as faculty_name
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                JOIN courses c ON a.course_id = c.id
                JOIN course_faculty cf ON c.id = cf.course_id
                JOIN users u ON cf.faculty_id = u.id
                WHERE s.student_id = ${user.id} AND s.grade IS NOT NULL
                ORDER BY s.graded_at DESC
            `,
            "Failed to fetch grades"
        )

        // Calculate course GPAs and overall statistics
        const courseStats = await safeQuery(
            () => sql`
                SELECT 
                    c.code as course_code,
                    c.name as course_name,
                    c.credits,
                    COUNT(s.id) as graded_assignments,
                    COUNT(a.id) as total_assignments,
                    AVG(CASE WHEN s.grade IS NOT NULL THEN (s.grade::float / a.max_marks::float) * 100 END) as average_percentage,
                    SUM(CASE WHEN s.grade IS NOT NULL THEN s.grade ELSE 0 END) as total_points,
                    SUM(CASE WHEN s.grade IS NOT NULL THEN a.max_marks ELSE 0 END) as total_possible_points
                FROM enrollments e
                JOIN courses c ON e.course_id = c.id
                JOIN assignments a ON c.id = a.course_id
                LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ${user.id}
                WHERE e.student_id = ${user.id}
                GROUP BY c.id, c.code, c.name, c.credits
                ORDER BY c.code
            `,
            "Failed to fetch course statistics"
        )

        // Format grades for frontend
        const formattedGrades = grades.map(grade => ({
            id: grade.id,
            courseCode: grade.course_code,
            courseName: grade.course_name,
            assignmentTitle: grade.assignment_title,
            grade: grade.grade,
            maxMarks: grade.max_marks,
            percentage: Math.round((grade.grade / grade.max_marks) * 100),
            feedback: grade.feedback || "",
            submittedAt: grade.submitted_at,
            gradedAt: grade.graded_at,
            facultyName: grade.faculty_name
        }))

        // Calculate course GPAs (4.0 scale)
        const courseGPAs = courseStats.map(course => {
            const avgPercentage = parseFloat(course.average_percentage) || 0
            let gpaPoints = 0.0

            if (avgPercentage >= 97) gpaPoints = 4.0
            else if (avgPercentage >= 93) gpaPoints = 3.7
            else if (avgPercentage >= 90) gpaPoints = 3.3
            else if (avgPercentage >= 87) gpaPoints = 3.0
            else if (avgPercentage >= 83) gpaPoints = 2.7
            else if (avgPercentage >= 80) gpaPoints = 2.3
            else if (avgPercentage >= 77) gpaPoints = 2.0
            else if (avgPercentage >= 73) gpaPoints = 1.7
            else if (avgPercentage >= 70) gpaPoints = 1.3
            else if (avgPercentage >= 67) gpaPoints = 1.0
            else if (avgPercentage >= 65) gpaPoints = 0.7
            else gpaPoints = 0.0

            return {
                courseCode: course.course_code,
                courseName: course.course_name,
                credits: course.credits,
                averageGrade: avgPercentage,
                totalAssignments: course.total_assignments,
                completedAssignments: course.graded_assignments,
                gpaPoints: gpaPoints
            }
        })

        // Calculate overall GPA
        const totalCredits = courseGPAs.reduce((sum, course) => sum + course.credits, 0)
        const weightedGPA = courseGPAs.reduce((sum, course) => sum + (course.gpaPoints * course.credits), 0)
        const overallGPA = totalCredits > 0 ? weightedGPA / totalCredits : 0

        return NextResponse.json({
            success: true,
            grades: formattedGrades,
            courseGPAs: courseGPAs,
            overallGPA: parseFloat(overallGPA.toFixed(2)),
            summary: {
                totalGradedAssignments: formattedGrades.length,
                totalCourses: courseGPAs.length,
                totalCredits: totalCredits,
                averageGrade: formattedGrades.length > 0 ?
                    Math.round(formattedGrades.reduce((sum, grade) => sum + grade.percentage, 0) / formattedGrades.length) : 0
            }
        })
    } catch (error) {
        console.error("Student grades error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch grades" },
            { status: 500 }
        )
    }
} 