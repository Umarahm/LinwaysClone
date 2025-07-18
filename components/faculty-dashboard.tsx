"use client"

import * as React from "react"
import { BookOpen, Users, FileText, TrendingUp, Clock, Calendar, GraduationCap, BarChart3, Award, Target } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton, DashboardHeroSkeleton, TimetableSkeleton, CourseGridSkeleton, StatsCardSkeleton } from "@/components/ui/skeleton"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import { MiniTimetable } from "@/components/faculty/mini-timetable"
import { Progress } from "@/components/ui/progress"
import designSystem from '@/university_design_system.json'

const DS = designSystem.designSystem;

interface Course {
    id: number;
    code: string;
    name: string;
    faculty_name: string;
    all_faculty_names?: string;
    is_primary?: boolean;
    credits: number;
    created_at: string;
}

interface FacultyDashboardProps {
    user?: {
        id: number;
        email: string;
        fullName: string;
        role: string;
        department: string;
    };
}

export function FacultyDashboard({ user }: FacultyDashboardProps) {
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [stats, setStats] = React.useState({
        totalStudents: 0,
        pendingAssignments: 0,
        totalAssignments: 0,
    });

    React.useEffect(() => {
        fetchFacultyData();
    }, []);

    const fetchFacultyData = async () => {
        try {
            // Fetch courses assigned to this faculty
            const coursesResponse = await fetch(`/api/faculty/courses`);
            if (coursesResponse.ok) {
                const coursesData = await coursesResponse.json();
                setCourses(coursesData.courses || []);
            }

            // Fetch faculty stats
            const statsResponse = await fetch('/api/faculty/stats');
            if (statsResponse.ok) {
                const statsData = await statsResponse.json();
                setStats(statsData.stats || {
                    totalStudents: 0,
                    pendingAssignments: 0,
                    totalAssignments: 0,
                });
            }
        } catch (error) {
            console.error('Error fetching faculty data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div
                className="animated-gradient-bg dashboard-light-gradient relative overflow-hidden"
                style={{
                    minHeight: DS.layout.structure.mainContent.minHeight,
                    fontFamily: DS.typography.fontFamily.primary,
                    backgroundColor: `hsl(var(--background))`,
                    padding: DS.spacing[4],
                    paddingTop: '0'
                }}
            >
                {/* Light Mode Background Gradient */}
                <div className="background-gradient"></div>

                {/* Animated Background Elements */}
                <div className="gradient-orb"></div>
                <div className="gradient-orb"></div>
                <div className="gradient-orb"></div>
                <div className="gradient-mesh"></div>

                <div className="max-w-7xl mx-auto relative z-10" style={{ paddingTop: DS.spacing[6] }}>
                    {/* Hero Section Skeleton */}
                    <div className="faculty-glass faculty-shimmer subtle-wave glow-effect skeleton-glass p-8 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton variant="shimmer" className="h-12 w-12 rounded-2xl bg-white/20" />
                                    <div className="space-y-2">
                                        <Skeleton variant="shimmer" className="h-8 w-[320px] bg-white/20" />
                                        <Skeleton variant="shimmer" className="h-5 w-[220px] bg-white/15" />
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="faculty-glass p-4 rounded-lg space-y-2 text-center backdrop-blur border border-white/20">
                                        <Skeleton variant="shimmer" className="h-4 w-4 mx-auto bg-white/25" />
                                        <Skeleton variant="shimmer" className="h-6 w-[40px] mx-auto bg-white/25" />
                                        <Skeleton variant="shimmer" className="h-3 w-[60px] mx-auto bg-white/20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Course Cards Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="faculty-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Skeleton variant="shimmer" className="h-6 w-[80px] bg-white/25" />
                                        <Skeleton variant="shimmer" className="h-5 w-[60px] rounded-full bg-white/20" />
                                    </div>
                                    <Skeleton variant="shimmer" className="h-5 w-full bg-white/20" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton variant="shimmer" className="h-4 w-[80px] bg-white/20" />
                                            <Skeleton variant="shimmer" className="h-4 w-[40px] bg-white/20" />
                                        </div>
                                        <div className="flex justify-between">
                                            <Skeleton variant="shimmer" className="h-4 w-[100px] bg-white/20" />
                                            <Skeleton variant="shimmer" className="h-4 w-[60px] bg-white/20" />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Skeleton variant="shimmer" className="h-8 w-[120px] rounded bg-white/20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mini Timetable Skeleton */}
                    <div className="faculty-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Skeleton variant="shimmer" className="h-6 w-6 rounded bg-white/25" />
                                <Skeleton variant="shimmer" className="h-6 w-[150px] bg-white/25" />
                            </div>
                            <div className="space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-white/20 bg-white/5">
                                        <Skeleton variant="shimmer" className="h-4 w-[60px] bg-white/20" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton variant="shimmer" className="h-4 w-[140px] bg-white/25" />
                                            <Skeleton variant="shimmer" className="h-3 w-[100px] bg-white/20" />
                                        </div>
                                        <Skeleton variant="shimmer" className="h-6 w-[80px] rounded-full bg-white/25" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Teaching Insights Skeleton */}
                        <div className="faculty-glass rounded-3xl overflow-hidden glow-effect skeleton-glass">
                            <div className="p-6 bg-white/10 border-b border-white/20">
                                <div className="flex items-center gap-3">
                                    <Skeleton variant="shimmer" className="h-5 w-5 bg-white/25" />
                                    <Skeleton variant="shimmer" className="h-6 w-[140px] bg-white/25" />
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Skeleton variant="shimmer" className="h-4 w-[120px] bg-white/20" />
                                        <Skeleton variant="shimmer" className="h-4 w-[40px] bg-white/20" />
                                    </div>
                                    <Skeleton variant="shimmer" className="h-2 w-full rounded-full bg-white/20" />
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions Skeleton */}
                        <div className="faculty-glass rounded-3xl overflow-hidden glow-effect skeleton-glass">
                            <div className="p-6 bg-white/10 border-b border-white/20">
                                <div className="flex items-center gap-3">
                                    <Skeleton variant="shimmer" className="h-5 w-5 bg-white/25" />
                                    <Skeleton variant="shimmer" className="h-6 w-[120px] bg-white/25" />
                                </div>
                            </div>
                            <div className="p-6 space-y-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
                                        <Skeleton variant="shimmer" className="h-8 w-8 rounded bg-white/25" />
                                        <div className="flex-1">
                                            <Skeleton variant="shimmer" className="h-4 w-[140px] bg-white/20" />
                                        </div>
                                        <Skeleton variant="shimmer" className="h-4 w-4 rounded bg-white/20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const completionRate = stats.totalAssignments > 0 ? ((stats.totalAssignments - stats.pendingAssignments) / stats.totalAssignments) * 100 : 0;
    const totalCredits = courses.reduce((acc, course) => acc + course.credits, 0);

    return (
        <div
            className="animated-gradient-bg dashboard-light-gradient relative overflow-hidden"
            style={{
                minHeight: DS.layout.structure.mainContent.minHeight,
                fontFamily: DS.typography.fontFamily.primary,
                backgroundColor: `hsl(var(--background))`,
                padding: DS.spacing[4],
                paddingTop: '0'
            }}
        >
            {/* Light Mode Background Gradient */}
            <div className="background-gradient"></div>

            {/* Animated Background Elements */}
            <div className="gradient-orb"></div>
            <div className="gradient-orb"></div>
            <div className="gradient-orb"></div>
            <div className="gradient-mesh"></div>

            {/* Hero Section - Profile Header Card Pattern */}
            <div className="max-w-7xl mx-auto relative z-10" style={{ paddingTop: DS.spacing[6] }}>
                <div
                    className="faculty-glass faculty-shimmer subtle-wave glow-effect"
                    style={{
                        ...DS.components.cards.profile,
                        borderRadius: DS.components.cards.elevated.borderRadius,
                        padding: DS.spacing[8],
                        marginBottom: DS.spacing[8],
                    }}
                >
                    <div
                        className="flex flex-col lg:flex-row lg:items-center lg:justify-between"
                        style={{ gap: DS.spacing[6] }}
                    >
                        <div className="flex-1" style={{ gap: DS.spacing[3] }}>
                            <div className="flex items-center" style={{ gap: DS.spacing[3] }}>
                                <div
                                    className="faculty-floating backdrop-blur-sm flex items-center justify-center breathing-glow"
                                    style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: DS.components.cards.elevated.borderRadius,
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    }}
                                >
                                    <GraduationCap
                                        className="text-white"
                                        style={{
                                            width: DS.iconography.sizes.lg,
                                            height: DS.iconography.sizes.lg
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1
                                        className="text-white"
                                        style={{
                                            fontSize: DS.typography.fontSizes['4xl'],
                                            fontWeight: DS.typography.fontWeights.bold,
                                            lineHeight: DS.typography.lineHeights.tight,
                                        }}
                                    >
                                        Welcome back, {user?.fullName?.split(' ')[0] || 'Professor'}! 👋
                                    </h1>
                                    <p
                                        className="text-white/80"
                                        style={{
                                            fontSize: DS.typography.fontSizes.lg,
                                            fontWeight: DS.typography.fontWeights.medium,
                                        }}
                                    >
                                        {user?.department && `${user.department} Department`} • Ready to inspire minds today?
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats Overview Section following dashboard pattern */}
                        <div
                            className="grid grid-cols-2 lg:grid-cols-4"
                            style={{ gap: DS.spacing[4] }}
                        >
                            <div
                                className="faculty-glass text-center glow-effect"
                                style={{
                                    borderRadius: DS.components.cards.elevated.borderRadius,
                                    padding: DS.spacing[4],
                                }}
                            >
                                <div
                                    className="flex items-center justify-center"
                                    style={{ marginBottom: DS.spacing[2] }}
                                >
                                    <BookOpen
                                        className="text-white/80"
                                        style={{
                                            width: DS.iconography.sizes.md,
                                            height: DS.iconography.sizes.md,
                                            marginRight: DS.spacing[2]
                                        }}
                                    />
                                </div>
                                <div
                                    className="text-white"
                                    style={{
                                        fontSize: DS.typography.fontSizes['2xl'],
                                        fontWeight: DS.typography.fontWeights.bold,
                                    }}
                                >
                                    {courses.length}
                                </div>
                                <div
                                    className="text-white/80"
                                    style={{ fontSize: DS.typography.fontSizes.sm }}
                                >
                                    Active Courses
                                </div>
                            </div>

                            <div
                                className="faculty-glass text-center glow-effect"
                                style={{
                                    borderRadius: DS.components.cards.elevated.borderRadius,
                                    padding: DS.spacing[4],
                                }}
                            >
                                <div
                                    className="flex items-center justify-center"
                                    style={{ marginBottom: DS.spacing[2] }}
                                >
                                    <Clock
                                        className="text-white/80"
                                        style={{
                                            width: DS.iconography.sizes.md,
                                            height: DS.iconography.sizes.md,
                                            marginRight: DS.spacing[2]
                                        }}
                                    />
                                </div>
                                <div
                                    className="text-white"
                                    style={{
                                        fontSize: DS.typography.fontSizes['2xl'],
                                        fontWeight: DS.typography.fontWeights.bold,
                                    }}
                                >
                                    {totalCredits}
                                </div>
                                <div
                                    className="text-white/80"
                                    style={{ fontSize: DS.typography.fontSizes.sm }}
                                >
                                    Credit Hours
                                </div>
                            </div>

                            <div
                                className="faculty-glass text-center glow-effect"
                                style={{
                                    borderRadius: DS.components.cards.elevated.borderRadius,
                                    padding: DS.spacing[4],
                                }}
                            >
                                <div
                                    className="flex items-center justify-center"
                                    style={{ marginBottom: DS.spacing[2] }}
                                >
                                    <FileText
                                        className="text-white/80"
                                        style={{
                                            width: DS.iconography.sizes.md,
                                            height: DS.iconography.sizes.md,
                                            marginRight: DS.spacing[2]
                                        }}
                                    />
                                </div>
                                <div
                                    className="text-white"
                                    style={{
                                        fontSize: DS.typography.fontSizes['2xl'],
                                        fontWeight: DS.typography.fontWeights.bold,
                                    }}
                                >
                                    {stats.pendingAssignments}
                                </div>
                                <div
                                    className="text-white/80"
                                    style={{ fontSize: DS.typography.fontSizes.sm }}
                                >
                                    Pending Grading
                                </div>
                            </div>

                            <div
                                className="faculty-glass text-center glow-effect"
                                style={{
                                    borderRadius: DS.components.cards.elevated.borderRadius,
                                    padding: DS.spacing[4],
                                }}
                            >
                                <div
                                    className="flex items-center justify-center"
                                    style={{ marginBottom: DS.spacing[2] }}
                                >
                                    <Users
                                        className="text-white/80"
                                        style={{
                                            width: DS.iconography.sizes.md,
                                            height: DS.iconography.sizes.md,
                                            marginRight: DS.spacing[2]
                                        }}
                                    />
                                </div>
                                <div
                                    className="text-white"
                                    style={{
                                        fontSize: DS.typography.fontSizes['2xl'],
                                        fontWeight: DS.typography.fontWeights.bold,
                                    }}
                                >
                                    {stats.totalStudents}
                                </div>
                                <div
                                    className="text-white/80"
                                    style={{ fontSize: DS.typography.fontSizes.sm }}
                                >
                                    Total Students
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Today's Schedule */}
                <div className="mb-8">
                    {user && (
                        <div className="faculty-glass rounded-3xl p-6 glow-effect subtle-wave">
                            <div className="flex items-center gap-3 mb-6">
                                <Calendar className="w-6 h-6 text-white" />
                                <h2 className="text-2xl font-bold text-white">Today's Schedule</h2>
                            </div>
                            <MiniTimetable userId={user.id} userRole={user.role} />
                        </div>
                    )}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Courses Section - Takes up 2 columns */}
                    <div className="xl:col-span-2 space-y-6">
                        <Card className="faculty-glass border-0 rounded-3xl overflow-hidden glow-effect">
                            <CardHeader className="border-b border-white/20 bg-white/10 subtle-wave">
                                <CardTitle className="flex items-center gap-3 text-white text-xl">
                                    <BookOpen className="w-6 h-6" />
                                    My Courses
                                    <Badge className="bg-white/20 text-white border-white/30">{courses.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto faculty-table-scroll">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/20 hover:bg-white/5">
                                                <TableHead className="text-white/90 font-semibold">Course</TableHead>
                                                <TableHead className="text-white/90 font-semibold">Faculty</TableHead>
                                                <TableHead className="text-white/90 font-semibold">Credits</TableHead>
                                                <TableHead className="text-white/90 font-semibold">Status</TableHead>
                                                <TableHead className="text-white/90 font-semibold">Created</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {courses.map((course, index) => (
                                                <TableRow
                                                    key={course.id}
                                                    className="border-white/20 hover:bg-white/10 transition-colors"
                                                    style={{ animationDelay: `${index * 0.1}s` }}
                                                >
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-semibold text-white">{course.code}</div>
                                                            <div className="text-white/80 text-sm">{course.name}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-wrap gap-1">
                                                            {course.all_faculty_names ? (
                                                                course.all_faculty_names.split(', ').map((facultyName, index) => (
                                                                    <Badge
                                                                        key={index}
                                                                        variant={index === 0 && course.is_primary ? "default" : "outline"}
                                                                        className={`text-xs glow-effect ${index === 0 && course.is_primary
                                                                            ? 'bg-white/20 text-white border-white/30'
                                                                            : 'bg-transparent text-white/80 border-white/30'
                                                                            }`}
                                                                    >
                                                                        {index === 0 && course.is_primary && '👑 '}
                                                                        {facultyName}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <Badge className="bg-transparent text-white/60 border-white/30 text-xs">
                                                                    No Faculty Assigned
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-white/20 text-white border-white/30 glow-effect">
                                                            {course.credits}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 breathing-glow">
                                                            Active
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-white/80">
                                                        {new Date(course.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    {courses.length === 0 && (
                                        <div className="text-center py-12">
                                            <div className="faculty-floating w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center breathing-glow">
                                                <BookOpen className="w-8 h-8 text-white/60" />
                                            </div>
                                            <p className="text-white/80 text-lg">No courses assigned yet</p>
                                            <p className="text-white/60 text-sm">Contact admin to get courses assigned to you</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Content */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <Card className="faculty-glass border-0 rounded-3xl overflow-hidden glow-effect">
                            <CardHeader className="border-b border-white/20 bg-white/10 subtle-wave">
                                <CardTitle className="flex items-center gap-3 text-white">
                                    <BarChart3 className="w-5 h-5" />
                                    Teaching Insights
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-white/90 font-medium">Grading Progress</span>
                                        <span className="text-white font-semibold">{Math.round(completionRate)}%</span>
                                    </div>
                                    <Progress value={completionRate} className="h-2 bg-white/20">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300 breathing-glow"
                                            style={{ width: `${completionRate}%` }}
                                        />
                                    </Progress>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                                        <div className="text-2xl font-bold text-white">{courses.length}</div>
                                        <div className="text-white/80 text-sm">Courses</div>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                                        <div className="text-2xl font-bold text-white">{totalCredits}</div>
                                        <div className="text-white/80 text-sm">Credits</div>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                                        <div className="text-2xl font-bold text-white">{stats.totalAssignments}</div>
                                        <div className="text-white/80 text-sm">Assignments</div>
                                    </div>
                                    <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                                        <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                                        <div className="text-white/80 text-sm">Students</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Announcements */}
                        <div className="faculty-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
                            <DashboardAnnouncements userRole="faculty" userEmail={user?.email} limit={4} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
