"use client"

import * as React from "react"
import { Calendar, FileText, Upload, CheckCircle, Clock, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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

interface Assignment {
    id: number
    title: string
    courseCode: string
    courseName: string
    description: string
    dueDate: string
    maxMarks: number
    submissionStatus: 'not_submitted' | 'submitted' | 'late_submitted'
    submittedFile?: string
    submittedAt?: string
    grade?: number
    feedback?: string
}

export function AssignmentsSubmission() {
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [uploadingFiles, setUploadingFiles] = React.useState<{ [key: number]: File | null }>({})
    const [isLoading, setIsLoading] = React.useState(false)

    // Mock data - replace with actual API calls
    React.useEffect(() => {
        setAssignments([
            {
                id: 1,
                title: "Binary Search Tree Implementation",
                courseCode: "CS201",
                courseName: "Data Structures & Algorithms",
                description: "Implement a complete BST with insertion, deletion, and traversal operations",
                dueDate: "2024-12-25T23:59:00",
                maxMarks: 100,
                submissionStatus: "submitted",
                submittedFile: "john_bst_implementation.zip",
                submittedAt: "2024-12-20T15:30:00",
                grade: 85,
                feedback: "Good implementation, minor improvements needed in deletion logic"
            },
            {
                id: 2,
                title: "Database Design Project",
                courseCode: "CS301",
                courseName: "Database Management Systems",
                description: "Design a complete database schema for an e-commerce application with proper normalization",
                dueDate: "2024-12-30T23:59:00",
                maxMarks: 150,
                submissionStatus: "not_submitted"
            },
            {
                id: 3,
                title: "React Portfolio Website",
                courseCode: "IT401",
                courseName: "Web Development",
                description: "Create a personal portfolio website using React, TypeScript, and modern styling",
                dueDate: "2025-01-05T23:59:00",
                maxMarks: 200,
                submissionStatus: "not_submitted"
            },
            {
                id: 4,
                title: "Machine Learning Classification",
                courseCode: "CS401",
                courseName: "Machine Learning",
                description: "Implement and compare different classification algorithms on a given dataset",
                dueDate: "2024-12-18T23:59:00",
                maxMarks: 120,
                submissionStatus: "late_submitted",
                submittedFile: "ml_classification_late.py",
                submittedAt: "2024-12-19T10:15:00"
            }
        ])
    }, [])

    const handleFileChange = (assignmentId: number, file: File | null) => {
        setUploadingFiles(prev => ({
            ...prev,
            [assignmentId]: file
        }))
    }

    const handleSubmit = async (assignmentId: number) => {
        const file = uploadingFiles[assignmentId]
        if (!file) {
            alert("Please select a file to submit")
            return
        }

        setIsLoading(true)

        // Simulate file upload
        setTimeout(() => {
            setAssignments(assignments.map(assignment =>
                assignment.id === assignmentId
                    ? {
                        ...assignment,
                        submissionStatus: 'submitted' as const,
                        submittedFile: file.name,
                        submittedAt: new Date().toISOString()
                    }
                    : assignment
            ))

            // Clear the uploaded file
            setUploadingFiles(prev => ({
                ...prev,
                [assignmentId]: null
            }))

            setIsLoading(false)
            alert("Assignment submitted successfully!")
        }, 2000)
    }

    const getStatusColor = (status: string, dueDate: string) => {
        const now = new Date()
        const due = new Date(dueDate)

        switch (status) {
            case 'submitted':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'late_submitted':
                return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
            case 'not_submitted':
                if (now > due) {
                    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }

    const getStatusText = (status: string, dueDate: string) => {
        const now = new Date()
        const due = new Date(dueDate)

        switch (status) {
            case 'submitted':
                return 'Submitted'
            case 'late_submitted':
                return 'Late Submitted'
            case 'not_submitted':
                if (now > due) {
                    return 'Overdue'
                }
                return 'Not Submitted'
            default:
                return 'Unknown'
        }
    }

    const getStatusIcon = (status: string, dueDate: string) => {
        const now = new Date()
        const due = new Date(dueDate)

        switch (status) {
            case 'submitted':
                return <CheckCircle className="h-4 w-4" />
            case 'late_submitted':
                return <AlertCircle className="h-4 w-4" />
            case 'not_submitted':
                if (now > due) {
                    return <AlertCircle className="h-4 w-4" />
                }
                return <Clock className="h-4 w-4" />
            default:
                return <Clock className="h-4 w-4" />
        }
    }

    const getDaysUntilDue = (dueDate: string) => {
        const now = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const stats = {
        total: assignments.length,
        submitted: assignments.filter(a => a.submissionStatus === 'submitted').length,
        pending: assignments.filter(a => a.submissionStatus === 'not_submitted').length,
        overdue: assignments.filter(a => {
            const now = new Date()
            const due = new Date(a.dueDate)
            return a.submissionStatus === 'not_submitted' && now > due
        }).length
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">My Assignments</h2>
                <p className="text-muted-foreground">
                    View and submit your course assignments
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0}% completion
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
                        <p className="text-xs text-muted-foreground">
                            Need to submit
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                        <p className="text-xs text-muted-foreground">
                            Past deadline
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Progress Overview */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-foreground">Assignment Progress</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Your overall assignment completion progress
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-foreground">
                            <span>Completion Rate</span>
                            <span>{stats.total > 0 ? Math.round((stats.submitted / stats.total) * 100) : 0}%</span>
                        </div>
                        <Progress value={stats.total > 0 ? (stats.submitted / stats.total) * 100 : 0} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Assignments Table */}
            <Card className="border-border bg-card">
                <CardHeader>
                    <CardTitle className="text-foreground">Assignment Submissions</CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Submit your assignments and track their status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Upload File</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => {
                                const daysUntilDue = getDaysUntilDue(assignment.dueDate)
                                const canSubmit = assignment.submissionStatus === 'not_submitted'
                                const currentFile = uploadingFiles[assignment.id]

                                return (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{assignment.title}</div>
                                                <div className="text-sm text-muted-foreground">{assignment.description}</div>
                                                <div className="text-sm font-medium text-blue-600">Max Marks: {assignment.maxMarks}</div>
                                                {assignment.grade && (
                                                    <div className="text-sm font-medium text-green-600">
                                                        Grade: {assignment.grade}/{assignment.maxMarks} ({Math.round((assignment.grade / assignment.maxMarks) * 100)}%)
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{assignment.courseCode}</div>
                                                <div className="text-sm text-muted-foreground">{assignment.courseName}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                {daysUntilDue > 0 && canSubmit && (
                                                    <div className="text-sm text-blue-600">
                                                        {daysUntilDue} days left
                                                    </div>
                                                )}
                                                {daysUntilDue <= 0 && canSubmit && (
                                                    <div className="text-sm text-red-600 font-medium">
                                                        {Math.abs(daysUntilDue)} days overdue
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(assignment.submissionStatus, assignment.dueDate)}>
                                                {getStatusIcon(assignment.submissionStatus, assignment.dueDate)}
                                                <span className="ml-1">{getStatusText(assignment.submissionStatus, assignment.dueDate)}</span>
                                            </Badge>
                                            {assignment.submittedAt && (
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                            {assignment.submittedFile && (
                                                <div className="text-xs text-blue-600 mt-1">
                                                    File: {assignment.submittedFile}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {canSubmit ? (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.zip,.py,.cpp,.java,.txt"
                                                        onChange={(e) => handleFileChange(assignment.id, e.target.files?.[0] || null)}
                                                        className="w-48"
                                                    />
                                                    {currentFile && (
                                                        <div className="text-sm text-green-600 flex items-center gap-1">
                                                            <Upload className="h-3 w-3" />
                                                            {currentFile.name}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">
                                                    {assignment.submissionStatus === 'submitted' ? 'Already submitted' : 'Late submission'}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {canSubmit ? (
                                                <Button
                                                    onClick={() => handleSubmit(assignment.id)}
                                                    disabled={!currentFile || isLoading}
                                                    size="sm"
                                                >
                                                    {isLoading ? "Submitting..." : "Submit"}
                                                </Button>
                                            ) : (
                                                <div className="space-y-1">
                                                    {assignment.grade && assignment.feedback && (
                                                        <Button variant="outline" size="sm">
                                                            View Feedback
                                                        </Button>
                                                    )}
                                                    {assignment.submissionStatus === 'not_submitted' && daysUntilDue <= 0 && (
                                                        <Button variant="destructive" size="sm">
                                                            Late Submit
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
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