"use client"

import * as React from "react"
import { Calendar, CheckCircle, XCircle, TrendingUp, Filter } from "lucide-react"

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
import { Progress } from "@/components/ui/progress"

interface AttendanceRecord {
    id: number
    date: string
    courseCode: string
    courseName: string
    status: 'present' | 'absent'
    markedBy: string
}

interface CourseAttendanceSummary {
    courseCode: string
    courseName: string
    totalClasses: number
    presentCount: number
    absentCount: number
    attendancePercentage: number
}

export function AttendanceHistory() {
    const [attendanceRecords, setAttendanceRecords] = React.useState<AttendanceRecord[]>([])
    const [courseSummary, setCourseSummary] = React.useState<CourseAttendanceSummary[]>([])
    const [selectedCourse, setSelectedCourse] = React.useState<string>("")
    const [isLoading, setIsLoading] = React.useState(true)

    // Mock data - replace with actual API calls
    React.useEffect(() => {
        setTimeout(() => {
            const mockRecords: AttendanceRecord[] = [
                {
                    id: 1,
                    date: "2024-12-15",
                    courseCode: "CS201",
                    courseName: "Data Structures & Algorithms",
                    status: "present",
                    markedBy: "Dr. Sarah Johnson"
                },
                {
                    id: 2,
                    date: "2024-12-14",
                    courseCode: "CS301",
                    courseName: "Database Management Systems",
                    status: "present",
                    markedBy: "Dr. Sarah Johnson"
                },
                {
                    id: 3,
                    date: "2024-12-13",
                    courseCode: "IT401",
                    courseName: "Web Development",
                    status: "absent",
                    markedBy: "Prof. Michael Brown"
                },
                {
                    id: 4,
                    date: "2024-12-12",
                    courseCode: "CS201",
                    courseName: "Data Structures & Algorithms",
                    status: "present",
                    markedBy: "Dr. Sarah Johnson"
                },
                {
                    id: 5,
                    date: "2024-12-11",
                    courseCode: "CS301",
                    courseName: "Database Management Systems",
                    status: "present",
                    markedBy: "Dr. Sarah Johnson"
                },
                {
                    id: 6,
                    date: "2024-12-10",
                    courseCode: "IT401",
                    courseName: "Web Development",
                    status: "present",
                    markedBy: "Prof. Michael Brown"
                },
                {
                    id: 7,
                    date: "2024-12-09",
                    courseCode: "CS201",
                    courseName: "Data Structures & Algorithms",
                    status: "absent",
                    markedBy: "Dr. Sarah Johnson"
                },
                {
                    id: 8,
                    date: "2024-12-08",
                    courseCode: "CS301",
                    courseName: "Database Management Systems",
                    status: "present",
                    markedBy: "Dr. Sarah Johnson"
                },
                {
                    id: 9,
                    date: "2024-12-07",
                    courseCode: "IT401",
                    courseName: "Web Development",
                    status: "present",
                    markedBy: "Prof. Michael Brown"
                },
                {
                    id: 10,
                    date: "2024-12-06",
                    courseCode: "CS201",
                    courseName: "Data Structures & Algorithms",
                    status: "present",
                    markedBy: "Dr. Sarah Johnson"
                }
            ]

            setAttendanceRecords(mockRecords)

            // Calculate course summaries
            const courseGroups = mockRecords.reduce((acc, record) => {
                const key = record.courseCode
                if (!acc[key]) {
                    acc[key] = {
                        courseCode: record.courseCode,
                        courseName: record.courseName,
                        records: []
                    }
                }
                acc[key].records.push(record)
                return acc
            }, {} as { [key: string]: { courseCode: string, courseName: string, records: AttendanceRecord[] } })

            const summaries = Object.values(courseGroups).map(group => {
                const totalClasses = group.records.length
                const presentCount = group.records.filter(r => r.status === 'present').length
                const absentCount = totalClasses - presentCount
                const attendancePercentage = Math.round((presentCount / totalClasses) * 100)

                return {
                    courseCode: group.courseCode,
                    courseName: group.courseName,
                    totalClasses,
                    presentCount,
                    absentCount,
                    attendancePercentage
                }
            })

            setCourseSummary(summaries)
            setIsLoading(false)
        }, 1000)
    }, [])

    const filteredRecords = selectedCourse && selectedCourse !== "all"
        ? attendanceRecords.filter(record => record.courseCode === selectedCourse)
        : attendanceRecords

    const overallStats = {
        totalClasses: attendanceRecords.length,
        presentCount: attendanceRecords.filter(r => r.status === 'present').length,
        absentCount: attendanceRecords.filter(r => r.status === 'absent').length,
        overallPercentage: attendanceRecords.length > 0
            ? Math.round((attendanceRecords.filter(r => r.status === 'present').length / attendanceRecords.length) * 100)
            : 0
    }

    const getStatusColor = (status: string) => {
        return status === 'present'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }

    const getAttendanceGrade = (percentage: number) => {
        if (percentage >= 90) return { grade: 'Excellent', color: 'text-green-600' }
        if (percentage >= 80) return { grade: 'Good', color: 'text-blue-600' }
        if (percentage >= 75) return { grade: 'Satisfactory', color: 'text-yellow-600' }
        if (percentage >= 65) return { grade: 'Below Average', color: 'text-orange-600' }
        return { grade: 'Poor', color: 'text-red-600' }
    }

    const courses = [...new Set(attendanceRecords.map(r => ({ code: r.courseCode, name: r.courseName })))]

    return (
        <div className="space-y-6 bg-background text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Attendance History</h2>
                    <p className="text-muted-foreground">
                        View your attendance records and overall performance
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger className="w-[250px]">
                            <SelectValue placeholder="All courses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All courses</SelectItem>
                            {courses.map((course, index) => (
                                <SelectItem key={index} value={course.code}>
                                    {course.code} - {course.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Overall Summary Card */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Overall Attendance Summary
                    </CardTitle>
                    <CardDescription>
                        Your overall attendance performance across all courses
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">{overallStats.overallPercentage}%</div>
                            <p className="text-sm text-muted-foreground">Overall Attendance</p>
                            <div className={`text-sm font-medium ${getAttendanceGrade(overallStats.overallPercentage).color}`}>
                                {getAttendanceGrade(overallStats.overallPercentage).grade}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold">{overallStats.totalClasses}</div>
                            <p className="text-sm text-muted-foreground">Total Classes</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{overallStats.presentCount}</div>
                            <p className="text-sm text-muted-foreground">Classes Attended</p>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{overallStats.absentCount}</div>
                            <p className="text-sm text-muted-foreground">Classes Missed</p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Attendance Progress</span>
                            <span>{overallStats.overallPercentage}%</span>
                        </div>
                        <Progress value={overallStats.overallPercentage} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* Course-wise Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Course-wise Attendance Summary</CardTitle>
                    <CardDescription>
                        Attendance breakdown by individual courses
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {courseSummary.map((course) => (
                            <Card key={course.courseCode} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">{course.courseCode}</CardTitle>
                                    <CardDescription className="text-sm">{course.courseName}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted-foreground">Attendance</span>
                                            <span className={`text-lg font-bold ${getAttendanceGrade(course.attendancePercentage).color}`}>
                                                {course.attendancePercentage}%
                                            </span>
                                        </div>
                                        <Progress value={course.attendancePercentage} className="h-2" />
                                        <div className="flex justify-between text-sm text-muted-foreground">
                                            <span>{course.presentCount} Present</span>
                                            <span>{course.absentCount} Absent</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Total Classes: {course.totalClasses}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Attendance Records */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance Records</CardTitle>
                    <CardDescription>
                        Detailed view of your attendance for each class
                        {selectedCourse && selectedCourse !== "all" && ` - ${courses.find(c => c.code === selectedCourse)?.name}`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Marked By</TableHead>
                                <TableHead className="text-right">Day</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredRecords
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{record.courseCode}</div>
                                                <div className="text-sm text-muted-foreground">{record.courseName}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(record.status)}>
                                                {record.status === 'present' ? (
                                                    <><CheckCircle className="mr-1 h-3 w-3" /> Present</>
                                                ) : (
                                                    <><XCircle className="mr-1 h-3 w-3" /> Absent</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{record.markedBy}</TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long' })}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>

                    {filteredRecords.length === 0 && (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Attendance Records</h3>
                            <p className="text-muted-foreground">
                                {selectedCourse && selectedCourse !== "all"
                                    ? "No attendance records found for the selected course."
                                    : "No attendance records available yet."
                                }
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Attendance Tips */}
            <Card className="bg-yellow-50 dark:bg-yellow-950/20">
                <CardHeader>
                    <CardTitle className="text-yellow-800 dark:text-yellow-200">📝 Attendance Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>• Minimum 75% attendance is required for eligibility to appear in examinations</p>
                        <p>• 90%+ attendance is considered excellent and may qualify for additional benefits</p>
                        <p>• Contact your faculty immediately if you notice any discrepancies in attendance records</p>
                        <p>• Regular attendance helps in better understanding of course material and improved performance</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 