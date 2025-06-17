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

        // Handle both FormData (with file) and JSON (without file)
        let title, courseId, description, dueDate, maxMarks, file = null

        const contentType = request.headers.get("content-type")

        if (contentType?.includes("multipart/form-data")) {
            // Handle FormData for file uploads
            const formData = await request.formData()
            title = formData.get("title") as string
            courseId = formData.get("courseId") as string
            description = formData.get("description") as string
            dueDate = formData.get("dueDate") as string
            maxMarks = formData.get("maxMarks") as string
            file = formData.get("file") as File | null
        } else {
            // Handle JSON for regular requests
            const body = await request.json()
            title = body.title
            courseId = body.courseId
            description = body.description
            dueDate = body.dueDate
            maxMarks = body.maxMarks
        }

        // Validate input
        if (!title || !courseId || !description || !dueDate || !maxMarks) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            )
        }

        // Handle file upload if present
        let fileUrl = null
        if (file && file.size > 0) {
            // Basic file validation
            const maxFileSize = 10 * 1024 * 1024 // 10MB
            if (file.size > maxFileSize) {
                return NextResponse.json(
                    { success: false, message: "File size too large. Maximum 10MB allowed." },
                    { status: 400 }
                )
            }

            try {
                // Read file as buffer
                const fileBuffer = await file.arrayBuffer()
                const fileName = `assignment_${Date.now()}_${user.id}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

                // Store file in database
                const fileRecord = await safeQuery(
                    () => sql`
                    INSERT INTO files (filename, original_name, mime_type, file_size, file_data, created_by)
                    VALUES (${fileName}, ${file.name}, ${file.type}, ${file.size}, ${Buffer.from(fileBuffer)}, ${user.id})
                    RETURNING filename
                    `,
                    "Failed to store file"
                )

                fileUrl = fileRecord[0].filename
            } catch (fileError) {
                console.error('File upload error:', fileError)
                return NextResponse.json(
                    { success: false, message: "Failed to upload file" },
                    { status: 500 }
                )
            }
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
        INSERT INTO assignments (title, description, course_id, faculty_id, due_date, max_marks, file_url)
        VALUES (${title}, ${description}, ${courseId}, ${user.id}, ${dueDate}, ${Number.parseInt(maxMarks)}, ${fileUrl})
        RETURNING id, title, description, due_date as "dueDate", max_marks as "maxMarks", file_url as "fileUrl", created_at as "createdAt"
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