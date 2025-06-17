"use server"

import { sql } from "./db"
import { getCurrentUserServer } from "./auth-server"
import { revalidatePath } from "next/cache"

// Enhanced student attendance with analytics
export async function getStudentAttendance(userId?: number) {
  const user = await getCurrentUserServer()
  if (!user || (user.role !== "student" && !userId)) {
    throw new Error("Unauthorized")
  }

  const targetUserId = userId || user.id

  // Get detailed attendance records with faculty information
  const attendanceRecords = await sql`
    SELECT 
      a.id,
      a.date,
      c.name as course_name,
      c.code as course_code,
      a.status,
      u.full_name as marked_by_name,
      t.start_time,
      t.end_time,
      t.room
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    LEFT JOIN users u ON a.marked_by = u.id
    LEFT JOIN timetable t ON a.course_id = t.course_id 
      AND t.day = to_char(a.date, 'Day')
    WHERE a.student_id = ${targetUserId}
    ORDER BY a.date DESC
    LIMIT 50
  `

  // Get attendance summary by course with analytics
  const attendanceSummary = await sql`
    SELECT 
      c.code as course_code,
      c.name as course_name,
      c.id as course_id,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
      COUNT(a.id) as total_count,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0))::numeric, 
        2
      ) as percentage,
      MIN(a.date) as first_class_date,
      MAX(a.date) as last_class_date
    FROM courses c
    JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN attendance a ON c.id = a.course_id AND a.student_id = e.student_id
    WHERE e.student_id = ${targetUserId}
    GROUP BY c.id, c.code, c.name
    ORDER BY c.code
  `

  // Get weekly attendance trends
  const weeklyTrends = await sql`
    SELECT 
      DATE_TRUNC('week', a.date) as week_start,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(a.id) as total_count,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0))::numeric, 
        2
      ) as weekly_percentage
    FROM attendance a
    JOIN enrollments e ON a.course_id = e.course_id
    WHERE e.student_id = ${targetUserId}
      AND a.date >= CURRENT_DATE - INTERVAL '12 weeks'
    GROUP BY DATE_TRUNC('week', a.date)
    ORDER BY week_start DESC
  `

  // Get monthly analytics
  const monthlyStats = await sql`
    SELECT 
      DATE_TRUNC('month', a.date) as month_start,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
      COUNT(a.id) as total_count
    FROM attendance a
    JOIN enrollments e ON a.course_id = e.course_id
    WHERE e.student_id = ${targetUserId}
      AND a.date >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY DATE_TRUNC('month', a.date)
    ORDER BY month_start DESC
  `

  return {
    attendanceRecords: attendanceRecords.map((record) => ({
      ...record,
      percentage: Number(record.percentage) || 0,
    })),
    attendanceSummary: attendanceSummary.map((summary) => ({
      ...summary,
      present_count: Number(summary.present_count) || 0,
      absent_count: Number(summary.absent_count) || 0,
      total_count: Number(summary.total_count) || 0,
      percentage: Number(summary.percentage) || 0,
    })),
    weeklyTrends: weeklyTrends.map((trend) => ({
      ...trend,
      present_count: Number(trend.present_count) || 0,
      total_count: Number(trend.total_count) || 0,
      weekly_percentage: Number(trend.weekly_percentage) || 0,
    })),
    monthlyStats: monthlyStats.map((stat) => ({
      ...stat,
      present_count: Number(stat.present_count) || 0,
      absent_count: Number(stat.absent_count) || 0,
      total_count: Number(stat.total_count) || 0,
    }))
  }
}

// Enhanced faculty course fetching
export async function getFacultyCourses() {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  const courses = await sql`
    SELECT 
      c.id, 
      c.code, 
      c.name,
      c.credits,
      c.description,
      COUNT(e.student_id) as enrolled_students,
      COUNT(DISTINCT a.date) as classes_held,
      ROUND(AVG(
        CASE WHEN a.status = 'present' THEN 100.0 ELSE 0.0 END
      )::numeric, 2) as average_attendance
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN attendance a ON c.id = a.course_id
    WHERE c.faculty_id = ${user.id}
    GROUP BY c.id, c.code, c.name, c.credits, c.description
    ORDER BY c.code
  `

  return courses.map(course => ({
    ...course,
    enrolled_students: Number(course.enrolled_students) || 0,
    classes_held: Number(course.classes_held) || 0,
    average_attendance: Number(course.average_attendance) || 0
  }))
}

// Enhanced student fetching for attendance marking
export async function getCourseStudents(courseId: number, date?: string, timetableId?: number) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  try {
    const targetDate = date || new Date().toISOString().split('T')[0]

    // First, get all students enrolled in the course
    const enrolledStudents = await sql`
      SELECT 
        u.id,
        u.full_name,
        u.email,
        CONCAT('STU', LPAD(u.id::text, 4, '0')) as roll_number
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.course_id = ${courseId} AND u.role = 'student'
      ORDER BY u.full_name
    `

    if (enrolledStudents.length === 0) {
      return []
    }

    // Get attendance for the specific date and timetable entry
    const attendanceForDate = await sql`
      SELECT 
        student_id,
        status,
        id as attendance_id
      FROM attendance
      WHERE course_id = ${courseId} AND date = ${targetDate}
      ${timetableId ? sql`AND timetable_id = ${timetableId}` : sql``}
    `

    // Get overall attendance statistics for each student
    const attendanceStats = await sql`
      SELECT 
        student_id,
        COUNT(*) as total_attendance_count,
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count
      FROM attendance
      WHERE course_id = ${courseId}
      GROUP BY student_id
    `

    // Combine the data
    const students = enrolledStudents.map(student => {
      const todayAttendance = attendanceForDate.find(a => a.student_id === student.id)
      const stats = attendanceStats.find(s => s.student_id === student.id)

      const totalCount = Number(stats?.total_attendance_count) || 0
      const presentCount = Number(stats?.present_count) || 0

      return {
        ...student,
        attendance_status: todayAttendance?.status || null,
        attendance_id: todayAttendance?.attendance_id || null,
        total_attendance_count: totalCount,
        present_count: presentCount,
        attendance_percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0
      }
    })

    return students
  } catch (error) {
    console.error('Error in getCourseStudents:', error)
    throw new Error('Failed to fetch course students')
  }
}

// Enhanced attendance marking with real-time updates
export async function markAttendance(formData: FormData) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  const courseId = Number.parseInt(formData.get("courseId") as string)
  const timetableId = Number.parseInt(formData.get("timetableId") as string)
  const date = formData.get("date") as string
  const attendanceData = JSON.parse(formData.get("attendanceData") as string)

  try {
    // Verify faculty has permission for this specific timetable entry
    const timetableCheck = await sql`
      SELECT t.id, t.course_id, t.day, t.start_time, t.end_time
      FROM timetable t
      WHERE t.id = ${timetableId} AND t.faculty_id = ${user.id} AND t.course_id = ${courseId}
    `

    if (timetableCheck.length === 0) {
      return { success: false, message: "Timetable entry not found or not assigned to you" }
    }

    // Delete existing attendance for this specific timetable entry, date
    await sql`
      DELETE FROM attendance 
      WHERE course_id = ${courseId} AND date = ${date} AND timetable_id = ${timetableId}
    `

    // Insert new attendance records with timetable_id
    const insertPromises = attendanceData.map((record: any) =>
      sql`
        INSERT INTO attendance (student_id, course_id, date, status, marked_by, timetable_id)
        VALUES (${record.studentId}, ${courseId}, ${date}, ${record.status}, ${user.id}, ${timetableId})
      `
    )

    await Promise.all(insertPromises)

    // Revalidate relevant paths for immediate updates
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/student')
    revalidatePath('/dashboard/faculty')

    return {
      success: true,
      message: `Attendance marked successfully for ${attendanceData.length} students`,
      markedCount: attendanceData.length,
      date: date
    }
  } catch (error) {
    console.error('Error marking attendance:', error)
    return { success: false, message: "Failed to mark attendance" }
  }
}

// Check if attendance is already marked for a specific date and timetable entry
export async function checkAttendanceStatus(courseId: number, date: string, timetableId?: number) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  let whereClause = `a.course_id = ${courseId} AND a.date = ${date}`
  if (timetableId) {
    whereClause += ` AND a.timetable_id = ${timetableId}`
  }

  const existingAttendance = await sql`
    SELECT 
      COUNT(*) as student_count,
      COUNT(CASE WHEN status = 'present' THEN 1 END) as present_count,
      MIN(marked_by) as marked_by_id,
      u.full_name as marked_by_name
    FROM attendance a
    LEFT JOIN users u ON a.marked_by = u.id
    WHERE a.course_id = ${courseId} 
      AND a.date = ${date}
      ${timetableId ? sql`AND a.timetable_id = ${timetableId}` : sql``}
    GROUP BY u.full_name
  `

  if (existingAttendance.length > 0 && Number(existingAttendance[0].student_count) > 0) {
    return {
      isMarked: true,
      studentCount: Number(existingAttendance[0].student_count),
      presentCount: Number(existingAttendance[0].present_count),
      markedBy: existingAttendance[0].marked_by_name
    }
  }

  return { isMarked: false }
}

// Get attendance status for student timetable entries
export async function getStudentTimetableAttendance(studentId?: number, date?: string) {
  const user = await getCurrentUserServer()
  if (!user || (user.role !== "student" && !studentId)) {
    throw new Error("Unauthorized")
  }

  const targetStudentId = studentId || user.id
  const targetDate = date || new Date().toISOString().split('T')[0]

  try {
    // Get attendance records for the student on the specified date
    const attendanceRecords = await sql`
      SELECT 
        a.course_id,
        a.timetable_id,
        a.status,
        t.start_time,
        t.end_time,
        t.day,
        c.code as course_code,
        c.name as course_name
      FROM attendance a
      JOIN timetable t ON a.timetable_id = t.id
      JOIN courses c ON a.course_id = c.id
      WHERE a.student_id = ${targetStudentId} 
        AND a.date = ${targetDate}
    `

    // Create a map of timetable_id -> attendance status
    const attendanceMap: Record<number, 'present' | 'absent'> = {}
    attendanceRecords.forEach(record => {
      if (record.timetable_id) {
        attendanceMap[record.timetable_id] = record.status as 'present' | 'absent'
      }
    })

    return attendanceMap
  } catch (error) {
    console.error('Error getting student timetable attendance:', error)
    return {}
  }
}

// Get attendance analytics for faculty dashboard
export async function getFacultyAttendanceAnalytics() {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  // Overall course statistics
  const courseStats = await sql`
    SELECT 
      c.code,
      c.name,
      COUNT(DISTINCT e.student_id) as enrolled_students,
      COUNT(DISTINCT a.date) as classes_held,
      COUNT(a.id) as total_attendance_records,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as total_present,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0))::numeric, 
        2
      ) as overall_attendance_rate
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN attendance a ON c.id = a.course_id
    WHERE c.faculty_id = ${user.id}
    GROUP BY c.id, c.code, c.name
    ORDER BY c.code
  `

  // Recent attendance trends (last 4 weeks)
  const recentTrends = await sql`
    SELECT 
      DATE_TRUNC('week', a.date) as week_start,
      c.code as course_code,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
      COUNT(a.id) as total_count,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0))::numeric, 
        2
      ) as weekly_rate
    FROM attendance a
    JOIN courses c ON a.course_id = c.id
    WHERE c.faculty_id = ${user.id}
      AND a.date >= CURRENT_DATE - INTERVAL '4 weeks'
    GROUP BY DATE_TRUNC('week', a.date), c.id, c.code
    ORDER BY week_start DESC, c.code
  `

  // Low attendance alerts (students with < 75% attendance)
  const lowAttendanceAlerts = await sql`
    SELECT 
      u.full_name as student_name,
      u.email as student_email,
      c.code as course_code,
      c.name as course_name,
      COUNT(a.id) as total_classes,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_classes,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0))::numeric, 
        2
      ) as attendance_rate
    FROM users u
    JOIN enrollments e ON u.id = e.student_id
    JOIN courses c ON e.course_id = c.id
    LEFT JOIN attendance a ON u.id = a.student_id AND a.course_id = c.id
    WHERE c.faculty_id = ${user.id}
      AND u.role = 'student'
    GROUP BY u.id, u.full_name, u.email, c.id, c.code, c.name
    HAVING COUNT(a.id) > 0 
      AND (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(a.id)) < 75
    ORDER BY attendance_rate ASC, c.code
  `

  return {
    courseStats: courseStats.map(stat => ({
      ...stat,
      enrolled_students: Number(stat.enrolled_students) || 0,
      classes_held: Number(stat.classes_held) || 0,
      total_attendance_records: Number(stat.total_attendance_records) || 0,
      total_present: Number(stat.total_present) || 0,
      overall_attendance_rate: Number(stat.overall_attendance_rate) || 0
    })),
    recentTrends: recentTrends.map(trend => ({
      ...trend,
      present_count: Number(trend.present_count) || 0,
      total_count: Number(trend.total_count) || 0,
      weekly_rate: Number(trend.weekly_rate) || 0
    })),
    lowAttendanceAlerts: lowAttendanceAlerts.map(alert => ({
      ...alert,
      total_classes: Number(alert.total_classes) || 0,
      present_classes: Number(alert.present_classes) || 0,
      attendance_rate: Number(alert.attendance_rate) || 0
    }))
  }
}

// Get admin attendance overview
export async function getAdminAttendanceOverview() {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized")
  }

  // Overall system statistics
  const systemStats = await sql`
    SELECT 
      COUNT(DISTINCT c.id) as total_courses,
      COUNT(DISTINCT u.id) as total_students,
      COUNT(DISTINCT f.id) as total_faculty,
      COUNT(DISTINCT a.date) as total_class_days,
      COUNT(a.id) as total_attendance_records,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as total_present,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0))::numeric, 
        2
      ) as system_attendance_rate
    FROM courses c
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN users u ON e.student_id = u.id AND u.role = 'student'
    LEFT JOIN users f ON c.faculty_id = f.id AND f.role = 'faculty'
    LEFT JOIN attendance a ON c.id = a.course_id
  `

  // Department-wise statistics
  const departmentStats = await sql`
    SELECT 
      COALESCE(u.department, 'Unknown') as department,
      COUNT(DISTINCT c.id) as courses_count,
      COUNT(DISTINCT s.id) as students_count,
      COUNT(a.id) as total_records,
      COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_records,
      ROUND(
        (COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / NULLIF(COUNT(a.id), 0))::numeric, 
        2
      ) as department_attendance_rate
    FROM users u
    JOIN courses c ON u.id = c.faculty_id
    LEFT JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN users s ON e.student_id = s.id AND s.role = 'student'
    LEFT JOIN attendance a ON c.id = a.course_id
    WHERE u.role = 'faculty'
    GROUP BY u.department
    ORDER BY department_attendance_rate DESC
  `

  return {
    systemStats: {
      total_courses: Number(systemStats[0]?.total_courses) || 0,
      total_students: Number(systemStats[0]?.total_students) || 0,
      total_faculty: Number(systemStats[0]?.total_faculty) || 0,
      total_class_days: Number(systemStats[0]?.total_class_days) || 0,
      total_attendance_records: Number(systemStats[0]?.total_attendance_records) || 0,
      total_present: Number(systemStats[0]?.total_present) || 0,
      system_attendance_rate: Number(systemStats[0]?.system_attendance_rate) || 0
    },
    departmentStats: departmentStats.map(stat => ({
      ...stat,
      courses_count: Number(stat.courses_count) || 0,
      students_count: Number(stat.students_count) || 0,
      total_records: Number(stat.total_records) || 0,
      present_records: Number(stat.present_records) || 0,
      department_attendance_rate: Number(stat.department_attendance_rate) || 0
    }))
  }
}
