"use client"

import * as React from "react"
import {
    BookOpen,
    FileText,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    Award,
    Bell,
    CheckCircle,
    AlertCircle,
    Target,
    GraduationCap
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface DashboardSummaryCardsProps {
    userRole: 'student' | 'faculty' | 'admin'
}

interface StudentEnrollmentData {
    enrolled_courses: any[]
    available_courses: any[]
    student_stats: {
        gpa: string
        enrolled_count: number
        available_count: number
        graded_assignments: number
    }
}

// Memoized loading skeleton component
const LoadingSkeleton = React.memo(() => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </CardContent>
            </Card>
        ))}
    </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export const DashboardSummaryCards = React.memo(function DashboardSummaryCards({ userRole }: DashboardSummaryCardsProps) {
    const [users, setUsers] = React.useState<any[]>([]);
    const [courses, setCourses] = React.useState<any[]>([]);
    const [announcements, setAnnouncements] = React.useState<any[]>([]);
    const [studentData, setStudentData] = React.useState<StudentEnrollmentData | null>(null);
    const [loading, setLoading] = React.useState(true);

    // Memoize expensive calculations
    const userStats = React.useMemo(() => {
        const studentUsers = users.filter(user => user.role === 'student');
        const facultyUsers = users.filter(user => user.role === 'faculty');
        return { studentUsers, facultyUsers };
    }, [users]);

    // Memoized fetch function to prevent recreation on every render
    const fetchData = React.useCallback(async () => {
        try {
            setLoading(true);
            if (userRole === 'student') {
                // For students, fetch student-specific enrollment data
                const [studentResponse, announcementsResponse] = await Promise.all([
                    fetch('/api/student/enrollments'),
                    fetch(`/api/announcements?role=${userRole}`)
                ]);

                if (studentResponse.ok) {
                    const studentDataResult = await studentResponse.json();
                    setStudentData(studentDataResult);
                }

                if (announcementsResponse.ok) {
                    const announcementsData = await announcementsResponse.json();
                    setAnnouncements(announcementsData.announcements || []);
                }
            } else {
                // For faculty and admin, fetch general data
                const [usersResponse, coursesResponse, announcementsResponse] = await Promise.all([
                    fetch('/api/admin/users'),
                    fetch('/api/admin/courses'),
                    fetch(`/api/announcements?role=${userRole}`)
                ]);

                if (usersResponse.ok) {
                    const usersData = await usersResponse.json();
                    setUsers(usersData.users || []);
                }

                if (coursesResponse.ok) {
                    const coursesData = await coursesResponse.json();
                    setCourses(coursesData.courses || []);
                }

                if (announcementsResponse.ok) {
                    const announcementsData = await announcementsResponse.json();
                    setAnnouncements(announcementsData.announcements || []);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [userRole]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (userRole === 'student') {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Available Courses - Now using real data */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Available Courses</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {studentData?.student_stats.available_count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Courses to enroll in
                        </p>
                    </CardContent>
                </Card>

                {/* Enrolled Courses - Now using real data */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            {studentData?.student_stats.enrolled_count || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This semester
                        </p>
                    </CardContent>
                </Card>

                {/* GPA - Now using real calculated data */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
                        <Award className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {studentData?.student_stats.gpa || "0.0"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Out of 4.0 ({studentData?.student_stats.graded_assignments || 0} assignments)
                        </p>
                    </CardContent>
                </Card>

                {/* Announcements */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {announcements.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recent updates
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (userRole === 'faculty') {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Courses Taught */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Courses Taught</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {courses.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This semester
                        </p>
                    </CardContent>
                </Card>

                {/* Total Students */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {userStats.studentUsers.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all courses
                        </p>
                    </CardContent>
                </Card>

                {/* Pending Grading */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            7
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Assignments to grade
                        </p>
                    </CardContent>
                </Card>

                {/* Announcements */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Announcements</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {announcements.length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Recent updates
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Users */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                        {users.length}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                            {userStats.studentUsers.length} Students
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                            {userStats.facultyUsers.length} Faculty
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Total Courses */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        {courses.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Active courses
                    </p>
                </CardContent>
            </Card>

            {/* System Status */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        Healthy
                    </div>
                    <p className="text-xs text-muted-foreground">
                        All systems operational
                    </p>
                </CardContent>
            </Card>

            {/* Announcements */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Announcements</CardTitle>
                    <Bell className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {announcements.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Recent updates
                    </p>
                </CardContent>
            </Card>
        </div>
    )
});
