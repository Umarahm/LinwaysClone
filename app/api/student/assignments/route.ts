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
            return NextResponse.json({ success: false, message: "Access denied. Student only." }, { status: 403 })
        }

        // Fetch assignments for courses the student is enrolled in
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
          s.id as "submissionId",
          s.grade,
          s.submitted_at as "submittedAt",
          s.file_url as "submittedFileUrl",
          s.feedback
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON c.id = e.course_id
        LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ${user.id}
        WHERE e.student_id = ${user.id}
        ORDER BY a.due_date ASC
      `,
            "Failed to fetch student assignments"
        )

        // Convert the results to proper format
        const formattedAssignments = assignments.map(assignment => {
            let submissionStatus: 'not_submitted' | 'submitted' | 'late_submitted' = 'not_submitted'

            if (assignment.submissionId) {
                const dueDate = new Date(assignment.dueDate)
                const submittedDate = new Date(assignment.submittedAt)
                submissionStatus = submittedDate > dueDate ? 'late_submitted' : 'submitted'
            }

            return {
                id: assignment.id,
                title: assignment.title,
                courseCode: assignment.courseCode,
                courseName: assignment.courseName,
                description: assignment.description,
                dueDate: assignment.dueDate,
                maxMarks: assignment.maxMarks,
                submissionStatus,
                submittedFile: assignment.submittedFileUrl ? assignment.submittedFileUrl.split('/').pop() : undefined,
                submittedAt: assignment.submittedAt,
                grade: assignment.grade,
                feedback: assignment.feedback,
                fileUrl: assignment.fileUrl,
                createdAt: assignment.createdAt
            }
        })

        return NextResponse.json({
            success: true,
            assignments: formattedAssignments,
        })
    } catch (error) {
        console.error("Student assignments error:", error)
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

        if (user.role !== "student") {
            return NextResponse.json({ success: false, message: "Access denied. Student only." }, { status: 403 })
        }

        // Handle FormData for file uploads
        const formData = await request.formData()
        const assignmentId = formData.get("assignmentId") as string
        const file = formData.get("file") as File | null

        // Validate input
        if (!assignmentId) {
            return NextResponse.json(
                { success: false, message: "Assignment ID is required" },
                { status: 400 }
            )
        }

        if (!file || file.size === 0) {
            return NextResponse.json(
                { success: false, message: "File is required" },
                { status: 400 }
            )
        }

        // Validate file size
        const maxFileSize = 10 * 1024 * 1024 // 10MB
        if (file.size > maxFileSize) {
            return NextResponse.json(
                { success: false, message: "File size too large. Maximum 10MB allowed." },
                { status: 400 }
            )
        }

        // Verify the assignment exists and student is enrolled in the course
        const assignmentCheck = await safeQuery(
            () => sql`
        SELECT a.id, a.title, c.code, c.name 
        FROM assignments a
        JOIN courses c ON a.course_id = c.id
        JOIN enrollments e ON c.id = e.course_id
        WHERE a.id = ${assignmentId} AND e.student_id = ${user.id}
      `,
            "Failed to verify assignment access"
        )

        if (assignmentCheck.length === 0) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or you're not enrolled in this course" },
                { status: 404 }
            )
        }

        // Check if student has already submitted
        const existingSubmission = await safeQuery(
            () => sql`
        SELECT id FROM submissions 
        WHERE assignment_id = ${assignmentId} AND student_id = ${user.id}
      `,
            "Failed to check existing submission"
        )

        if (existingSubmission.length > 0) {
            return NextResponse.json(
                { success: false, message: "You have already submitted this assignment" },
                { status: 400 }
            )
        }

        // Handle file storage
        let fileUrl: string
        try {
            // Read file as buffer
            const fileBuffer = await file.arrayBuffer()
            const fileName = `submission_${Date.now()}_${user.id}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

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

        // Create the submission
        const newSubmission = await safeQuery(
            () => sql`
        INSERT INTO submissions (assignment_id, student_id, file_url, submitted_at)
        VALUES (${assignmentId}, ${user.id}, ${fileUrl}, NOW())
        RETURNING id, submitted_at as "submittedAt"
      `,
            "Failed to create submission"
        )

        return NextResponse.json({
            success: true,
            submission: {
                id: newSubmission[0].id,
                submittedAt: newSubmission[0].submittedAt,
                fileName: file.name,
                fileUrl: fileUrl
            },
            message: "Assignment submitted successfully"
        })
    } catch (error) {
        console.error("Submit assignment error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to submit assignment" },
            { status: 500 }
        )
    }
} 