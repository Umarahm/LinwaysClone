import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getCurrentUserServer } from "@/lib/auth-server"

export async function GET() {
  try {
    const user = await getCurrentUserServer()
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized - Student access required" },
        { status: 401 }
      )
    }

    // Get enrolled courses for the student
    const enrolledCourses = await sql`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.credits,
        c.description,
        f.full_name as faculty_name,
        e.enrolled_at,
        COUNT(DISTINCT a.id) as assignment_count,
        COUNT(DISTINCT att.id) as attendance_count
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN users f ON c.faculty_id = f.id
      LEFT JOIN assignments a ON c.id = a.course_id
      LEFT JOIN attendance att ON c.id = att.course_id AND att.student_id = ${user.id}
      WHERE e.student_id = ${user.id}
      GROUP BY c.id, c.code, c.name, c.credits, c.description, f.full_name, e.enrolled_at
      ORDER BY c.code
    `

    // Get available courses (not enrolled in)
    const availableCourses = await sql`
      SELECT 
        c.id,
        c.code,
        c.name,
        c.credits,
        c.description,
        f.full_name as faculty_name,
        COUNT(DISTINCT e.id) as enrolled_count
      FROM courses c
      LEFT JOIN users f ON c.faculty_id = f.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      WHERE c.id NOT IN (
        SELECT course_id 
        FROM enrollments 
        WHERE student_id = ${user.id}
      )
      GROUP BY c.id, c.code, c.name, c.credits, c.description, f.full_name
      ORDER BY c.code
    `

    // Get student's GPA (placeholder - you can implement actual GPA calculation)
    const gradeData = await sql`
      SELECT 
        AVG(s.grade) as avg_grade,
        COUNT(s.id) as graded_assignments
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = ${user.id} AND s.grade IS NOT NULL
    `

    const gpa = gradeData[0]?.avg_grade ?
      (Number(gradeData[0].avg_grade) / 25).toFixed(2) : // Converting 100-point scale to 4.0 scale
      "0.0"

    return NextResponse.json({
      enrolled_courses: enrolledCourses.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        faculty_name: course.faculty_name || 'Not Assigned',
        description: course.description,
        enrolled_at: course.enrolled_at,
        assignment_count: Number(course.assignment_count),
        attendance_count: Number(course.attendance_count)
      })),
      available_courses: availableCourses.map(course => ({
        id: course.id,
        code: course.code,
        name: course.name,
        credits: course.credits,
        faculty_name: course.faculty_name || 'Not Assigned',
        description: course.description,
        enrolled_count: Number(course.enrolled_count)
      })),
      student_stats: {
        gpa: gpa,
        enrolled_count: enrolledCourses.length,
        available_count: availableCourses.length,
        graded_assignments: Number(gradeData[0]?.graded_assignments) || 0
      }
    })
  } catch (error) {
    console.error("Error fetching student enrollment data:", error)
    return NextResponse.json(
      { error: "Failed to fetch enrollment data" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserServer()
    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Unauthorized - Student access required" },
        { status: 401 }
      )
    }

    const { course_id } = await request.json()

    if (!course_id) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      )
    }

    // Check if course exists
    const course = await sql`
      SELECT id, code, name FROM courses WHERE id = ${course_id}
    `

    if (course.length === 0) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    // Check if student is already enrolled
    const existingEnrollment = await sql`
      SELECT id FROM enrollments 
      WHERE student_id = ${user.id} AND course_id = ${course_id}
    `

    if (existingEnrollment.length > 0) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 }
      )
    }

    // Create enrollment
    await sql`
      INSERT INTO enrollments (student_id, course_id, enrolled_at)
      VALUES (${user.id}, ${course_id}, NOW())
    `

    return NextResponse.json({
      message: `Successfully enrolled in ${course[0].code} - ${course[0].name}`,
      course: {
        id: course[0].id,
        code: course[0].code,
        name: course[0].name
      }
    })
  } catch (error) {
    console.error("Error enrolling student:", error)
    return NextResponse.json(
      { error: "Failed to enroll in course" },
      { status: 500 }
    )
  }
} 