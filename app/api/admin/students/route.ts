import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateAdminAccess } from "@/lib/auth-server"

export async function GET(request: NextRequest) {
    try {
        console.log('Students API called');

        const { user, error } = await validateAdminAccess(request)
        console.log('Current user:', user?.role);

        if (!user) {
            console.log('Unauthorized access attempt:', error);
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }

        // Get all students
        console.log('Fetching students from database...');
        const students = await sql`
            SELECT 
                id,
                full_name,
                email,
                department,
                created_at
            FROM users 
            WHERE role = 'student'
            ORDER BY full_name
        `

        console.log(`Found ${students.length} students`);

        const result = {
            students: students.map(student => ({
                id: student.id,
                full_name: student.full_name,
                email: student.email,
                department: student.department,
                created_at: student.created_at
            }))
        };

        console.log('Returning students data:', result);
        return NextResponse.json(result)

    } catch (error) {
        console.error("Error fetching students:", error)
        return NextResponse.json(
            { error: "Failed to fetch students. Please check database connection." },
            { status: 500 }
        )
    }
} 