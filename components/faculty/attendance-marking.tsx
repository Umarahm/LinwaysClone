"use client"

import * as React from "react"
import { Calendar, Users, Check, X, Save, UserCheck, AlertTriangle, TrendingUp, Clock, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { getFacultyCourses, getCourseStudents, markAttendance, checkAttendanceStatus, getFacultyAttendanceAnalytics } from "@/lib/attendance-actions"

interface Student {
  id: number
  full_name: string
  email: string
  attendance_status: 'present' | 'absent' | null
  attendance_id?: number
  total_attendance_count: number
  present_count: number
  attendance_percentage: number
}

interface Course {
  id: number
  code: string
  name: string
  credits: number
  description: string
  enrolled_students: number
  classes_held: number
  average_attendance: number
}

interface AttendanceAnalytics {
  courseStats: Array<{
    code: string
    name: string
    enrolled_students: number
    classes_held: number
    total_attendance_records: number
    total_present: number
    overall_attendance_rate: number
  }>
  recentTrends: Array<{
    week_start: string
    course_code: string
    present_count: number
    total_count: number
    weekly_rate: number
  }>
  lowAttendanceAlerts: Array<{
    student_name: string
    student_email: string
    course_code: string
    course_name: string
    total_classes: number
    present_classes: number
    attendance_rate: number
  }>
}

export function AttendanceMarking() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [selectedCourse, setSelectedCourse] = React.useState<string>("")
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [analytics, setAnalytics] = React.useState<AttendanceAnalytics | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [fetchLoading, setFetchLoading] = React.useState(true)
  const [attendanceMarked, setAttendanceMarked] = React.useState(false)
  const [attendanceStatus, setAttendanceStatus] = React.useState<any>(null)
  const { toast } = useToast()

  // Fetch faculty courses and analytics on component mount
  React.useEffect(() => {
    Promise.all([
      fetchFacultyCourses(),
      fetchAnalytics()
    ])
  }, [])

  const fetchFacultyCourses = async () => {
    try {
      setFetchLoading(true)
      const data = await getFacultyCourses()
      setCourses(data as Course[])
    } catch (error) {
      console.error('Error fetching faculty courses:', error)
      toast({
        title: "Error",
        description: "Failed to load your courses",
        variant: "destructive"
      })
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const data = await getFacultyAttendanceAnalytics()
      setAnalytics(data as AttendanceAnalytics)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  // Load students when course is selected
  React.useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchStudentsAndAttendanceStatus()
    }
  }, [selectedCourse, selectedDate])

  const fetchStudentsAndAttendanceStatus = async () => {
    try {
      setIsLoading(true)
      setAttendanceMarked(false)

      // Check if attendance is already marked
      const statusCheck = await checkAttendanceStatus(parseInt(selectedCourse), selectedDate)
      setAttendanceStatus(statusCheck)

      if (statusCheck.isMarked) {
        setAttendanceMarked(true)
      }

      // Fetch students with their attendance data
      const studentsData = await getCourseStudents(parseInt(selectedCourse), selectedDate)
      setStudents(studentsData as Student[])

    } catch (error) {
      console.error('Error fetching students:', error)
      toast({
        title: "Error",
        description: "Failed to load students",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent') => {
    setStudents(students.map(student =>
      student.id === studentId
        ? { ...student, attendance_status: status }
        : student
    ))
  }

  const handleBulkAttendance = (status: 'present' | 'absent') => {
    setStudents(students.map(student => ({
      ...student,
      attendance_status: status
    })))
  }

  const handleSubmitAttendance = async () => {
    const unmarkedStudents = students.filter(s => s.attendance_status === null)

    if (unmarkedStudents.length > 0) {
      const confirmed = window.confirm(
        `${unmarkedStudents.length} students have unmarked attendance. Mark them as absent and continue?`
      )
      if (!confirmed) return

      // Mark unmarked students as absent
      setStudents(students.map(student => ({
        ...student,
        attendance_status: student.attendance_status || 'absent'
      })))
    }

    setIsLoading(true)

    try {
      const attendanceData = students.map(s => ({
        studentId: s.id,
        status: s.attendance_status || 'absent'
      }))

      const formData = new FormData()
      formData.append('courseId', selectedCourse)
      formData.append('date', selectedDate)
      formData.append('attendanceData', JSON.stringify(attendanceData))

      const result = await markAttendance(formData)

      if (result.success) {
        setAttendanceMarked(true)
        toast({
          title: "Success",
          description: result.message
        })

        // Refresh analytics and status
        await Promise.all([
          fetchAnalytics(),
          fetchStudentsAndAttendanceStatus()
        ])
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting attendance:', error)
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAttendanceStats = () => {
    const present = students.filter(s => s.attendance_status === 'present').length
    const absent = students.filter(s => s.attendance_status === 'absent').length
    const unmarked = students.filter(s => s.attendance_status === null).length
    const total = students.length

    return { present, absent, unmarked, total }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const stats = getAttendanceStats()
  const selectedCourseData = courses.find(c => c.id === parseInt(selectedCourse))

  if (fetchLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your courses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">Mark attendance for your classes and view analytics</p>
        </div>
      </div>

      <Tabs defaultValue="mark-attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mark-attendance">Mark Attendance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Mark Attendance Tab */}
        <TabsContent value="mark-attendance" className="space-y-6">
          {/* Course Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Course & Date
              </CardTitle>
              <CardDescription>
                Choose the course and date for attendance marking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{course.code} - {course.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {course.enrolled_students} students enrolled
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {selectedCourseData && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Enrolled Students:</span>
                      <span className="ml-2">{selectedCourseData.enrolled_students}</span>
                    </div>
                    <div>
                      <span className="font-medium">Classes Held:</span>
                      <span className="ml-2">{selectedCourseData.classes_held}</span>
                    </div>
                    <div>
                      <span className="font-medium">Average Attendance:</span>
                      <span className="ml-2">{selectedCourseData.average_attendance.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {attendanceStatus?.isMarked && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Attendance has already been marked for this date by {attendanceStatus.markedBy}.
                    You can update it if needed.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Students List */}
          {selectedCourse && students.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Students ({students.length})
                    </CardTitle>
                    <CardDescription>
                      Mark attendance for {formatDate(selectedDate)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAttendance('present')}
                      disabled={isLoading}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark All Present
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAttendance('absent')}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Mark All Absent
                    </Button>
                  </div>
                </div>

                {/* Attendance Statistics */}
                {stats.total > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.present}</div>
                      <div className="text-sm text-green-700 dark:text-green-300">Present</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.absent}</div>
                      <div className="text-sm text-red-700 dark:text-red-300">Absent</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-950 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{stats.unmarked}</div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">Unmarked</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.total > 0 ? Math.round((stats.present / (stats.present + stats.absent || 1)) * 100) : 0}%
                      </div>
                      <div className="text-sm text-blue-700 dark:text-blue-300">Attendance Rate</div>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Overall Attendance</TableHead>
                      <TableHead>Today's Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{student.full_name}</div>
                            <div className="text-sm text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Progress value={student.attendance_percentage} className="h-2 w-20" />
                              <span className="text-sm font-medium">{student.attendance_percentage}%</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.present_count}/{student.total_attendance_count} classes
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              student.attendance_status === 'present'
                                ? 'default'
                                : student.attendance_status === 'absent'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                          >
                            {student.attendance_status === 'present' && <Check className="w-3 h-3 mr-1" />}
                            {student.attendance_status === 'absent' && <X className="w-3 h-3 mr-1" />}
                            {student.attendance_status || 'Not marked'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={student.attendance_status === 'present' ? 'default' : 'outline'}
                              onClick={() => handleAttendanceChange(student.id, 'present')}
                              disabled={isLoading}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={student.attendance_status === 'absent' ? 'destructive' : 'outline'}
                              onClick={() => handleAttendanceChange(student.id, 'absent')}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleSubmitAttendance}
                    disabled={isLoading || stats.total === 0}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {attendanceMarked ? 'Update Attendance' : 'Submit Attendance'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedCourse && students.length === 0 && !isLoading && (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                <p className="text-muted-foreground">
                  No students are enrolled in this course or no data available for the selected date.
                </p>
              </CardContent>
            </Card>
          )}

          {!selectedCourse && (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
                <p className="text-muted-foreground">
                  Please select a course and date to mark attendance.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <>
              {/* Course Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Course Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analytics.courseStats.map((course, index) => (
                      <Card key={index} className="border">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">{course.code}</h4>
                              <Badge variant="outline">{course.overall_attendance_rate.toFixed(1)}%</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{course.name}</p>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Students: {course.enrolled_students}</span>
                                <span>Classes: {course.classes_held}</span>
                              </div>
                              <Progress value={course.overall_attendance_rate} className="h-2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Low Attendance Alerts */}
              {analytics.lowAttendanceAlerts.length > 0 && (
                <Card className="border-amber-200 dark:border-amber-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                      <AlertTriangle className="h-5 w-5" />
                      Low Attendance Alerts
                    </CardTitle>
                    <CardDescription>
                      Students with attendance below 75%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.lowAttendanceAlerts.map((alert, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                          <div>
                            <div className="font-medium">{alert.student_name}</div>
                            <div className="text-sm text-muted-foreground">
                              {alert.course_code} - {alert.present_classes}/{alert.total_classes} classes
                            </div>
                          </div>
                          <Badge variant="destructive">
                            {alert.attendance_rate.toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Trends */}
              {analytics.recentTrends.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Recent Trends (Last 4 Weeks)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics.recentTrends.map((trend, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              {trend.course_code} - Week of {new Date(trend.week_start).toLocaleDateString()}
                            </span>
                            <span className="font-medium">{trend.weekly_rate.toFixed(1)}%</span>
                          </div>
                          <Progress value={trend.weekly_rate} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Present: {trend.present_count}</span>
                            <span>Total: {trend.total_count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
