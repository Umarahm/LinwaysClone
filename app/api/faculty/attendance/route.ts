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

        // Fetch attendance for the specific date and course
        const attendance = await safeQuery(
            () => sql`
        SELECT 
          a.student_id,
          a.status,
          u.full_name,
          u.email
        FROM attendance a
        JOIN users u ON a.student_id = u.id
        WHERE a.course_id = ${courseId} 
        AND a.date = ${date}
        ORDER BY u.full_name
      `,
            "Failed to fetch attendance"
        )

        return NextResponse.json({
            success: true,
            attendance: attendance,
        })
    } catch (error) {
        console.error("Faculty attendance fetch error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch attendance" },
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

        const { courseId, date, attendance } = await request.json()

        // Validate input
        if (!courseId || !date || !Array.isArray(attendance)) {
            return NextResponse.json(
                { success: false, message: "Course ID, date, and attendance array are required" },
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

        // Delete existing attendance for this date and course (if any)
        await safeQuery(
            () => sql`
        DELETE FROM attendance 
        WHERE course_id = ${courseId} AND date = ${date}
      `,
            "Failed to clear existing attendance"
        )

        // Insert new attendance records
        if (attendance.length > 0) {
            const attendanceValues = attendance.map((record: any) =>
                `(${record.studentId}, ${courseId}, '${date}', '${record.status}', ${user.id})`
            ).join(', ')

            await safeQuery(
                () => sql`
          INSERT INTO attendance (student_id, course_id, date, status, marked_by)
          VALUES ${sql.unsafe(attendanceValues)}
        `,
                "Failed to insert attendance records"
            )
        }

        return NextResponse.json({
            success: true,
            message: "Attendance marked successfully"
        })
    } catch (error) {
        console.error("Mark attendance error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to mark attendance" },
            { status: 500 }
        )
    }
} 