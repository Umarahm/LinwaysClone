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
        const { enrollments } = body

        if (!enrollments || !Array.isArray(enrollments) || enrollments.length === 0) {
            return NextResponse.json(
                { error: "Enrollments array is required" },
                { status: 400 }
            )
        }

        let successful = 0;
        let failed = 0;
        const results = [];

        // Process each enrollment
        for (let i = 0; i < enrollments.length; i++) {
            const enrollment = enrollments[i];
            const rowNumber = i + 1;

            try {
                // Extract and validate required fields
                const studentEmail = enrollment['Student Email']?.toString().trim();
                const courseCode = enrollment['Course Code']?.toString().trim();

                if (!studentEmail || !courseCode) {
                    failed++;
                    results.push({
                        row: rowNumber,
                        studentEmail,
                        courseCode,
                        error: "Missing required fields (Student Email or Course Code)"
                    });
                    continue;
                }

                // Find student by email
                const student = await sql`
                    SELECT id, full_name, email FROM users 
                    WHERE email = ${studentEmail} AND role = 'student'
                `

                if (student.length === 0) {
                    failed++;
                    results.push({
                        row: rowNumber,
                        studentEmail,
                        courseCode,
                        error: "Student not found with this email"
                    });
                    continue;
                }

                // Find course by code
                const course = await sql`
                    SELECT id, code, name FROM courses 
                    WHERE code = ${courseCode}
                `

                if (course.length === 0) {
                    failed++;
                    results.push({
                        row: rowNumber,
                        studentEmail,
                        courseCode,
                        error: "Course not found with this code"
                    });
                    continue;
                }

                // Check if enrollment already exists
                const existingEnrollment = await sql`
                    SELECT id FROM enrollments 
                    WHERE student_id = ${student[0].id} AND course_id = ${course[0].id}
                `

                if (existingEnrollment.length > 0) {
                    failed++;
                    results.push({
                        row: rowNumber,
                        studentEmail,
                        courseCode,
                        studentName: student[0].full_name,
                        courseName: course[0].name,
                        error: "Student already enrolled in this course"
                    });
                    continue;
                }

                // Create new enrollment
                await sql`
                    INSERT INTO enrollments (student_id, course_id, enrolled_at)
                    VALUES (${student[0].id}, ${course[0].id}, NOW())
                `

                successful++;
                results.push({
                    row: rowNumber,
                    studentEmail,
                    courseCode,
                    studentName: student[0].full_name,
                    courseName: course[0].name,
                    success: true
                });

            } catch (enrollmentError) {
                console.error(`Error processing enrollment row ${rowNumber}:`, enrollmentError);
                failed++;
                results.push({
                    row: rowNumber,
                    studentEmail: enrollment['Student Email'],
                    courseCode: enrollment['Course Code'],
                    error: "Failed to process enrollment"
                });
            }
        }

        return NextResponse.json({
            message: `Import completed: ${successful} successful, ${failed} failed`,
            successful,
            failed,
            total: enrollments.length,
            results
        })

    } catch (error) {
        console.error("Error in enrollment import:", error)
        return NextResponse.json(
            { error: "Failed to process enrollment import" },
            { status: 500 }
        )
    }
} 