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

        const { searchParams } = new URL(request.url)
        const courseId = searchParams.get("courseId")
        const date = searchParams.get("date")

        if (!courseId || !date) {
            return NextResponse.json(
                { success: false, message: "Course ID and date are required" },
                { status: 400 }
            )
        }

        // Check if attendance exists for this course and date
        const attendanceCheck = await safeQuery(
            () => sql`
        SELECT COUNT(*) as count
        FROM attendance 
        WHERE course_id = ${courseId} AND date = ${date}
      `,
            "Failed to check attendance"
        )

        const alreadyMarked = parseInt(attendanceCheck[0]?.count || 0) > 0

        return NextResponse.json({
            success: true,
            alreadyMarked: alreadyMarked,
        })
    } catch (error) {
        console.error("Attendance check error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to check attendance" },
            { status: 500 }
        )
    }
} 