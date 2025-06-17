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

import { signOut } from "@/lib/auth-actions"
import { getAvatarColor } from "@/lib/utils"
import { useAnnouncements } from "@/hooks/use-announcements"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  // Use announcements hook for notifications
  const { unreadCount, refresh: refreshAnnouncements } = useAnnouncements({
    userRole: user.role,
    pollingInterval: 30000 // Check every 30 seconds
  })

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
          <div className={user.role === "faculty" ? "" : user.role === "student" ? "" : "p-6 space-y-6"}>
            {user.role === "student" && <StudentDashboard />}
            {user.role === "faculty" && <FacultyDashboard user={user} />}
            {user.role === "admin" && <AdminDashboard />}
          </div>
        )

      case "my-assignments":
        return (
          <div className="p-6 pt-4">
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
          <Sidebar className="faculty-glass backdrop-blur-xl border-0 sidebar-override" style={{
            background: user.role === 'faculty'
              ? 'linear-gradient(180deg, hsl(var(--faculty-primary)) 0%, hsl(var(--faculty-secondary)) 100%)'
              : 'hsl(var(--sidebar-background))',
            borderRight: 'none',
            border: 'none'
          }}>
            <SidebarHeader className="border-b border-white/20 p-6">
              <div className="flex items-center gap-4">
                <div className="faculty-floating flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-lg">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-white">Presidency University</h1>
                  <p className="text-sm text-white/80 font-medium">Learning Portal</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className={`px-4 py-6 ${user.role === 'faculty' ? 'sidebar-faculty-scroll' : 'sidebar-default-scroll'}`} style={{
              background: user.role === 'faculty'
                ? 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.05) 100%)'
                : 'transparent'
            }}>
              <SidebarGroup>
                <div className={`
                  px-4 py-3 mb-6 rounded-2xl border backdrop-blur-sm
                  ${user.role === 'faculty'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-muted/50 border-border text-foreground'
                  }
                `}>
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center
                      ${user.role === 'faculty'
                        ? 'bg-white/20 text-white'
                        : 'bg-primary/10 text-primary'
                      }
                    `}>
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className={`font-semibold text-sm ${user.role === 'faculty' ? 'text-white' : 'text-foreground'}`}>
                        Navigation
                      </div>
                      <div className={`text-xs ${user.role === 'faculty' ? 'text-white/70' : 'text-muted-foreground'}`}>
                        Quick access menu
                      </div>
                    </div>
                  </div>
                </div>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item, index) => (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          onClick={() => {
                            // Clear URL parameters and update current page
                            window.history.pushState({}, '', '/dashboard')
                            setCurrentPage(item.key)
                          }}
                          isActive={currentPage === item.key}
                          className={`
                            group relative rounded-2xl px-4 py-3 mb-1 transition-all duration-300 sidebar-item-hover border
                            ${user.role === 'faculty' ? 'sidebar-faculty-item' : ''}
                            ${currentPage === item.key
                              ? user.role === 'faculty'
                                ? 'bg-white/25 text-white shadow-lg backdrop-blur-sm border-white/30'
                                : 'bg-primary text-primary-foreground border-primary/20'
                              : user.role === 'faculty'
                                ? 'text-white/80 hover:bg-white/10 hover:text-white border-white/10 hover:border-white/20'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground border-transparent hover:border-border'
                            }
                          `}
                          style={{
                            animationDelay: `${index * 0.05}s`,
                            transform: currentPage === item.key ? 'translateX(2px)' : 'none'
                          }}
                        >
                          <div className={`
                            w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300
                            ${currentPage === item.key
                              ? user.role === 'faculty'
                                ? 'bg-white/20 text-white'
                                : 'bg-primary-foreground/20 text-primary-foreground'
                              : user.role === 'faculty'
                                ? 'bg-white/10 text-white/80 group-hover:bg-white/15 group-hover:text-white'
                                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                            }
                          `}>
                            <item.icon className="h-4 w-4 transition-transform group-hover:scale-110 sidebar-icon-hover" />
                          </div>
                          <span className="font-medium">{item.title}</span>
                          {currentPage === item.key && (
                            <div className={`
                              absolute right-3 w-2 h-2 rounded-full
                              ${user.role === 'faculty' ? 'bg-white/80 faculty-pulse' : 'bg-primary faculty-pulse'}
                            `}></div>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            {/* Enhanced user profile at bottom */}
            <div className="mt-auto p-6 border-t border-white/20">
              <div className={`
                rounded-2xl p-4 transition-all duration-300 sidebar-profile-hover
                ${user.role === 'faculty'
                  ? 'bg-white/10 backdrop-blur-sm'
                  : 'bg-muted/50'
                }
              `}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white/30">
                    {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                    <AvatarFallback
                      className="text-sm text-white flex items-center justify-center font-semibold"
                      style={{
                        backgroundColor: user.role === 'faculty'
                          ? 'rgba(255,255,255,0.2)'
                          : getAvatarColor(user.fullName)
                      }}
                    >
                      {user.fullName
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className={`font-semibold leading-none line-clamp-1 ${user.role === 'faculty' ? 'text-white' : 'text-foreground'
                      }`}>
                      {user.fullName}
                    </span>
                    <span className={`text-xs line-clamp-1 mt-1 ${user.role === 'faculty' ? 'text-white/80' : 'text-muted-foreground'
                      }`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      {user.department && ` • ${user.department}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Sidebar>

          <SidebarInset className="flex-1">
            {/* Enhanced Header */}
            <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b backdrop-blur-xl px-6 bg-background/95 border-border supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-6">
                <SidebarTrigger className="transition-all duration-300 hover:scale-110 sidebar-icon-hover" />
                <div className="hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                      {currentPage === 'dashboard' && <Home className="h-4 w-4 text-white" />}
                      {currentPage === 'my-timetable' && <Calendar className="h-4 w-4 text-white" />}
                      {currentPage === 'assignment-management' && <ClipboardList className="h-4 w-4 text-white" />}
                      {currentPage === 'grading' && <GraduationCap className="h-4 w-4 text-white" />}
                      {currentPage === 'mark-attendance' && <Calendar className="h-4 w-4 text-white" />}
                      {currentPage === 'attendance-analytics' && <TrendingUp className="h-4 w-4 text-white" />}
                      {!['dashboard', 'my-timetable', 'assignment-management', 'grading', 'mark-attendance', 'attendance-analytics'].includes(currentPage) && <FileText className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold capitalize text-foreground">
                        {currentPage.replace("-", " ")}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {user.role === 'faculty' && currentPage === 'dashboard' && 'Your teaching overview'}
                        {user.role === 'faculty' && currentPage === 'my-timetable' && 'Your schedule and classes'}
                        {user.role === 'faculty' && currentPage === 'assignment-management' && 'Manage course assignments'}
                        {user.role === 'faculty' && currentPage === 'grading' && 'Review and grade submissions'}
                        {user.role === 'faculty' && currentPage === 'mark-attendance' && 'Take student attendance'}
                        {user.role === 'faculty' && currentPage === 'attendance-analytics' && 'View attendance insights'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">

                <Button
                  variant="ghost"
                  size="icon"
                  className="relative transition-all duration-300 hover:scale-110 sidebar-icon-hover"
                  onClick={() => {
                    setCurrentPage("announcements")
                    toast({
                      title: "Announcements",
                      description: "Checking for new announcements...",
                      duration: 2000,
                    })
                    refreshAnnouncements()
                  }}
                  title={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    </div>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-3 transition-all duration-300 hover:scale-105"
                    >
                      <Avatar className="h-10 w-10 border-2 border-white/30">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} />
                        ) : null}
                        <AvatarFallback
                          className="text-sm text-white flex items-center justify-center font-semibold"
                          style={{
                            backgroundColor: user.role === 'faculty'
                              ? 'hsl(var(--faculty-primary))'
                              : getAvatarColor(user.fullName)
                          }}
                        >
                          {user.fullName
                            .split(" ")
                            .slice(0, 2)
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden lg:block text-left">
                        <div className="font-semibold text-foreground">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => {
                      window.history.pushState({}, '', '/dashboard')
                      setCurrentPage("profile")
                    }}>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 relative z-0">{renderContent()}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
