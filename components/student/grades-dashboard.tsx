"use client"

import * as React from "react"
import { TrendingUp, Award, BookOpen, Target } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface GradeRecord {
    id: number
    courseCode: string
    courseName: string
    assignmentTitle: string
    grade: number
    maxMarks: number
    percentage: number
    feedback: string
    submittedAt: string
    gradedAt: string
}

interface CourseGPA {
    courseCode: string
    courseName: string
    credits: number
    averageGrade: number
    totalAssignments: number
    completedAssignments: number
    gpaPoints: number
}

export function GradesDashboard() {
    const [gradeRecords, setGradeRecords] = React.useState<GradeRecord[]>([])
    const [courseGPAs, setCourseGPAs] = React.useState<CourseGPA[]>([])
    const [overallGPA, setOverallGPA] = React.useState(0)

    // Mock data - replace with actual API calls
    React.useEffect(() => {
        const mockGrades: GradeRecord[] = [
            {
                id: 1,
                courseCode: "CS201",
                courseName: "Data Structures & Algorithms",
                assignmentTitle: "Binary Search Tree Implementation",
                grade: 85,
                maxMarks: 100,
                percentage: 85,
                feedback: "Good implementation with proper tree operations. Minor improvements needed in deletion logic.",
                submittedAt: "2024-12-15T10:30:00",
                gradedAt: "2024-12-20T14:20:00"
            },
            {
                id: 2,
                courseCode: "CS201",
                courseName: "Data Structures & Algorithms",
                assignmentTitle: "Graph Algorithms Quiz",
                grade: 92,
                maxMarks: 100,
                percentage: 92,
                feedback: "Excellent understanding of BFS and DFS algorithms. Perfect implementation.",
                submittedAt: "2024-12-10T09:15:00",
                gradedAt: "2024-12-12T16:45:00"
            },
            {
                id: 3,
                courseCode: "CS301",
                courseName: "Database Management Systems",
                assignmentTitle: "Database Design Project",
                grade: 142,
                maxMarks: 150,
                percentage: 95,
                feedback: "Outstanding database design with proper normalization. Excellent attention to indexing strategies.",
                submittedAt: "2024-12-18T16:45:00",
                gradedAt: "2024-12-22T10:30:00"
            },
            {
                id: 4,
                courseCode: "CS301",
                courseName: "Database Management Systems",
                assignmentTitle: "SQL Queries Assessment",
                grade: 78,
                maxMarks: 100,
                percentage: 78,
                feedback: "Good understanding of basic queries. Need improvement in complex joins and subqueries.",
                submittedAt: "2024-12-05T14:20:00",
                gradedAt: "2024-12-08T11:15:00"
            },
            {
                id: 5,
                courseCode: "IT401",
                courseName: "Web Development",
                assignmentTitle: "React Portfolio Website",
                grade: 188,
                maxMarks: 200,
                percentage: 94,
                feedback: "Impressive use of modern React features and responsive design. Clean code structure.",
                submittedAt: "2024-12-20T09:15:00",
                gradedAt: "2024-12-23T15:30:00"
            },
            {
                id: 6,
                courseCode: "CS401",
                courseName: "Machine Learning",
                assignmentTitle: "Classification Algorithms",
                grade: 88,
                maxMarks: 120,
                percentage: 73,
                feedback: "Good implementation of multiple algorithms. Analysis could be more detailed.",
                submittedAt: "2024-12-19T10:15:00",
                gradedAt: "2024-12-21T13:45:00"
            }
        ]

        const mockCourseGPAs: CourseGPA[] = [
            {
                courseCode: "CS201",
                courseName: "Data Structures & Algorithms",
                credits: 4,
                averageGrade: 88.5,
                totalAssignments: 3,
                completedAssignments: 2,
                gpaPoints: 3.7
            },
            {
                courseCode: "CS301",
                courseName: "Database Management Systems",
                credits: 3,
                averageGrade: 86.5,
                totalAssignments: 3,
                completedAssignments: 2,
                gpaPoints: 3.6
            },
            {
                courseCode: "IT401",
                courseName: "Web Development",
                credits: 3,
                averageGrade: 94,
                totalAssignments: 2,
                completedAssignments: 1,
                gpaPoints: 4.0
            },
            {
                courseCode: "CS401",
                courseName: "Machine Learning",
                credits: 4,
                averageGrade: 73,
                totalAssignments: 4,
                completedAssignments: 1,
                gpaPoints: 2.8
            }
        ]

        setGradeRecords(mockGrades)
        setCourseGPAs(mockCourseGPAs)

        // Calculate overall GPA
        const totalCredits = mockCourseGPAs.reduce((sum, course) => sum + course.credits, 0)
        const weightedGPA = mockCourseGPAs.reduce((sum, course) => sum + (course.gpaPoints * course.credits), 0)
        setOverallGPA(totalCredits > 0 ? weightedGPA / totalCredits : 0)
    }, [])

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600 dark:text-green-400'
        if (percentage >= 80) return 'text-blue-600 dark:text-blue-400'
        if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
        if (percentage >= 60) return 'text-orange-600 dark:text-orange-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getGradeBadge = (percentage: number) => {
        if (percentage >= 90) return { label: 'A+', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
        if (percentage >= 85) return { label: 'A', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
        if (percentage >= 80) return { label: 'B+', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
        if (percentage >= 75) return { label: 'B', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
        if (percentage >= 70) return { label: 'C+', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
        if (percentage >= 65) return { label: 'C', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
        if (percentage >= 60) return { label: 'D', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' }
        return { label: 'F', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    }

    const getGPAColor = (gpa: number) => {
        if (gpa >= 3.5) return 'text-green-600 dark:text-green-400'
        if (gpa >= 3.0) return 'text-blue-600 dark:text-blue-400'
        if (gpa >= 2.5) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const totalAssignments = courseGPAs.reduce((sum, course) => sum + course.totalAssignments, 0)
    const completedAssignments = gradeRecords.length
    const averageGrade = gradeRecords.length > 0
        ? gradeRecords.reduce((sum, record) => sum + record.percentage, 0) / gradeRecords.length
        : 0

    return (
        <div className="space-y-6 bg-background text-foreground">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Academic Performance</h2>
                <p className="text-muted-foreground">
                    Track your grades, GPA, and academic progress
                </p>
            </div>

            {/* GPA Summary Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-foreground">
                        <Award className="h-5 w-5" />
                        GPA Summary
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Your overall academic performance summary
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className={`text-4xl font-bold ${getGPAColor(overallGPA)}`}>
                                {overallGPA.toFixed(2)}
                            </div>
                            <p className="text-sm text-muted-foreground">Overall GPA</p>
                            <div className="text-sm font-medium">
                                {overallGPA >= 3.5 ? 'Excellent' : overallGPA >= 3.0 ? 'Good' : overallGPA >= 2.5 ? 'Satisfactory' : 'Needs Improvement'}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
                            <p className="text-sm text-muted-foreground">Average Grade</p>
                            <div className={`text-sm font-medium ${getGradeColor(averageGrade)}`}>
                                {getGradeBadge(averageGrade).label} Grade
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{completedAssignments}</div>
                            <p className="text-sm text-muted-foreground">Assignments Graded</p>
                            <div className="text-sm text-muted-foreground">
                                of {totalAssignments} total
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{courseGPAs.length}</div>
                            <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                            <div className="text-sm text-muted-foreground">
                                {courseGPAs.reduce((sum, course) => sum + course.credits, 0)} total credits
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Assignment Completion</span>
                            <span>{totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0}%</span>
                        </div>
                        <Progress value={totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Course-wise Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Course Performance</CardTitle>
                    <CardDescription>
                        Your performance breakdown by course
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                        {courseGPAs.map((course) => (
                            <Card key={course.courseCode} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{course.courseCode}</CardTitle>
                                            <CardDescription className="text-sm">{course.courseName}</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-xl font-bold ${getGPAColor(course.gpaPoints)}`}>
                                                {course.gpaPoints.toFixed(1)}
                                            </div>
                                            <div className="text-sm text-muted-foreground">GPA</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Average Grade</span>
                                            <span className={`font-medium ${getGradeColor(course.averageGrade)}`}>
                                                {course.averageGrade.toFixed(1)}%
                                            </span>
                                        </div>
                                        <Progress value={course.averageGrade} className="h-2" />
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>{course.completedAssignments} / {course.totalAssignments} assignments</span>
                                            <span>{course.credits} credits</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Grades Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Grade Details</CardTitle>
                    <CardDescription>
                        Detailed view of all your graded assignments
                    </CardDescription>
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
                                <TableHead className="text-right">Graded Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {gradeRecords
                                .sort((a, b) => new Date(b.gradedAt).getTime() - new Date(a.gradedAt).getTime())
                                .map((record) => {
                                    const gradeBadge = getGradeBadge(record.percentage)

                                    return (
                                        <TableRow key={record.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{record.courseCode}</div>
                                                    <div className="text-sm text-muted-foreground">{record.courseName}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{record.assignmentTitle}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-lg font-bold ${getGradeColor(record.percentage)}`}>
                                                        {record.grade}
                                                    </span>
                                                    <span className="text-muted-foreground">/ {record.maxMarks}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-medium ${getGradeColor(record.percentage)}`}>
                                                        {record.percentage.toFixed(1)}%
                                                    </span>
                                                    <Badge className={gradeBadge.color}>
                                                        {gradeBadge.label}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-xs">
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {record.feedback}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-muted-foreground">
                                                {new Date(record.gradedAt).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="bg-green-50/80 dark:bg-green-950/20 border-green-200 dark:border-green-800/30">
                <CardHeader>
                    <CardTitle className="text-green-800 dark:text-green-200 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Performance Insights
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 text-sm text-green-700 dark:text-green-300">
                        {overallGPA >= 3.5 && (
                            <p>🎉 Excellent work! You're maintaining a high GPA. Keep up the great performance!</p>
                        )}
                        {overallGPA >= 3.0 && overallGPA < 3.5 && (
                            <p>👍 Good academic performance! Focus on improving weaker areas to reach excellence.</p>
                        )}
                        {overallGPA < 3.0 && (
                            <p>📚 There's room for improvement. Consider reaching out to instructors for help and study resources.</p>
                        )}
                        <p>• Your strongest subject: {courseGPAs.reduce((max, course) => course.gpaPoints > max.gpaPoints ? course : max, courseGPAs[0])?.courseName}</p>
                        <p>• Focus area: {courseGPAs.reduce((min, course) => course.gpaPoints < min.gpaPoints ? course : min, courseGPAs[0])?.courseName}</p>
                        <p>• Assignment completion rate: {Math.round((completedAssignments / totalAssignments) * 100)}%</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 