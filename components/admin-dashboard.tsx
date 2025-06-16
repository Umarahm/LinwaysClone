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
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System Administration Panel</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Students</p>
                <p className="text-3xl font-bold">{studentUsers.length}</p>
                <p className="text-blue-100 text-xs mt-1">Active users</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Faculty Members</p>
                <p className="text-3xl font-bold">{facultyUsers.length}</p>
                <p className="text-emerald-100 text-xs mt-1">Teaching staff</p>
              </div>
              <UserCheck className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Total Courses</p>
                <p className="text-3xl font-bold">{allCourses.length}</p>
                <p className="text-amber-100 text-xs mt-1">Available</p>
              </div>
              <BookOpen className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">System Status</p>
                <p className="text-3xl font-bold">Active</p>
                <p className="text-purple-100 text-xs mt-1">All systems</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Management */}
        <Card className="shadow-sm border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Total Students</span>
              <Badge variant="default">{studentUsers.length}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Total Faculty</span>
              <Badge variant="secondary">{facultyUsers.length}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Total Users</span>
              <Badge variant="secondary">{studentUsers.length + facultyUsers.length}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Course Management */}
        <Card className="shadow-sm border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Course Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Total Courses</span>
              <Badge variant="default">{allCourses.length}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Active Courses</span>
              <Badge variant="secondary">{allCourses.length}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Departments</span>
              <Badge variant="secondary">{new Set([...studentUsers, ...facultyUsers].map(u => u.department).filter(Boolean)).size}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{studentUsers.length}</div>
              <div className="text-sm text-muted-foreground">Students Registered</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{facultyUsers.length}</div>
              <div className="text-sm text-muted-foreground">Faculty Members</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{allCourses.length}</div>
              <div className="text-sm text-muted-foreground">Available Courses</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
