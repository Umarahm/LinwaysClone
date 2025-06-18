import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { validateAdminAccess } from "@/lib/auth-server"

export async function POST(request: NextRequest) {
    try {
        const { user, error } = await validateAdminAccess(request)

        if (!user) {
            return NextResponse.json(
                { error: error || "Unauthorized - Admin access required" },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { student_ids, course_id } = body

        if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0 || !course_id) {
            return NextResponse.json(
                { error: "Student IDs array and Course ID are required" },
                { status: 400 }
            )
        }

        // Verify course exists
        const course = await sql`
            SELECT id, code, name FROM courses WHERE id = ${course_id}
        `

        if (course.length === 0) {
            return NextResponse.json(
                { error: "Course not found" },
                { status: 404 }
            )
        }

        let successful = 0;
        let failed = 0;
        const results = [];

        // Process each student enrollment
        for (const student_id of student_ids) {
            try {
                // Check if student exists
                const student = await sql`
                    SELECT id, full_name, email FROM users 
                    WHERE id = ${student_id} AND role = 'student'
                `

                if (student.length === 0) {
                    failed++;
                    results.push({
                        student_id,
                        error: "Student not found"
                    });
                    continue;
                }

                // Check if enrollment already exists
                const existingEnrollment = await sql`
                    SELECT id FROM enrollments 
                    WHERE student_id = ${student_id} AND course_id = ${course_id}
                `

                if (existingEnrollment.length > 0) {
                    failed++;
                    results.push({
                        student_id,
                        student_name: student[0].full_name,
                        error: "Already enrolled in this course"
                    });
                    continue;
                }

                // Create new enrollment
                await sql`
                    INSERT INTO enrollments (student_id, course_id, enrolled_at)
                    VALUES (${student_id}, ${course_id}, NOW())
                `

                successful++;
                results.push({
                    student_id,
                    student_name: student[0].full_name,
                    success: true
                });

            } catch (studentError) {
                failed++;
                results.push({
                    student_id,
                    error: "Failed to enroll student"
                });
            }
        }

        return NextResponse.json({
            message: `Bulk enrollment completed: ${successful} successful, ${failed} failed`,
            successful,
            failed,
            course: {
                id: course[0].id,
                code: course[0].code,
                name: course[0].name
            },
            results
        })

    } catch (error) {
        console.error("Error in bulk enrollment:", error)
        return NextResponse.json(
            { error: "Failed to process bulk enrollment" },
            { status: 500 }
        )
    }
} 