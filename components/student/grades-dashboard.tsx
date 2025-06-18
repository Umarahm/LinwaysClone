"use client"

import * as React from "react"
import { TrendingUp, Award, BookOpen, Target, Loader2, RefreshCw } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

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
    facultyName: string
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

interface GradeSummary {
    totalGradedAssignments: number
    totalCourses: number
    totalCredits: number
    averageGrade: number
}

export function GradesDashboard() {
    const { toast } = useToast()
    const [gradeRecords, setGradeRecords] = React.useState<GradeRecord[]>([])
    const [courseGPAs, setCourseGPAs] = React.useState<CourseGPA[]>([])
    const [overallGPA, setOverallGPA] = React.useState(0)
    const [summary, setSummary] = React.useState<GradeSummary>({
        totalGradedAssignments: 0,
        totalCourses: 0,
        totalCredits: 0,
        averageGrade: 0
    })
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    const fetchGrades = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/student/grades')
            const data = await response.json()

            if (data.success) {
                setGradeRecords(data.grades || [])
                setCourseGPAs(data.courseGPAs || [])
                setOverallGPA(data.overallGPA || 0)
                setSummary(data.summary || {})
            } else {
                setError(data.message || 'Failed to fetch grades')
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.message || "Failed to fetch grades",
                })
            }
        } catch (error) {
            console.error('Error fetching grades:', error)
            setError('Failed to fetch grades. Please try again.')
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch grades. Please try again.",
            })
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        fetchGrades()
    }, [])

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600 dark:text-green-400'
        if (percentage >= 80) return 'text-blue-600 dark:text-blue-400'
        if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
        if (percentage >= 60) return 'text-orange-600 dark:text-orange-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getGradeBadge = (percentage: number) => {
        if (percentage >= 97) return { label: 'A+', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
        if (percentage >= 93) return { label: 'A', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
        if (percentage >= 90) return { label: 'A-', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' }
        if (percentage >= 87) return { label: 'B+', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
        if (percentage >= 83) return { label: 'B', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
        if (percentage >= 80) return { label: 'B-', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' }
        if (percentage >= 77) return { label: 'C+', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
        if (percentage >= 73) return { label: 'C', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
        if (percentage >= 70) return { label: 'C-', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' }
        if (percentage >= 67) return { label: 'D+', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' }
        if (percentage >= 65) return { label: 'D', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' }
        return { label: 'F', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
    }

    const getGPAColor = (gpa: number) => {
        if (gpa >= 3.5) return 'text-green-600 dark:text-green-400'
        if (gpa >= 3.0) return 'text-blue-600 dark:text-blue-400'
        if (gpa >= 2.5) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getGPADescription = (gpa: number) => {
        if (gpa >= 3.7) return 'Excellent'
        if (gpa >= 3.3) return 'Very Good'
        if (gpa >= 3.0) return 'Good'
        if (gpa >= 2.7) return 'Satisfactory'
        if (gpa >= 2.0) return 'Below Average'
        return 'Poor'
    }

    if (loading) {
        return (
            <div className="space-y-6 bg-background text-foreground">
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Loading your grades...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6 bg-background text-foreground">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-red-600 mb-4">{error}</p>
                            <Button onClick={fetchGrades} variant="outline">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Try Again
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">My Grades</h2>
                    <p className="text-muted-foreground">
                        Track your grades, GPA, and academic progress
                    </p>
                </div>
                <Button onClick={fetchGrades} variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall GPA</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${getGPAColor(overallGPA)}`}>{overallGPA.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            {getGPADescription(overallGPA)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.averageGrade}%</div>
                        <p className="text-xs text-muted-foreground">
                            Across all courses
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graded Assignments</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalGradedAssignments}</div>
                        <p className="text-xs text-muted-foreground">
                            Assignments completed
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
                        <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalCredits}</div>
                        <p className="text-xs text-muted-foreground">
                            From {summary.totalCourses} courses
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Course Performance */}
            {courseGPAs.length > 0 && (
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
            )}

            {/* Detailed Grades Table */}
            {gradeRecords.length > 0 ? (
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
                                                    <div className="text-sm text-muted-foreground">by {record.facultyName}</div>
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
                                                            {record.feedback || "No feedback provided"}
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
            ) : (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No grades yet</h3>
                            <p className="text-muted-foreground">
                                Your graded assignments will appear here once faculty have reviewed your submissions.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Performance Insights */}
            {gradeRecords.length > 0 && (
                <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50">
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
                            {courseGPAs.length > 0 && (
                                <>
                                    <p>• Your strongest subject: {courseGPAs.reduce((max, course) => course.gpaPoints > max.gpaPoints ? course : max, courseGPAs[0])?.courseName}</p>
                                    <p>• Focus area: {courseGPAs.reduce((min, course) => course.gpaPoints < min.gpaPoints ? course : min, courseGPAs[0])?.courseName}</p>
                                </>
                            )}
                            <p>• Total assignments graded: {summary.totalGradedAssignments}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 