import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUserFromRequest } from "@/lib/auth-server"

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUserFromRequest(request)
        if (!user || user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }

        const resolvedParams = await params
        const enrollmentId = parseInt(resolvedParams.id)

        if (isNaN(enrollmentId)) {
            return NextResponse.json(
                { error: "Invalid enrollment ID" },
                { status: 400 }
            )
        }

        // Check if enrollment exists and get details
        const enrollment = await sql`
      SELECT 
        e.id,
        u.full_name as student_name,
        c.code as course_code,
        c.name as course_name
      FROM enrollments e
      JOIN users u ON e.student_id = u.id
      JOIN courses c ON e.course_id = c.id
      WHERE e.id = ${enrollmentId}
    `

        if (enrollment.length === 0) {
            return NextResponse.json(
                { error: "Enrollment not found" },
                { status: 404 }
            )
        }

        // Delete related attendance records first (due to foreign key constraints)
        await sql`
      DELETE FROM attendance 
      WHERE student_id = (SELECT student_id FROM enrollments WHERE id = ${enrollmentId})
        AND course_id = (SELECT course_id FROM enrollments WHERE id = ${enrollmentId})
    `

        // Delete related assignment submissions
        await sql`
      DELETE FROM submissions 
      WHERE student_id = (SELECT student_id FROM enrollments WHERE id = ${enrollmentId})
        AND assignment_id IN (
          SELECT a.id FROM assignments a 
          WHERE a.course_id = (SELECT course_id FROM enrollments WHERE id = ${enrollmentId})
        )
    `

        // Delete the enrollment
        await sql`DELETE FROM enrollments WHERE id = ${enrollmentId}`

        return NextResponse.json({
            message: `Successfully unenrolled ${enrollment[0].student_name} from ${enrollment[0].course_code} - ${enrollment[0].course_name}`,
            deleted_enrollment: {
                student_name: enrollment[0].student_name,
                course_code: enrollment[0].course_code,
                course_name: enrollment[0].course_name
            }
        })
    } catch (error) {
        console.error("Error deleting enrollment:", error)
        return NextResponse.json(
            { error: "Failed to delete enrollment" },
            { status: 500 }
        )
    }
} 