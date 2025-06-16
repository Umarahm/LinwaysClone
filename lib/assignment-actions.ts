"use server"

import { sql } from "./db"
import { getCurrentUser } from "./auth-actions"

export async function getStudentAssignments() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") {
    throw new Error("Unauthorized")
  }

  const assignments = await sql`
    SELECT 
      a.id,
      a.title,
      c.name as course_name,
      c.code as course_code,
      a.due_date,
      a.max_marks,
      s.id as submission_id,
      s.grade,
      s.submitted_at,
      s.file_url
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN submissions s ON a.id = s.assignment_id AND s.student_id = ${user.id}
    WHERE e.student_id = ${user.id}
    ORDER BY a.due_date ASC
  `

  return assignments.map((assignment) => ({
    id: assignment.id,
    title: assignment.title,
    course: `${assignment.course_code} - ${assignment.course_name}`,
    dueDate: assignment.due_date,
    status: assignment.submission_id ? "submitted" : "not_submitted",
    grade: assignment.grade,
    submissionUrl: assignment.file_url,
    submittedAt: assignment.submitted_at,
  }))
}

export async function getFacultyAssignments() {
  const user = await getCurrentUser()
  if (!user || user.role !== "faculty") {
    throw new Error("Unauthorized")
  }

  const assignments = await sql`
    SELECT 
      a.id,
      a.title,
      c.name as course_name,
      c.code as course_code,
      a.due_date,
      a.max_marks,
      a.description,
      COUNT(s.id) as submission_count,
      COUNT(e.student_id) as total_students
    FROM assignments a
    JOIN courses c ON a.course_id = c.id
    JOIN enrollments e ON c.id = e.course_id
    LEFT JOIN submissions s ON a.id = s.assignment_id
    WHERE a.faculty_id = ${user.id}
    GROUP BY a.id, c.name, c.code
    ORDER BY a.due_date DESC
  `

  return assignments
}

export async function createAssignment(
  prevState: { success: boolean; message: string } | null,
  formData: FormData
) {
  const user = await getCurrentUser()
  if (!user || user.role !== "faculty") {
    return { success: false, message: "Unauthorized" }
  }

  const title = formData.get("title") as string
  const courseId = formData.get("courseId") as string
  const description = formData.get("description") as string
  const dueDate = formData.get("dueDate") as string
  const maxMarks = formData.get("maxMarks") as string

  try {
    await sql`
      INSERT INTO assignments (title, description, course_id, faculty_id, due_date, max_marks)
      VALUES (${title}, ${description}, ${Number.parseInt(courseId)}, ${user.id}, ${dueDate}, ${Number.parseInt(maxMarks)})
    `

    return { success: true, message: "Assignment created successfully" }
  } catch (error) {
    return { success: false, message: "Failed to create assignment" }
  }
}
