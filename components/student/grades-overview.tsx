"use client"
import { Award, BookOpen, FileText, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Grade {
  id: number
  course_code: string
  course_name: string
  assignment_title: string
  grade: number
  max_marks: number
  feedback: string
  submitted_at: string
}

interface CourseGPA {
  course_code: string
  course_name: string
  credits: number
  average_grade: number
  gpa_points: number
}

interface GradesOverviewProps {
  grades: Grade[]
  courseGPAs: CourseGPA[]
  overallGPA: number
}

export function GradesOverview({ grades, courseGPAs, overallGPA }: GradesOverviewProps) {
  const totalCredits = courseGPAs.reduce((acc, course) => acc + course.credits, 0)
  const completedAssignments = grades.length
  const averageGrade =
    grades.length > 0
      ? Math.round(grades.reduce((acc, grade) => acc + (grade.grade / grade.max_marks) * 100, 0) / grades.length)
      : 0

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    if (percentage >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return "A"
    if (percentage >= 80) return "B"
    if (percentage >= 70) return "C"
    if (percentage >= 60) return "D"
    return "F"
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Grades</h1>
          <p className="text-gray-600 mt-1">Track your academic performance across all courses</p>
        </div>
      </div>

      {/* GPA Summary Card */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-yellow-300" />
              </div>
              <p className="text-blue-100 text-sm font-medium">Overall GPA</p>
              <p className="text-4xl font-bold">{overallGPA.toFixed(2)}</p>
              <p className="text-blue-100 text-xs mt-1">Out of 4.0</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <BookOpen className="w-8 h-8 text-blue-200" />
              </div>
              <p className="text-blue-100 text-sm font-medium">Total Credits</p>
              <p className="text-3xl font-bold">{totalCredits}</p>
              <p className="text-blue-100 text-xs mt-1">Credit hours</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-8 h-8 text-blue-200" />
              </div>
              <p className="text-blue-100 text-sm font-medium">Assignments</p>
              <p className="text-3xl font-bold">{completedAssignments}</p>
              <p className="text-blue-100 text-xs mt-1">Completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-blue-200" />
              </div>
              <p className="text-blue-100 text-sm font-medium">Average</p>
              <p className="text-3xl font-bold">{averageGrade}%</p>
              <p className="text-blue-100 text-xs mt-1">Overall average</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course-wise GPA */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Course Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courseGPAs.map((course, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">{course.course_code}</span>
                  <span className="text-sm text-gray-600 ml-2">{course.course_name}</span>
                  <Badge variant="outline" className="ml-2">
                    {course.credits} credits
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">{course.gpa_points.toFixed(1)}</span>
                  <span className="text-sm text-gray-600 ml-2">({course.average_grade.toFixed(1)}%)</span>
                </div>
              </div>
              <Progress value={course.average_grade} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Detailed Grades Table */}
      <Card className="shadow-sm border-0 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <FileText className="w-5 h-5 text-blue-600" />
            Assignment Grades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Assignment</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((grade) => {
                const percentage = Math.round((grade.grade / grade.max_marks) * 100)
                return (
                  <TableRow key={grade.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{grade.course_code}</div>
                        <div className="text-sm text-gray-600">{grade.course_name}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{grade.assignment_title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {grade.grade}/{grade.max_marks}
                        </span>
                        <Badge variant="secondary" className={getGradeColor(percentage)}>
                          {getGradeLetter(percentage)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${getGradeColor(percentage)}`}>{percentage}%</span>
                        <div className="w-16">
                          <Progress value={percentage} className="h-1" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate" title={grade.feedback}>
                          {grade.feedback || "No feedback provided"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">{new Date(grade.submitted_at).toLocaleDateString()}</span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
