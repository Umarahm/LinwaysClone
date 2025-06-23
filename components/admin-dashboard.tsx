"use client"

import * as React from "react"
import { BookOpen, Users, UserCheck, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton, DashboardHeroSkeleton, TimetableSkeleton, CourseGridSkeleton, StatsCardSkeleton } from "@/components/ui/skeleton"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import designSystem from '@/university_design_system.json'

const DS = designSystem.designSystem;

interface User {
    id: number;
    full_name: string;
    email: string;
    role: string;
    department: string;
    created_at: string;
}

interface Course {
    id: number;
    code: string;
    name: string;
    faculty_name: string;
    credits: number;
    created_at: string;
}

export function AdminDashboard() {
    const [studentUsers, setStudentUsers] = useState<User[]>([])
    const [facultyUsers, setFacultyUsers] = useState<User[]>([])
    const [allCourses, setAllCourses] = useState<Course[]>([])
    const [enrollmentStats, setEnrollmentStats] = useState({
        totalEnrollments: 0,
        averageEnrollmentPerCourse: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAdminData()
    }, [])

    const fetchAdminData = async () => {
        try {
            const [usersResponse, coursesResponse] = await Promise.all([
                fetch('/api/admin/users'),
                fetch('/api/admin/courses')
            ])

            if (usersResponse.ok) {
                const usersData = await usersResponse.json()
                const students = usersData.users?.filter((u: User) => u.role === 'student') || []
                const faculty = usersData.users?.filter((u: User) => u.role === 'faculty') || []
                setStudentUsers(students)
                setFacultyUsers(faculty)
            }

            if (coursesResponse.ok) {
                const coursesData = await coursesResponse.json()
                setAllCourses(coursesData.courses || [])
            }
        } catch (error) {
            console.error('Error fetching admin data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div
                className="animated-gradient-bg dashboard-light-gradient min-h-screen relative overflow-hidden"
                style={{
                    fontFamily: DS.typography.fontFamily.primary,
                    minHeight: DS.layout.structure.mainContent.minHeight,
                    backgroundColor: `hsl(var(--background))`,
                }}
            >
                {/* Light Mode Background Gradient */}
                <div className="background-gradient"></div>

                {/* Gradient Orbs */}
                <div className="gradient-orb"></div>
                <div className="gradient-orb"></div>
                <div className="gradient-orb"></div>

                {/* Gradient Mesh Overlay */}
                <div className="gradient-mesh"></div>

                <div className="admin-dashboard-container relative z-10">
                    <div style={{ padding: DS.spacing[6] }} className="space-y-8">
                        {/* Hero Section Skeleton */}
                        <div className="admin-glass glow-effect subtle-wave skeleton-glass p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Skeleton variant="shimmer" className="h-12 w-12 rounded-2xl bg-white/20" />
                                        <div className="space-y-2">
                                            <Skeleton variant="shimmer" className="h-8 w-[280px] bg-white/20" />
                                            <Skeleton variant="shimmer" className="h-5 w-[250px] bg-white/15" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="bg-white/10 p-4 rounded-lg space-y-2 backdrop-blur border border-white/20">
                                            <Skeleton variant="shimmer" className="h-6 w-[40px] bg-white/25" />
                                            <Skeleton variant="shimmer" className="h-3 w-[60px] bg-white/20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Management Cards Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Skeleton variant="shimmer" className="h-8 w-8 rounded bg-white/25" />
                                            <Skeleton variant="shimmer" className="h-6 w-[140px] bg-white/25" />
                                        </div>
                                        <Skeleton variant="shimmer" className="h-4 w-full bg-white/20" />
                                        <Skeleton variant="shimmer" className="h-4 w-[80%] bg-white/20" />
                                        <div className="pt-2">
                                            <Skeleton variant="shimmer" className="h-8 w-[100px] rounded bg-white/20" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Data Tables Skeleton */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Users Table Skeleton */}
                            <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton variant="shimmer" className="h-5 w-5 rounded bg-white/25" />
                                        <Skeleton variant="shimmer" className="h-6 w-[120px] bg-white/25" />
                                    </div>
                                    <div className="space-y-3">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-white/20 bg-white/5">
                                                <Skeleton variant="shimmer" className="h-8 w-8 rounded-full bg-white/25" />
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton variant="shimmer" className="h-4 w-[140px] bg-white/25" />
                                                    <Skeleton variant="shimmer" className="h-3 w-[100px] bg-white/20" />
                                                </div>
                                                <Skeleton variant="shimmer" className="h-6 w-[60px] rounded-full bg-white/20" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Courses Table Skeleton */}
                            <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Skeleton variant="shimmer" className="h-5 w-5 rounded bg-white/25" />
                                        <Skeleton variant="shimmer" className="h-6 w-[120px] bg-white/25" />
                                    </div>
                                    <div className="space-y-3">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-white/20 bg-white/5">
                                                <div className="flex-1 space-y-2">
                                                    <Skeleton variant="shimmer" className="h-4 w-[100px] bg-white/25" />
                                                    <Skeleton variant="shimmer" className="h-3 w-[160px] bg-white/20" />
                                                    <Skeleton variant="shimmer" className="h-3 w-[120px] bg-white/20" />
                                                </div>
                                                <Skeleton variant="shimmer" className="h-6 w-[40px] rounded bg-white/20" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Analytics Skeleton */}
                        <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton variant="shimmer" className="h-5 w-5 rounded bg-white/25" />
                                    <Skeleton variant="shimmer" className="h-6 w-[150px] bg-white/25" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="space-y-3">
                                            <Skeleton variant="shimmer" className="h-4 w-[100px] bg-white/20" />
                                            <Skeleton variant="shimmer" className="h-8 w-[60px] bg-white/25" />
                                            <Skeleton variant="shimmer" className="h-2 w-full rounded-full bg-white/20" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="animated-gradient-bg dashboard-light-gradient min-h-screen relative overflow-hidden"
            style={{
                fontFamily: DS.typography.fontFamily.primary,
                minHeight: DS.layout.structure.mainContent.minHeight,
                backgroundColor: `hsl(var(--background))`,
            }}
        >
            {/* Light Mode Background Gradient */}
            <div className="background-gradient"></div>

            {/* Gradient Orbs */}
            <div className="gradient-orb"></div>
            <div className="gradient-orb"></div>
            <div className="gradient-orb"></div>

            {/* Gradient Mesh Overlay */}
            <div className="gradient-mesh"></div>

            <div className="admin-dashboard-container relative z-10">
                <div style={{ padding: DS.spacing[6] }} className="space-y-8">
                    {/* Hero Section - Profile Header Card Pattern */}
                    <div
                        className="admin-glass glow-effect subtle-wave"
                        style={{
                            ...DS.components.cards.profile,
                            borderRadius: DS.components.cards.elevated.borderRadius,
                            padding: DS.spacing[8],
                        }}
                    >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                            <div className="mb-6 lg:mb-0 flex-1">
                                <div style={{ marginBottom: DS.spacing[3] }}>
                                    <h1
                                        className="text-white admin-floating"
                                        style={{
                                            fontSize: DS.typography.fontSizes['4xl'],
                                            fontWeight: DS.typography.fontWeights.bold,
                                            lineHeight: DS.typography.lineHeights.tight,
                                        }}
                                    >
                                        System Administration
                                    </h1>
                                </div>
                                <p
                                    className="text-white/80"
                                    style={{
                                        fontSize: DS.typography.fontSizes.lg,
                                        lineHeight: DS.typography.lineHeights.relaxed,
                                    }}
                                >
                                    Manage users, courses, and system-wide operations
                                </p>
                            </div>

                            {/* Stats Overview Section following dashboard pattern */}
                            <div
                                className="grid grid-cols-2 pt-4"
                                style={{ gap: DS.spacing[4] }}
                            >
                                <div
                                    className="bg-white/10 text-center glow-effect subtle-wave"
                                    style={{
                                        borderRadius: DS.components.cards.elevated.borderRadius,
                                        padding: DS.spacing[4],
                                    }}
                                >
                                    <div
                                        className="font-bold text-white"
                                        style={{
                                            fontSize: DS.typography.fontSizes['2xl'],
                                            fontWeight: DS.typography.fontWeights.bold,
                                        }}
                                    >
                                        {studentUsers.length}
                                    </div>
                                    <div
                                        className="text-white/80"
                                        style={{ fontSize: DS.typography.fontSizes.sm }}
                                    >
                                        Students
                                    </div>
                                </div>
                                <div
                                    className="bg-white/10 text-center glow-effect subtle-wave"
                                    style={{
                                        borderRadius: DS.components.cards.elevated.borderRadius,
                                        padding: DS.spacing[4],
                                    }}
                                >
                                    <div
                                        className="font-bold text-white"
                                        style={{
                                            fontSize: DS.typography.fontSizes['2xl'],
                                            fontWeight: DS.typography.fontWeights.bold,
                                        }}
                                    >
                                        {facultyUsers.length}
                                    </div>
                                    <div
                                        className="text-white/80"
                                        style={{ fontSize: DS.typography.fontSizes.sm }}
                                    >
                                        Faculty
                                    </div>
                                </div>
                                <div
                                    className="bg-white/10 text-center glow-effect subtle-wave"
                                    style={{
                                        borderRadius: DS.components.cards.elevated.borderRadius,
                                        padding: DS.spacing[4],
                                    }}
                                >
                                    <div
                                        className="font-bold text-white"
                                        style={{
                                            fontSize: DS.typography.fontSizes['2xl'],
                                            fontWeight: DS.typography.fontWeights.bold,
                                        }}
                                    >
                                        {allCourses.length}
                                    </div>
                                    <div
                                        className="text-white/80"
                                        style={{ fontSize: DS.typography.fontSizes.sm }}
                                    >
                                        Courses
                                    </div>
                                </div>
                                <div
                                    className="bg-white/10 text-center glow-effect subtle-wave"
                                    style={{
                                        borderRadius: DS.components.cards.elevated.borderRadius,
                                        padding: DS.spacing[4],
                                    }}
                                >
                                    <div
                                        className="font-bold text-white"
                                        style={{
                                            fontSize: DS.typography.fontSizes['2xl'],
                                            fontWeight: DS.typography.fontWeights.bold,
                                        }}
                                    >
                                        Active
                                    </div>
                                    <div
                                        className="text-white/80"
                                        style={{ fontSize: DS.typography.fontSizes.sm }}
                                    >
                                        System
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Grid following dashboard pattern */}
                    <div
                        className="grid grid-cols-1 lg:grid-cols-3"
                        style={{
                            gridTemplateColumns: DS.patterns.dashboard.gridLayout.columns,
                            gap: DS.patterns.dashboard.gridLayout.gap,
                        }}
                    >
                        {/* Student Management */}
                        <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
                            <Card className="border-0 bg-transparent text-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Users className="w-5 h-5 text-blue-300" />
                                        Student Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                        <span className="text-white">Total Students</span>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{studentUsers.length}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                        <span className="text-white">Active Enrollments</span>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{enrollmentStats.totalEnrollments}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Faculty Management */}
                        <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
                            <Card className="border-0 bg-transparent text-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <UserCheck className="w-5 h-5 text-green-300" />
                                        Faculty Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                        <span className="text-white">Total Faculty</span>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{facultyUsers.length}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                        <span className="text-white">Departments</span>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{new Set([...studentUsers, ...facultyUsers].map(u => u.department).filter(Boolean)).size}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Course Management */}
                        <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
                            <Card className="border-0 bg-transparent text-white">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <BookOpen className="w-5 h-5 text-purple-300" />
                                        Course Management
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                        <span className="text-white">Total Courses</span>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{allCourses.length}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                        <span className="text-white">Active Courses</span>
                                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{allCourses.length}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* System Overview */}
                    <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
                        <Card className="border-0 bg-transparent text-white">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <TrendingUp className="w-5 h-5 text-green-300" />
                                    System Overview
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center p-4 bg-white/10 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{studentUsers.length}</div>
                                        <div className="text-sm text-white/80">Students Registered</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/10 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{facultyUsers.length}</div>
                                        <div className="text-sm text-white/80">Faculty Members</div>
                                    </div>
                                    <div className="text-center p-4 bg-white/10 rounded-lg">
                                        <div className="text-2xl font-bold text-white">{allCourses.length}</div>
                                        <div className="text-sm text-white/80">Available Courses</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Announcements */}
                    <div className="admin-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
                        <DashboardAnnouncements userRole="admin" limit={4} />
                    </div>
                </div>
            </div>
        </div>
    )
}
