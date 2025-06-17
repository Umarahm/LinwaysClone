"use client"

import * as React from "react"
import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  LogOut,
  Settings,
  TrendingUp,
  User,
  Users,
} from "lucide-react"
import { StudentDashboard } from "@/components/student-dashboard"
import { FacultyDashboard } from "@/components/faculty-dashboard"
import { AdminDashboard } from "@/components/admin-dashboard"
import { AssignmentsPage } from "@/components/student/assignments-page"
import { AttendanceView } from "@/components/student/attendance-view"
import { AttendanceAnalytics } from "@/components/attendance/attendance-analytics"
import { getStudentAttendance } from "@/lib/attendance-actions"
import { GradesOverview } from "@/components/student/grades-overview"
import { AssignmentsManagement } from "@/components/faculty/assignments-management"
import { CourseSelectionForAttendance } from "@/components/faculty/course-selection-for-attendance"
import { FacultyTimetableClient } from "@/components/faculty/faculty-timetable-client"
import { StudentTimetableClient } from "@/components/student/student-timetable-client"
import { AnnouncementsPage } from "@/components/announcements-page"
import { UserManagement } from "@/components/admin/user-management"
import { CourseManagement } from "@/components/admin/course-management"
import { TimetableSidebar } from "@/components/admin/timetable-sidebar"
import { EnrollmentManagement } from "@/components/admin/enrollment-management"
import { AssignmentManagement } from "@/components/faculty/assignment-management"
import { GradingInterface } from "@/components/faculty/grading-interface"
import { AttendanceHistory } from "@/components/student/attendance-history"
import { AssignmentsSubmission } from "@/components/student/assignments-submission"
import { GradesDashboard } from "@/components/student/grades-dashboard"
import { CourseCatalog } from "@/components/courses/course-catalog"
import { UserProfile } from "@/components/profile/user-profile"
import { DashboardSummaryCards } from "@/components/dashboard-summary-cards"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { signOut } from "@/lib/auth-actions"
import { getAvatarColor } from "@/lib/utils"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useState } from "react"

interface DashboardClientProps {
  user: {
    id: number
    email: string
    fullName: string
    role: string
    department: string
    avatar?: string
  }
}

const getNavigationItems = (role: string) => {
  const baseItems = [
    { title: "Dashboard", icon: Home, key: "dashboard" },
    { title: "Announcements", icon: Bell, key: "announcements" },
    { title: "Profile", icon: User, key: "profile" },
  ]

  if (role === "student") {
    return [
      ...baseItems.slice(0, 1),
      { title: "My Timetable", icon: Calendar, key: "student-timetable" },
      { title: "My Assignments", icon: ClipboardList, key: "my-assignments" },
      { title: "My Grades", icon: TrendingUp, key: "my-grades" },
      { title: "Attendance", icon: Calendar, key: "attendance" },
      { title: "Available Courses", icon: BookOpen, key: "course-catalog" },
      ...baseItems.slice(1),
    ]
  }

  if (role === "faculty") {
    return [
      ...baseItems.slice(0, 1),
      { title: "My Timetable", icon: Calendar, key: "my-timetable" },
      { title: "Assignments", icon: ClipboardList, key: "assignment-management" },
      { title: "Grading", icon: GraduationCap, key: "grading" },
      { title: "Mark Attendance", icon: Calendar, key: "mark-attendance" },
      { title: "Attendance Analytics", icon: TrendingUp, key: "attendance-analytics" },
      { title: "Courses", icon: BookOpen, key: "courses" },
      ...baseItems.slice(1),
    ]
  }

  if (role === "admin") {
    return [
      ...baseItems.slice(0, 1),
      { title: "User Management", icon: Users, key: "user-management" },
      { title: "Course Management", icon: BookOpen, key: "course-management" },
      { title: "Timetable Management", icon: Calendar, key: "timetable-management" },
      { title: "Enrollment Management", icon: ClipboardList, key: "enrollment-management" },
      { title: "Attendance Analytics", icon: TrendingUp, key: "attendance-analytics" },
      { title: "Reports", icon: TrendingUp, key: "reports" },
      ...baseItems.slice(1),
    ]
  }

  return baseItems
}

export function DashboardClient({ user: initialUser }: DashboardClientProps) {
  const [user, setUser] = useState(initialUser)
  const [currentPage, setCurrentPage] = React.useState("dashboard")
  const [attendanceData, setAttendanceData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(false)
  const navigationItems = getNavigationItems(user.role)

  // Handle URL tab parameter on initial load only
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const tabParam = urlParams.get('tab')
    const navItems = getNavigationItems(user.role)
    if (tabParam && navItems.some(item => item.key === tabParam)) {
      setCurrentPage(tabParam)
      // Clear the URL parameter after setting the page to prevent future interference
      window.history.replaceState({}, '', '/dashboard')
    }
  }, [user.role]) // Only depend on user.role since that determines available navigation items

  // Fetch attendance data when needed
  const fetchAttendanceData = React.useCallback(async () => {
    if (user.role === "student") {
      try {
        setLoading(true)
        const data = await getStudentAttendance()
        setAttendanceData(data)
      } catch (error) {
        console.error('Error fetching attendance data:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [user.role])

  // Fetch attendance data when switching to attendance page
  React.useEffect(() => {
    if (currentPage === "attendance" && user.role === "student" && !attendanceData) {
      fetchAttendanceData()
    }
  }, [currentPage, user.role, attendanceData, fetchAttendanceData])

  const handleLogout = async () => {
    await signOut()
  }

  const renderContent = () => {
    // Mock data for demonstration
    const mockAssignments = [
      {
        id: 1,
        title: "Binary Search Tree Implementation",
        courseCode: "CS201",
        courseName: "Data Structures & Algorithms",
        description: "Implement a complete BST with insertion, deletion, and traversal operations. Focus on maintaining tree balance and efficient operations.",
        dueDate: "2024-02-15T23:59:00",
        status: "not_submitted" as const,
        maxMarks: 100,
        fileUrl: "https://example.com/bst-assignment.pdf",
      },
      {
        id: 2,
        title: "Database Design Project",
        courseCode: "CS301",
        courseName: "Database Management Systems",
        description: "Design a complete database schema for an e-commerce application with proper normalization and relationships.",
        dueDate: "2024-02-20T23:59:00",
        status: "submitted" as const,
        grade: 85,
        maxMarks: 150,
        submittedAt: "2024-02-18T14:30:00",
      },
      {
        id: 3,
        title: "React Portfolio Website",
        courseCode: "IT401",
        courseName: "Web Development",
        description: "Create a personal portfolio website using React, TypeScript, and modern styling frameworks. Include responsive design and accessibility features.",
        dueDate: "2025-01-05T23:59:00",
        status: "not_submitted" as const,
        maxMarks: 200,
        fileUrl: "https://example.com/portfolio-requirements.pdf",
      },
      {
        id: 4,
        title: "Machine Learning Classification",
        courseCode: "CS401",
        courseName: "Machine Learning",
        description: "Implement and compare different classification algorithms on a given dataset. Include data preprocessing, model training, and evaluation.",
        dueDate: "2024-12-18T23:59:00",
        status: "late_submitted" as const,
        maxMarks: 120,
        grade: 92,
        submittedAt: "2024-12-19T10:15:00",
      },
      {
        id: 5,
        title: "Network Security Analysis",
        courseCode: "CS501",
        courseName: "Cybersecurity",
        description: "Conduct a comprehensive security analysis of a given network infrastructure and provide recommendations for improvement.",
        dueDate: "2024-01-30T23:59:00",
        status: "submitted" as const,
        maxMarks: 80,
        grade: 78,
        submittedAt: "2024-01-28T16:45:00",
      },
    ]

    const mockAttendanceRecords = [
      {
        id: 1,
        date: "2024-01-15",
        course_name: "Data Structures",
        course_code: "CS201",
        status: "present" as const,
      },
      {
        id: 2,
        date: "2024-01-14",
        course_name: "Database Systems",
        course_code: "CS301",
        status: "absent" as const,
      },
    ]

    const mockAttendanceSummary = [
      {
        course_code: "CS201",
        course_name: "Data Structures",
        present_count: 28,
        total_count: 30,
        percentage: 93,
      },
      {
        course_code: "CS301",
        course_name: "Database Systems",
        present_count: 25,
        total_count: 28,
        percentage: 89,
      },
    ]

    const mockGrades = [
      {
        id: 1,
        course_code: "CS201",
        course_name: "Data Structures",
        assignment_title: "Quiz 1",
        grade: 87,
        max_marks: 100,
        feedback: "Good work, minor improvements needed",
        submitted_at: "2024-01-15",
      },
    ]

    const mockCourseGPAs = [
      {
        course_code: "CS201",
        course_name: "Data Structures",
        credits: 4,
        average_grade: 87,
        gpa_points: 3.7,
      },
    ]

    const mockAnnouncements = [
      {
        id: 1,
        title: "Mid-term Examination Schedule",
        message: "Mid-term exams will be conducted from Feb 10-15.",
        author_name: "Admin",
        author_role: "admin",
        created_at: "2024-01-10",
        recipient: "all",
      },
    ]

    switch (currentPage) {
      case "dashboard":
        return (
          <div className="p-6 space-y-6">
            <DashboardSummaryCards userRole={user.role as 'student' | 'faculty' | 'admin'} />
            {user.role === "student" && <StudentDashboard />}
            {user.role === "faculty" && <FacultyDashboard user={user} />}
            {user.role === "admin" && <AdminDashboard />}
          </div>
        )

      case "my-assignments":
        return (
          <div className="p-6">
            <AssignmentsSubmission />
          </div>
        )

      case "my-grades":
        return (
          <div className="p-6">
            <GradesDashboard />
          </div>
        )

      case "course-catalog":
        return (
          <div className="p-6">
            <CourseCatalog />
          </div>
        )

      case "profile":
        return (
          <div className="p-6">
            <UserProfile user={user} setUser={setUser} />
          </div>
        )

      case "assignments":
        if (user.role === "student") {
          return <AssignmentsPage assignments={mockAssignments} />
        } else {
          return (
            <div className="p-6">
              <AssignmentManagement />
            </div>
          )
        }

      case "attendance":
        if (loading) {
          return (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-lg text-muted-foreground">Loading attendance data...</p>
              </div>
            </div>
          )
        }

        if (attendanceData) {
          return (
            <AttendanceView
              attendanceRecords={attendanceData.attendanceRecords}
              attendanceSummary={attendanceData.attendanceSummary}
              weeklyTrends={attendanceData.weeklyTrends}
              monthlyStats={attendanceData.monthlyStats}
            />
          )
        }

        return (
          <div className="p-6">
            <AttendanceHistory />
          </div>
        )

      case "grades":
        return <GradesOverview grades={mockGrades} courseGPAs={mockCourseGPAs} overallGPA={3.67} />

      case "assignment-management":
        return (
          <div className="p-6">
            <AssignmentManagement />
          </div>
        )

      case "grading":
        return (
          <div className="p-6">
            <GradingInterface />
          </div>
        )

      case "my-timetable":
        return (
          <div className="p-6">
            <FacultyTimetableClient userId={user.id} user={user} />
          </div>
        )

      case "student-timetable":
        return (
          <div className="p-6">
            <StudentTimetableClient />
          </div>
        )

      case "mark-attendance":
        return (
          <div className="p-6">
            <CourseSelectionForAttendance />
          </div>
        )

      case "attendance-analytics":
        return (
          <div className="p-6">
            <AttendanceAnalytics userRole={user.role as 'faculty' | 'admin'} />
          </div>
        )

      case "user-management":
        return (
          <div className="p-6">
            <UserManagement />
          </div>
        )

      case "course-management":
        return (
          <div className="p-6">
            <CourseManagement />
          </div>
        )

      case "timetable-management":
        return (
          <div className="p-6">
            <TimetableSidebar />
          </div>
        )

      case "enrollment-management":
        return (
          <div className="p-6">
            <EnrollmentManagement />
          </div>
        )

      case "announcements":
        return <AnnouncementsPage userRole={user.role} />

      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold">Page Under Construction</h1>
            <p className="text-gray-600 mt-2">This page is being developed.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="border-r">
            <SidebarHeader className="border-b p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-lg font-semibold">Presidency University</h1>
                  <p className="text-sm text-muted-foreground">Learning Portal</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          onClick={() => {
                            // Clear URL parameters and update current page
                            window.history.pushState({}, '', '/dashboard')
                            setCurrentPage(item.key)
                          }}
                          isActive={currentPage === item.key}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Mini user profile at bottom */}
            <div className="mt-auto p-4 border-t">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                  <AvatarFallback
                    className="text-sm text-white flex items-center justify-center"
                    style={{ backgroundColor: getAvatarColor(user.fullName) }}
                  >
                    {user.fullName
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground leading-none line-clamp-1">
                    {user.fullName}
                  </span>
                  <span className="text-xs text-muted-foreground line-clamp-1">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="hidden md:block">
                  <h2 className="text-xl font-semibold capitalize text-foreground">{currentPage.replace("-", " ")}</h2>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ThemeToggle />

                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} />
                        ) : null}
                        <AvatarFallback
                          className="text-xs text-white flex items-center justify-center"
                          style={{ backgroundColor: getAvatarColor(user.fullName) }}
                        >
                          {user.fullName
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-foreground">{user.fullName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                      window.history.pushState({}, '', '/dashboard')
                      setCurrentPage("profile")
                    }}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1">{renderContent()}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
