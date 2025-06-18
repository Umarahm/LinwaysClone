"use client"

import * as React from "react"
import { BookOpen, Users, FileText, TrendingUp, Clock, Calendar, GraduationCap, BarChart3, Award, Target } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import { MiniTimetable } from "@/components/faculty/mini-timetable"
import { Progress } from "@/components/ui/progress"

interface Course {
  id: number;
  code: string;
  name: string;
  faculty_name: string;
  all_faculty_names?: string;
  is_primary?: boolean;
  credits: number;
  created_at: string;
}

interface FacultyDashboardProps {
  user?: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    department: string;
  };
}

export function FacultyDashboard({ user }: FacultyDashboardProps) {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    pendingAssignments: 0,
    totalAssignments: 0,
  });

  React.useEffect(() => {
    fetchFacultyData();
  }, []);

  const fetchFacultyData = async () => {
    try {
      // Fetch courses assigned to this faculty
      const coursesResponse = await fetch(`/api/faculty/courses`);
      if (coursesResponse.ok) {
        const coursesData = await coursesResponse.json();
        setCourses(coursesData.courses || []);
      }

      // Fetch faculty stats
      const statsResponse = await fetch('/api/faculty/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.stats || {
          totalStudents: 0,
          pendingAssignments: 0,
          totalAssignments: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animated-gradient-bg relative overflow-hidden" style={{
        minHeight: '100vh',
        padding: '2rem'
      }}>
        {/* Animated Background Elements */}
        <div className="gradient-orb"></div>
        <div className="gradient-orb"></div>
        <div className="gradient-orb"></div>
        <div className="gradient-mesh"></div>

        <div className="flex justify-center items-center h-64 relative z-10">
          <div className="faculty-glass rounded-2xl p-8 text-center glow-effect">
            <div className="faculty-pulse w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="text-lg font-semibold text-foreground">Loading your dashboard...</div>
            <div className="text-sm text-muted-foreground mt-2">Preparing your teaching insights</div>
          </div>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalAssignments > 0 ? ((stats.totalAssignments - stats.pendingAssignments) / stats.totalAssignments) * 100 : 0;
  const totalCredits = courses.reduce((acc, course) => acc + course.credits, 0);

  return (
    <div className="animated-gradient-bg relative overflow-hidden" style={{
      minHeight: 'calc(100vh - 5rem)',
      padding: '1rem',
      paddingTop: '0'
    }}>
      {/* Animated Background Elements */}
      <div className="gradient-orb"></div>
      <div className="gradient-orb"></div>
      <div className="gradient-orb"></div>
      <div className="gradient-mesh"></div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto relative z-10 pt-6">
        <div className="faculty-glass rounded-3xl p-8 mb-8 faculty-shimmer subtle-wave glow-effect">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <div className="faculty-floating w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center breathing-glow">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white">
                    Welcome back, {user?.fullName?.split(' ')[0] || 'Professor'}! 👋
                  </h1>
                  <p className="text-white/80 text-lg font-medium">
                    {user?.department && `${user.department} Department`} • Ready to inspire minds today?
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced Info Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="faculty-glass rounded-2xl p-4 text-center glow-effect">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="w-5 h-5 text-white/80 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">{courses.length}</div>
                <div className="text-white/80 text-sm">Active Courses</div>
              </div>

              <div className="faculty-glass rounded-2xl p-4 text-center glow-effect">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-white/80 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">{totalCredits}</div>
                <div className="text-white/80 text-sm">Credit Hours</div>
              </div>

              <div className="faculty-glass rounded-2xl p-4 text-center glow-effect">
                <div className="flex items-center justify-center mb-2">
                  <FileText className="w-5 h-5 text-white/80 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.pendingAssignments}</div>
                <div className="text-white/80 text-sm">Pending Grading</div>
              </div>

              <div className="faculty-glass rounded-2xl p-4 text-center glow-effect">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-5 h-5 text-white/80 mr-2" />
                </div>
                <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                <div className="text-white/80 text-sm">Total Students</div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="mb-8">
          {user && (
            <div className="faculty-glass rounded-3xl p-6 glow-effect subtle-wave">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-2xl font-bold text-white">Today's Schedule</h2>
              </div>
              <MiniTimetable userId={user.id} userRole={user.role} />
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Courses Section - Takes up 2 columns */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="faculty-glass border-0 rounded-3xl overflow-hidden glow-effect">
              <CardHeader className="border-b border-white/20 bg-white/10 subtle-wave">
                <CardTitle className="flex items-center gap-3 text-white text-xl">
                  <BookOpen className="w-6 h-6" />
                  My Courses
                  <Badge className="bg-white/20 text-white border-white/30">{courses.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto faculty-table-scroll">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-white/90 font-semibold">Course</TableHead>
                        <TableHead className="text-white/90 font-semibold">Faculty</TableHead>
                        <TableHead className="text-white/90 font-semibold">Credits</TableHead>
                        <TableHead className="text-white/90 font-semibold">Status</TableHead>
                        <TableHead className="text-white/90 font-semibold">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course, index) => (
                        <TableRow
                          key={course.id}
                          className="border-white/20 hover:bg-white/10 transition-colors"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <TableCell>
                            <div>
                              <div className="font-semibold text-white">{course.code}</div>
                              <div className="text-white/80 text-sm">{course.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {course.all_faculty_names ? (
                                course.all_faculty_names.split(', ').map((facultyName, index) => (
                                  <Badge
                                    key={index}
                                    variant={index === 0 && course.is_primary ? "default" : "outline"}
                                    className={`text-xs glow-effect ${index === 0 && course.is_primary
                                      ? 'bg-white/20 text-white border-white/30'
                                      : 'bg-transparent text-white/80 border-white/30'
                                      }`}
                                  >
                                    {index === 0 && course.is_primary && '👑 '}
                                    {facultyName}
                                  </Badge>
                                ))
                              ) : (
                                <Badge className="bg-transparent text-white/60 border-white/30 text-xs">
                                  No Faculty Assigned
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-white/20 text-white border-white/30 glow-effect">
                              {course.credits}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-green-500/20 text-green-300 border-green-500/30 breathing-glow">
                              Active
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white/80">
                            {new Date(course.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {courses.length === 0 && (
                    <div className="text-center py-12">
                      <div className="faculty-floating w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center breathing-glow">
                        <BookOpen className="w-8 h-8 text-white/60" />
                      </div>
                      <p className="text-white/80 text-lg">No courses assigned yet</p>
                      <p className="text-white/60 text-sm">Contact admin to get courses assigned to you</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="faculty-glass border-0 rounded-3xl overflow-hidden glow-effect">
              <CardHeader className="border-b border-white/20 bg-white/10 subtle-wave">
                <CardTitle className="flex items-center gap-3 text-white">
                  <BarChart3 className="w-5 h-5" />
                  Teaching Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/90 font-medium">Grading Progress</span>
                    <span className="text-white font-semibold">{Math.round(completionRate)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2 bg-white/20">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-300 breathing-glow"
                      style={{ width: `${completionRate}%` }}
                    />
                  </Progress>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                    <div className="text-2xl font-bold text-white">{courses.length}</div>
                    <div className="text-white/80 text-sm">Courses</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                    <div className="text-2xl font-bold text-white">{totalCredits}</div>
                    <div className="text-white/80 text-sm">Credits</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                    <div className="text-2xl font-bold text-white">{stats.totalAssignments}</div>
                    <div className="text-white/80 text-sm">Assignments</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 text-center glow-effect subtle-wave">
                    <div className="text-2xl font-bold text-white">{stats.totalStudents}</div>
                    <div className="text-white/80 text-sm">Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Announcements */}
            <div className="faculty-glass rounded-3xl overflow-hidden glow-effect subtle-wave">
              <DashboardAnnouncements userRole="faculty" userEmail={user?.email} limit={4} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
