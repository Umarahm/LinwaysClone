"use client"

import * as React from "react"
import { Calendar, FileText, Download, Filter, CheckCircle, Clock, AlertCircle, BookOpen, User, Star, Save, Edit } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface Submission {
    id: number
    assignmentId: number
    assignmentTitle: string
    courseCode: string
    courseName: string
    studentId: number
    studentName: string
    studentEmail: string
    submittedAt: string
    fileUrl?: string
    fileName?: string
    grade?: number
    maxMarks: number
    feedback?: string
    status: 'submitted' | 'late_submitted' | 'graded'
    dueDate: string
}

interface Assignment {
    id: number
    title: string
    courseCode: string
    courseName: string
    dueDate: string
    maxMarks: number
    totalStudents: number
    submissionsCount: number
}

export function AssignmentSubmissions() {
    const { toast } = useToast()
    const [submissions, setSubmissions] = React.useState<Submission[]>([])
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [selectedAssignment, setSelectedAssignment] = React.useState<string>("all")
    const [filterStatus, setFilterStatus] = React.useState<"all" | "submitted" | "graded" | "pending">("all")
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)
    const [gradingSubmission, setGradingSubmission] = React.useState<Submission | null>(null)
    const [gradeForm, setGradeForm] = React.useState({ grade: "", feedback: "" })

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Fetch assignments
            const assignmentsResponse = await fetch('/api/faculty/assignments')
            if (assignmentsResponse.ok) {
                const assignmentsData = await assignmentsResponse.json()
                setAssignments(assignmentsData.assignments || [])
            }

            // Fetch submissions
            const submissionsResponse = await fetch('/api/faculty/submissions')
            const submissionsData = await submissionsResponse.json()

            if (submissionsData.success) {
                setSubmissions(submissionsData.submissions || [])
            } else {
                setError(submissionsData.message || 'Failed to fetch submissions')
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            setError('Failed to fetch data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadSubmission = async (fileUrl: string) => {
        try {
            const response = await fetch(`/api/files/${fileUrl}`)

            if (response.ok) {
                const contentDisposition = response.headers.get('Content-Disposition')
                let filename = 'submission'

                if (contentDisposition) {
                    const matches = contentDisposition.match(/filename="(.+)"/)
                    if (matches) {
                        filename = matches[1]
                    }
                }

                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = filename
                document.body.appendChild(a)
                a.click()
                window.URL.revokeObjectURL(url)
                document.body.removeChild(a)
            } else {
                const errorData = await response.json()
                toast({
                    variant: "warning",
                    title: "Download Failed",
                    description: errorData.message || "Failed to download file",
                })
            }
        } catch (error) {
            console.error('Download error:', error)
            toast({
                variant: "warning",
                title: "Download Failed",
                description: "Failed to download file. Please try again.",
            })
        }
    }

    const handleGradeSubmission = async () => {
        if (!gradingSubmission) return

        try {
            const response = await fetch('/api/faculty/submissions/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId: gradingSubmission.id,
                    grade: parseInt(gradeForm.grade),
                    feedback: gradeForm.feedback
                })
            })

            const data = await response.json()

            if (data.success) {
                // Update local state
                setSubmissions(submissions.map(sub =>
                    sub.id === gradingSubmission.id
                        ? { ...sub, grade: parseInt(gradeForm.grade), feedback: gradeForm.feedback, status: 'graded' as const }
                        : sub
                ))
                setGradingSubmission(null)
                setGradeForm({ grade: "", feedback: "" })
                toast({
                    variant: "success",
                    title: "Grade Submitted",
                    description: "Grade submitted successfully!",
                })
            } else {
                toast({
                    variant: "warning",
                    title: "Grading Failed",
                    description: data.message || "Failed to submit grade",
                })
            }
        } catch (error) {
            console.error('Grading error:', error)
            toast({
                variant: "warning",
                title: "Grading Failed",
                description: "Failed to submit grade. Please try again.",
            })
        }
    }

    const getSubmissionStatus = (submission: Submission) => {
        if (submission.grade !== undefined && submission.grade !== null) {
            return { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", text: "Graded", icon: CheckCircle }
        }

        const dueDate = new Date(submission.dueDate)
        const submittedDate = new Date(submission.submittedAt)

        if (submittedDate > dueDate) {
            return { color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300", text: "Late", icon: AlertCircle }
        }

        return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", text: "Submitted", icon: Clock }
    }

    const filteredSubmissions = React.useMemo(() => {
        let filtered = submissions

        // Filter by assignment
        if (selectedAssignment !== "all") {
            filtered = filtered.filter(sub => sub.assignmentId.toString() === selectedAssignment)
        }

        // Filter by status
        switch (filterStatus) {
            case "submitted":
                return filtered.filter(sub => sub.grade === undefined || sub.grade === null)
            case "graded":
                return filtered.filter(sub => sub.grade !== undefined && sub.grade !== null)
            case "pending":
                return filtered.filter(sub => {
                    const dueDate = new Date(sub.dueDate)
                    const now = new Date()
                    return dueDate < now && (sub.grade === undefined || sub.grade === null)
                })
            default:
                return filtered
        }
    }, [submissions, selectedAssignment, filterStatus])

    const stats = React.useMemo(() => {
        const total = submissions.length
        const graded = submissions.filter(s => s.grade !== undefined && s.grade !== null).length
        const pending = submissions.filter(s => s.grade === undefined || s.grade === null).length
        const late = submissions.filter(s => {
            const dueDate = new Date(s.dueDate)
            const submittedDate = new Date(s.submittedAt)
            return submittedDate > dueDate
        }).length

        return { total, graded, pending, late }
    }, [submissions])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-lg text-muted-foreground">Loading submissions...</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto p-6">
                    <Card className="bg-white dark:bg-gray-800 border-red-200 dark:border-red-700">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Submissions</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{error}</p>
                            <Button onClick={fetchData} className="bg-blue-600 hover:bg-blue-700">
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignment Submissions</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Review and grade student submissions</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <FileText className="w-6 h-6 text-blue-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Graded</p>
                                    <p className="text-2xl font-bold">{stats.graded}</p>
                                </div>
                                <CheckCircle className="w-6 h-6 text-green-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-amber-100 text-sm font-medium">Pending</p>
                                    <p className="text-2xl font-bold">{stats.pending}</p>
                                </div>
                                <Clock className="w-6 h-6 text-amber-200" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-medium">Late</p>
                                    <p className="text-2xl font-bold">{stats.late}</p>
                                </div>
                                <AlertCircle className="w-6 h-6 text-red-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Label htmlFor="assignment-filter" className="text-sm font-medium">Filter by Assignment</Label>
                        <select
                            id="assignment-filter"
                            value={selectedAssignment}
                            onChange={(e) => setSelectedAssignment(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="all">All Assignments</option>
                            {assignments.map((assignment) => (
                                <option key={assignment.id} value={assignment.id.toString()}>
                                    {assignment.courseCode} - {assignment.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1">
                        <Label className="text-sm font-medium">Filter by Status</Label>
                        <Tabs value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)} className="mt-1">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="all" className="text-xs">All ({stats.total})</TabsTrigger>
                                <TabsTrigger value="submitted" className="text-xs">Pending ({stats.pending})</TabsTrigger>
                                <TabsTrigger value="graded" className="text-xs">Graded ({stats.graded})</TabsTrigger>
                                <TabsTrigger value="pending" className="text-xs">Overdue ({stats.late})</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>

                {/* Submissions Grid */}
                <SubmissionsGrid
                    submissions={filteredSubmissions}
                    onDownloadSubmission={handleDownloadSubmission}
                    onGradeSubmission={(submission) => {
                        setGradingSubmission(submission)
                        setGradeForm({
                            grade: submission.grade?.toString() || "",
                            feedback: submission.feedback || ""
                        })
                    }}
                    getSubmissionStatus={getSubmissionStatus}
                />

                {/* Grading Modal */}
                {gradingSubmission && (
                    <Dialog open={!!gradingSubmission} onOpenChange={() => setGradingSubmission(null)}>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Grade Submission</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium">{gradingSubmission.assignmentTitle}</h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Student: {gradingSubmission.studentName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Course: {gradingSubmission.courseCode} - {gradingSubmission.courseName}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="grade">Grade (out of {gradingSubmission.maxMarks})</Label>
                                    <Input
                                        id="grade"
                                        type="number"
                                        min="0"
                                        max={gradingSubmission.maxMarks}
                                        value={gradeForm.grade}
                                        onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                        placeholder={`Enter grade (0-${gradingSubmission.maxMarks})`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="feedback">Feedback (Optional)</Label>
                                    <Textarea
                                        id="feedback"
                                        value={gradeForm.feedback}
                                        onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                                        placeholder="Provide feedback for the student..."
                                        rows={4}
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setGradingSubmission(null)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleGradeSubmission}
                                        disabled={!gradeForm.grade}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Grade
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}

interface SubmissionsGridProps {
    submissions: Submission[]
    onDownloadSubmission: (fileUrl: string) => void
    onGradeSubmission: (submission: Submission) => void
    getSubmissionStatus: (submission: Submission) => { color: string; text: string; icon: any }
}

function SubmissionsGrid({
    submissions,
    onDownloadSubmission,
    onGradeSubmission,
    getSubmissionStatus
}: SubmissionsGridProps) {
    if (submissions.length === 0) {
        return (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No submissions found</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                        No submissions match your current filter criteria.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {submissions.map((submission) => {
                const statusInfo = getSubmissionStatus(submission)
                const StatusIcon = statusInfo.icon
                const submissionDate = new Date(submission.submittedAt)
                const dueDate = new Date(submission.dueDate)
                const isLate = submissionDate > dueDate

                return (
                    <Card key={submission.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {submission.assignmentTitle}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{submission.courseCode}</span>
                                        <span className="text-gray-400">•</span>
                                        <span>{submission.courseName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <User className="w-4 h-4" />
                                        <span>{submission.studentName}</span>
                                    </div>
                                </div>
                                <Badge className={statusInfo.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusInfo.text}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Submitted: {submissionDate.toLocaleDateString()}</span>
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    Max: {submission.maxMarks} pts
                                </div>
                            </div>

                            {isLate && (
                                <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-950 rounded-md">
                                    <AlertCircle className="w-4 h-4 text-orange-600" />
                                    <span className="text-sm text-orange-800 dark:text-orange-200">
                                        Submitted {Math.ceil((submissionDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))} days late
                                    </span>
                                </div>
                            )}

                            {submission.fileUrl && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                                        {submission.fileName || 'Submission file'}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 px-2"
                                        onClick={() => onDownloadSubmission(submission.fileUrl!)}
                                    >
                                        <Download className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}

                            {submission.grade !== undefined && submission.grade !== null && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                                    <Star className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-800 dark:text-green-200">
                                        Grade: {submission.grade}/{submission.maxMarks} ({Math.round((submission.grade / submission.maxMarks) * 100)}%)
                                    </span>
                                </div>
                            )}

                            {submission.feedback && (
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Feedback:</strong> {submission.feedback}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => onGradeSubmission(submission)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    {submission.grade !== undefined && submission.grade !== null ? 'Edit Grade' : 'Grade'}
                                </Button>

                                {submission.fileUrl && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDownloadSubmission(submission.fileUrl!)}
                                    >
                                        <Download className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
} 