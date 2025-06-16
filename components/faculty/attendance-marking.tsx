"use client"

import * as React from "react"
import { Calendar, Users, Check, X, Save, UserCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

interface Student {
  id: number
  name: string
  rollNumber: string
  email: string
  attendance: 'present' | 'absent' | null
}

interface Course {
  id: number
  code: string
  name: string
  enrolledStudents: number
}

export function AttendanceMarking() {
  const [courses, setCourses] = React.useState<Course[]>([])
  const [students, setStudents] = React.useState<Student[]>([])
  const [selectedCourse, setSelectedCourse] = React.useState<string>("")
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [isLoading, setIsLoading] = React.useState(false)
  const [attendanceMarked, setAttendanceMarked] = React.useState(false)

  // Mock data - replace with actual API calls
  React.useEffect(() => {
    setCourses([
      { id: 1, code: "CS201", name: "Data Structures & Algorithms", enrolledStudents: 45 },
      { id: 2, code: "CS301", name: "Database Management Systems", enrolledStudents: 38 },
      { id: 3, code: "IT401", name: "Web Development", enrolledStudents: 52 },
    ])
  }, [])

  // Load students when course is selected
  React.useEffect(() => {
    if (selectedCourse && selectedDate) {
      setIsLoading(true)

      // Simulate API call
      setTimeout(() => {
        const mockStudents: Student[] = [
          {
            id: 1,
            name: "John Doe",
            rollNumber: "CS2021001",
            email: "john.doe@presidency.edu",
            attendance: null
          },
          {
            id: 2,
            name: "Jane Smith",
            rollNumber: "CS2021002",
            email: "jane.smith@presidency.edu",
            attendance: null
          },
          {
            id: 3,
            name: "Mike Johnson",
            rollNumber: "CS2021003",
            email: "mike.johnson@presidency.edu",
            attendance: null
          },
          {
            id: 4,
            name: "Sarah Wilson",
            rollNumber: "CS2021004",
            email: "sarah.wilson@presidency.edu",
            attendance: null
          },
          {
            id: 5,
            name: "David Brown",
            rollNumber: "CS2021005",
            email: "david.brown@presidency.edu",
            attendance: null
          },
          {
            id: 6,
            name: "Emily Davis",
            rollNumber: "CS2021006",
            email: "emily.davis@presidency.edu",
            attendance: null
          },
          {
            id: 7,
            name: "Alex Miller",
            rollNumber: "CS2021007",
            email: "alex.miller@presidency.edu",
            attendance: null
          },
          {
            id: 8,
            name: "Lisa Garcia",
            rollNumber: "CS2021008",
            email: "lisa.garcia@presidency.edu",
            attendance: null
          }
        ]

        setStudents(mockStudents)
        setAttendanceMarked(false)
        setIsLoading(false)
      }, 1000)
    }
  }, [selectedCourse, selectedDate])

  const handleAttendanceChange = (studentId: number, status: 'present' | 'absent') => {
    setStudents(students.map(student =>
      student.id === studentId
        ? { ...student, attendance: status }
        : student
    ))
  }

  const handleBulkAttendance = (status: 'present' | 'absent') => {
    setStudents(students.map(student => ({ ...student, attendance: status })))
  }

  const handleSubmitAttendance = async () => {
    const unmarkedStudents = students.filter(s => s.attendance === null)

    if (unmarkedStudents.length > 0) {
      if (!confirm(`${unmarkedStudents.length} students have unmarked attendance. Continue?`)) {
        return
      }
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setAttendanceMarked(true)
      setIsLoading(false)

      // Show success message
      alert("Attendance marked successfully!")
    }, 1500)
  }

  const getAttendanceStats = () => {
    const present = students.filter(s => s.attendance === 'present').length
    const absent = students.filter(s => s.attendance === 'absent').length
    const unmarked = students.filter(s => s.attendance === null).length
    const total = students.length

    return { present, absent, unmarked, total }
  }

  const stats = getAttendanceStats()
  const selectedCourseInfo = courses.find(c => c.id === parseInt(selectedCourse))

  return (
    <div className="space-y-6 bg-background text-foreground">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Mark Attendance</h2>
        <p className="text-muted-foreground">
          Select a course and date to mark student attendance
        </p>
      </div>

      {/* Course and Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
          <CardDescription>
            Select the course and date for attendance marking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course">Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Select Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {selectedCourse && selectedDate && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium">
                  Marking attendance for {selectedCourseInfo?.code} - {selectedCourseInfo?.name}
                </span>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Date: {new Date(selectedDate).toLocaleDateString()} |
                Students: {students.length}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      {selectedCourse && students.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <Check className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% attendance
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <X className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unmarked</CardTitle>
              <UserCheck className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.unmarked}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.unmarked / stats.total) * 100) : 0}% unmarked
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Attendance Table */}
      {selectedCourse && students.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription>
                  Mark attendance for each student
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAttendance('present')}
                  disabled={attendanceMarked}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Mark All Present
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAttendance('absent')}
                  disabled={attendanceMarked}
                >
                  <X className="mr-2 h-4 w-4" />
                  Mark All Absent
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Present</TableHead>
                  <TableHead className="text-center">Absent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell className="text-muted-foreground">{student.email}</TableCell>
                    <TableCell>
                      {student.attendance === 'present' && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Present
                        </Badge>
                      )}
                      {student.attendance === 'absent' && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          Absent
                        </Badge>
                      )}
                      {student.attendance === null && (
                        <Badge variant="outline">
                          Unmarked
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.attendance === 'present'}
                        onCheckedChange={() => handleAttendanceChange(student.id, 'present')}
                        disabled={attendanceMarked}
                        className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Checkbox
                        checked={student.attendance === 'absent'}
                        onCheckedChange={() => handleAttendanceChange(student.id, 'absent')}
                        disabled={attendanceMarked}
                        className="data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {!attendanceMarked && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleSubmitAttendance}
                  disabled={isLoading || students.every(s => s.attendance === null)}
                  size="lg"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Saving..." : "Submit Attendance"}
                </Button>
              </div>
            )}

            {attendanceMarked && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Attendance has been successfully marked!</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {stats.present} students present, {stats.absent} students absent
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedCourse && students.length === 0 && !isLoading && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Students Found</h3>
            <p className="text-muted-foreground">
              No students are enrolled in the selected course.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
