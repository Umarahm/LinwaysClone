"use client"

import { Calendar, CheckCircle, TrendingUp, XCircle, AlertTriangle, Clock, User, BarChart3 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AttendanceRecord {
  id: number
  date: string
  course_name: string
  course_code: string
  status: "present" | "absent"
  marked_by_name?: string
  start_time?: string
  end_time?: string
  room?: string
}

interface AttendanceSummary {
  course_code: string
  course_name: string
  course_id: number
  present_count: number
  absent_count: number
  total_count: number
  percentage: number
  first_class_date?: string
  last_class_date?: string
}

interface WeeklyTrend {
  week_start: string
  present_count: number
  total_count: number
  weekly_percentage: number
}

interface MonthlyStat {
  month_start: string
  present_count: number
  absent_count: number
  total_count: number
}

interface AttendanceViewProps {
  attendanceRecords: AttendanceRecord[]
  attendanceSummary: AttendanceSummary[]
  weeklyTrends: WeeklyTrend[]
  monthlyStats: MonthlyStat[]
}

export function AttendanceView({
  attendanceRecords,
  attendanceSummary,
  weeklyTrends,
  monthlyStats
}: AttendanceViewProps) {
  const overallPercentage =
    attendanceSummary.length > 0
      ? Math.round(attendanceSummary.reduce((acc, curr) => acc + curr.percentage, 0) / attendanceSummary.length)
      : 0

  const totalPresent = attendanceSummary.reduce((acc, curr) => acc + curr.present_count, 0)
  const totalClasses = attendanceSummary.reduce((acc, curr) => acc + curr.total_count, 0)
  const totalAbsent = attendanceSummary.reduce((acc, curr) => acc + curr.absent_count, 0)

  // Get attendance status color
  const getAttendanceStatusColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600 dark:text-green-400"
    if (percentage >= 75) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getAttendanceStatusBadge = (percentage: number) => {
    if (percentage >= 85) return { variant: "default" as const, text: "Excellent", color: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" }
    if (percentage >= 75) return { variant: "secondary" as const, text: "Good", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200" }
    return { variant: "destructive" as const, text: "Low", color: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" }
  }

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Format time helper
  const formatTime = (timeString?: string) => {
    if (!timeString) return ""
    const [hours, minutes] = timeString.split(':')
    const hour24 = parseInt(hours)
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
    const ampm = hour24 >= 12 ? 'PM' : 'AM'
    return `${hour12}:${minutes} ${ampm}`
  }

  // Get recent trend
  const recentTrend = weeklyTrends.length > 1 ?
    weeklyTrends[0].weekly_percentage - weeklyTrends[1].weekly_percentage : 0

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Attendance</h1>
          <p className="text-muted-foreground mt-1">Track your class attendance across all courses with detailed analytics</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Overall Attendance</p>
                <p className="text-3xl font-bold">{overallPercentage}%</p>
                <p className="text-blue-100 text-xs mt-1">
                  {recentTrend !== 0 && (
                    <span className={recentTrend > 0 ? "text-green-200" : "text-red-200"}>
                      {recentTrend > 0 ? "+" : ""}{recentTrend.toFixed(1)}% this week
                    </span>
                  )}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">Classes Attended</p>
                <p className="text-3xl font-bold">{totalPresent}</p>
                <p className="text-emerald-100 text-xs mt-1">Out of {totalClasses} total</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium">Classes Missed</p>
                <p className="text-3xl font-bold">{totalAbsent}</p>
                <p className="text-amber-100 text-xs mt-1">Absent days</p>
              </div>
              <XCircle className="w-8 h-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100 text-sm font-medium">Courses Enrolled</p>
                <p className="text-3xl font-bold">{attendanceSummary.length}</p>
                <p className="text-violet-100 text-xs mt-1">Active courses</p>
              </div>
              <BarChart3 className="w-8 h-8 text-violet-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">By Course</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Course-wise Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 w-5" />
                Course-wise Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {attendanceSummary.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No attendance data available</p>
                </div>
              ) : (
                attendanceSummary.map((summary, index) => {
                  const statusBadge = getAttendanceStatusBadge(summary.percentage)
                  return (
                    <div key={index} className="space-y-3 p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{summary.course_code}</span>
                            <Badge className={statusBadge.color}>
                              {statusBadge.text}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">{summary.course_name}</span>
                        </div>
                        <div className="text-right">
                          <span className={`font-bold text-lg ${getAttendanceStatusColor(summary.percentage)}`}>
                            {summary.percentage.toFixed(1)}%
                          </span>
                          <div className="text-sm text-muted-foreground">
                            {summary.present_count}/{summary.total_count} classes
                          </div>
                        </div>
                      </div>
                      <Progress value={summary.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Present: {summary.present_count}</span>
                        <span>Absent: {summary.absent_count}</span>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Attendance Alerts */}
          {attendanceSummary.some(s => s.percentage < 75) && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="w-5 h-5" />
                  Attendance Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendanceSummary
                    .filter(s => s.percentage < 75)
                    .map((course, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                        <div>
                          <span className="font-medium">{course.course_code}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Attendance below 75% threshold
                          </span>
                        </div>
                        <Badge variant="destructive">
                          {course.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attendanceSummary.map((course, index) => {
              const statusBadge = getAttendanceStatusBadge(course.percentage)
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{course.course_code}</CardTitle>
                      <Badge className={statusBadge.color}>
                        {statusBadge.text}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.course_name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getAttendanceStatusColor(course.percentage)}`}>
                          {course.percentage.toFixed(1)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Attendance Rate</p>
                      </div>

                      <Progress value={course.percentage} className="h-2" />

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {course.present_count}
                          </div>
                          <p className="text-xs text-muted-foreground">Present</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                            {course.absent_count}
                          </div>
                          <p className="text-xs text-muted-foreground">Absent</p>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-muted-foreground">
                            {course.total_count}
                          </div>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                      </div>

                      {course.first_class_date && course.last_class_date && (
                        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                          {formatDate(course.first_class_date)} - {formatDate(course.last_class_date)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {weeklyTrends.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">No weekly data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {weeklyTrends.slice(0, 8).map((week, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Week of {formatDate(week.week_start)}
                          </span>
                          <span className={`font-medium ${getAttendanceStatusColor(week.weekly_percentage)}`}>
                            {week.weekly_percentage.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={week.weekly_percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Present: {week.present_count}</span>
                          <span>Total: {week.total_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Monthly Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyStats.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground">No monthly data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {monthlyStats.slice(0, 6).map((month, index) => {
                      const monthlyPercentage = month.total_count > 0
                        ? (month.present_count / month.total_count) * 100
                        : 0
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {new Date(month.month_start).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long'
                              })}
                            </span>
                            <span className={`font-medium ${getAttendanceStatusColor(monthlyPercentage)}`}>
                              {monthlyPercentage.toFixed(1)}%
                            </span>
                          </div>
                          <Progress value={monthlyPercentage} className="h-2" />
                          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                            <span>Present: {month.present_count}</span>
                            <span>Absent: {month.absent_count}</span>
                            <span>Total: {month.total_count}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Detailed Attendance Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="text-muted-foreground">No attendance records found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Marked By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {formatDate(record.date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{record.course_code}</div>
                            <div className="text-sm text-muted-foreground">{record.course_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.start_time && record.end_time ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {formatTime(record.start_time)} - {formatTime(record.end_time)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.room || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={record.status === "present" ? "default" : "destructive"}
                            className="flex items-center gap-1 w-fit"
                          >
                            {record.status === "present" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {record.status === "present" ? "Present" : "Absent"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.marked_by_name ? (
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">{record.marked_by_name}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
