"use client"

import * as React from "react"
import { Save, Download, FileText, Calendar, User, GraduationCap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface Submission {
    id: number
    studentName: string
    studentEmail: string
    assignmentTitle: string
    assignmentId: number
    submissionFile: string
    submissionDate: string
    grade: number | null
    feedback: string
    maxMarks: number
    status: 'submitted' | 'graded' | 'late'
}

interface Assignment {
    id: number
    title: string
    courseCode: string
    maxMarks: number
}

export function GradingInterface() {
    const [submissions, setSubmissions] = React.useState<Submission[]>([])
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [selectedAssignment, setSelectedAssignment] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [gradingData, setGradingData] = React.useState<{ [key: number]: { grade: string, feedback: string } }>({})

    // Mock data - replace with actual API calls
    React.useEffect(() => {
        setAssignments([
            { id: 1, title: "Binary Search Tree Implementation", courseCode: "CS201", maxMarks: 100 },
            { id: 2, title: "Database Design Project", courseCode: "CS301", maxMarks: 150 },
            { id: 3, title: "React Portfolio Website", courseCode: "IT401", maxMarks: 200 },
        ])

        setSubmissions([
            {
                id: 1,
                studentName: "John Doe",
                studentEmail: "john.doe@presidency.edu",
                assignmentTitle: "Binary Search Tree Implementation",
                assignmentId: 1,
                submissionFile: "john_bst_implementation.zip",
                submissionDate: "2024-12-15T10:30:00",
                grade: 85,
                feedback: "Good implementation with proper tree operations. Minor improvements needed in deletion logic.",
                maxMarks: 100,
                status: 'graded'
            },
            {
                id: 2,
                studentName: "Jane Smith",
                studentEmail: "jane.smith@presidency.edu",
                assignmentTitle: "Binary Search Tree Implementation",
                assignmentId: 1,
                submissionFile: "jane_bst_project.zip",
                submissionDate: "2024-12-16T14:20:00",
                grade: null,
                feedback: "",
                maxMarks: 100,
                status: 'submitted'
            },
            {
                id: 3,
                studentName: "Mike Johnson",
                studentEmail: "mike.johnson@presidency.edu",
                assignmentTitle: "Database Design Project",
                assignmentId: 2,
                submissionFile: "mike_database_schema.pdf",
                submissionDate: "2024-12-18T16:45:00",
                grade: 142,
                feedback: "Excellent database design with proper normalization. Great attention to indexing strategies.",
                maxMarks: 150,
                status: 'graded'
            },
            {
                id: 4,
                studentName: "Sarah Wilson",
                studentEmail: "sarah.wilson@presidency.edu",
                assignmentTitle: "React Portfolio Website",
                assignmentId: 3,
                submissionFile: "sarah_portfolio_site.zip",
                submissionDate: "2024-12-20T09:15:00",
                grade: null,
                feedback: "",
                maxMarks: 200,
                status: 'submitted'
            }
        ])
    }, [])

    const filteredSubmissions = selectedAssignment && selectedAssignment !== "all"
        ? submissions.filter(s => s.assignmentId === parseInt(selectedAssignment))
        : submissions

    const handleGradeChange = (submissionId: number, grade: string) => {
        setGradingData(prev => ({
            ...prev,
            [submissionId]: {
                ...prev[submissionId],
                grade
            }
        }))
    }

    const handleFeedbackChange = (submissionId: number, feedback: string) => {
        setGradingData(prev => ({
            ...prev,
            [submissionId]: {
                ...prev[submissionId],
                feedback
            }
        }))
    }

    const handleSaveGrade = async (submissionId: number) => {
        const data = gradingData[submissionId]
        if (!data?.grade) return

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setSubmissions(submissions.map(submission =>
                submission.id === submissionId
                    ? {
                        ...submission,
                        grade: parseInt(data.grade),
                        feedback: data.feedback || "",
                        status: 'graded' as const
                    }
                    : submission
            ))

            // Clear the temporary grading data
            setGradingData(prev => {
                const newData = { ...prev }
                delete newData[submissionId]
                return newData
            })

            setIsLoading(false)
        }, 1000)
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'graded': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            case 'late': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }

    const getGradeColor = (grade: number, maxMarks: number) => {
        const percentage = (grade / maxMarks) * 100
        if (percentage >= 90) return 'text-green-600 dark:text-green-400'
        if (percentage >= 80) return 'text-blue-600 dark:text-blue-400'
        if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
        if (percentage >= 60) return 'text-orange-600 dark:text-orange-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getCurrentGrade = (submissionId: number, currentGrade: number | null) => {
        return gradingData[submissionId]?.grade || currentGrade?.toString() || ""
    }

    const getCurrentFeedback = (submissionId: number, currentFeedback: string) => {
        return gradingData[submissionId]?.feedback || currentFeedback || ""
    }

    const stats = {
        total: filteredSubmissions.length,
        graded: filteredSubmissions.filter(s => s.status === 'graded').length,
        pending: filteredSubmissions.filter(s => s.status === 'submitted').length,
        avgGrade: filteredSubmissions.filter(s => s.grade !== null).reduce((acc, s) => acc + (s.grade || 0), 0) / filteredSubmissions.filter(s => s.grade !== null).length || 0
    }

    return (
        <div className="space-y-6 bg-background text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Grading Interface</h2>
                    <p className="text-muted-foreground">
                        Review and grade student submissions
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Label htmlFor="assignment-filter">Filter by Assignment:</Label>
                    <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                        <SelectTrigger className="w-[300px]">
                            <SelectValue placeholder="All assignments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All assignments</SelectItem>
                            {assignments.map((assignment) => (
                                <SelectItem key={assignment.id} value={assignment.id.toString()}>
                                    {assignment.courseCode} - {assignment.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graded</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats.avgGrade)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Submissions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Submissions</CardTitle>
                    <CardDescription>
                        Review submissions and provide grades and feedback
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Submission File</TableHead>
                                <TableHead>Submitted Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Feedback</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSubmissions.map((submission) => (
                                <TableRow key={submission.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-medium">{submission.studentName}</div>
                                                <div className="text-sm text-muted-foreground">{submission.studentEmail}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{submission.assignmentTitle}</div>
                                            <div className="text-sm text-muted-foreground">Max: {submission.maxMarks} marks</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                                            <Download className="mr-2 h-4 w-4" />
                                            {submission.submissionFile}
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            {new Date(submission.submissionDate).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(submission.status)}>
                                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="number"
                                                min="0"
                                                max={submission.maxMarks}
                                                value={getCurrentGrade(submission.id, submission.grade)}
                                                onChange={(e) => handleGradeChange(submission.id, e.target.value)}
                                                className="w-20"
                                                placeholder="Grade"
                                            />
                                            <span className="text-sm text-muted-foreground">/ {submission.maxMarks}</span>
                                            {submission.grade !== null && (
                                                <span className={`text-sm font-medium ${getGradeColor(submission.grade, submission.maxMarks)}`}>
                                                    ({Math.round((submission.grade / submission.maxMarks) * 100)}%)
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Textarea
                                            value={getCurrentFeedback(submission.id, submission.feedback)}
                                            onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                                            placeholder="Enter feedback..."
                                            rows={2}
                                            className="min-w-[200px]"
                                        />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            onClick={() => handleSaveGrade(submission.id)}
                                            disabled={isLoading || !gradingData[submission.id]?.grade}
                                            size="sm"
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            Save
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
} 