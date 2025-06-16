"use server"

import { sql } from "./db"
import { getCurrentUser } from "./auth-actions"

export async function getStudentAttendance() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") {
    throw new Error("Unauthorized")
  }

  // Get detailed attendance records
  const attendanceRecords = await sql`
    SELECT 
      a.id,
      a.date,
      c.name as course_name,
      c.code as course_code,
      a.status
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE a.student_id = ${user.id}
    ORDER BY a.date DESC
  `

  // Get attendance summary by course
  const attendanceSummary = await sql`
    SELECT 
      c.code as course_code,
      c.name as course_name,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(a.id) as total_count,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id))::numeric, 
        0
      ) as percentage
    FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN attendance a ON c.id = a.course_id AND a.student_id = e.student_id
    WHERE e.student_id = ${user.id}
    GROUP BY c.id, c.code, c.name
    ORDER BY c.code
  `

  return {
    attendanceRecords: attendanceRecords.map((record) => ({
      ...record,
      percentage: Number.parseInt(record.percentage) || 0,
    })),
    attendanceSummary: attendanceSummary.map((summary) => ({
      ...summary,
      present_count: Number.parseInt(summary.present_count) || 0,
      total_count: Number.parseInt(summary.total_count) || 0,
      percentage: Number.parseInt(summary.percentage) || 0,
    })),
  }
}

export async function getFacultyCourses() {
  const user = await getCurrentUser()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  const courses = await sql`
    SELECT id, code, name
    FROM courses
    WHERE faculty_id = ${user.id}
    ORDER BY code
  `

  return courses
}

export async function getCourseStudents(courseId: number) {
  const user = await getCurrentUser()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  const students = await sql`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      a.status as attendance_status
    FROM users u
    JOIN enrollments e ON u.id = e.student_id
    LEFT JOIN attendance a ON u.id = a.student_id 
      AND a.course_id = ${courseId} 
      AND a.date = CURRENT_DATE
    WHERE e.course_id = ${courseId} AND u.role = 'student'
    ORDER BY u.full_name
  `

  return students
}

export async function markAttendance(formData: FormData) {
  const user = await getCurrentUser()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  const courseId = Number.parseInt(formData.get("courseId") as string)
  const date = formData.get("date") as string
  const attendanceData = JSON.parse(formData.get("attendanceData") as string)

  try {
    // Delete existing attendance for this date and course
    await sql`
      DELETE FROM attendance 
      WHERE course_id = ${courseId} AND date = ${date}
    `

    // Insert new attendance records
    for (const record of attendanceData) {
      await sql`
        INSERT INTO attendance (student_id, course_id, date, status, marked_by)
        VALUES (${record.studentId}, ${courseId}, ${date}, ${record.status}, ${user.id})
      `
    }

    return { success: true, message: "Attendance marked successfully" }
  } catch (error) {
    return { success: false, message: "Failed to mark attendance" }
  }
}
