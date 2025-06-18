"use client"

import * as React from "react"
import { BookOpen, Users, UserCheck, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"

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

      <div className="admin-dashboard-container relative z-10">
        <div className="p-6 space-y-8">
          {/* Hero Section */}
          <div className="admin-glass rounded-3xl p-8 glow-effect subtle-wave">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0 flex-1">
                <div className="mb-3">
                  <h1 className="text-4xl font-bold text-white admin-floating">
                    System Administration
                  </h1>
                </div>
                <p className="text-white/80 text-lg leading-relaxed">
                  Manage users, courses, and system-wide operations
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">{studentUsers.length}</div>
                  <div className="text-white/80 text-sm">Students</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">{facultyUsers.length}</div>
                  <div className="text-white/80 text-sm">Faculty</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">{allCourses.length}</div>
                  <div className="text-white/80 text-sm">Courses</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                  <div className="text-2xl font-bold text-white">Active</div>
                  <div className="text-white/80 text-sm">System</div>
                </div>
              </div>
            </div>
          </div>

          {/* Management Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
