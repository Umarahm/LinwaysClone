"use server"

import { sql } from "./db"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

async function getCurrentUserServer() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")

  if (!userCookie) {
    return null
  }

  try {
    return JSON.parse(userCookie.value)
  } catch (error) {
    return null
  }
}

export interface TimetableEntry {
  id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  faculty_id: number;
  faculty_name: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  created_at: string;
}

export interface TimetableFormData {
  course_id: number;
  faculty_id: number;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
}

export async function getTimetableByUser(userId?: number, userRole?: string) {
  try {
    const user = await getCurrentUserServer()
    if (!user) {
      console.error('getTimetableByUser: No user found in cookies')
      throw new Error("Unauthorized")
    }

    // Use passed parameters or fallback to current user
    const targetUserId = userId || user.id
    const targetUserRole = userRole || user.role

    console.log('getTimetableByUser: targetUserId:', targetUserId, 'targetUserRole:', targetUserRole)
    console.log('getTimetableByUser: current user:', user)

    // If admin role, get all timetable entries
    if (targetUserRole === "admin") {
      console.log('getTimetableByUser: Executing admin query')
      const timetableEntries = await sql`
        SELECT 
          t.id,
          t.course_id,
          c.name as course_name,
          c.code as course_code,
          t.faculty_id,
          f.full_name as faculty_name,
          t.day,
          t.start_time,
          t.end_time,
          t.room,
          t.created_at
        FROM timetable t
        JOIN courses c ON t.course_id = c.id
        JOIN users f ON t.faculty_id = f.id
        ORDER BY 
          CASE t.day
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
          END,
          t.start_time
      `
      console.log('getTimetableByUser: Admin query result:', timetableEntries.length, 'entries')
      return timetableEntries
    }

    // If faculty, get their assigned timetable entries
    if (targetUserRole === "faculty") {
      console.log('getTimetableByUser: Executing faculty query for userId:', targetUserId)
      const timetableEntries = await sql`
        SELECT 
          t.id,
          t.course_id,
          c.name as course_name,
          c.code as course_code,
          t.faculty_id,
          f.full_name as faculty_name,
          t.day,
          t.start_time,
          t.end_time,
          t.room,
          t.created_at
        FROM timetable t
        JOIN courses c ON t.course_id = c.id
        JOIN users f ON t.faculty_id = f.id
        WHERE t.faculty_id = ${targetUserId}
        ORDER BY 
          CASE t.day
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
          END,
          t.start_time
      `
      console.log('getTimetableByUser: Faculty query result:', timetableEntries.length, 'entries')
      return timetableEntries
    }

    // If student, get timetable for enrolled courses
    if (targetUserRole === "student") {
      console.log('getTimetableByUser: Executing student query for userId:', targetUserId)
      const timetableEntries = await sql`
        SELECT 
          t.id,
          t.course_id,
          c.name as course_name,
          c.code as course_code,
          t.faculty_id,
          f.full_name as faculty_name,
          t.day,
          t.start_time,
          t.end_time,
          t.room,
          t.created_at
        FROM timetable t
        JOIN courses c ON t.course_id = c.id
        JOIN users f ON t.faculty_id = f.id
        JOIN enrollments e ON c.id = e.course_id
        WHERE e.student_id = ${targetUserId}
        ORDER BY 
          CASE t.day
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
          END,
          t.start_time
      `
      console.log('getTimetableByUser: Student query result:', timetableEntries.length, 'entries')
      return timetableEntries
    }

    console.error('getTimetableByUser: Invalid user role:', targetUserRole)
    throw new Error("Invalid user role")
  } catch (error) {
    console.error('getTimetableByUser: Caught error:', error)
    throw error
  }
}

export async function createTimetableSlot(data: TimetableFormData) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required")
  }

  try {
    // Check for time conflicts
    const conflictCheck = await sql`
      SELECT id FROM timetable 
      WHERE day = ${data.day} 
      AND room = ${data.room}
      AND (
        (start_time <= ${data.start_time} AND end_time > ${data.start_time})
        OR (start_time < ${data.end_time} AND end_time >= ${data.end_time})
        OR (start_time >= ${data.start_time} AND end_time <= ${data.end_time})
      )
    `

    if (conflictCheck.length > 0) {
      throw new Error("Time slot conflict: Room is already booked for this time")
    }

    // Check faculty availability
    const facultyConflict = await sql`
      SELECT id FROM timetable 
      WHERE day = ${data.day} 
      AND faculty_id = ${data.faculty_id}
      AND (
        (start_time <= ${data.start_time} AND end_time > ${data.start_time})
        OR (start_time < ${data.end_time} AND end_time >= ${data.end_time})
        OR (start_time >= ${data.start_time} AND end_time <= ${data.end_time})
      )
    `

    if (facultyConflict.length > 0) {
      throw new Error("Faculty conflict: Faculty is already assigned to another class at this time")
    }

    // Create the timetable entry
    const newEntry = await sql`
      INSERT INTO timetable (course_id, faculty_id, day, start_time, end_time, room)
      VALUES (${data.course_id}, ${data.faculty_id}, ${data.day}, ${data.start_time}, ${data.end_time}, ${data.room})
      RETURNING id
    `

    return { success: true, message: "Timetable slot created successfully", id: newEntry[0].id }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create timetable slot"
    }
  }
}

export async function updateTimetableSlot(id: number, data: TimetableFormData) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required")
  }

  try {
    // Check for time conflicts (excluding current entry)
    const conflictCheck = await sql`
      SELECT id FROM timetable 
      WHERE day = ${data.day} 
      AND room = ${data.room}
      AND id != ${id}
      AND (
        (start_time <= ${data.start_time} AND end_time > ${data.start_time})
        OR (start_time < ${data.end_time} AND end_time >= ${data.end_time})
        OR (start_time >= ${data.start_time} AND end_time <= ${data.end_time})
      )
    `

    if (conflictCheck.length > 0) {
      throw new Error("Time slot conflict: Room is already booked for this time")
    }

    // Check faculty availability (excluding current entry)
    const facultyConflict = await sql`
      SELECT id FROM timetable 
      WHERE day = ${data.day} 
      AND faculty_id = ${data.faculty_id}
      AND id != ${id}
      AND (
        (start_time <= ${data.start_time} AND end_time > ${data.start_time})
        OR (start_time < ${data.end_time} AND end_time >= ${data.end_time})
        OR (start_time >= ${data.start_time} AND end_time <= ${data.end_time})
      )
    `

    if (facultyConflict.length > 0) {
      throw new Error("Faculty conflict: Faculty is already assigned to another class at this time")
    }

    // Update the timetable entry
    await sql`
      UPDATE timetable 
      SET course_id = ${data.course_id}, 
          faculty_id = ${data.faculty_id}, 
          day = ${data.day}, 
          start_time = ${data.start_time}, 
          end_time = ${data.end_time}, 
          room = ${data.room}
      WHERE id = ${id}
    `

    return { success: true, message: "Timetable slot updated successfully" }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update timetable slot"
    }
  }
}

export async function deleteTimetableSlot(id: number) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required")
  }

  try {
    await sql`DELETE FROM timetable WHERE id = ${id}`
    return { success: true, message: "Timetable slot deleted successfully" }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete timetable slot"
    }
  }
}

export async function getCourses() {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required")
  }

  const courses = await sql`
    SELECT id, code, name
    FROM courses
    ORDER BY code
  `
  return courses
}

export async function getFaculty() {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required")
  }

  const faculty = await sql`
    SELECT id, full_name, department
    FROM users
    WHERE role = 'faculty'
    ORDER BY full_name
  `

  return faculty
}

export async function markTimetableAttendance(timetableId: number) {
  const user = await getCurrentUserServer()

  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized - Faculty access required")
  }

  try {
    // Get timetable entry details
    const timetableEntry = await sql`
      SELECT t.*, c.name as course_name, c.code as course_code
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      WHERE t.id = ${timetableId} AND t.faculty_id = ${user.id}
    `

    if (timetableEntry.length === 0) {
      return {
        success: false,
        message: "Timetable entry not found or not assigned to you"
      }
    }

    const entry = timetableEntry[0]
    const today = new Date().toISOString().split('T')[0]

    // Check if attendance is already marked for today
    const existingAttendance = await sql`
      SELECT COUNT(*) as count FROM attendance
      WHERE course_id = ${entry.course_id} 
      AND date = ${today}
      AND marked_by = ${user.id}
    `

    if (parseInt(existingAttendance[0].count) > 0) {
      return {
        success: false,
        message: "Attendance already marked for today"
      }
    }

    // Get all students enrolled in this course
    const enrolledStudents = await sql`
      SELECT u.id, u.full_name, u.email
      FROM users u
      JOIN enrollments e ON u.id = e.student_id
      WHERE e.course_id = ${entry.course_id} AND u.role = 'student'
      ORDER BY u.full_name
    `

    if (enrolledStudents.length === 0) {
      return {
        success: false,
        message: "No students enrolled in this course"
      }
    }

    // Mark all students as present by default (faculty can change later if needed)
    for (const student of enrolledStudents) {
      await sql`
        INSERT INTO attendance (student_id, course_id, date, status, marked_by)
        VALUES (${student.id}, ${entry.course_id}, ${today}, 'present', ${user.id})
      `
    }

    // Revalidate paths to update UI immediately
    revalidatePath('/dashboard/faculty')
    revalidatePath('/dashboard/faculty/timetable')
    revalidatePath('/dashboard')

    return {
      success: true,
      message: `Attendance marked for ${enrolledStudents.length} students in ${entry.course_name}`,
      studentsCount: enrolledStudents.length
    }
  } catch (error) {
    console.error('Error marking attendance:', error)
    return {
      success: false,
      message: "Failed to mark attendance"
    }
  }
}

export async function checkTimetableAttendance(timetableId: number) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized - Faculty access required")
  }

  try {
    // Get timetable entry details
    const timetableEntry = await sql`
      SELECT course_id FROM timetable
      WHERE id = ${timetableId} AND faculty_id = ${user.id}
    `

    if (timetableEntry.length === 0) {
      return { isMarked: false }
    }

    const today = new Date().toISOString().split('T')[0]

    // Check if attendance is already marked for today
    const existingAttendance = await sql`
      SELECT COUNT(*) as count FROM attendance
      WHERE course_id = ${timetableEntry[0].course_id} 
      AND date = ${today}
      AND marked_by = ${user.id}
    `

    return {
      isMarked: parseInt(existingAttendance[0].count) > 0
    }
  } catch (error) {
    console.error('Error checking attendance:', error)
    return { isMarked: false }
  }
}

export async function getTimetableAttendanceStatus(date?: string) {
  const user = await getCurrentUserServer()
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized - Admin access required")
  }

  const targetDate = date || new Date().toISOString().split('T')[0]

  try {
    // Get all timetable entries with attendance status for the specified date
    const timetableWithAttendance = await sql`
      SELECT 
        t.id as timetable_id,
        t.course_id,
        c.name as course_name,
        c.code as course_code,
        t.faculty_id,
        u.full_name as faculty_name,
        t.day as day,
        t.start_time,
        t.end_time,
        t.room,
        CASE 
          WHEN a.marked_by IS NOT NULL THEN true 
          ELSE false 
        END as attendance_marked,
        a.marked_by,
        u2.full_name as marked_by_name
      FROM timetable t
      JOIN courses c ON t.course_id = c.id
      JOIN users u ON t.faculty_id = u.id
      LEFT JOIN (
        SELECT DISTINCT course_id, marked_by
        FROM attendance 
        WHERE date = ${targetDate}
      ) a ON t.course_id = a.course_id AND t.faculty_id = a.marked_by
      LEFT JOIN users u2 ON a.marked_by = u2.id
      ORDER BY 
        CASE t.day 
          WHEN 'Monday' THEN 1 
          WHEN 'Tuesday' THEN 2 
          WHEN 'Wednesday' THEN 3 
          WHEN 'Thursday' THEN 4 
          WHEN 'Friday' THEN 5 
          WHEN 'Saturday' THEN 6 
          WHEN 'Sunday' THEN 7 
        END,
        t.start_time
    `

    return timetableWithAttendance.map(entry => ({
      ...entry,
      attendance_marked: Boolean(entry.attendance_marked)
    }))
  } catch (error) {
    console.error('Error getting timetable attendance status:', error)
    return []
  }
} 