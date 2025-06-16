'use client';

import React, { useEffect, useState } from 'react';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, TrendingUp, ClipboardList, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface StudentStats {
    attendancePercentage: number;
    gpa: number;
    upcomingAssignments: number;
}

export default function StudentDashboard() {
    const [stats, setStats] = useState<StudentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchStudentStats();
    }, []);

    const fetchStudentStats = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) throw new Error('No token found');

            const response = await fetch('/api/student/overview', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch student stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <ProtectedLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </ProtectedLayout>
        );
    }

    if (error) {
        return (
            <ProtectedLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-destructive">Error</h3>
                        <p className="text-muted-foreground">{error}</p>
                    </div>
                </div>
            </ProtectedLayout>
        );
    }

    const getAttendanceColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600 dark:text-green-400';
        if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getGpaColor = (gpa: number) => {
        if (gpa >= 3.5) return 'text-green-600 dark:text-green-400';
        if (gpa >= 3.0) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <ProtectedLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
                        <p className="text-muted-foreground">
                            Welcome back, {user?.fullName}. Here's an overview of your academic progress.
                        </p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border border-border bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Attendance %
                            </CardTitle>
                            <Calendar className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${getAttendanceColor(stats?.attendancePercentage || 0)}`}>
                                {stats?.attendancePercentage || 0}%
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Overall attendance across all courses
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-border bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                GPA
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${getGpaColor(stats?.gpa || 0)}`}>
                                {stats?.gpa?.toFixed(2) || '0.00'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Current grade point average
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border border-border bg-card hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Upcoming Assignments
                            </CardTitle>
                            <ClipboardList className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-foreground">
                                {stats?.upcomingAssignments || 0}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Due in the next 7 days
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center text-foreground">
                                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                                My Courses
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                View your enrolled courses, materials, and announcements.
                            </p>
                            <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                View Courses
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="border border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center text-foreground">
                                <ClipboardList className="h-5 w-5 mr-2 text-primary" />
                                Assignments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                View and submit assignments for all your courses.
                            </p>
                            <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                View Assignments
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="border border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center text-foreground">
                                <Calendar className="h-5 w-5 mr-2 text-primary" />
                                Attendance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Check your attendance records and upcoming classes.
                            </p>
                            <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                View Attendance
                            </button>
                        </CardContent>
                    </Card>

                    <Card className="border border-border bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center text-foreground">
                                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                                Grades
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                View your grades and academic performance reports.
                            </p>
                            <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                                View Grades
                            </button>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Overview */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Performance Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Attendance Rate</span>
                                    <span className={`text-sm font-medium ${getAttendanceColor(stats?.attendancePercentage || 0)}`}>
                                        {stats?.attendancePercentage || 0}%
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${stats?.attendancePercentage || 0}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">GPA Progress</span>
                                    <span className={`text-sm font-medium ${getGpaColor(stats?.gpa || 0)}`}>
                                        {stats?.gpa?.toFixed(2) || '0.00'}/4.00
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-primary h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${((stats?.gpa || 0) / 4.0) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border border-border bg-card">
                        <CardHeader>
                            <CardTitle className="text-foreground">Upcoming Deadlines</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground">Mathematics Assignment 3</p>
                                        <p className="text-xs text-muted-foreground">Due tomorrow</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground">Physics Lab Report</p>
                                        <p className="text-xs text-muted-foreground">Due in 3 days</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-sm text-foreground">History Essay</p>
                                        <p className="text-xs text-muted-foreground">Due in 5 days</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </ProtectedLayout>
    );
} 