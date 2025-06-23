"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getTimetableByUser } from '@/lib/timetable-actions'
import { getStudentTimetableAttendance } from '@/lib/attendance-actions'
import { injectUniversalBreaks, isBreakEntry, BreakEntry } from '@/lib/utils'
import { Clock, MapPin, BookOpen, GraduationCap, User, Check, X, UtensilsCrossed } from 'lucide-react'

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

// Break colors for mini display
const breakColors = {
    'Lunch Break': { bg: 'bg-green-500', icon: UtensilsCrossed }
}

export function StudentMiniTimetable() {
    const [timetableData, setTimetableData] = useState<(TimetableEntry | BreakEntry)[]>([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [attendanceStatus, setAttendanceStatus] = useState<Record<number, 'present' | 'absent'>>({})

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                setLoading(true)
                const data = await getTimetableByUser() as TimetableEntry[]

                // Inject universal breaks into the timetable data
                const dataWithBreaks = injectUniversalBreaks(data)
                setTimetableData(dataWithBreaks)

                // Fetch today's attendance status
                const today = new Date().toISOString().split('T')[0]
                const attendanceData = await getStudentTimetableAttendance(undefined, today)
                setAttendanceStatus(attendanceData)
            } catch (error) {
                console.error('Error fetching timetable:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTimetable()

        // Update current time every minute
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)

        return () => clearInterval(interval)
    }, [])

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

    const timeToMinutes = (time: string) => {
        const [hours, minutes] = time.split(':').map(Number)
        return hours * 60 + minutes
    }

    const isCurrentClass = (startTime: string, endTime: string) => {
        const startMinutes = timeToMinutes(startTime)
        const endMinutes = timeToMinutes(endTime)
        return currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes
    }

    const isUpcoming = (startTime: string) => {
        const startMinutes = timeToMinutes(startTime)
        return currentTimeInMinutes < startMinutes
    }

    const isPast = (endTime: string) => {
        const endMinutes = timeToMinutes(endTime)
        return currentTimeInMinutes > endMinutes
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
            <Card className="border-0 bg-transparent text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <BookOpen className="h-5 w-5 text-blue-300" />
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="bg-white/10 border border-white/20 rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <Skeleton variant="shimmer" className="h-4 w-12 rounded-full bg-white/20" />
                                        <Skeleton variant="shimmer" className="h-4 w-16 rounded-full bg-white/15" />
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Skeleton variant="shimmer" className="h-3 w-12 bg-white/20" />
                                        <Skeleton variant="shimmer" className="h-3 w-12 bg-white/15" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Skeleton variant="shimmer" className="h-4 w-20 bg-white/25" />
                                    <Skeleton variant="shimmer" className="h-3 w-32 bg-white/20" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Skeleton variant="shimmer" className="h-3 w-3 bg-white/20" />
                                        <Skeleton variant="shimmer" className="h-3 w-16 bg-white/20" />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Skeleton variant="shimmer" className="h-3 w-3 bg-white/20" />
                                        <Skeleton variant="shimmer" className="h-3 w-20 bg-white/20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    // Check if there are classes for today
    const todaysClasses = timetableData.filter((entry): entry is TimetableEntry => !isBreakEntry(entry) && entry.day === today)

    if (todaysClasses.length === 0) {
        return (
            <Card className="border-0 bg-transparent text-white">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <BookOpen className="h-5 w-5 text-blue-300" />
                        Today's Schedule
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
                        <GraduationCap className="h-12 w-12 text-white/50 mx-auto mb-2" />
                        <div className="text-white/80 text-sm mb-1">No classes scheduled</div>
                        <p className="text-white/60 text-xs">Enjoy your free day!</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="border-0 bg-transparent text-white">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg text-white">
                        <BookOpen className="h-5 w-5 text-blue-300" />
                        Today's Schedule
                    </CardTitle>
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-xs">
                        {today} • {todaysClasses.length} {todaysClasses.length === 1 ? 'class' : 'classes'}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className={todaysClasses.length > 1 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" : "space-y-3"}>
                    {timetableData
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .filter((entry): entry is TimetableEntry => !isBreakEntry(entry) && entry.day === today)
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
                    bg-white/10 border border-white/20 rounded-lg p-3
                    transition-all duration-200 relative cursor-pointer
                    hover:bg-white/15 hover:scale-[1.02]
                    ${isCurrent ? 'ring-2 ring-red-400 shadow-md' : ''}
                    ${past ? 'opacity-60' : ''}
                  `}
                                >
                                    {getAttendanceIndicator(entry.id)}

                                    {/* Mobile Layout - Simple view */}
                                    <div className="md:hidden space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="font-semibold text-sm text-white truncate pr-2">
                                                {entry.course_name}
                                            </div>
                                            <div className="text-xs font-semibold text-white whitespace-nowrap">
                                                {formatTime(entry.start_time)}
                                            </div>
                                        </div>
                                        {(isCurrent || upcoming || past) && (
                                            <div className="flex gap-1">
                                                {isCurrent && (
                                                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 h-auto">
                                                        LIVE
                                                    </Badge>
                                                )}
                                                {upcoming && (
                                                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-200 border-orange-400/30 text-xs px-1.5 py-0.5 h-auto">
                                                        Upcoming
                                                    </Badge>
                                                )}
                                                {past && (
                                                    <Badge variant="secondary" className="bg-white/10 text-white/60 border-white/30 text-xs px-1.5 py-0.5 h-auto">
                                                        Completed
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Desktop/Tablet Layout - Full view */}
                                    <div className="hidden md:block space-y-2">
                                        {/* Status indicators and Time */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-1">
                                                {isCurrent && (
                                                    <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 h-auto">
                                                        LIVE
                                                    </Badge>
                                                )}
                                                {upcoming && (
                                                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-200 border-orange-400/30 text-xs px-1.5 py-0.5 h-auto">
                                                        Upcoming
                                                    </Badge>
                                                )}
                                                {past && (
                                                    <Badge variant="secondary" className="bg-white/10 text-white/60 border-white/30 text-xs px-1.5 py-0.5 h-auto">
                                                        Completed
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-semibold text-white">
                                                    {formatTime(entry.start_time)}
                                                </div>
                                                <div className="text-xs text-white/60">
                                                    {formatTime(entry.end_time)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Course Info */}
                                        <div>
                                            <div className="font-semibold text-sm text-white">
                                                {entry.course_code}
                                            </div>
                                            <div className="text-xs text-white/80 truncate">
                                                {entry.course_name}
                                            </div>
                                        </div>

                                        {/* Room and Faculty Info */}
                                        <div className="flex items-center justify-between text-xs text-white/70">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                <span>{entry.room}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                <span className="truncate">
                                                    {entry.faculty_name || 'TBA'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Progress indicator for current class */}
                                    {isCurrent && (
                                        <div className="mt-3 pt-2 border-t border-white/20">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs font-medium text-white">
                                                    Class in progress
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Time until class starts for upcoming classes */}
                                    {upcoming && (
                                        <div className="mt-3 pt-2 border-t border-white/20">
                                            <div className="text-xs text-white/70">
                                                Starts in {Math.floor((timeToMinutes(entry.start_time) - currentTimeInMinutes))} minute(s)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                </div>

                {/* Next class indicator if no current class */}
                {todaysClasses.length > 0 && !todaysClasses.some(entry => isCurrentClass(entry.start_time, entry.end_time)) && (
                    <div className="mt-4 pt-3 border-t border-white/20">
                        <div className="text-center">
                            {todaysClasses.some(entry => isUpcoming(entry.start_time)) ? (
                                <div className="text-xs text-white/70">
                                    Next class: {formatTime(todaysClasses
                                        .filter(entry => isUpcoming(entry.start_time))
                                        .sort((a, b) => a.start_time.localeCompare(b.start_time))[0]?.start_time)}
                                </div>
                            ) : (
                                <div className="text-xs text-white/70">
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