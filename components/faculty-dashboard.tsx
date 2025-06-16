"use client"

import * as React from "react"
import { BookOpen, Users, FileText, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardAnnouncements } from "@/components/dashboard-announcements"
import { MiniTimetable } from "@/components/faculty/mini-timetable"

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
      <div className="p-6 space-y-6 bg-background min-h-screen">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome, {user?.fullName || 'Faculty'} - Manage your courses and students
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Courses Taught</p>
                <p className="text-3xl font-bold">{courses.length}</p>
                <p className="text-blue-100 text-xs mt-1">This semester</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Total Credits</p>
                <p className="text-3xl font-bold">{courses.reduce((acc, course) => acc + course.credits, 0)}</p>
                <p className="text-emerald-100 text-xs mt-1">Teaching load</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Assignments</p>
                <p className="text-3xl font-bold">{stats.pendingAssignments}</p>
                <p className="text-amber-100 text-xs mt-1">Pending grading</p>
              </div>
              <FileText className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Students</p>
                <p className="text-3xl font-bold">{stats.totalStudents}</p>
                <p className="text-purple-100 text-xs mt-1">Total enrolled</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Timetable */}
      {user && (
        <MiniTimetable userId={user.id} userRole={user.role} />
      )}

      {/* Courses Taught */}
      <Card className="shadow-sm border bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Course Code</TableHead>
                <TableHead className="text-muted-foreground">Course Name</TableHead>
                <TableHead className="text-muted-foreground">Faculty</TableHead>
                <TableHead className="text-muted-foreground">Credits</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-foreground">{course.code}</TableCell>
                  <TableCell className="text-foreground">{course.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {course.all_faculty_names ? (
                        course.all_faculty_names.split(', ').map((facultyName, index) => (
                          <Badge
                            key={index}
                            variant={index === 0 && course.is_primary ? "default" : "outline"}
                            className="text-xs w-fit"
                          >
                            {index === 0 && course.is_primary && '👑 '}
                            {facultyName}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="outline" className="text-xs">No Faculty Assigned</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{course.credits}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(course.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {courses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No courses assigned yet. Contact admin to get courses assigned to you.
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Statistics */}
        <Card className="shadow-sm border bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Courses Teaching</span>
              <Badge variant="default">{courses.length}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Total Credits</span>
              <Badge variant="secondary">{courses.reduce((acc, course) => acc + course.credits, 0)}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Total Assignments</span>
              <Badge variant="secondary">{stats.totalAssignments}</Badge>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-foreground">Total Students</span>
              <Badge variant="secondary">{stats.totalStudents}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <DashboardAnnouncements userRole="faculty" limit={4} />
      </div>
    </div>
  );
}
