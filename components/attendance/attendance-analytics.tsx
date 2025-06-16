"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, Users, TrendingUp, AlertTriangle, BarChart3, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { getFacultyAttendanceAnalytics, getAdminAttendanceOverview } from '@/lib/attendance-actions'

interface AttendanceAnalyticsProps {
    userRole: 'faculty' | 'admin'
}

export function AttendanceAnalytics({ userRole }: AttendanceAnalyticsProps) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalyticsData()
    }, [userRole])

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true)

            if (userRole === 'faculty') {
                const result = await getFacultyAttendanceAnalytics()
                setData(result)
            } else if (userRole === 'admin') {
                const result = await getAdminAttendanceOverview()
                setData(result)
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    const getAttendanceStatusColor = (percentage: number) => {
        if (percentage >= 85) return "text-green-600 dark:text-green-400"
        if (percentage >= 75) return "text-yellow-600 dark:text-yellow-400"
        return "text-red-600 dark:text-red-400"
    }

    const getAttendanceStatusBadge = (percentage: number) => {
        if (percentage >= 85) return { text: "Excellent", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" }
        if (percentage >= 75) return { text: "Good", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" }
        return { text: "Needs Attention", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-lg text-muted-foreground">Loading analytics...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Attendance Analytics</h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive insights into attendance patterns and trends
                    </p>
                </div>
                <Button variant="outline" onClick={fetchAnalyticsData}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {userRole === 'faculty' && data && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">Total Courses</p>
                                        <p className="text-3xl font-bold">{data.courseStats?.length || 0}</p>
                                        <p className="text-blue-100 text-xs mt-1">Active courses</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium">Total Students</p>
                                        <p className="text-3xl font-bold">
                                            {data.courseStats?.reduce((acc: number, course: any) => acc + (course.enrolled_students || 0), 0) || 0}
                                        </p>
                                        <p className="text-emerald-100 text-xs mt-1">Enrolled across courses</p>
                                    </div>
                                    <Users className="w-8 h-8 text-emerald-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium">Classes Held</p>
                                        <p className="text-3xl font-bold">
                                            {data.courseStats?.reduce((acc: number, course: any) => acc + (course.classes_held || 0), 0) || 0}
                                        </p>
                                        <p className="text-amber-100 text-xs mt-1">Total sessions</p>
                                    </div>
                                    <Calendar className="w-8 h-8 text-amber-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-violet-100 text-sm font-medium">Average Attendance</p>
                                        <p className="text-3xl font-bold">
                                            {data.courseStats?.length > 0
                                                ? Math.round(data.courseStats.reduce((acc: number, course: any) => acc + (course.overall_attendance_rate || 0), 0) / data.courseStats.length)
                                                : 0}%
                                        </p>
                                        <p className="text-violet-100 text-xs mt-1">Across all courses</p>
                                    </div>
                                    <Target className="w-8 h-8 text-violet-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Course Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Course Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.courseStats?.map((course: any, index: number) => {
                                    const statusBadge = getAttendanceStatusBadge(course.overall_attendance_rate || 0)
                                    return (
                                        <Card key={index} className="border">
                                            <CardContent className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">{course.code}</h4>
                                                        <Badge className={statusBadge.color}>
                                                            {statusBadge.text}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{course.name}</p>
                                                    <div className="text-center">
                                                        <div className={`text-2xl font-bold ${getAttendanceStatusColor(course.overall_attendance_rate || 0)}`}>
                                                            {(course.overall_attendance_rate || 0).toFixed(1)}%
                                                        </div>
                                                        <Progress value={course.overall_attendance_rate || 0} className="h-2 mt-2" />
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Students: {course.enrolled_students || 0}</span>
                                                        <span>Classes: {course.classes_held || 0}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Low Attendance Alerts */}
                    {data.lowAttendanceAlerts?.length > 0 && (
                        <Card className="border-amber-200 dark:border-amber-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                                    <AlertTriangle className="h-5 w-5" />
                                    Low Attendance Alerts
                                </CardTitle>
                                <CardDescription>
                                    Students with attendance below 75%
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.lowAttendanceAlerts.map((alert: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                                            <div>
                                                <div className="font-medium">{alert.student_name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {alert.course_code} - {alert.present_classes}/{alert.total_classes} classes
                                                </div>
                                            </div>
                                            <Badge variant="destructive">
                                                {(alert.attendance_rate || 0).toFixed(1)}%
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {userRole === 'admin' && data && (
                <div className="space-y-6">
                    {/* System Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm font-medium">System Attendance</p>
                                        <p className="text-3xl font-bold">{(data.systemStats?.system_attendance_rate || 0).toFixed(1)}%</p>
                                        <p className="text-blue-100 text-xs mt-1">Overall rate</p>
                                    </div>
                                    <Target className="w-8 h-8 text-blue-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 text-sm font-medium">Total Students</p>
                                        <p className="text-3xl font-bold">{data.systemStats?.total_students || 0}</p>
                                        <p className="text-emerald-100 text-xs mt-1">Active students</p>
                                    </div>
                                    <Users className="w-8 h-8 text-emerald-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 text-sm font-medium">Active Courses</p>
                                        <p className="text-3xl font-bold">{data.systemStats?.total_courses || 0}</p>
                                        <p className="text-amber-100 text-xs mt-1">This semester</p>
                                    </div>
                                    <BarChart3 className="w-8 h-8 text-amber-200" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-r from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 text-white border-0">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-violet-100 text-sm font-medium">Faculty Members</p>
                                        <p className="text-3xl font-bold">{data.systemStats?.total_faculty || 0}</p>
                                        <p className="text-violet-100 text-xs mt-1">Active faculty</p>
                                    </div>
                                    <Users className="w-8 h-8 text-violet-200" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Department Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Department Performance
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.departmentStats?.map((dept: any, index: number) => {
                                    const statusBadge = getAttendanceStatusBadge(dept.department_attendance_rate || 0)
                                    return (
                                        <Card key={index} className="border">
                                            <CardContent className="p-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="font-semibold">{dept.department}</h4>
                                                        <Badge className={statusBadge.color}>
                                                            {statusBadge.text}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className={`text-2xl font-bold ${getAttendanceStatusColor(dept.department_attendance_rate || 0)}`}>
                                                            {(dept.department_attendance_rate || 0).toFixed(1)}%
                                                        </div>
                                                        <Progress value={dept.department_attendance_rate || 0} className="h-2 mt-2" />
                                                    </div>
                                                    <div className="flex justify-between text-sm">
                                                        <span>Courses: {dept.courses_count || 0}</span>
                                                        <span>Students: {dept.students_count || 0}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
} 