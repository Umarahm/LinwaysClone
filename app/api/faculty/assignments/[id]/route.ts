import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export async function PUT(
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
        const assignmentId = parseInt(resolvedParams.id)

        if (isNaN(assignmentId)) {
            return NextResponse.json(
                { success: false, message: "Invalid assignment ID" },
                { status: 400 }
            )
        }

        // Verify the assignment belongs to this faculty
        const assignmentCheck = await safeQuery(
            () => sql`
        SELECT id FROM assignments 
        WHERE id = ${assignmentId} AND faculty_id = ${user.id}
      `,
            "Failed to verify assignment ownership"
        )

        if (assignmentCheck.length === 0) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or not assigned to you" },
                { status: 404 }
            )
        }

        // Parse form data
        const formData = await request.formData()
        const title = formData.get('title') as string
        const courseId = formData.get('courseId') as string
        const description = formData.get('description') as string
        const dueDate = formData.get('dueDate') as string
        const maxMarks = parseInt(formData.get('maxMarks') as string)
        const file = formData.get('file') as File | null

        // Validate required fields
        if (!title || !courseId || !description || !dueDate || isNaN(maxMarks)) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            )
        }

        // Verify the course belongs to this faculty
        const courseCheck = await safeQuery(
            () => sql`
        SELECT id FROM course_faculty 
        WHERE course_id = ${parseInt(courseId)} AND faculty_id = ${user.id}
      `,
            "Failed to verify course access"
        )

        if (courseCheck.length === 0) {
            return NextResponse.json(
                { success: false, message: "You don't have access to this course" },
                { status: 403 }
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

        // Update the assignment
        const updatedAssignment = await safeQuery(
            () => sql`
        UPDATE assignments 
        SET title = ${title}, course_id = ${parseInt(courseId)}, description = ${description}, 
            due_date = ${dueDate}, max_marks = ${maxMarks}
            ${fileUrl ? sql`, file_url = ${fileUrl}` : sql``}
        WHERE id = ${assignmentId}
        RETURNING id, title, description, due_date as "dueDate", max_marks as "maxMarks", file_url as "fileUrl"
      `,
            "Failed to update assignment"
        )

        return NextResponse.json({
            success: true,
            assignment: updatedAssignment[0],
            message: "Assignment updated successfully"
        })
    } catch (error) {
        console.error("Update assignment error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to update assignment" },
            { status: 500 }
        )
    }
}

export async function DELETE(
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
        const assignmentId = parseInt(resolvedParams.id)

        if (isNaN(assignmentId)) {
            return NextResponse.json(
                { success: false, message: "Invalid assignment ID" },
                { status: 400 }
            )
        }

        // Verify the assignment belongs to this faculty
        const assignmentCheck = await safeQuery(
            () => sql`
        SELECT id FROM assignments 
        WHERE id = ${assignmentId} AND faculty_id = ${user.id}
      `,
            "Failed to verify assignment ownership"
        )

        if (assignmentCheck.length === 0) {
            return NextResponse.json(
                { success: false, message: "Assignment not found or not assigned to you" },
                { status: 404 }
            )
        }

        // Delete related submissions first (cascade delete)
        await safeQuery(
            () => sql`
        DELETE FROM submissions WHERE assignment_id = ${assignmentId}
      `,
            "Failed to delete assignment submissions"
        )

        // Delete the assignment
        await safeQuery(
            () => sql`
        DELETE FROM assignments WHERE id = ${assignmentId}
      `,
            "Failed to delete assignment"
        )

        return NextResponse.json({
            success: true,
            message: "Assignment deleted successfully"
        })
    } catch (error) {
        console.error("Delete assignment error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to delete assignment" },
            { status: 500 }
        )
    }
} 