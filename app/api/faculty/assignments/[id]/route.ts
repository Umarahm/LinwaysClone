import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { cookies } from "next/headers"

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
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

        const assignmentId = parseInt(params.id)

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