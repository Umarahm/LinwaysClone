"use client"

import * as React from "react"
import { Calendar, FileText, Upload, Filter, CheckCircle, Clock, AlertCircle, BookOpen, Download, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton, AssignmentCardSkeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

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
    fileUrl?: string
}

export function AssignmentsSubmission() {
    const { toast } = useToast()
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
    const [uploadingId, setUploadingId] = React.useState<number | null>(null)
    const [filterStatus, setFilterStatus] = React.useState<"all" | "pending" | "submitted">("all")
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // Fetch assignments from API
    React.useEffect(() => {
        fetchAssignments()
    }, [])

    const fetchAssignments = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/student/assignments')
            const data = await response.json()

            if (data.success) {
                setAssignments(data.assignments)
            } else {
                setError(data.message || 'Failed to fetch assignments')
            }
        } catch (error) {
            console.error('Error fetching assignments:', error)
            setError('Failed to fetch assignments. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleFileUpload = async (assignmentId: number) => {
        if (!selectedFile) {
            toast({
                variant: "warning",
                title: "No File Selected",
                description: "Please select a file to upload",
            })
            return
        }

        const maxSize = 10 * 1024 * 1024 // 10MB
        if (selectedFile.size > maxSize) {
            toast({
                variant: "warning",
                title: "File Too Large",
                description: "File size too large. Maximum 10MB allowed.",
            })
            return
        }

        setUploadingId(assignmentId)

        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            formData.append('assignmentId', assignmentId.toString())

            const response = await fetch('/api/student/assignments', {
                method: 'POST',
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                // Update assignment status locally
                setAssignments(assignments.map(assignment =>
                    assignment.id === assignmentId
                        ? {
                            ...assignment,
                            submissionStatus: 'submitted' as const,
                            submittedFile: selectedFile.name,
                            submittedAt: data.submission.submittedAt
                        }
                        : assignment
                ))

                toast({
                    variant: "success",
                    title: "Assignment Submitted",
                    description: "Assignment submitted successfully!",
                })
                setSelectedFile(null)
            } else {
                toast({
                    variant: "warning",
                    title: "Submission Failed",
                    description: data.message || "Failed to submit assignment",
                })
            }
        } catch (error) {
            console.error('Upload error:', error)
            toast({
                variant: "warning",
                title: "Upload Failed",
                description: "Failed to upload file. Please try again.",
            })
        } finally {
            setUploadingId(null)
        }
    }

    const handleDownloadFile = async (fileUrl: string) => {
        try {
            const response = await fetch(`/api/files/${fileUrl}`)

            if (response.ok) {
                // Get the filename from the Content-Disposition header or use a default
                const contentDisposition = response.headers.get('Content-Disposition')
                let filename = 'download'

                if (contentDisposition) {
                    const matches = contentDisposition.match(/filename="(.+)"/)
                    if (matches) {
                        filename = matches[1]
                    }
                }

                // Create blob and download
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

    const handleDownloadSubmittedFile = async (assignmentId: number) => {
        try {
            // Find the assignment to get the submitted file URL
            const assignment = assignments.find(a => a.id === assignmentId)
            if (!assignment?.submittedFile) {
                toast({
                    variant: "warning",
                    title: "File Not Found",
                    description: "No submitted file found",
                })
                return
            }

            // For now, we'll construct the file URL based on the pattern used in the API
            // In a real implementation, you'd store the full file URL in the database
            const submissionFileUrl = `uploads/submissions/${assignment.submittedFile}`

            const response = await fetch(`/api/files/${submissionFileUrl}`)

            if (response.ok) {
                // Get the filename from the Content-Disposition header or use the submitted filename
                const contentDisposition = response.headers.get('Content-Disposition')
                let filename = assignment.submittedFile

                if (contentDisposition) {
                    const matches = contentDisposition.match(/filename="(.+)"/)
                    if (matches) {
                        filename = matches[1]
                    }
                }

                // Create blob and download
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
                    description: errorData.message || "Failed to download submitted file",
                })
            }
        } catch (error) {
            console.error('Download submitted file error:', error)
            toast({
                variant: "warning",
                title: "Download Failed",
                description: "Failed to download submitted file. Please try again.",
            })
        }
    }

    const getDueDateStatus = (dueDate: string, status: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (status === "submitted" || status === "late_submitted") {
            return { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", text: "Submitted", icon: CheckCircle }
        } else if (diffDays < 0) {
            return { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", text: "Overdue", icon: AlertCircle }
        } else if (diffDays <= 3) {
            return { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", text: `Due in ${diffDays} days`, icon: Clock }
        } else {
            return { color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300", text: `Due in ${diffDays} days`, icon: Clock }
        }
    }

    const filteredAssignments = React.useMemo(() => {
        switch (filterStatus) {
            case "pending":
                return assignments.filter(a => a.submissionStatus === "not_submitted")
            case "submitted":
                return assignments.filter(a => a.submissionStatus === "submitted" || a.submissionStatus === "late_submitted")
            default:
                return assignments
        }
    }, [assignments, filterStatus])

    const stats = React.useMemo(() => {
        const total = assignments.length
        const submitted = assignments.filter(a => a.submissionStatus === "submitted" || a.submissionStatus === "late_submitted").length
        const pending = assignments.filter(a => a.submissionStatus === "not_submitted").length
        const overdue = assignments.filter(a => {
            const today = new Date()
            const due = new Date(a.dueDate)
            return due < today && a.submissionStatus === "not_submitted"
        }).length

        return { total, submitted, pending, overdue }
    }, [assignments])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto p-6 space-y-6">
                    {/* Header Skeleton */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                            <Skeleton variant="shimmer" className="h-8 w-[200px]" />
                            <Skeleton variant="shimmer" className="h-4 w-[280px]" />
                        </div>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} className="border-0">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton variant="shimmer" className="h-3 w-[60px] bg-white/40" />
                                            <Skeleton variant="shimmer" className="h-6 w-[30px] bg-white/50" />
                                        </div>
                                        <Skeleton variant="shimmer" className="h-6 w-6 bg-white/40" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Filter Tabs Skeleton */}
                    <div className="space-y-6">
                        <div className="flex space-x-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <Skeleton key={i} variant="shimmer" className="h-10 w-[120px] rounded" />
                            ))}
                        </div>

                        {/* Assignment Cards Skeleton */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <Skeleton variant="shimmer" className="h-5 w-[160px]" />
                                                <div className="flex items-center gap-2">
                                                    <Skeleton variant="shimmer" className="h-4 w-4" />
                                                    <Skeleton variant="shimmer" className="h-4 w-[100px]" />
                                                </div>
                                            </div>
                                            <Skeleton variant="shimmer" className="h-6 w-[80px] rounded-full" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Skeleton variant="shimmer" className="h-4 w-full" />
                                            <Skeleton variant="shimmer" className="h-4 w-[80%]" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Skeleton variant="shimmer" className="h-4 w-4" />
                                                <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton variant="shimmer" className="h-4 w-4" />
                                                <Skeleton variant="shimmer" className="h-4 w-[60px]" />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {Math.random() > 0.5 ? (
                                                <Skeleton variant="shimmer" className="h-9 w-[100px] rounded" />
                                            ) : (
                                                <>
                                                    <Skeleton variant="shimmer" className="h-9 flex-1 rounded" />
                                                    <Skeleton variant="shimmer" className="h-9 w-[100px] rounded" />
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Assignments</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">{error}</p>
                            <Button onClick={fetchAssignments} className="bg-blue-600 hover:bg-blue-700">
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
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Assignments</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Track and submit your course assignments</p>
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
                                    <p className="text-green-100 text-sm font-medium">Submitted</p>
                                    <p className="text-2xl font-bold">{stats.submitted}</p>
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
                                    <p className="text-red-100 text-sm font-medium">Overdue</p>
                                    <p className="text-2xl font-bold">{stats.overdue}</p>
                                </div>
                                <AlertCircle className="w-6 h-6 text-red-200" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Tabs */}
                <Tabs value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
                        <TabsTrigger value="all" className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            All ({stats.total})
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pending ({stats.pending})
                        </TabsTrigger>
                        <TabsTrigger value="submitted" className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Submitted ({stats.submitted})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        <AssignmentGrid
                            assignments={filteredAssignments}
                            onFileUpload={handleFileUpload}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            uploadingId={uploadingId}
                            getDueDateStatus={getDueDateStatus}
                            onDownloadFile={handleDownloadFile}
                            onDownloadSubmittedFile={handleDownloadSubmittedFile}
                        />
                    </TabsContent>

                    <TabsContent value="pending" className="mt-6">
                        <AssignmentGrid
                            assignments={filteredAssignments}
                            onFileUpload={handleFileUpload}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            uploadingId={uploadingId}
                            getDueDateStatus={getDueDateStatus}
                            onDownloadFile={handleDownloadFile}
                            onDownloadSubmittedFile={handleDownloadSubmittedFile}
                        />
                    </TabsContent>

                    <TabsContent value="submitted" className="mt-6">
                        <AssignmentGrid
                            assignments={filteredAssignments}
                            onFileUpload={handleFileUpload}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            uploadingId={uploadingId}
                            getDueDateStatus={getDueDateStatus}
                            onDownloadFile={handleDownloadFile}
                            onDownloadSubmittedFile={handleDownloadSubmittedFile}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

interface AssignmentGridProps {
    assignments: Assignment[]
    onFileUpload: (id: number) => void
    selectedFile: File | null
    setSelectedFile: (file: File | null) => void
    uploadingId: number | null
    getDueDateStatus: (dueDate: string, status: string) => { color: string; text: string; icon: any }
    onDownloadFile: (fileUrl: string) => void
    onDownloadSubmittedFile: (assignmentId: number) => void
}

function AssignmentGrid({
    assignments,
    onFileUpload,
    selectedFile,
    setSelectedFile,
    uploadingId,
    getDueDateStatus,
    onDownloadFile,
    onDownloadSubmittedFile
}: AssignmentGridProps) {
    if (assignments.length === 0) {
        return (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No assignments found</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                        No assignments match your current filter criteria.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {assignments.map((assignment) => {
                const dueDateInfo = getDueDateStatus(assignment.dueDate, assignment.submissionStatus)
                const StatusIcon = dueDateInfo.icon
                const canUpload = assignment.submissionStatus === "not_submitted"

                return (
                    <Card key={assignment.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {assignment.title}
                                    </CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{assignment.courseCode}</span>
                                        <span className="text-gray-400">•</span>
                                        <span>{assignment.courseName}</span>
                                    </div>
                                </div>
                                <Badge className={dueDateInfo.color}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {dueDateInfo.text}
                                </Badge>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {assignment.description}
                            </p>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                    <Calendar className="w-4 h-4" />
                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    Max: {assignment.maxMarks} pts
                                </div>
                            </div>

                            {assignment.fileUrl && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-800 dark:text-blue-200">
                                        Assignment materials available
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto h-6 px-2"
                                        onClick={() => onDownloadFile(assignment.fileUrl!)}
                                    >
                                        <Download className="w-3 h-3" />
                                    </Button>
                                </div>
                            )}

                            {(assignment.submissionStatus === "submitted" || assignment.submissionStatus === "late_submitted") && assignment.grade && (
                                <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-md">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-800 dark:text-green-200">
                                        Grade: {assignment.grade}/{assignment.maxMarks} ({Math.round((assignment.grade / assignment.maxMarks) * 100)}%)
                                    </span>
                                </div>
                            )}

                            {assignment.feedback && (
                                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        <strong>Feedback:</strong> {assignment.feedback}
                                    </p>
                                </div>
                            )}

                            {assignment.submittedAt && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Submitted on {new Date(assignment.submittedAt).toLocaleDateString()} at {new Date(assignment.submittedAt).toLocaleTimeString()}
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                {canUpload ? (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Submission
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle>Submit Assignment</DialogTitle>
                                            </DialogHeader>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium">{assignment.title}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.courseName}</p>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="file">Select File</Label>
                                                    <Input
                                                        id="file"
                                                        type="file"
                                                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                                        accept=".pdf,.doc,.docx,.zip,.txt,.jpg,.png"
                                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                    />
                                                    {selectedFile && (
                                                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                                                            <FileText className="w-4 h-4 text-blue-600" />
                                                            <div className="flex-1">
                                                                <span className="text-sm text-blue-800 dark:text-blue-200 block">
                                                                    {selectedFile.name}
                                                                </span>
                                                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setSelectedFile(null)}
                                                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" onClick={() => setSelectedFile(null)}>
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        onClick={() => onFileUpload(assignment.id)}
                                                        disabled={!selectedFile || uploadingId === assignment.id}
                                                        className="bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {uploadingId === assignment.id ? "Uploading..." : "Submit"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                ) : (
                                    <Button variant="outline" className="flex-1" disabled>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Submitted
                                    </Button>
                                )}

                                {assignment.submittedFile && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDownloadSubmittedFile(assignment.id)}
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