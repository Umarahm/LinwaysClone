"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Calendar, Clock, Users, BookOpen, MapPin, Check, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getTimetableByUser, checkTimetableAttendance } from "@/lib/timetable-actions"

interface TimetableEntry {
    id: number
    course_id: number
    course_name: string
    course_code: string
    faculty_id: number
    faculty_name: string
    day: string
    start_time: string
    end_time: string
    room: string
}

export function CourseSelectionForAttendance() {
    const router = useRouter()
    const { toast } = useToast()
    const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([])
    const [selectedCourse, setSelectedCourse] = useState<string>("")
    const [selectedDate, setSelectedDate] = useState<string>(
        new Date().toISOString().split('T')[0]
    )
    const [isLoading, setIsLoading] = useState(true)
    const [attendanceStatus, setAttendanceStatus] = useState<Record<number, boolean>>({})

    useEffect(() => {
        fetchTimetableEntries()
    }, [])

    // Check attendance status when date changes
    useEffect(() => {
        if (timetableEntries.length > 0 && selectedDate) {
            checkAttendanceForDate()
        }
    }, [selectedDate, timetableEntries])

    const fetchTimetableEntries = async () => {
        try {
            setIsLoading(true)
            const data = await getTimetableByUser() as TimetableEntry[]
            setTimetableEntries(data)
        } catch (error) {
            console.error('Error fetching timetable:', error)
            toast({
                title: "Loading Error",
                description: "Failed to load your courses. Please refresh the page.",
                variant: "warning" as any,
                duration: 5000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const checkAttendanceForDate = async () => {
        try {
            const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })
            const dayTimetableEntries = timetableEntries.filter(entry =>
                entry.day.toLowerCase() === selectedDay.toLowerCase()
            )

            const statusPromises = dayTimetableEntries.map(async (entry) => {
                try {
                    const result = await checkTimetableAttendance(entry.id)
                    return { timetableId: entry.id, isMarked: result.isMarked }
                } catch (error) {
                    console.error(`Error checking attendance for entry ${entry.id}:`, error)
                    return { timetableId: entry.id, isMarked: false }
                }
            })

            const results = await Promise.all(statusPromises)
            const statusMap: Record<number, boolean> = {}
            results.forEach(({ timetableId, isMarked }) => {
                statusMap[timetableId] = isMarked
            })
            setAttendanceStatus(statusMap)
        } catch (error) {
            console.error('Error checking attendance status:', error)
        }
    }

    // Get unique courses from timetable entries, filtered by selected day
    const selectedDay = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })
    const dayTimetableEntries = timetableEntries.filter(entry =>
        entry.day.toLowerCase() === selectedDay.toLowerCase()
    )

    const uniqueCourses = dayTimetableEntries.reduce((acc, entry) => {
        const courseKey = `${entry.course_id}`
        if (!acc[courseKey]) {
            acc[courseKey] = {
                id: entry.course_id,
                code: entry.course_code,
                name: entry.course_name,
                timetableEntries: []
            }
        }
        acc[courseKey].timetableEntries.push(entry)
        return acc
    }, {} as Record<string, {
        id: number
        code: string
        name: string
        timetableEntries: TimetableEntry[]
    }>)

    const courses = Object.values(uniqueCourses)

    const selectedCourseData = courses.find(c => c.id === parseInt(selectedCourse))

    const handleMarkAttendance = (timetableEntry?: TimetableEntry) => {
        if (!selectedCourse) {
            toast({
                title: "Course Required",
                description: "You must select a course before marking attendance",
                variant: "warning" as any,
                duration: 5000,
            })
            return
        }

        // Use provided timetable entry or find the first one for the selected course
        const entryToUse = timetableEntry || selectedCourseData?.timetableEntries[0]

        if (!entryToUse) {
            toast({
                title: "Schedule Not Found",
                description: "No timetable entry found for this course on the selected day",
                variant: "warning" as any,
                duration: 5000,
            })
            return
        }

        // Navigate to the same attendance marking page used by timetable
        const params = new URLSearchParams({
            courseId: selectedCourse,
            timetableId: entryToUse.id.toString(),
            date: selectedDate
        })

        router.push(`/dashboard/faculty/attendance/mark?${params.toString()}`)
    }

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':')
        const hourNum = parseInt(hour)
        const ampm = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
        return `${displayHour}:${minute} ${ampm}`
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (isLoading) {
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
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Mark Attendance</h1>
                <p className="text-muted-foreground">
                    Select a course and date to mark attendance for your students
                </p>
            </div>

            {/* Course Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Course Selection
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Course Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="course">Select Course</Label>
                            <Select
                                value={selectedCourse}
                                onValueChange={setSelectedCourse}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a course..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{course.code}</span>
                                                <span className="text-sm text-muted-foreground">{course.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Selection */}
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

                    {/* Selected Course Details */}
                    {selectedCourseData && (
                        <div className="border rounded-lg p-4 bg-muted/50 space-y-3">
                            <h3 className="font-semibold text-lg">
                                {selectedCourseData.code}: {selectedCourseData.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Selected Date: {formatDate(selectedDate)}
                            </p>

                            {/* Show class schedules for this course on selected day */}
                            <div className="space-y-2">
                                <h4 className="font-medium text-sm">Classes on {selectedDay}:</h4>
                                {selectedCourseData.timetableEntries.length === 0 ? (
                                    <div className="text-sm text-muted-foreground p-4 text-center border rounded bg-muted/30">
                                        No classes scheduled for {selectedDay}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedCourseData.timetableEntries.map((entry) => (
                                            <div key={entry.id} className="flex items-center justify-between p-3 bg-background rounded border">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-4 w-4" />
                                                    <span className="font-medium">{entry.day}</span>
                                                    <Clock className="h-4 w-4 ml-2" />
                                                    <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
                                                    <MapPin className="h-4 w-4 ml-2" />
                                                    <span>{entry.room}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {attendanceStatus[entry.id] ? (
                                                        <>
                                                            <div className="flex items-center gap-1 text-green-600">
                                                                <Check className="h-4 w-4" />
                                                                <span className="text-xs font-medium">Attendance Marked</span>
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    const params = new URLSearchParams({
                                                                        courseId: selectedCourse,
                                                                        timetableId: entry.id.toString(),
                                                                        date: selectedDate
                                                                    })
                                                                    router.push(`/dashboard/faculty/attendance/mark?${params.toString()}`)
                                                                }}
                                                                className="h-8 px-2"
                                                            >
                                                                <Edit className="h-3 w-3 mr-1" />
                                                                Edit
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <span className="text-xs">Not marked yet</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end">
                        {selectedCourseData && selectedCourseData.timetableEntries.length > 0 ? (
                            <div className="space-y-2">
                                {selectedCourseData.timetableEntries.map((entry) => (
                                    <Button
                                        key={entry.id}
                                        onClick={() => handleMarkAttendance(entry)}
                                        className="min-w-[200px] justify-start"
                                        variant={attendanceStatus[entry.id] ? "outline" : "default"}
                                    >
                                        {attendanceStatus[entry.id] ? (
                                            <Edit className="h-4 w-4 mr-2" />
                                        ) : (
                                            <Users className="h-4 w-4 mr-2" />
                                        )}
                                        {attendanceStatus[entry.id] ? "Edit" : "Mark"} Attendance
                                        <span className="ml-2 text-xs">
                                            ({formatTime(entry.start_time)} - {formatTime(entry.end_time)})
                                        </span>
                                    </Button>
                                ))}
                            </div>
                        ) : (
                            <Button
                                onClick={() => handleMarkAttendance()}
                                disabled={!selectedCourse}
                                className="min-w-[200px]"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Mark Attendance
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Today's Classes Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-primary">{courses.length}</div>
                            <div className="text-sm text-muted-foreground">Courses on {selectedDay}</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">
                                {dayTimetableEntries.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Classes</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-green-600">
                                {Object.values(attendanceStatus).filter(Boolean).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Attendance Marked</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                                {dayTimetableEntries.length - Object.values(attendanceStatus).filter(Boolean).length}
                            </div>
                            <div className="text-sm text-muted-foreground">Pending</div>
                        </div>
                    </div>
                    {dayTimetableEntries.length === 0 && (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium text-muted-foreground mb-2">
                                No Classes Scheduled
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                You don't have any classes scheduled for {selectedDay}.
                                Try selecting a different date.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
