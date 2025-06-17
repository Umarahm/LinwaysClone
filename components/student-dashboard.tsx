"use client"

import * as React from "react"
import { BookOpen, Users, FileText, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import { StudentMiniTimetable } from "@/components/student/student-mini-timetable"

interface Course {
  id: number;
  code: string;
  name: string;
  faculty_name: string;
  credits: number;
  created_at: string;
  assignment_count?: number;
  enrolled_count?: number;
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
    <div className="animated-gradient-bg min-h-screen relative overflow-hidden">
      {/* Gradient Orbs */}
      <div className="gradient-orb"></div>
      <div className="gradient-orb"></div>
      <div className="gradient-orb"></div>

      {/* Gradient Mesh Overlay */}
      <div className="gradient-mesh"></div>

      <div className="student-dashboard-container relative z-10">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="student-glass rounded-3xl p-8 glow-effect subtle-wave">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-4xl font-bold text-white mb-3 student-floating">
                  Welcome Back, Student!
                </h1>
                <p className="text-white/80 text-lg leading-relaxed">
                  Track your academic journey and stay on top of your studies
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">{studentStats.enrolled_count}</div>
                  <div className="text-white/80 text-sm">Courses</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">{enrollments.reduce((sum, course) => sum + course.credits, 0)}</div>
                  <div className="text-white/80 text-sm">Credits</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">{studentStats.gpa}</div>
                  <div className="text-white/80 text-sm">GPA</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">{enrollments.reduce((sum, course) => sum + (course.assignment_count || 0), 0)}</div>
                  <div className="text-white/80 text-sm">Assignments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Timetable */}
          <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
            <StudentMiniTimetable />
          </div>

          {/* Available Courses */}
          <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
            <Card className="border-0 bg-transparent text-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-white">
                  <BookOpen className="w-5 h-5 text-blue-300" />
                  Available Courses ({studentStats.available_count})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availableCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableCourses.slice(0, 6).map((course) => (
                      <div key={course.id} className="p-4 border border-white/20 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                        <h3 className="font-semibold text-white">{course.code}</h3>
                        <p className="text-sm text-white/80 mb-2">{course.name}</p>
                        <div className="flex justify-between items-center text-xs text-white/70">
                          <span>{course.credits} credits</span>
                          <span>{course.faculty_name}</span>
                        </div>
                        <div className="mt-2 text-xs text-white/70">
                          {course.enrolled_count} students enrolled
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/80">No available courses at this time.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Academic Progress */}
            <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
              <Card className="border-0 bg-transparent text-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-purple-300" />
                    Academic Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white">Enrolled Courses</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{studentStats.enrolled_count}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white">Credit Hours</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{enrollments.reduce((sum, course) => sum + course.credits, 0)}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white">Current GPA</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{studentStats.gpa}</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <span className="text-white">Graded Assignments</span>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{studentStats.graded_assignments}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Announcements */}
            <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
              <DashboardAnnouncements userRole="student" limit={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
