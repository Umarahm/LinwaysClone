"use client"

import * as React from "react"
import { BookOpen, Users, FileText, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton, DashboardHeroSkeleton, TimetableSkeleton, CourseGridSkeleton, StatsCardSkeleton } from "@/components/ui/skeleton"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import { StudentMiniTimetable } from "@/components/student/student-mini-timetable"
import designSystem from '@/university_design_system.json'

const DS = designSystem.designSystem;

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
  const [userEmail, setUserEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)



  useEffect(() => {
    fetchEnrollmentData()
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUserEmail(userData.user?.email || "")
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

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

        <div className="student-dashboard-container relative z-10">
          <div style={{ padding: DS.spacing[6] }} className="space-y-8">
            {/* Hero Section Skeleton */}
            <div className="student-glass rounded-3xl glow-effect subtle-wave skeleton-glass p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="shimmer" className="h-12 w-12 rounded-2xl bg-white/20" />
                    <div className="space-y-2">
                      <Skeleton variant="shimmer" className="h-8 w-[300px] bg-white/20" />
                      <Skeleton variant="shimmer" className="h-5 w-[200px] bg-white/15" />
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

            {/* Timetable Skeleton */}
            <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton variant="shimmer" className="h-6 w-6 rounded bg-white/25" />
                  <Skeleton variant="shimmer" className="h-6 w-[140px] bg-white/25" />
                </div>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-white/20 bg-white/5">
                      <Skeleton variant="shimmer" className="h-3 w-[60px] bg-white/20" />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="shimmer" className="h-4 w-[120px] bg-white/25" />
                        <Skeleton variant="shimmer" className="h-3 w-[80px] bg-white/20" />
                      </div>
                      <Skeleton variant="shimmer" className="h-6 w-[60px] rounded-full bg-white/25" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Grid Skeleton */}
            <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Skeleton variant="shimmer" className="h-5 w-5 rounded bg-white/25" />
                  <Skeleton variant="shimmer" className="h-6 w-[180px] bg-white/25" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="p-4 border border-white/20 rounded-lg bg-white/10 space-y-3">
                      <div className="flex justify-between items-center">
                        <Skeleton variant="shimmer" className="h-5 w-[80px] bg-white/25" />
                        <Skeleton variant="shimmer" className="h-4 w-[60px] bg-white/20" />
                      </div>
                      <Skeleton variant="shimmer" className="h-4 w-full bg-white/20" />
                      <div className="flex justify-between text-xs">
                        <Skeleton variant="shimmer" className="h-3 w-[60px] bg-white/20" />
                        <Skeleton variant="shimmer" className="h-3 w-[80px] bg-white/20" />
                      </div>
                      <Skeleton variant="shimmer" className="h-3 w-[100px] bg-white/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Progress Skeleton */}
              <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="shimmer" className="h-5 w-5 rounded bg-white/25" />
                    <Skeleton variant="shimmer" className="h-6 w-[140px] bg-white/25" />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between">
                          <Skeleton variant="shimmer" className="h-4 w-[100px] bg-white/20" />
                          <Skeleton variant="shimmer" className="h-4 w-[40px] bg-white/20" />
                        </div>
                        <Skeleton variant="shimmer" className="h-2 w-full rounded-full bg-white/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Links Skeleton */}
              <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave skeleton-glass p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Skeleton variant="shimmer" className="h-5 w-5 rounded bg-white/25" />
                    <Skeleton variant="shimmer" className="h-6 w-[120px] bg-white/25" />
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10">
                        <Skeleton variant="shimmer" className="h-8 w-8 rounded bg-white/25" />
                        <div className="flex-1">
                          <Skeleton variant="shimmer" className="h-4 w-[120px] bg-white/20" />
                        </div>
                        <Skeleton variant="shimmer" className="h-4 w-4 rounded bg-white/20" />
                      </div>
                    ))}
                  </div>
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

      <div className="student-dashboard-container relative z-10">
        <div style={{ padding: DS.spacing[6] }} className="space-y-8">
          {/* Hero Section - Profile Header Card Pattern */}
          <div
            className="student-glass rounded-3xl glow-effect subtle-wave"
            style={{
              ...DS.components.cards.profile,
              borderRadius: DS.components.cards.elevated.borderRadius,
              padding: DS.spacing[8],
            }}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0 flex-1">
                <div className="mb-3">
                  <h1
                    className="text-white student-floating"
                    style={{
                      fontSize: DS.typography.fontSizes['4xl'],
                      fontWeight: DS.typography.fontWeights.bold,
                      lineHeight: DS.typography.lineHeights.tight,
                    }}
                  >
                    Welcome Back, Student!
                  </h1>
                </div>
                <p
                  className="text-white/80"
                  style={{
                    fontSize: DS.typography.fontSizes.lg,
                    lineHeight: DS.typography.lineHeights.relaxed,
                  }}
                >
                  Track your academic journey and stay on top of your studies
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
                    {studentStats.enrolled_count}
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
                    {enrollments.reduce((sum, course) => sum + course.credits, 0)}
                  </div>
                  <div
                    className="text-white/80"
                    style={{ fontSize: DS.typography.fontSizes.sm }}
                  >
                    Credits
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
                    {studentStats.gpa}
                  </div>
                  <div
                    className="text-white/80"
                    style={{ fontSize: DS.typography.fontSizes.sm }}
                  >
                    GPA
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
                    {enrollments.reduce((sum, course) => sum + (course.assignment_count || 0), 0)}
                  </div>
                  <div
                    className="text-white/80"
                    style={{ fontSize: DS.typography.fontSizes.sm }}
                  >
                    Assignments
                  </div>
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
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">{studentStats.graded_assignments || 0}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Announcements */}
            <div className="student-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
              <DashboardAnnouncements userRole="student" userEmail={userEmail} limit={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
