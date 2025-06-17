"use client"

import React, { useCallback, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { checkTimetableAttendance } from '@/lib/timetable-actions'
import { Check, Clock, Users, MapPin, BookOpen, Calendar } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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

interface FacultyTimetableProps {
    timetableData: TimetableEntry[]
    userRole: string
    currentUser?: any
}

const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'
]

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Modern color schemes with dark mode support
const facultyColors = [
    {
        bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
        text: 'text-blue-900 dark:text-blue-100',
        border: 'border-blue-200 dark:border-blue-800',
        button: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white',
        accent: 'bg-blue-500 dark:bg-blue-600'
    },
    {
        bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
        text: 'text-emerald-900 dark:text-emerald-100',
        border: 'border-emerald-200 dark:border-emerald-800',
        button: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white',
        accent: 'bg-emerald-500 dark:bg-emerald-600'
    },
    {
        bg: 'bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900',
        text: 'text-violet-900 dark:text-violet-100',
        border: 'border-violet-200 dark:border-violet-800',
        button: 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 text-white',
        accent: 'bg-violet-500 dark:bg-violet-600'
    },
    {
        bg: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
        text: 'text-orange-900 dark:text-orange-100',
        border: 'border-orange-200 dark:border-orange-800',
        button: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white',
        accent: 'bg-orange-500 dark:bg-orange-600'
    },
    {
        bg: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900',
        text: 'text-rose-900 dark:text-rose-100',
        border: 'border-rose-200 dark:border-rose-800',
        button: 'bg-rose-500 hover:bg-rose-600 dark:bg-rose-600 dark:hover:bg-rose-700 text-white',
        accent: 'bg-rose-500 dark:bg-rose-600'
    },
    {
        bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900',
        text: 'text-indigo-900 dark:text-indigo-100',
        border: 'border-indigo-200 dark:border-indigo-800',
        button: 'bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white',
        accent: 'bg-indigo-500 dark:bg-indigo-600'
    },
    {
        bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900',
        text: 'text-red-900 dark:text-red-100',
        border: 'border-red-200 dark:border-red-800',
        button: 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white',
        accent: 'bg-red-500 dark:bg-red-600'
    },
    {
        bg: 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900',
        text: 'text-amber-900 dark:text-amber-100',
        border: 'border-amber-200 dark:border-amber-800',
        button: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white',
        accent: 'bg-amber-500 dark:bg-amber-600'
    }
]

export function FacultyTimetable({ timetableData, userRole, currentUser }: FacultyTimetableProps) {
    const { toast } = useToast()
    const [attendanceStatus, setAttendanceStatus] = useState<{ [key: number]: boolean }>({})

    // Check attendance status for all timetable entries on component mount
    useEffect(() => {
        const checkAllAttendance = async () => {
            if (userRole !== 'faculty' || !currentUser) return

            const statusPromises = timetableData.map(async (entry) => {
                try {
                    const result = await checkTimetableAttendance(entry.id)
                    return { id: entry.id, isMarked: result.isMarked }
                } catch (error) {
                    console.error(`Error checking attendance for entry ${entry.id}:`, error)
                    return { id: entry.id, isMarked: false }
                }
            })

            const statuses = await Promise.all(statusPromises)
            const statusMap = statuses.reduce((acc, { id, isMarked }) => {
                acc[id] = isMarked
                return acc
            }, {} as { [key: number]: boolean })

            setAttendanceStatus(statusMap)
        }

        checkAllAttendance()
    }, [timetableData, userRole, currentUser])

    const handleMarkAttendance = useCallback((entry: TimetableEntry) => {
        if (userRole !== 'faculty' || !currentUser || entry.faculty_id !== currentUser.id) {
            toast({
                title: "Access Denied",
                description: "You can only mark attendance for your own classes.",
                variant: "warning" as any,
                duration: 5000,
            })
            return
        }

        // Navigate to attendance marking page
        const searchParams = new URLSearchParams({
            courseId: entry.course_id.toString(),
            timetableId: entry.id.toString(),
            date: new Date().toISOString().split('T')[0]
        })

        // Use Next.js navigation
        window.open(`/dashboard/faculty/attendance/mark?${searchParams.toString()}`, '_self')
    }, [userRole, currentUser])

    const getFacultyColorIndex = useCallback((facultyId: number) => {
        return facultyId % facultyColors.length
    }, [])

    const isCurrentTimeSlot = useCallback((timeSlot: string) => {
        const now = new Date()
        const currentHour = now.getHours()
        const currentMinute = now.getMinutes()
        const currentTime = currentHour * 100 + currentMinute

        const [hour, minute] = timeSlot.split(':').map(Number)
        const slotStart = hour * 100 + minute
        const slotEnd = slotStart + 100

        return currentTime >= slotStart && currentTime < slotEnd
    }, [])

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':')
        const hourNum = parseInt(hour)
        const ampm = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
        return `${displayHour}:${minute} ${ampm}`
    }

    const renderGridCell = (day: string, timeSlot: string) => {
        const entries = timetableData.filter(entry => {
            const entryStartHour = parseInt(entry.start_time.split(':')[0])
            const slotHour = parseInt(timeSlot.split(':')[0])
            return entry.day === day && entryStartHour === slotHour
        })

        const isCurrentSlot = isCurrentTimeSlot(timeSlot)
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
        const isToday = day === today

        if (entries.length === 0) {
            return (
                <div
                    key={`${day}-${timeSlot}`}
                    className={`
                        min-h-24 p-3 border border-border bg-muted/50 rounded-lg
                        flex items-center justify-center
                        ${isCurrentSlot && isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500 bg-blue-50 dark:bg-blue-950/50' : ''}
                    `}
                >
                    <span className="text-xs text-muted-foreground font-medium">Free</span>
                </div>
            )
        }

        return (
            <div key={`${day}-${timeSlot}`} className="space-y-2">
                {entries.map((entry) => {
                    const colorScheme = facultyColors[getFacultyColorIndex(entry.faculty_id)]
                    const isMarked = attendanceStatus[entry.id] || false
                    const canMarkAttendance = userRole === 'faculty' &&
                        currentUser &&
                        entry.faculty_id === currentUser.id

                    return (
                        <Card
                            key={entry.id}
                            className={`
                                ${colorScheme.bg} ${colorScheme.border} border-2
                                transition-all duration-200 hover:shadow-md
                                ${isCurrentSlot && isToday ? 'ring-2 ring-blue-400 dark:ring-blue-500 ring-offset-2 dark:ring-offset-background' : ''}
                                relative overflow-hidden
                            `}
                        >
                            {/* Status indicator */}
                            {isMarked && (
                                <div className="absolute top-2 right-2">
                                    <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                                        <Check className="w-2 h-2 text-white" />
                                    </div>
                                </div>
                            )}

                            <CardContent className="p-3">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className={`font-semibold text-sm ${colorScheme.text}`}>
                                                {entry.course_code}
                                            </h4>
                                            <p className={`text-xs ${colorScheme.text} opacity-80 mt-1 leading-tight`}>
                                                {entry.course_name}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className={`flex items-center gap-1.5 text-xs ${colorScheme.text} opacity-70`}>
                                            <MapPin className="w-3 h-3" />
                                            <span>{entry.room}</span>
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-xs ${colorScheme.text} opacity-70`}>
                                            <Clock className="w-3 h-3" />
                                            <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
                                        </div>
                                    </div>

                                    {canMarkAttendance && (
                                        <div className="mt-3">
                                            {isMarked ? (
                                                <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 text-xs">
                                                    <Check className="w-3 h-3 mr-1" />
                                                    Marked
                                                </Badge>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleMarkAttendance(entry)}
                                                    className={`${colorScheme.button} text-xs h-7 px-3`}
                                                >
                                                    <Users className="w-3 h-3 mr-1" />
                                                    Take Attendance
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="w-full space-y-6">
            {/* Desktop View */}
            <div className="hidden lg:block">
                <Card className="border-border">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-xl">
                                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    Weekly Class Schedule
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your teaching timetable with attendance tracking
                                </p>
                            </div>
                            <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                                Faculty View
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-8 gap-3">
                            {/* Header Row */}
                            <div className="p-3 font-semibold text-center bg-muted rounded-lg">
                                <Clock className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                                <span className="text-sm text-foreground">Time</span>
                            </div>

                            {weekdays.map(day => {
                                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
                                const isToday = day === today
                                return (
                                    <div
                                        key={day}
                                        className={`p-3 font-semibold text-center rounded-lg transition-colors ${isToday
                                            ? 'bg-blue-600 dark:bg-blue-700 text-white'
                                            : 'bg-muted text-foreground hover:bg-muted/80'
                                            }`}
                                    >
                                        <span className="text-sm">{day.slice(0, 3)}</span>
                                        {isToday && (
                                            <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1" />
                                        )}
                                    </div>
                                )
                            })}

                            {/* Time Slot Rows */}
                            {timeSlots.map((timeSlot) => {
                                const isCurrentHour = isCurrentTimeSlot(timeSlot)

                                return (
                                    <React.Fragment key={timeSlot}>
                                        <div className={`p-3 text-sm font-medium text-center rounded-lg flex items-center justify-center ${isCurrentHour
                                            ? 'bg-blue-100 dark:bg-blue-950 border-2 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                                            : 'bg-muted text-muted-foreground'
                                            }`}>
                                            {formatTime(timeSlot)}
                                        </div>

                                        {weekdays.map(day => (
                                            <div key={`${day}-${timeSlot}`}>
                                                {renderGridCell(day, timeSlot)}
                                            </div>
                                        ))}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
                {weekdays.map(day => {
                    const dayEntries = timetableData.filter(entry => entry.day === day)
                    if (dayEntries.length === 0) return null

                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
                    const isToday = day === today

                    return (
                        <Card key={day} className="border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className={`text-lg flex items-center gap-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
                                    }`}>
                                    <BookOpen className="w-5 h-5" />
                                    {day}
                                    {isToday && (
                                        <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs">
                                            Today
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {timeSlots.map(timeSlot => {
                                        const entries = dayEntries.filter(entry => {
                                            const entryStartHour = parseInt(entry.start_time.split(':')[0])
                                            const slotHour = parseInt(timeSlot.split(':')[0])
                                            return entryStartHour === slotHour
                                        })

                                        if (entries.length === 0) return null

                                        return (
                                            <div key={timeSlot} className="space-y-2">
                                                {entries.map(entry => {
                                                    const colorScheme = facultyColors[getFacultyColorIndex(entry.faculty_id)]
                                                    const isMarked = attendanceStatus[entry.id] || false
                                                    const canMarkAttendance = userRole === 'faculty' &&
                                                        currentUser &&
                                                        entry.faculty_id === currentUser.id

                                                    return (
                                                        <Card
                                                            key={entry.id}
                                                            className={`${colorScheme.bg} ${colorScheme.border} border-2 relative`}
                                                        >
                                                            {isMarked && (
                                                                <div className="absolute top-2 right-2">
                                                                    <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                                                                        <Check className="w-2 h-2 text-white" />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <CardContent className="p-4">
                                                                <div className="space-y-3">
                                                                    <div>
                                                                        <h4 className={`font-semibold ${colorScheme.text}`}>
                                                                            {entry.course_code}
                                                                        </h4>
                                                                        <p className={`text-sm ${colorScheme.text} opacity-80`}>
                                                                            {entry.course_name}
                                                                        </p>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <div className={`flex items-center gap-2 text-sm ${colorScheme.text} opacity-70`}>
                                                                            <MapPin className="w-4 h-4" />
                                                                            <span>{entry.room}</span>
                                                                        </div>
                                                                        <div className={`flex items-center gap-2 text-sm ${colorScheme.text} opacity-70`}>
                                                                            <Clock className="w-4 h-4" />
                                                                            <span>{formatTime(entry.start_time)} - {formatTime(entry.end_time)}</span>
                                                                        </div>
                                                                    </div>

                                                                    {canMarkAttendance && (
                                                                        <div className="pt-2">
                                                                            {isMarked ? (
                                                                                <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                                                                                    <Check className="w-4 h-4 mr-1" />
                                                                                    Attendance Marked
                                                                                </Badge>
                                                                            ) : (
                                                                                <Button
                                                                                    onClick={() => handleMarkAttendance(entry)}
                                                                                    className={`${colorScheme.button} w-full`}
                                                                                >
                                                                                    <Users className="w-4 h-4 mr-2" />
                                                                                    Take Attendance
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
} 