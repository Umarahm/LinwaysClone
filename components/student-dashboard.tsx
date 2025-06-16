"use client"

import * as React from "react"
import { BookOpen, Users, FileText, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"

interface Course {
  id: number;
  code: string;
  name: string;
  faculty_name: string;
  credits: number;
  created_at: string;
}

export function StudentDashboard() {
  const [enrollments, setEnrollments] = useState<Course[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [studentStats, setStudentStats] = useState({
    gpa: 0,
    enrolled_count: 0,
    available_count: 0,
    graded_assignments: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchEnrollmentData()
  }, [])

  const fetchEnrollmentData = async () => {
    try {
      const response = await fetch('/api/student/enrollments')
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data.enrolled_courses || [])
        setAvailableCourses(data.available_courses || [])
        setStudentStats(data.student_stats || {})
      }
    } catch (error) {
      console.error('Error fetching enrollment data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your academic progress</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Enrolled Courses</p>
                <p className="text-3xl font-bold">{studentStats.enrolled_count}</p>
                <p className="text-blue-100 text-xs mt-1">This semester</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Credits</p>
                <p className="text-3xl font-bold">{enrollments.reduce((sum, course) => sum + course.credits, 0)}</p>
                <p className="text-emerald-100 text-xs mt-1">Credit hours</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Assignments</p>
                <p className="text-3xl font-bold">{enrollments.reduce((sum, course) => sum + course.assignment_count, 0)}</p>
                <p className="text-amber-100 text-xs mt-1">Total</p>
              </div>
              <FileText className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">GPA</p>
                <p className="text-3xl font-bold">{studentStats.gpa}</p>
                <p className="text-purple-100 text-xs mt-1">Current</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Courses */}
      <Card className="shadow-sm border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Available Courses ({studentStats.available_count})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {availableCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableCourses.slice(0, 6).map((course) => (
                <div key={course.id} className="p-4 border border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <h3 className="font-semibold text-foreground">{course.code}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{course.name}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{course.credits} credits</span>
                    <span>{course.faculty_name}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {course.enrolled_count} students enrolled
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No available courses at this time.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic Progress */}
        <Card className="shadow-sm border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Academic Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Enrolled Courses</span>
              <Badge variant="default">{studentStats.enrolled_count}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Credit Hours</span>
              <Badge variant="secondary">{enrollments.reduce((sum, course) => sum + course.credits, 0)}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Current GPA</span>
              <Badge variant="secondary">{studentStats.gpa}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Graded Assignments</span>
              <Badge variant="secondary">{studentStats.graded_assignments}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <DashboardAnnouncements userRole="student" limit={4} />
      </div>
    </div>
  );
}
