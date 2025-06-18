"use client"

import * as React from "react"
import { Save, Download, FileText, Calendar, User, GraduationCap, RefreshCw, Search, CheckSquare, Square, Eye, BarChart3, Users } from "lucide-react"

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
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

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
    courseCode: string
    courseName: string
    dueDate: string
}

interface Assignment {
    id: number
    title: string
    courseCode: string
    maxMarks: number
    dueDate: string
    submissionCount: number
    totalStudents: number
}

interface GradingStats {
    total: number
    graded: number
    pending: number
    late: number
    avgGrade: number
}

export function EnhancedGradingInterface() {
    const { toast } = useToast()
    const [submissions, setSubmissions] = React.useState<Submission[]>([])
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [selectedAssignment, setSelectedAssignment] = React.useState<string>("all")
    const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedSubmissions, setSelectedSubmissions] = React.useState<Set<number>>(new Set())
    const [bulkGradeOpen, setBulkGradeOpen] = React.useState(false)
    const [bulkGradeData, setBulkGradeData] = React.useState({
        grade: "",
        feedback: ""
    })
    const [gradingData, setGradingData] = React.useState<{ [key: number]: { grade: string, feedback: string } }>({})
    const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table')

    React.useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setIsLoading(true)

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
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: submissionsData.message || 'Failed to fetch submissions',
                })
            }
        } catch (error) {
            console.error('Error fetching data:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: 'Failed to fetch data. Please try again.',
            })
        } finally {
            setIsLoading(false)
        }
    }

    const filteredSubmissions = React.useMemo(() => {
        let filtered = submissions

        if (selectedAssignment && selectedAssignment !== "all") {
            filtered = filtered.filter(s => s.assignmentId === parseInt(selectedAssignment))
        }

        if (selectedStatus && selectedStatus !== "all") {
            filtered = filtered.filter(s => s.status === selectedStatus)
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(s =>
                s.studentName.toLowerCase().includes(query) ||
                s.studentEmail.toLowerCase().includes(query) ||
                s.assignmentTitle.toLowerCase().includes(query) ||
                s.courseCode.toLowerCase().includes(query)
            )
        }

        return filtered
    }, [submissions, selectedAssignment, selectedStatus, searchQuery])

    const handleExportGrades = async () => {
        try {
            setIsLoading(true)

            const dataToExport = filteredSubmissions.map(submission => ({
                'Student Name': submission.studentName,
                'Student Email': submission.studentEmail,
                'Assignment': submission.assignmentTitle,
                'Course': submission.courseCode,
                'Grade': submission.grade?.toString() || 'Not Graded',
                'Max Marks': submission.maxMarks.toString(),
                'Percentage': submission.grade ? Math.round((submission.grade / submission.maxMarks) * 100) + '%' : 'N/A',
                'Status': submission.status,
                'Submission Date': new Date(submission.submissionDate).toLocaleDateString(),
                'Due Date': new Date(submission.dueDate).toLocaleDateString(),
                'Feedback': submission.feedback || 'No feedback'
            }))

            if (dataToExport.length === 0) {
                toast({
                    variant: "destructive",
                    title: "No Data",
                    description: "No submissions to export",
                })
                return
            }

            // Convert to CSV
            const headers = Object.keys(dataToExport[0])
            const csvContent = [
                headers.join(','),
                ...dataToExport.map(row =>
                    headers.map(header => {
                        const value = row[header as keyof typeof row]
                        return `"${String(value).replace(/"/g, '""')}"`
                    }).join(',')
                )
            ].join('\n')

            // Add UTF-8 BOM for Excel compatibility
            const bom = '\uFEFF'
            const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })

            // Create and trigger download
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `grades_export_${new Date().toISOString().split('T')[0]}.csv`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            toast({
                title: "Export Successful",
                description: `Exported ${dataToExport.length} records to CSV`,
            })
        } catch (error) {
            console.error('Export error:', error)
            toast({
                variant: "destructive",
                title: "Export Failed",
                description: "Failed to export grades. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleBulkGrade = async () => {
        if (!bulkGradeData.grade || selectedSubmissions.size === 0) return

        try {
            setIsLoading(true)
            const promises = Array.from(selectedSubmissions).map(submissionId =>
                fetch('/api/faculty/submissions/grade', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        submissionId,
                        grade: parseInt(bulkGradeData.grade),
                        feedback: bulkGradeData.feedback
                    })
                })
            )

            const results = await Promise.all(promises)
            const successfulResults = await Promise.all(
                results.map(async (result, index) => {
                    if (result.ok) {
                        return { success: true, index }
                    } else {
                        const error = await result.json()
                        return { success: false, index, error }
                    }
                })
            )

            const successCount = successfulResults.filter(r => r.success).length

            if (successCount > 0) {
                toast({
                    title: "Bulk Grading Complete",
                    description: `Successfully graded ${successCount} out of ${selectedSubmissions.size} submissions`,
                })

                // Update local state for successful grades
                setSubmissions(prev => prev.map(sub =>
                    selectedSubmissions.has(sub.id)
                        ? { ...sub, grade: parseInt(bulkGradeData.grade), feedback: bulkGradeData.feedback, status: 'graded' as const }
                        : sub
                ))

                setBulkGradeOpen(false)
                setSelectedSubmissions(new Set())
                setBulkGradeData({ grade: "", feedback: "" })
            } else {
                toast({
                    variant: "destructive",
                    title: "Bulk Grading Failed",
                    description: "No submissions were successfully graded",
                })
            }
        } catch (error) {
            console.error('Bulk grading error:', error)
            toast({
                variant: "destructive",
                title: "Bulk Grading Failed",
                description: "Failed to grade submissions. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveGrade = async (submissionId: number) => {
        const data = gradingData[submissionId]
        if (!data?.grade) return

        try {
            setIsLoading(true)
            const response = await fetch('/api/faculty/submissions/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionId,
                    grade: parseInt(data.grade),
                    feedback: data.feedback || ''
                })
            })

            const result = await response.json()

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Grade saved successfully!",
                })

                setSubmissions(prev => prev.map(sub =>
                    sub.id === submissionId
                        ? { ...sub, grade: parseInt(data.grade), feedback: data.feedback || '', status: 'graded' as const }
                        : sub
                ))

                setGradingData(prev => {
                    const updated = { ...prev }
                    delete updated[submissionId]
                    return updated
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.message || "Failed to save grade",
                })
            }
        } catch (error) {
            console.error('Grading error:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save grade. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

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

    const toggleSubmissionSelection = (submissionId: number) => {
        setSelectedSubmissions(prev => {
            const updated = new Set(prev)
            if (updated.has(submissionId)) {
                updated.delete(submissionId)
            } else {
                updated.add(submissionId)
            }
            return updated
        })
    }

    const toggleSelectAll = () => {
        if (selectedSubmissions.size === filteredSubmissions.length) {
            setSelectedSubmissions(new Set())
        } else {
            setSelectedSubmissions(new Set(filteredSubmissions.map(s => s.id)))
        }
    }

    const getCurrentGrade = (submissionId: number, currentGrade: number | null) => {
        return gradingData[submissionId]?.grade || currentGrade?.toString() || ""
    }

    const getCurrentFeedback = (submissionId: number, currentFeedback: string) => {
        return gradingData[submissionId]?.feedback || currentFeedback || ""
    }

    const getGradeColor = (grade: number, maxMarks: number) => {
        const percentage = (grade / maxMarks) * 100
        if (percentage >= 90) return 'text-green-600 dark:text-green-400'
        if (percentage >= 80) return 'text-blue-600 dark:text-blue-400'
        if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400'
        if (percentage >= 60) return 'text-orange-600 dark:text-orange-400'
        return 'text-red-600 dark:text-red-400'
    }

    const stats: GradingStats = React.useMemo(() => {
        const total = filteredSubmissions.length
        const graded = filteredSubmissions.filter(s => s.status === 'graded').length
        const pending = filteredSubmissions.filter(s => s.status === 'submitted').length
        const late = filteredSubmissions.filter(s => s.status === 'late').length
        const avgGrade = filteredSubmissions.filter(s => s.grade !== null).reduce((acc, s) => acc + (s.grade || 0), 0) / filteredSubmissions.filter(s => s.grade !== null).length || 0

        return { total, graded, pending, late, avgGrade }
    }, [filteredSubmissions])

    const renderCardView = () => (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    checked={selectedSubmissions.has(submission.id)}
                                    onCheckedChange={() => toggleSubmissionSelection(submission.id)}
                                />
                                <div>
                                    <CardTitle className="text-base">{submission.studentName}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{submission.studentEmail}</p>
                                </div>
                            </div>
                            <Badge variant={
                                submission.status === 'graded' ? 'default' :
                                    submission.status === 'late' ? 'destructive' : 'secondary'
                            }>
                                {submission.status === 'graded' ? 'Graded' :
                                    submission.status === 'late' ? 'Late' : 'Pending'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="font-medium text-sm">{submission.assignmentTitle}</p>
                            <p className="text-xs text-muted-foreground">{submission.courseCode}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="0"
                                max={submission.maxMarks}
                                value={getCurrentGrade(submission.id, submission.grade)}
                                onChange={(e) => handleGradeChange(submission.id, e.target.value)}
                                className="w-20 h-8"
                                placeholder="Grade"
                            />
                            <span className="text-sm text-muted-foreground">/ {submission.maxMarks}</span>
                        </div>
                        <Textarea
                            value={getCurrentFeedback(submission.id, submission.feedback)}
                            onChange={(e) => handleFeedbackChange(submission.id, e.target.value)}
                            placeholder="Feedback..."
                            rows={2}
                            className="text-sm"
                        />
                        <div className="flex gap-2">
                            <Button
                                onClick={() => handleSaveGrade(submission.id)}
                                disabled={isLoading || !gradingData[submission.id]?.grade}
                                size="sm"
                                className="flex-1"
                            >
                                <Save className="h-3 w-3 mr-1" />
                                Save
                            </Button>
                            <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )

    return (
        <div className="space-y-6 bg-background text-foreground">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Enhanced Grading Interface</h2>
                    <p className="text-muted-foreground">
                        Review and grade student submissions with advanced features
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm" disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button onClick={handleExportGrades} variant="outline" size="sm" disabled={isLoading}>
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    {selectedSubmissions.size > 0 && (
                        <Dialog open={bulkGradeOpen} onOpenChange={setBulkGradeOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <CheckSquare className="h-4 w-4 mr-2" />
                                    Bulk Grade ({selectedSubmissions.size})
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Bulk Grade Submissions</DialogTitle>
                                    <DialogDescription>
                                        Grade {selectedSubmissions.size} selected submissions at once
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="bulk-grade">Grade</Label>
                                        <Input
                                            id="bulk-grade"
                                            type="number"
                                            value={bulkGradeData.grade}
                                            onChange={(e) => setBulkGradeData(prev => ({ ...prev, grade: e.target.value }))}
                                            placeholder="Enter grade"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="bulk-feedback">Feedback (Optional)</Label>
                                        <Textarea
                                            id="bulk-feedback"
                                            value={bulkGradeData.feedback}
                                            onChange={(e) => setBulkGradeData(prev => ({ ...prev, feedback: e.target.value }))}
                                            placeholder="Enter feedback for all selected submissions"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="outline" onClick={() => setBulkGradeOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleBulkGrade}
                                            disabled={!bulkGradeData.grade || isLoading}
                                        >
                                            Grade All
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid gap-4 md:grid-cols-6">
                {[
                    { label: 'Total', value: stats.total, icon: FileText, progress: 100 },
                    { label: 'Graded', value: stats.graded, icon: GraduationCap, progress: stats.total > 0 ? (stats.graded / stats.total) * 100 : 0, color: 'text-green-600' },
                    { label: 'Pending', value: stats.pending, icon: Calendar, progress: stats.total > 0 ? (stats.pending / stats.total) * 100 : 0, color: 'text-orange-600' },
                    { label: 'Late', value: stats.late, icon: Calendar, progress: stats.total > 0 ? (stats.late / stats.total) * 100 : 0, color: 'text-red-600' },
                    { label: 'Average', value: `${Math.round(stats.avgGrade)}%`, icon: BarChart3, progress: stats.avgGrade },
                    { label: 'Selected', value: selectedSubmissions.size, icon: Users, progress: stats.total > 0 ? (selectedSubmissions.size / stats.total) * 100 : 0, color: 'text-blue-600' }
                ].map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${stat.color || ''}`}>{stat.value}</div>
                            <Progress value={stat.progress} className="mt-2 h-1" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="grading" className="w-full">
                <TabsList>
                    <TabsTrigger value="grading">Grading</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="grading" className="space-y-4">
                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">Filters & View</CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant={viewMode === 'table' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('table')}
                                    >
                                        Table
                                    </Button>
                                    <Button
                                        variant={viewMode === 'cards' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setViewMode('cards')}
                                    >
                                        Cards
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div>
                                    <Label>Assignment</Label>
                                    <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
                                        <SelectTrigger>
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
                                <div>
                                    <Label>Status</Label>
                                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All statuses</SelectItem>
                                            <SelectItem value="submitted">Pending Review</SelectItem>
                                            <SelectItem value="graded">Graded</SelectItem>
                                            <SelectItem value="late">Late Submissions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search students, assignments..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedAssignment("all")
                                            setSelectedStatus("all")
                                            setSearchQuery("")
                                            setSelectedSubmissions(new Set())
                                        }}
                                        className="w-full"
                                    >
                                        Clear All
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submissions */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Student Submissions</CardTitle>
                                    <CardDescription>
                                        Review and grade submissions ({filteredSubmissions.length} results)
                                    </CardDescription>
                                </div>
                                {filteredSubmissions.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={toggleSelectAll}
                                    >
                                        {selectedSubmissions.size === filteredSubmissions.length ? (
                                            <>
                                                <CheckSquare className="h-4 w-4 mr-2" />
                                                Deselect All
                                            </>
                                        ) : (
                                            <>
                                                <Square className="h-4 w-4 mr-2" />
                                                Select All
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {filteredSubmissions.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
                                    <p className="text-muted-foreground">
                                        {submissions.length === 0
                                            ? "No submissions have been made yet."
                                            : "Try adjusting your filters to see more results."
                                        }
                                    </p>
                                </div>
                            ) : viewMode === 'cards' ? renderCardView() : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedSubmissions.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            </TableHead>
                                            <TableHead>Student</TableHead>
                                            <TableHead>Assignment</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Feedback</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSubmissions.map((submission) => (
                                            <TableRow key={submission.id} className={selectedSubmissions.has(submission.id) ? "bg-muted/50" : ""}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedSubmissions.has(submission.id)}
                                                        onCheckedChange={() => toggleSubmissionSelection(submission.id)}
                                                    />
                                                </TableCell>
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
                                                        <div className="text-sm text-muted-foreground">{submission.courseCode}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={
                                                        submission.status === 'graded' ? 'default' :
                                                            submission.status === 'late' ? 'destructive' : 'secondary'
                                                    }>
                                                        {submission.status === 'graded' ? 'Graded' :
                                                            submission.status === 'late' ? 'Late' : 'Pending'}
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
                                                        <span className="text-sm text-muted-foreground">/{submission.maxMarks}</span>
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
                                                <TableCell>
                                                    <Button
                                                        onClick={() => handleSaveGrade(submission.id)}
                                                        disabled={isLoading || !gradingData[submission.id]?.grade}
                                                        size="sm"
                                                    >
                                                        <Save className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grading Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-medium mb-2">Grading Progress</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Graded</span>
                                                <span>{stats.graded}/{stats.total}</span>
                                            </div>
                                            <Progress value={stats.total > 0 ? (stats.graded / stats.total) * 100 : 0} />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-medium mb-2">Performance</h4>
                                        <div className="text-sm text-muted-foreground">
                                            Average Grade: {Math.round(stats.avgGrade)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 