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

        // Fetch courses assigned to this faculty using the new course_faculty relationship
        const courses = await safeQuery(
            () => sql`
        SELECT 
          c.id,
          c.code,
          c.name,
          c.description,
          c.credits,
          c.created_at,
          cf.is_primary,
          cf.assigned_at,
          STRING_AGG(u.full_name, ', ') as all_faculty_names
        FROM course_faculty cf
        JOIN courses c ON cf.course_id = c.id
        LEFT JOIN course_faculty cf2 ON c.id = cf2.course_id
        LEFT JOIN users u ON cf2.faculty_id = u.id AND u.role = 'faculty'
        WHERE cf.faculty_id = ${user.id}
        GROUP BY c.id, c.code, c.name, c.description, c.credits, c.created_at, cf.is_primary, cf.assigned_at
        ORDER BY c.code
      `,
            "Failed to fetch faculty courses"
        )

        return NextResponse.json({
            success: true,
            courses: courses,
        })
    } catch (error) {
        console.error("Faculty courses error:", error)
        return NextResponse.json(
            { success: false, message: "Failed to fetch courses" },
            { status: 500 }
        )
    }
} 