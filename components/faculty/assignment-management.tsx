"use client"

import * as React from "react"
import { Plus, Edit, Trash2, Calendar, FileText, Users, Upload } from "lucide-react"

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
    maxMarks: number
    file: File | null
}

export function AssignmentManagement() {
    const [assignments, setAssignments] = React.useState<Assignment[]>([])
    const [courses, setCourses] = React.useState<Course[]>([])
    const [isLoading, setIsLoading] = React.useState(false)

    const [formData, setFormData] = React.useState<AssignmentFormData>({
        title: "",
        courseId: "",
        description: "",
        dueDate: "",
        maxMarks: 100,
        file: null
    })

    // Mock data - replace with actual API calls
    React.useEffect(() => {
        setCourses([
            { id: 1, code: "CS201", name: "Data Structures & Algorithms", enrolledStudents: 45 },
            { id: 2, code: "CS301", name: "Database Management Systems", enrolledStudents: 38 },
            { id: 3, code: "IT401", name: "Web Development", enrolledStudents: 52 },
        ])

        setAssignments([
            {
                id: 1,
                title: "Binary Search Tree Implementation",
                courseCode: "CS201",
                courseName: "Data Structures & Algorithms",
                description: "Implement BST with all operations",
                dueDate: "2024-12-20",
                maxMarks: 100,
                submissionsCount: 32,
                totalStudents: 45,
                createdAt: "2024-12-01"
            },
            {
                id: 2,
                title: "Database Design Project",
                courseCode: "CS301",
                courseName: "Database Management Systems",
                description: "Design a complete database schema for an e-commerce application",
                dueDate: "2024-12-25",
                maxMarks: 150,
                submissionsCount: 28,
                totalStudents: 38,
                createdAt: "2024-12-03"
            },
            {
                id: 3,
                title: "React Portfolio Website",
                courseCode: "IT401",
                courseName: "Web Development",
                description: "Create a personal portfolio using React and modern web technologies",
                dueDate: "2024-12-30",
                maxMarks: 200,
                submissionsCount: 41,
                totalStudents: 52,
                createdAt: "2024-12-05"
            }
        ])
    }, [])

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        const selectedCourse = courses.find(c => c.id === parseInt(formData.courseId))

        // Simulate API call
        setTimeout(() => {
            const newAssignment: Assignment = {
                id: assignments.length + 1,
                title: formData.title,
                courseCode: selectedCourse?.code || "",
                courseName: selectedCourse?.name || "",
                description: formData.description,
                dueDate: formData.dueDate,
                maxMarks: formData.maxMarks,
                submissionsCount: 0,
                totalStudents: selectedCourse?.enrolledStudents || 0,
                createdAt: new Date().toISOString().split('T')[0]
            }

            setAssignments([...assignments, newAssignment])
            setFormData({
                title: "",
                courseId: "",
                description: "",
                dueDate: "",
                maxMarks: 100,
                file: null
            })
            setIsLoading(false)
        }, 1000)
    }

    const handleDeleteAssignment = async (assignmentId: number) => {
        if (!confirm("Are you sure you want to delete this assignment?")) return

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setAssignments(assignments.filter(assignment => assignment.id !== assignmentId))
            setIsLoading(false)
        }, 1000)
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
        const percentage = Math.round((submitted / total) * 100)
        return { percentage, submitted, total }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setFormData({ ...formData, file })
    }

    return (
        <div className="space-y-6 bg-background text-foreground">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Assignment Management</h2>
                <p className="text-muted-foreground">
                    Create and manage assignments for your courses
                </p>
            </div>

            {/* Create Assignment Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Create New Assignment</CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new assignment
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                                    value={formData.maxMarks}
                                    onChange={(e) => setFormData({ ...formData, maxMarks: parseInt(e.target.value) })}
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
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.txt"
                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <Upload className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Upload assignment instructions or reference materials (PDF, DOC, DOCX, TXT)
                            </p>
                        </div>

                        <Button type="submit" disabled={isLoading || !formData.courseId}>
                            {isLoading ? "Creating..." : "Create Assignment"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{assignments.reduce((acc, a) => acc + a.submissionsCount, 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Submission Rate</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {assignments.length > 0
                                ? Math.round((assignments.reduce((acc, a) => acc + (a.submissionsCount / a.totalStudents), 0) / assignments.length) * 100)
                                : 0}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Due This Week</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {assignments.filter(a => {
                                const dueDate = new Date(a.dueDate)
                                const today = new Date()
                                const diffTime = dueDate.getTime() - today.getTime()
                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                return diffDays <= 7 && diffDays >= 0
                            }).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Assignments Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Assignments</CardTitle>
                    <CardDescription>
                        View and manage all your assignments
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Max Marks</TableHead>
                                <TableHead>Submissions</TableHead>
                                <TableHead>Progress</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {assignments.map((assignment) => {
                                const dueDateInfo = getDueDateStatus(assignment.dueDate)
                                const progressInfo = getSubmissionProgress(assignment.submissionsCount, assignment.totalStudents)

                                return (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{assignment.title}</div>
                                                <div className="text-sm text-muted-foreground">{assignment.description}</div>
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
                                                <div className="font-medium">{new Date(assignment.dueDate).toLocaleDateString()}</div>
                                                <Badge className={dueDateInfo.color}>
                                                    {dueDateInfo.text}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{assignment.maxMarks}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                {assignment.submissionsCount} / {assignment.totalStudents}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>{progressInfo.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${progressInfo.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="sm">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteAssignment(assignment.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </Button>
                                            </div>
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