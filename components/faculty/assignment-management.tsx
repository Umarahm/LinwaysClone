"use client"

import * as React from "react"
import { Plus, Edit, Trash2, Calendar, FileText, Users, Clock, BookOpen, AlertCircle, Upload, X, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { AssignmentSubmissions } from "@/components/faculty/assignment-submissions"

interface Assignment {
    id: number
    title: string
    courseCode: string
    courseName: string
    description: string
    dueDate: string
    maxMarks: number
    submissionsCount: number
    totalStudents: number
    fileUrl?: string
    createdAt: string
}

interface Course {
    id: number
    code: string
    name: string
    enrolledStudents: number
}

interface AssignmentFormData {
    title: string
    courseId: string
    description: string
    dueDate: string
    maxMarks: number | ""
    file: File | null
}

export function AssignmentManagement() {
    console.log('AssignmentManagement component rendered with updated UI')
    const { toast } = useToast()
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [courses, setCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [fetchLoading, setFetchLoading] = React.useState(true)
    const [selectedCourse, setSelectedCourse] = React.useState<string>("all")
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [editingAssignment, setEditingAssignment] = React.useState<Assignment | null>(null)

    const [formData, setFormData] = React.useState<AssignmentFormData>({
        title: "",
        courseId: "",
        description: "",
        dueDate: "",
        maxMarks: 100,
        file: null
    })

    // Fetch faculty-specific data
    React.useEffect(() => {
        fetchFacultyData()
    }, [])

    const fetchFacultyData = async () => {
        try {
            setFetchLoading(true)

            // Fetch faculty courses
            const coursesResponse = await fetch('/api/faculty/courses')
            if (coursesResponse.ok) {
                const coursesData = await coursesResponse.json()
                const coursesWithEnrollment = await Promise.all(
                    coursesData.courses.map(async (course: any) => {
                        try {
                            const enrollmentResponse = await fetch(`/api/courses/${course.id}/enrollment-count`)
                            const enrollmentData = await enrollmentResponse.json()
                            return {
                                id: course.id,
                                code: course.code,
                                name: course.name,
                                enrolledStudents: enrollmentData.count || 0
                            }
                        } catch (error) {
                            return {
                                id: course.id,
                                code: course.code,
                                name: course.name,
                                enrolledStudents: 0
                            }
                        }
                    })
                )
                setCourses(coursesWithEnrollment)
            }

            // Fetch faculty assignments
            const assignmentsResponse = await fetch('/api/faculty/assignments')
            if (assignmentsResponse.ok) {
                const assignmentsData = await assignmentsResponse.json()
                setAssignments(assignmentsData.assignments || [])
            }
        } catch (error) {
            console.error('Error fetching faculty data:', error)
        } finally {
            setFetchLoading(false)
        }
    }

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            // Create FormData to handle file upload
            const formDataToSend = new FormData()
            formDataToSend.append('title', formData.title)
            formDataToSend.append('courseId', formData.courseId)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('dueDate', formData.dueDate)
            formDataToSend.append('maxMarks', (typeof formData.maxMarks === "number" ? formData.maxMarks : 100).toString())

            // Add file if present
            if (formData.file) {
                formDataToSend.append('file', formData.file)
            }

            const response = await fetch('/api/faculty/assignments', {
                method: 'POST',
                body: formDataToSend, // Don't set Content-Type header for FormData
            })

            if (response.ok) {
                const newAssignment = await response.json()
                await fetchFacultyData() // Refresh data
                setFormData({
                    title: "",
                    courseId: "",
                    description: "",
                    dueDate: "",
                    maxMarks: 100,
                    file: null
                })
                setIsCreateModalOpen(false)
            } else {
                console.error('Failed to create assignment')
            }
        } catch (error) {
            console.error('Error creating assignment:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditAssignment = (assignment: Assignment) => {
        setEditingAssignment(assignment)
        setFormData({
            title: assignment.title,
            courseId: courses.find(c => c.code === assignment.courseCode)?.id.toString() || "",
            description: assignment.description,
            dueDate: new Date(assignment.dueDate).toISOString().slice(0, 16),
            maxMarks: assignment.maxMarks,
            file: null
        })
        setIsEditModalOpen(true)
    }

    const handleUpdateAssignment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingAssignment) return

        setIsLoading(true)

        try {
            // Create FormData to handle file upload
            const formDataToSend = new FormData()
            formDataToSend.append('title', formData.title)
            formDataToSend.append('courseId', formData.courseId)
            formDataToSend.append('description', formData.description)
            formDataToSend.append('dueDate', formData.dueDate)
            formDataToSend.append('maxMarks', (typeof formData.maxMarks === "number" ? formData.maxMarks : 100).toString())

            // Add file if present
            if (formData.file) {
                formDataToSend.append('file', formData.file)
            }

            const response = await fetch(`/api/faculty/assignments/${editingAssignment.id}`, {
                method: 'PUT',
                body: formDataToSend,
            })

            if (response.ok) {
                await fetchFacultyData() // Refresh data
                setFormData({
                    title: "",
                    courseId: "",
                    description: "",
                    dueDate: "",
                    maxMarks: 100,
                    file: null
                })
                setEditingAssignment(null)
                setIsEditModalOpen(false)
            } else {
                console.error('Failed to update assignment')
            }
        } catch (error) {
            console.error('Error updating assignment:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteAssignment = async (assignmentId: number) => {
        if (!confirm("Are you sure you want to delete this assignment?")) return

        setIsLoading(true)

        try {
            const response = await fetch(`/api/faculty/assignments/${assignmentId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setAssignments(assignments.filter(assignment => assignment.id !== assignmentId))
            } else {
                console.error('Failed to delete assignment')
            }
        } catch (error) {
            console.error('Error deleting assignment:', error)
        } finally {
            setIsLoading(false)
        }
    }



    const getDueDateStatus = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
            return { status: "overdue", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", text: "Overdue" }
        } else if (diffDays <= 3) {
            return { status: "due-soon", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", text: `Due in ${diffDays} days` }
        } else {
            return { status: "active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", text: `Due in ${diffDays} days` }
        }
    }

    const getSubmissionProgress = (submitted: number, total: number) => {
        const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0
        return { percentage, submitted, total }
    }

    // Filter assignments by course
    const filteredAssignments = selectedCourse === "all"
        ? assignments
        : assignments.filter(assignment => assignment.courseCode === selectedCourse)

    // Get unique course codes for tabs
    const courseTabs = React.useMemo(() => {
        const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseCode)))
        return uniqueCourses.map(code => {
            const course = assignments.find(a => a.courseCode === code)
            return {
                code,
                name: course?.courseName || code
            }
        })
    }, [assignments])

    // Calculate stats
    const totalAssignments = assignments.length
    const totalSubmissions = assignments.reduce((acc, a) => acc + a.submissionsCount, 0)
    const avgSubmissionRate = assignments.length > 0
        ? Math.round((assignments.reduce((acc, a) => acc + (a.submissionsCount / Math.max(a.totalStudents, 1)), 0) / assignments.length) * 100)
        : 0
    const overdueAssignments = assignments.filter(a => {
        const today = new Date()
        const due = new Date(a.dueDate)
        return due < today
    }).length

    if (fetchLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-foreground">Loading assignments...</div>
            </div>
        )
    }

    return (
        <div className="space-y-6 bg-background text-foreground p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Assignment Management</h2>
                    <p className="text-muted-foreground">
                        Create, manage assignments and review student submissions
                    </p>
                </div>
            </div>

            <Tabs defaultValue="manage" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="manage" className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Manage Assignments
                    </TabsTrigger>
                    <TabsTrigger value="submissions" className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Review Submissions
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manage" className="space-y-6">
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                        <div className="max-w-7xl mx-auto p-6 space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignment Management</h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage assignments for your courses</p>
                                </div>
                                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Assignment
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-[600px]">
                                        <DialogHeader>
                                            <DialogTitle>Create New Assignment</DialogTitle>
                                            <DialogDescription>
                                                Fill in the details below to create a new assignment for your students.
                                            </DialogDescription>
                                        </DialogHeader>

                                        <form onSubmit={handleCreateAssignment} className="space-y-4">
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Assignment Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={formData.title}
                                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                        placeholder="Enter assignment title"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="courseId">Course</Label>
                                                    <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select course" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {courses.map((course) => (
                                                                <SelectItem key={course.id} value={course.id.toString()}>
                                                                    {course.code} - {course.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="description">Description</Label>
                                                <Textarea
                                                    id="description"
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    placeholder="Enter assignment description and requirements"
                                                    rows={4}
                                                    required
                                                />
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="dueDate">Due Date</Label>
                                                    <Input
                                                        id="dueDate"
                                                        type="datetime-local"
                                                        value={formData.dueDate}
                                                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="maxMarks">Maximum Marks</Label>
                                                    <Input
                                                        id="maxMarks"
                                                        type="number"
                                                        value={formData.maxMarks || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            if (value === "") {
                                                                setFormData({ ...formData, maxMarks: "" })
                                                            } else {
                                                                const numValue = parseInt(value)
                                                                if (!isNaN(numValue) && numValue > 0) {
                                                                    setFormData({ ...formData, maxMarks: numValue })
                                                                }
                                                            }
                                                        }}
                                                        min="1"
                                                        max="1000"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="file">Assignment File (Optional)</Label>
                                                <div className="flex items-center gap-4">
                                                    <Input
                                                        id="file"
                                                        type="file"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0] || null
                                                            if (file) {
                                                                // Check file size (10MB limit)
                                                                const maxSize = 10 * 1024 * 1024 // 10MB
                                                                if (file.size > maxSize) {
                                                                    toast({
                                                                        variant: "warning",
                                                                        title: "File Too Large",
                                                                        description: "File size too large. Maximum 10MB allowed.",
                                                                    })
                                                                    e.target.value = "" // Clear the input
                                                                    return
                                                                }
                                                            }
                                                            setFormData({ ...formData, file })
                                                        }}
                                                        accept=".pdf,.doc,.docx,.txt,.zip,.rar,.ppt,.pptx"
                                                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
                                                    />
                                                    <Upload className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                {formData.file && (
                                                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                                                        <FileText className="h-4 w-4 text-blue-600" />
                                                        <div className="flex-1">
                                                            <span className="text-sm text-blue-800 dark:text-blue-200 block">
                                                                {formData.file.name}
                                                            </span>
                                                            <span className="text-xs text-blue-600 dark:text-blue-400">
                                                                {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setFormData({ ...formData, file: null })}
                                                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                                <p className="text-sm text-muted-foreground">
                                                    Upload assignment instructions, reference materials, or templates (PDF, DOC, DOCX, TXT, ZIP, etc.)
                                                </p>
                                            </div>

                                            <div className="flex justify-end gap-3 pt-4">
                                                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                                    {isLoading ? "Creating..." : "Create Assignment"}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-blue-100 text-sm font-medium">Total Assignments</p>
                                                <p className="text-2xl font-bold">{totalAssignments}</p>
                                            </div>
                                            <FileText className="w-6 h-6 text-blue-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-green-100 text-sm font-medium">Total Submissions</p>
                                                <p className="text-2xl font-bold">{totalSubmissions}</p>
                                            </div>
                                            <Users className="w-6 h-6 text-green-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-amber-100 text-sm font-medium">Avg. Submission Rate</p>
                                                <p className="text-2xl font-bold">{avgSubmissionRate}%</p>
                                            </div>
                                            <Users className="w-6 h-6 text-amber-200" />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-red-100 text-sm font-medium">Overdue</p>
                                                <p className="text-2xl font-bold">{overdueAssignments}</p>
                                            </div>
                                            <AlertCircle className="w-6 h-6 text-red-200" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <Label htmlFor="course-filter" className="text-sm font-medium">Filter by Course</Label>
                                    <select
                                        id="course-filter"
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    >
                                        <option value="all">All Courses</option>
                                        {courseTabs.map((course) => (
                                            <option key={course.code} value={course.code}>
                                                {course.code} - {course.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Assignments Grid */}
                            <AssignmentGrid
                                assignments={filteredAssignments}
                                onEdit={handleEditAssignment}
                                onDelete={handleDeleteAssignment}
                            />
                        </div>
                    </div>

                    {/* Edit Assignment Modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Edit Assignment</DialogTitle>
                                <DialogDescription>
                                    Update the assignment details below.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleUpdateAssignment} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-title">Assignment Title</Label>
                                        <Input
                                            id="edit-title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder="Enter assignment title"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-courseId">Course</Label>
                                        <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select course" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {courses.map((course) => (
                                                    <SelectItem key={course.id} value={course.id.toString()}>
                                                        {course.code} - {course.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Textarea
                                        id="edit-description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Enter assignment description and requirements"
                                        rows={4}
                                        required
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-dueDate">Due Date</Label>
                                        <Input
                                            id="edit-dueDate"
                                            type="datetime-local"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-maxMarks">Maximum Marks</Label>
                                        <Input
                                            id="edit-maxMarks"
                                            type="number"
                                            value={formData.maxMarks || ""}
                                            onChange={(e) => {
                                                const value = e.target.value
                                                if (value === "") {
                                                    setFormData({ ...formData, maxMarks: "" })
                                                } else {
                                                    const numValue = parseInt(value)
                                                    if (!isNaN(numValue) && numValue > 0) {
                                                        setFormData({ ...formData, maxMarks: numValue })
                                                    }
                                                }
                                            }}
                                            min="1"
                                            max="1000"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-file">Update Assignment File (Optional)</Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="edit-file"
                                            type="file"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null
                                                if (file) {
                                                    // Check file size (10MB limit)
                                                    const maxSize = 10 * 1024 * 1024 // 10MB
                                                    if (file.size > maxSize) {
                                                        toast({
                                                            variant: "warning",
                                                            title: "File Too Large",
                                                            description: "File size too large. Maximum 10MB allowed.",
                                                        })
                                                        e.target.value = "" // Clear the input
                                                        return
                                                    }
                                                }
                                                setFormData({ ...formData, file })
                                            }}
                                            accept=".pdf,.doc,.docx,.txt,.zip,.rar,.ppt,.pptx"
                                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950 dark:file:text-blue-300"
                                        />
                                        <Upload className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    {editingAssignment?.fileUrl && !formData.file && (
                                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-md">
                                            <FileText className="h-4 w-4 text-gray-600" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Current file: {editingAssignment.fileUrl.split('/').pop()}
                                            </span>
                                            <Badge variant="outline" className="text-xs">
                                                Existing
                                            </Badge>
                                        </div>
                                    )}
                                    {formData.file && (
                                        <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <div className="flex-1">
                                                <span className="text-sm text-blue-800 dark:text-blue-200 block">
                                                    {formData.file.name}
                                                </span>
                                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setFormData({ ...formData, file: null })}
                                                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Upload new file to replace existing assignment materials (PDF, DOC, DOCX, TXT, ZIP, etc.)
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button type="button" variant="outline" onClick={() => {
                                        setIsEditModalOpen(false)
                                        setEditingAssignment(null)
                                        setFormData({
                                            title: "",
                                            courseId: "",
                                            description: "",
                                            dueDate: "",
                                            maxMarks: 100,
                                            file: null
                                        })
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                                        {isLoading ? "Updating..." : "Update Assignment"}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                <TabsContent value="submissions" className="space-y-6">
                    <AssignmentSubmissions />
                </TabsContent>
            </Tabs>
        </div>
    )
}

interface AssignmentGridProps {
    assignments: Assignment[]
    onEdit: (assignment: Assignment) => void
    onDelete: (id: number) => void
}

function AssignmentGrid({ assignments, onEdit, onDelete }: AssignmentGridProps) {
    const getDueDateStatus = (dueDate: string) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays < 0) {
            return { status: "overdue", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300", text: "Overdue" }
        } else if (diffDays <= 3) {
            return { status: "due-soon", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300", text: `Due in ${diffDays} days` }
        } else {
            return { status: "active", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300", text: `Due in ${diffDays} days` }
        }
    }

    const getSubmissionProgress = (submitted: number, total: number) => {
        const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0
        return { percentage, submitted, total }
    }

    if (assignments.length === 0) {
        return (
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No assignments found</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                        Create your first assignment to get started.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {assignments.map((assignment) => {
                const dueDateInfo = getDueDateStatus(assignment.dueDate)
                const progressInfo = getSubmissionProgress(assignment.submissionsCount, assignment.totalStudents)

                return (
                    <Card key={assignment.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{assignment.title}</CardTitle>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                        <BookOpen className="w-4 h-4" />
                                        <span>{assignment.courseCode}</span>
                                        <span className="text-gray-400">•</span>
                                        <span>{assignment.courseName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <Badge variant="secondary" className="text-xs">
                                            {assignment.maxMarks} pts
                                        </Badge>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(assignment)}
                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(assignment.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {assignment.description}
                            </p>

                            {assignment.fileUrl && (
                                <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-md">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm text-blue-800 dark:text-blue-200 flex-1">
                                        Assignment file attached
                                    </span>
                                    <Badge variant="secondary" className="text-xs">
                                        File
                                    </Badge>
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                <span className="text-gray-600 dark:text-gray-400">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                <Badge className={dueDateInfo.color}>
                                    {dueDateInfo.text}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                        <Users className="w-4 h-4" />
                                        <span>Submissions</span>
                                    </div>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {progressInfo.submitted}/{progressInfo.total} ({progressInfo.percentage}%)
                                    </span>
                                </div>
                                <Progress value={progressInfo.percentage} className="w-full" />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onEdit(assignment)}
                                    className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onDelete(assignment.id)}
                                    className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-950"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
} 