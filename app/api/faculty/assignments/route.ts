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

        // Fetch assignments for courses assigned to this faculty with submission counts
        const assignments = await safeQuery(
            () => sql`
        SELECT 
          a.id,
          a.title,
          a.description,
          a.due_date as "dueDate",
          a.max_marks as "maxMarks",
          a.file_url as "fileUrl",
          a.created_at as "createdAt",
          c.code as "courseCode",
          c.name as "courseName",
          COUNT(s.id) as "submissionsCount",
          COUNT(e.student_id) as "totalStudents"
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN course_faculty cf ON c.id = cf.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id
        LEFT JOIN enrollments e ON c.id = e.course_id
        WHERE cf.faculty_id = ${user.id}
        GROUP BY a.id, c.id
        ORDER BY a.created_at DESC
      `,
            "Failed to fetch faculty assignments"
        )

        // Convert the results to proper format
        const formattedAssignments = assignments.map(assignment => ({
            id: assignment.id,
            title: assignment.title,
            courseCode: assignment.courseCode,
            courseName: assignment.courseName,
            description: assignment.description,
            dueDate: assignment.dueDate,
            maxMarks: assignment.maxMarks,
            submissionsCount: parseInt(assignment.submissionsCount || 0),
            totalStudents: parseInt(assignment.totalStudents || 0),
            fileUrl: assignment.fileUrl,
            createdAt: assignment.createdAt
        }))

        return NextResponse.json({
            success: true,
            assignments: formattedAssignments,
        })
    } catch (error) {
        console.error("Faculty assignments error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch assignments" },
            { status: 500 }
        )
    }
}

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

        const { title, courseId, description, dueDate, maxMarks } = await request.json()

        // Validate input
        if (!title || !courseId || !description || !dueDate || !maxMarks) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            )
        }

        // Verify the course is assigned to this faculty using the new relationship
        const courseCheck = await safeQuery(
            () => sql`
        SELECT cf.course_id FROM course_faculty cf
        WHERE cf.course_id = ${courseId} AND cf.faculty_id = ${user.id}
      `,
            "Failed to verify course ownership"
        )

        if (courseCheck.length === 0) {
            return NextResponse.json(
                { success: false, message: "Course not found or not assigned to you" },
                { status: 403 }
            )
        }

        // Create the assignment (keep faculty_id for backward compatibility and assignment ownership)
        const newAssignment = await safeQuery(
            () => sql`
        INSERT INTO assignments (title, description, course_id, faculty_id, due_date, max_marks)
        VALUES (${title}, ${description}, ${courseId}, ${user.id}, ${dueDate}, ${maxMarks})
        RETURNING id, title, description, due_date as "dueDate", max_marks as "maxMarks", created_at as "createdAt"
      `,
            "Failed to create assignment"
        )

        return NextResponse.json({
            success: true,
            assignment: newAssignment[0],
            message: "Assignment created successfully"
        })
    } catch (error) {
        console.error("Create assignment error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to create assignment" },
            { status: 500 }
        )
    }
} 