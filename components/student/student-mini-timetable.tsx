"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getTimetableByUser } from '@/lib/timetable-actions'
import { getStudentTimetableAttendance } from '@/lib/attendance-actions'
import { Clock, MapPin, BookOpen, GraduationCap, User, Check, X } from 'lucide-react'

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

// Dark mode optimized course colors
const courseColors = [
    {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800',
        text: 'text-blue-900 dark:text-blue-200',
        border: 'border-blue-200 dark:border-blue-700',
        accent: 'bg-blue-500'
    },
    {
        bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800',
        text: 'text-emerald-900 dark:text-emerald-200',
        border: 'border-emerald-200 dark:border-emerald-700',
        accent: 'bg-emerald-500'
    },
    {
        bg: 'bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-900 dark:to-violet-800',
        text: 'text-violet-900 dark:text-violet-200',
        border: 'border-violet-200 dark:border-violet-700',
        accent: 'bg-violet-500'
    },
    {
        bg: 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800',
        text: 'text-orange-900 dark:text-orange-200',
        border: 'border-orange-200 dark:border-orange-700',
        accent: 'bg-orange-500'
    },
    {
        bg: 'bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800',
        text: 'text-pink-900 dark:text-pink-200',
        border: 'border-pink-200 dark:border-pink-700',
        accent: 'bg-pink-500'
    },
    {
        bg: 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800',
        text: 'text-indigo-900 dark:text-indigo-200',
        border: 'border-indigo-200 dark:border-indigo-700',
        accent: 'bg-indigo-500'
    },
]

export function StudentMiniTimetable() {
    const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [attendanceStatus, setAttendanceStatus] = useState<Record<number, 'present' | 'absent'>>({})

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const currentTime = new Date().getHours() * 100 + new Date().getMinutes()

    useEffect(() => {
        const fetchTodayClasses = async () => {
            try {
                setLoading(true)
                const allClasses = await getTimetableByUser() as TimetableEntry[]
                const todaySchedule = allClasses.filter(entry => entry.day === today)
                setTodayClasses(todaySchedule)

                // Fetch today's attendance status
                const todayDate = new Date().toISOString().split('T')[0]
                const attendanceData = await getStudentTimetableAttendance(undefined, todayDate)
                setAttendanceStatus(attendanceData)
            } catch (error) {
                console.error('Error fetching today\'s classes:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTodayClasses()
    }, [today])

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':')
        const hourNum = parseInt(hour)
        const ampm = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
        return `${displayHour}:${minute} ${ampm}`
    }

    const getCourseColorIndex = (courseId: number) => {
        return courseId % courseColors.length
    }

    const isCurrentClass = (startTime: string, endTime: string) => {
        const start = parseInt(startTime.replace(':', ''))
        const end = parseInt(endTime.replace(':', ''))
        return currentTime >= start && currentTime <= end
    }

    const isUpcoming = (startTime: string) => {
        const start = parseInt(startTime.replace(':', ''))
        return currentTime < start
    }

    const isPast = (endTime: string) => {
        const end = parseInt(endTime.replace(':', ''))
        return currentTime > end
    }

    const getAttendanceIndicator = (timetableId: number) => {
        const status = attendanceStatus[timetableId]
        if (!status) return null

        if (status === 'present') {
            return (
                <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full p-1 z-10">
                    <Check className="w-3 h-3" />
                </div>
            )
        } else if (status === 'absent') {
            return (
                <div className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1 z-10">
                    <X className="w-3 h-3" />
                </div>
            )
        }
        return null
    }

    const getAttendanceStatusClass = (timetableId: number) => {
        const status = attendanceStatus[timetableId]
        if (!status) return ''

        if (status === 'present') {
            return 'ring-2 ring-green-400 bg-green-50 dark:bg-green-950'
        } else if (status === 'absent') {
            return 'ring-2 ring-red-400 bg-red-50 dark:bg-red-950'
        }
        return ''
    }

    if (loading) {
        return (
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (todayClasses.length === 0) {
        return (
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                        <div className="text-muted-foreground text-sm mb-1">No classes scheduled</div>
                        <p className="text-muted-foreground/70 text-xs">Enjoy your free day!</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Today's Schedule
                    </CardTitle>
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700 text-xs">
                        {today} • {todayClasses.length} {todayClasses.length === 1 ? 'class' : 'classes'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {todayClasses
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((entry) => {
                            const colorScheme = courseColors[getCourseColorIndex(entry.course_id)]
                            const isCurrent = isCurrentClass(entry.start_time, entry.end_time)
                            const upcoming = isUpcoming(entry.start_time)
                            const past = isPast(entry.end_time)
                            const attendanceClass = getAttendanceStatusClass(entry.id)

                            return (
                                <div
                                    key={entry.id}
                                    className={`
                    ${colorScheme.bg} ${colorScheme.border} border rounded-lg p-3
                    transition-all duration-200 relative cursor-pointer
                    hover:shadow-lg hover:scale-[1.02]
                    ${isCurrent ? 'ring-2 ring-red-400 dark:ring-red-600 shadow-md' : ''}
                    ${past ? 'opacity-60' : ''}
                    ${attendanceClass}
                  `}
                                >
                                    {getAttendanceIndicator(entry.id)}
                                    {/* Status indicators */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {isCurrent && (
                                            <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 h-auto">
                                                LIVE
                                            </Badge>
                                        )}
                                        {upcoming && (
                                            <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-700 text-xs px-1.5 py-0.5 h-auto">
                                                Upcoming
                                            </Badge>
                                        )}
                                        {past && (
                                            <Badge variant="outline" className="text-muted-foreground border-muted text-xs px-1.5 py-0.5 h-auto">
                                                Completed
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-12 gap-3 items-center">
                                        {/* Time */}
                                        <div className="col-span-3">
                                            <div className={`text-sm font-semibold ${colorScheme.text}`}>
                                                {formatTime(entry.start_time)}
                                            </div>
                                            <div className={`text-xs ${colorScheme.text} opacity-70`}>
                                                {formatTime(entry.end_time)}
                                            </div>
                                        </div>

                                        {/* Course Info */}
                                        <div className="col-span-6">
                                            <div className={`font-semibold text-sm ${colorScheme.text}`}>
                                                {entry.course_code}
                                            </div>
                                            <div className={`text-xs ${colorScheme.text} opacity-80 truncate`}>
                                                {entry.course_name}
                                            </div>
                                            <div className={`flex items-center gap-1 text-xs ${colorScheme.text} opacity-70 mt-1`}>
                                                <MapPin className="w-3 h-3" />
                                                <span>{entry.room}</span>
                                            </div>
                                        </div>

                                        {/* Faculty Info */}
                                        <div className="col-span-3 text-right">
                                            <div className={`flex items-center justify-end gap-1 text-xs ${colorScheme.text} opacity-80`}>
                                                <User className="w-3 h-3" />
                                                <span className="truncate text-right">
                                                    {entry.faculty_name.split(' ').slice(-1)[0]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress indicator for current class */}
                                    {isCurrent && (
                                        <div className="mt-3 pt-2 border-t border-current/20">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className={`text-xs font-medium ${colorScheme.text}`}>
                                                    Class in progress
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Time until class starts for upcoming classes */}
                                    {upcoming && (
                                        <div className="mt-3 pt-2 border-t border-current/20">
                                            <div className={`text-xs ${colorScheme.text} opacity-70`}>
                                                Starts in {Math.floor((parseInt(entry.start_time.replace(':', '')) - currentTime) / 100)} hour(s)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                </div>

                {/* Next class indicator if no current class */}
                {todayClasses.length > 0 && !todayClasses.some(entry => isCurrentClass(entry.start_time, entry.end_time)) && (
                    <div className="mt-4 pt-3 border-t border-border">
                        <div className="text-center">
                            {todayClasses.some(entry => isUpcoming(entry.start_time)) ? (
                                <div className="text-xs text-muted-foreground">
                                    Next class: {formatTime(todayClasses
                                        .filter(entry => isUpcoming(entry.start_time))
                                        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0]?.start_time)}
                                </div>
                            ) : (
                                <div className="text-xs text-muted-foreground">
                                    All classes completed for today
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 