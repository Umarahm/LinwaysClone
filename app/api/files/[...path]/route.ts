import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
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
        const fileName = resolvedParams.path.join('/')

        // Get file from database
        const fileRecord = await safeQuery(
            () => sql`
            SELECT f.filename, f.original_name, f.mime_type, f.file_size, f.file_data, f.created_by
            FROM files f
            WHERE f.filename = ${fileName}
            LIMIT 1
            `,
            "Failed to fetch file"
        )

        if (fileRecord.length === 0) {
            return NextResponse.json({ success: false, message: "File not found" }, { status: 404 })
        }

        const file = fileRecord[0]

        // Determine file type and verify access permissions
        const isAssignmentFile = fileName.startsWith('assignment_')
        const isSubmissionFile = fileName.startsWith('submission_')

        if (!isAssignmentFile && !isSubmissionFile) {
            return NextResponse.json({ success: false, message: "Invalid file type" }, { status: 400 })
        }

        // For assignment files - check if user is enrolled in the course or is faculty
        if (isAssignmentFile) {
            const assignmentCheck = await safeQuery(
                () => sql`
                SELECT a.id, a.title, c.code, c.name
                FROM assignments a
                JOIN courses c ON a.course_id = c.id
                LEFT JOIN enrollments e ON c.id = e.course_id
                LEFT JOIN course_faculty cf ON c.id = cf.course_id
                WHERE a.file_url = ${fileName} 
                AND (
                    (e.student_id = ${user.id} AND ${user.role} = 'student') OR
                    (cf.faculty_id = ${user.id} AND ${user.role} = 'faculty') OR
                    ${user.role} = 'admin'
                )
                LIMIT 1
                `,
                "Failed to verify file access"
            )

            if (assignmentCheck.length === 0) {
                return NextResponse.json({ success: false, message: "File not found or access denied" }, { status: 404 })
            }
        }

        // For submission files - check if user owns the submission or is faculty/admin
        if (isSubmissionFile) {
            const submissionCheck = await safeQuery(
                () => sql`
                SELECT s.id, a.title, c.code, c.name
                FROM submissions s
                JOIN assignments a ON s.assignment_id = a.id
                JOIN courses c ON a.course_id = c.id
                LEFT JOIN course_faculty cf ON c.id = cf.course_id
                WHERE s.file_url = ${fileName}
                AND (
                    (s.student_id = ${user.id} AND ${user.role} = 'student') OR
                    (cf.faculty_id = ${user.id} AND ${user.role} = 'faculty') OR
                    ${user.role} = 'admin'
                )
                LIMIT 1
                `,
                "Failed to verify submission access"
            )

            if (submissionCheck.length === 0) {
                return NextResponse.json({ success: false, message: "File not found or access denied" }, { status: 404 })
            }
        }

        // Convert BYTEA to Buffer and create response
        const fileBuffer = Buffer.from(file.file_data)

        // Create response with proper headers for file download
        const response = new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': file.mime_type || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${file.original_name}"`,
                'Content-Length': file.file_size.toString(),
                'Cache-Control': 'private, no-cache',
            },
        })

        return response

    } catch (error) {
        console.error("File download error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to download file" },
            { status: 500 }
        )
    }
} 