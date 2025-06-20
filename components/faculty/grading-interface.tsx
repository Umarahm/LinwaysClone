"use client"

import * as React from "react"
import { Save, Download, FileText, Calendar, User, GraduationCap, RefreshCw, Filter, Search, CheckSquare, Square, Eye, MessageSquare, BarChart3, Users } from "lucide-react"

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

interface BulkGradeData {
    submissionIds: number[]
    grade: string
    feedback: string
}

export function GradingInterface() {
    const { toast } = useToast()
    const [submissions, setSubmissions] = React.useState<Submission[]>([])
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [selectedAssignment, setSelectedAssignment] = React.useState<string>("all")
    const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
    const [searchQuery, setSearchQuery] = React.useState("")
    const [isLoading, setIsLoading] = React.useState(false)
    const [selectedSubmissions, setSelectedSubmissions] = React.useState<Set<number>>(new Set())
    const [bulkGradeOpen, setBulkGradeOpen] = React.useState(false)
    const [bulkGradeData, setBulkGradeData] = React.useState<BulkGradeData>({
        submissionIds: [],
        grade: "",
        feedback: ""
    })
    const [gradingData, setGradingData] = React.useState<{ [key: number]: { grade: string, feedback: string } }>({})
    const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table')
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = React.useState(false)
    const [quickGradeMode, setQuickGradeMode] = React.useState(false)
    const [selectedGradeTemplate, setSelectedGradeTemplate] = React.useState<string>("")

    React.useEffect(() => {
        fetchData()
    }, [])

    // Auto-save functionality
    React.useEffect(() => {
        if (!isAutoSaveEnabled) return

        const autoSaveTimer = setTimeout(() => {
            Object.entries(gradingData).forEach(([submissionId, data]) => {
                if (data.grade && data.grade !== '') {
                    handleSaveGrade(parseInt(submissionId))
                }
            })
        }, 2000) // Auto-save after 2 seconds of inactivity

        return () => clearTimeout(autoSaveTimer)
    }, [gradingData, isAutoSaveEnabled])

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

        // Filter by assignment
        if (selectedAssignment && selectedAssignment !== "all") {
            filtered = filtered.filter(s => s.assignmentId === parseInt(selectedAssignment))
        }

        // Filter by status
        if (selectedStatus && selectedStatus !== "all") {
            filtered = filtered.filter(s => s.status === selectedStatus)
        }

        // Filter by search query
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

    // Keyboard shortcuts
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Ctrl/Cmd + E for export
            if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
                event.preventDefault()
                if (!isLoading && filteredSubmissions.length > 0) {
                    handleExportGrades()
                }
            }
            // Ctrl/Cmd + A for select all
            if ((event.ctrlKey || event.metaKey) && event.key === 'a' && event.target instanceof HTMLElement && !event.target.matches('input, textarea')) {
                event.preventDefault()
                toggleSelectAll()
            }
            // Escape to clear selection
            if (event.key === 'Escape') {
                setSelectedSubmissions(new Set())
                setBulkGradeOpen(false)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isLoading, filteredSubmissions.length])

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
                const submission = submissions.find(s => s.id === submissionId)

                // Send notification to student automatically handled by the grading API

                toast({
                    title: "Success",
                    description: "Grade saved and student notified!",
                })

                // Update local state
                setSubmissions(prev => prev.map(sub =>
                    sub.id === submissionId
                        ? { ...sub, grade: parseInt(data.grade), feedback: data.feedback || '', status: 'graded' as const }
                        : sub
                ))

                // Clear the temporary grading data
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

    const handleExportGrades = async () => {
        try {
            setIsLoading(true)

            toast({
                title: "Export Started",
                description: "Preparing grades for export...",
            })

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
                    description: "No submissions to export with current filters",
                })
                return
            }

            // Convert to Excel format (XLSX)
            const headers = Object.keys(dataToExport[0])

            // Create Excel workbook structure
            const worksheetData = [
                headers, // Header row
                ...dataToExport.map(row => headers.map(header => row[header as keyof typeof row]))
            ]

            // Generate Excel file content (simplified XLSX format)
            const excelContent = generateExcelFile(worksheetData, headers)

            // Create and trigger download
            const blob = new Blob([excelContent], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', `grades_export_${new Date().toISOString().split('T')[0]}.xlsx`)
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            setTimeout(() => {
                toast({
                    title: "Export Successful",
                    description: `Downloaded ${dataToExport.length} records to Excel file`,
                })
            }, 500)

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
            const successCount = results.filter(r => r.ok).length

            if (successCount > 0) {
                toast({
                    title: "Bulk Grading Complete",
                    description: `Successfully graded ${successCount} submissions. Students will be notified automatically.`,
                })

                // Update local state
                setSubmissions(prev => prev.map(sub =>
                    selectedSubmissions.has(sub.id)
                        ? { ...sub, grade: parseInt(bulkGradeData.grade), feedback: bulkGradeData.feedback, status: 'graded' as const }
                        : sub
                ))

                setBulkGradeOpen(false)
                setSelectedSubmissions(new Set())
                setBulkGradeData({ submissionIds: [], grade: "", feedback: "" })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Bulk Grading Failed",
                description: "Failed to grade submissions. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
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

    const gradeTemplates = [
        { label: "Excellent (90-100%)", feedback: "Excellent work! You have demonstrated a thorough understanding of the concepts." },
        { label: "Good (80-89%)", feedback: "Good work! You have shown a solid understanding with minor areas for improvement." },
        { label: "Satisfactory (70-79%)", feedback: "Satisfactory work. Please review the feedback and work on the highlighted areas." },
        { label: "Needs Improvement (60-69%)", feedback: "Your work needs improvement. Please review the concepts and seek help if needed." },
        { label: "Unsatisfactory (<60%)", feedback: "This work does not meet the required standards. Please redo and resubmit." }
    ]

    const applyGradeTemplate = (submissionId: number, maxMarks: number) => {
        const template = gradeTemplates.find(t => t.label === selectedGradeTemplate)
        if (!template) return

        let grade = 0
        if (template.label.includes("90-100%")) grade = Math.round(maxMarks * 0.95)
        else if (template.label.includes("80-89%")) grade = Math.round(maxMarks * 0.85)
        else if (template.label.includes("70-79%")) grade = Math.round(maxMarks * 0.75)
        else if (template.label.includes("60-69%")) grade = Math.round(maxMarks * 0.65)
        else grade = Math.round(maxMarks * 0.50)

        setGradingData(prev => ({
            ...prev,
            [submissionId]: {
                grade: grade.toString(),
                feedback: template.feedback
            }
        }))
    }

    // Generate Excel file content
    const generateExcelFile = (data: any[][], headers: string[]) => {
        // Create a basic XLSX structure
        let excelContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets><sheet name="Grades" sheetId="1" r:id="rId1"/></sheets>
</workbook>`

        // For simplicity, we'll create a CSV-like format that Excel can read
        const csvData = data.map(row =>
            row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        ).join('\n')

        // Add UTF-8 BOM for Excel compatibility  
        const bom = '\uFEFF'
        return new TextEncoder().encode(bom + csvData)
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
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Grading Interface</h2>
                    <p className="text-muted-foreground">
                        Review and grade student submissions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchData} variant="outline" size="sm" disabled={isLoading}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                    <Button
                        onClick={handleExportGrades}
                        variant="outline"
                        size="sm"
                        disabled={isLoading || filteredSubmissions.length === 0}
                    >
                        <Download className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Exporting...' : `Export Excel (${filteredSubmissions.length})`}
                    </Button>
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Settings
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Grading Settings</DialogTitle>
                                <DialogDescription>
                                    Customize your grading experience
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="auto-save"
                                        checked={isAutoSaveEnabled}
                                        onCheckedChange={(checked) => setIsAutoSaveEnabled(checked === true)}
                                    />
                                    <Label htmlFor="auto-save">Enable auto-save (saves after 2 seconds of inactivity)</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="quick-grade"
                                        checked={quickGradeMode}
                                        onCheckedChange={(checked) => setQuickGradeMode(checked === true)}
                                    />
                                    <Label htmlFor="quick-grade">Quick grade mode (Enter to save, Tab to next)</Label>
                                </div>
                                <div>
                                    <Label>Grade Templates</Label>
                                    <Select value={selectedGradeTemplate} onValueChange={setSelectedGradeTemplate}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a grading template" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {gradeTemplates.map((template) => (
                                                <SelectItem key={template.label} value={template.label}>
                                                    {template.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    <h4 className="font-medium mb-2">Keyboard Shortcuts:</h4>
                                    <ul className="space-y-1">
                                        <li>• Ctrl/Cmd + E: Export grades</li>
                                        <li>• Ctrl/Cmd + A: Select all submissions</li>
                                        <li>• Escape: Clear selection</li>
                                    </ul>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
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
                                            disabled={!bulkGradeData.grade}
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

            {/* Auto-save indicator */}
            {isAutoSaveEnabled && (
                <div className="mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        Auto-save enabled - Changes will be saved automatically
                    </div>
                </div>
            )}

            {/* Enhanced Stats Cards */}
            <div className="grid gap-4 md:grid-cols-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <Progress value={100} className="mt-2 h-1" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Graded</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                        <Progress value={stats.total > 0 ? (stats.graded / stats.total) * 100 : 0} className="mt-2 h-1" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                        <Progress value={stats.total > 0 ? (stats.pending / stats.total) * 100 : 0} className="mt-2 h-1" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Late</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.late}</div>
                        <Progress value={stats.total > 0 ? (stats.late / stats.total) * 100 : 0} className="mt-2 h-1" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{Math.round(stats.avgGrade)}%</div>
                        <Progress value={stats.avgGrade} className="mt-2 h-1" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Selected</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{selectedSubmissions.size}</div>
                        <Progress value={stats.total > 0 ? (selectedSubmissions.size / stats.total) * 100 : 0} className="mt-2 h-1" />
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="grading" className="w-full">
                <TabsList>
                    <TabsTrigger value="grading">Grading</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="grading" className="space-y-4">
                    {/* Enhanced Filters */}
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
                                    <Label htmlFor="assignment-filter">Assignment</Label>
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
                                    <Label htmlFor="status-filter">Status</Label>
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
                                    <Label htmlFor="search">Search</Label>
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="search"
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

                    {/* Submissions Display */}
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
                                            <TableHead>Submission</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Grade</TableHead>
                                            <TableHead>Feedback</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
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
                                                        <div className="text-sm text-muted-foreground">{submission.courseCode} - Max: {submission.maxMarks} marks</div>
                                                        <div className="text-sm text-muted-foreground">Due: {new Date(submission.dueDate).toLocaleDateString()}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                                                            <Download className="mr-2 h-4 w-4" />
                                                            {submission.submissionFile}
                                                        </Button>
                                                        <div className="text-sm text-muted-foreground">
                                                            {new Date(submission.submissionDate).toLocaleDateString()}
                                                        </div>
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
                                                        <div className="flex items-center gap-1">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max={submission.maxMarks}
                                                                value={getCurrentGrade(submission.id, submission.grade)}
                                                                onChange={(e) => handleGradeChange(submission.id, e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (quickGradeMode && e.key === 'Enter') {
                                                                        e.preventDefault()
                                                                        handleSaveGrade(submission.id)
                                                                    }
                                                                }}
                                                                className="w-20"
                                                                placeholder="Grade"
                                                            />
                                                            {selectedGradeTemplate && (
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => applyGradeTemplate(submission.id, submission.maxMarks)}
                                                                    className="h-8 px-2"
                                                                    title="Apply selected template"
                                                                >
                                                                    T
                                                                </Button>
                                                            )}
                                                        </div>
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
                                                    <div className="flex gap-1">
                                                        <Button
                                                            onClick={() => handleSaveGrade(submission.id)}
                                                            disabled={isLoading || !gradingData[submission.id]?.grade}
                                                            size="sm"
                                                            variant={gradingData[submission.id]?.grade ? "default" : "outline"}
                                                            className={gradingData[submission.id]?.grade ? "bg-green-600 hover:bg-green-700" : ""}
                                                        >
                                                            <Save className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                // Future: Open submission preview
                                                                toast({
                                                                    title: "Preview",
                                                                    description: "Submission preview coming soon!"
                                                                })
                                                            }}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Grading Progress</CardTitle>
                                <CardDescription>
                                    Track your grading completion status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Completed</span>
                                            <span>{stats.graded}/{stats.total} ({stats.total > 0 ? Math.round((stats.graded / stats.total) * 100) : 0}%)</span>
                                        </div>
                                        <Progress value={stats.total > 0 ? (stats.graded / stats.total) * 100 : 0} className="h-3" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 pt-2">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">{stats.graded}</div>
                                            <div className="text-xs text-muted-foreground">Graded</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
                                            <div className="text-xs text-muted-foreground">Pending</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-600">{stats.late}</div>
                                            <div className="text-xs text-muted-foreground">Late</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Overview</CardTitle>
                                <CardDescription>
                                    Grade distribution and performance metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600">{Math.round(stats.avgGrade)}%</div>
                                        <div className="text-sm text-muted-foreground">Average Grade</div>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { label: "Excellent (90%+)", color: "bg-green-500", count: filteredSubmissions.filter(s => s.grade && (s.grade / s.maxMarks) >= 0.9).length },
                                            { label: "Good (80-89%)", color: "bg-blue-500", count: filteredSubmissions.filter(s => s.grade && (s.grade / s.maxMarks) >= 0.8 && (s.grade / s.maxMarks) < 0.9).length },
                                            { label: "Average (70-79%)", color: "bg-yellow-500", count: filteredSubmissions.filter(s => s.grade && (s.grade / s.maxMarks) >= 0.7 && (s.grade / s.maxMarks) < 0.8).length },
                                            { label: "Below Average (<70%)", color: "bg-red-500", count: filteredSubmissions.filter(s => s.grade && (s.grade / s.maxMarks) < 0.7).length }
                                        ].map((item) => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className={`w-3 h-3 rounded ${item.color}`}></div>
                                                    {item.label}
                                                </div>
                                                <span className="text-sm font-medium">{item.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                            <CardDescription>
                                Useful actions for efficient grading
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-2 md:grid-cols-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedStatus("submitted")}
                                    className="h-auto p-3 flex flex-col gap-1"
                                >
                                    <Calendar className="h-4 w-4" />
                                    <span className="text-xs">Show Pending</span>
                                    <span className="text-lg font-bold">{stats.pending}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedStatus("late")}
                                    className="h-auto p-3 flex flex-col gap-1"
                                >
                                    <Calendar className="h-4 w-4 text-red-500" />
                                    <span className="text-xs">Show Late</span>
                                    <span className="text-lg font-bold">{stats.late}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedStatus("graded")}
                                    className="h-auto p-3 flex flex-col gap-1"
                                >
                                    <GraduationCap className="h-4 w-4 text-green-500" />
                                    <span className="text-xs">Show Graded</span>
                                    <span className="text-lg font-bold">{stats.graded}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedStatus("all")
                                        setSelectedAssignment("all")
                                        setSearchQuery("")
                                    }}
                                    className="h-auto p-3 flex flex-col gap-1"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="text-xs">Reset Filters</span>
                                    <span className="text-lg font-bold">{stats.total}</span>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
} 