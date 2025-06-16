"use server"

import { sql } from "./db"
import { getCurrentUser } from "./auth-actions"

export async function getStudentGrades() {
  const user = await getCurrentUser()
  if (!user || user.role !== "student") {
    throw new Error("Unauthorized")
  }

  // Get detailed grades
  const grades = await sql`
    SELECT 
      s.id,
      c.code as course_code,
      c.name as course_name,
      a.title as assignment_title,
      s.grade,
      a.max_marks,
      s.feedback,
      s.submitted_at
    FROM submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN courses c ON a.course_id = c.id
    WHERE s.student_id = ${user.id} AND s.grade IS NOT NULL
    ORDER BY s.submitted_at DESC
  `

  // Get course-wise GPA
  const courseGPAs = await sql`
    SELECT 
      c.code as course_code,
      c.name as course_name,
      c.credits,
      AVG((s.grade::float / a.max_marks) * 100) as average_grade,
      CASE 
        WHEN AVG((s.grade::float / a.max_marks) * 100) >= 90 THEN 4.0
        WHEN AVG((s.grade::float / a.max_marks) * 100) >= 80 THEN 3.0
        WHEN AVG((s.grade::float / a.max_marks) * 100) >= 70 THEN 2.0
        WHEN AVG((s.grade::float / a.max_marks) * 100) >= 60 THEN 1.0
        ELSE 0.0
      END as gpa_points
    FROM courses c
    JOIN assignments a ON c.id = a.course_id
    JOIN submissions s ON a.id = s.assignment_id
    JOIN enrollments e ON c.id = e.course_id
    WHERE e.student_id = ${user.id} AND s.student_id = ${user.id} AND s.grade IS NOT NULL
    GROUP BY c.id, c.code, c.name, c.credits
    ORDER BY c.code
  `

  // Calculate overall GPA
  const totalCredits = courseGPAs.reduce((acc: number, course: any) => acc + course.credits, 0)
  const weightedGPA = courseGPAs.reduce((acc: number, course: any) => acc + course.gpa_points * course.credits, 0)
  const overallGPA = totalCredits > 0 ? weightedGPA / totalCredits : 0

  return {
    grades: grades.map((grade: any) => ({
      ...grade,
      grade: Number.parseInt(grade.grade),
      max_marks: Number.parseInt(grade.max_marks),
    })),
    courseGPAs: courseGPAs.map((course: any) => ({
      ...course,
      credits: Number.parseInt(course.credits),
      average_grade: Number.parseFloat(course.average_grade) || 0,
      gpa_points: Number.parseFloat(course.gpa_points) || 0,
    })),
    overallGPA: Number.parseFloat(overallGPA.toFixed(2)),
  }
}
