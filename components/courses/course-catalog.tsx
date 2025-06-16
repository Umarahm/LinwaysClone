"use client"

import * as React from "react"
import {
    BookOpen,
    Calendar,
    ChevronDown,
    Clock,
    Filter,
    Search,
    Star,
    Tag,
    Users,
    GraduationCap,
    Award,
    CheckCircle,
    XCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuItem,
    DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface Course {
    id: number
    code: string
    name: string
    description: string
    credits: number
    faculty_name: string
    enrolled_count?: number
    isEnrolled?: boolean
}

interface StudentEnrollmentData {
    enrolled_courses: Course[]
    available_courses: Course[]
    student_stats: {
        gpa: string
        enrolled_count: number
        available_count: number
        graded_assignments: number
    }
}

export function CourseCatalog() {
    const [studentData, setStudentData] = React.useState<StudentEnrollmentData | null>(null)
    const [searchTerm, setSearchTerm] = React.useState("")
    const [selectedDepartment, setSelectedDepartment] = React.useState("all")
    const [isLoading, setIsLoading] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const { toast } = useToast()

    React.useEffect(() => {
        fetchStudentData()
    }, [])

    const fetchStudentData = async () => {
        try {
            const response = await fetch('/api/student/enrollments')
            if (response.ok) {
                const data = await response.json()
                setStudentData(data)
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load course data",
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error fetching student data:', error)
            toast({
                title: "Error",
                description: "Failed to load course data",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    // Combine enrolled and available courses with enrollment status
    const allCourses = React.useMemo(() => {
        if (!studentData) return []

        const enrolledCoursesWithStatus = studentData.enrolled_courses.map(course => ({
            ...course,
            isEnrolled: true
        }))

        const availableCoursesWithStatus = studentData.available_courses.map(course => ({
            ...course,
            isEnrolled: false
        }))

        return [...enrolledCoursesWithStatus, ...availableCoursesWithStatus]
    }, [studentData])

    const filteredCourses = React.useMemo(() => {
        return allCourses.filter((course) => {
            const matchesSearch = course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.faculty_name.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesDepartment = selectedDepartment === "all" ||
                course.code.startsWith(selectedDepartment)

            return matchesSearch && matchesDepartment
        })
    }, [allCourses, searchTerm, selectedDepartment])

    const departments = React.useMemo(() => {
        const depts = Array.from(new Set(allCourses.map(course => course.code.substring(0, 2))))
        return depts.sort()
    }, [allCourses])

    const handleEnroll = async (courseId: number) => {
        setIsLoading(true)

        try {
            const response = await fetch('/api/student/enrollments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ course_id: courseId })
            })

            if (response.ok) {
                const result = await response.json()
                toast({
                    title: "Success!",
                    description: result.message,
                })
                // Refresh the data
                await fetchStudentData()
            } else {
                const error = await response.json()
                toast({
                    title: "Enrollment Failed",
                    description: error.error || "Failed to enroll in course",
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error occurred",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleUnenroll = async (courseId: number) => {
        if (!confirm("Are you sure you want to unenroll from this course?")) return

        setIsLoading(true)

        // For now, show that unenrollment would need to be implemented
        toast({
            title: "Feature Coming Soon",
            description: "Unenrollment functionality will be implemented soon",
            variant: "default"
        })

        setIsLoading(false)
    }

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg">Loading courses...</div>
                </div>
            </div>
        )
    }

    if (!studentData) {
        return (
            <div className="space-y-6">
                <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Unable to Load Courses</h3>
                    <p className="text-muted-foreground">
                        Please try refreshing the page or contact support.
                    </p>
                    <Button onClick={fetchStudentData} className="mt-4">
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="bg-card border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold">Course Catalog</h1>
                        <p className="text-muted-foreground">
                            Discover and enroll in courses for your academic journey
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                            {studentData.student_stats.enrolled_count}
                        </div>
                        <div className="text-sm text-muted-foreground">Enrolled Courses</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                            <span className="font-medium">Available Courses</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {studentData.student_stats.available_count}
                        </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Current GPA</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            {studentData.student_stats.gpa}
                        </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Graded Assignments</span>
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                            {studentData.student_stats.graded_assignments}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search courses by code, name, or instructor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                                {dept} Department
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Course Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className={`transition-all duration-200 hover:shadow-lg ${course.isEnrolled ? 'ring-2 ring-blue-500' : ''}`}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-lg">{course.code}</CardTitle>
                                    <CardDescription className="font-medium text-foreground">
                                        {course.name}
                                    </CardDescription>
                                </div>
                                {course.isEnrolled && (
                                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                        Enrolled
                                    </Badge>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>Prof. {course.faculty_name}</span>
                                <span>•</span>
                                <span>{course.credits} Credits</span>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                {course.description || "Course description not available."}
                            </p>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Enrolled Students:</span>
                                    <span className="font-medium">{course.enrolled_count || 0}</span>
                                </div>

                                <div className="pt-2">
                                    {course.isEnrolled ? (
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => handleUnenroll(course.id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Processing..." : "Unenroll"}
                                        </Button>
                                    ) : (
                                        <Button
                                            className="w-full"
                                            onClick={() => handleEnroll(course.id)}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? "Enrolling..." : "Enroll Now"}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Courses Found</h3>
                        <p className="text-muted-foreground">
                            Try adjusting your search criteria or filters to find more courses.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
} 