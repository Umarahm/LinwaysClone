"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton, TimetableSkeleton } from "@/components/ui/skeleton"
import { getTimetableByUser } from '@/lib/timetable-actions'
import { getStudentTimetableAttendance } from '@/lib/attendance-actions'
import { injectUniversalBreaks, isBreakEntry, formatBreakTime, isCurrentBreakTime, BreakEntry } from '@/lib/utils'
import { Calendar, Clock, MapPin, BookOpen, User, GraduationCap, Check, X, UtensilsCrossed } from 'lucide-react'

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

const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
]

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

// Dark mode optimized course colors
const courseColors = [
    {
        bg: 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        border: 'border-blue-300 dark:border-blue-700',
        dark: 'bg-blue-500'
    },
    {
        bg: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800',
        text: 'text-emerald-800 dark:text-emerald-200',
        border: 'border-emerald-300 dark:border-emerald-700',
        dark: 'bg-emerald-500'
    },
    {
        bg: 'bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800',
        text: 'text-violet-800 dark:text-violet-200',
        border: 'border-violet-300 dark:border-violet-700',
        dark: 'bg-violet-500'
    },
    {
        bg: 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800',
        text: 'text-orange-800 dark:text-orange-200',
        border: 'border-orange-300 dark:border-orange-700',
        dark: 'bg-orange-500'
    },
    {
        bg: 'bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900 dark:to-pink-800',
        text: 'text-pink-800 dark:text-pink-200',
        border: 'border-pink-300 dark:border-pink-700',
        dark: 'bg-pink-500'
    },
    {
        bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800',
        text: 'text-indigo-800 dark:text-indigo-200',
        border: 'border-indigo-300 dark:border-indigo-700',
        dark: 'bg-indigo-500'
    },
    {
        bg: 'bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900 dark:to-cyan-800',
        text: 'text-cyan-800 dark:text-cyan-200',
        border: 'border-cyan-300 dark:border-cyan-700',
        dark: 'bg-cyan-500'
    },
    {
        bg: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800',
        text: 'text-amber-800 dark:text-amber-200',
        border: 'border-amber-300 dark:border-amber-700',
        dark: 'bg-amber-500'
    },
]

// Break styling
const breakColors = {
    'Lunch Break': {
        bg: 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800',
        text: 'text-green-800 dark:text-green-200',
        border: 'border-green-300 dark:border-green-700',
        icon: UtensilsCrossed
    }
}

export function StudentTimetable() {
    const [timetableData, setTimetableData] = useState<(TimetableEntry | BreakEntry)[]>([])
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())
    const [attendanceStatus, setAttendanceStatus] = useState<Record<number, 'present' | 'absent'>>({})

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                setLoading(true)
                const data = await getTimetableByUser() as TimetableEntry[]

                // Inject universal breaks into the timetable data
                const dataWithBreaks = injectUniversalBreaks(data, daysOfWeek)
                setTimetableData(dataWithBreaks)

                // Fetch today's attendance status (only for regular classes, not breaks)
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

        // Update current time every minute for real-time highlighting
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)

        return () => clearInterval(interval)
    }, [])

    const getCourseColorIndex = (courseId: number) => {
        return courseId % courseColors.length
    }

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':')
        const hourNum = parseInt(hour)
        const ampm = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
        return `${displayHour}:${minute} ${ampm}`
    }

    const isCurrentTimeSlot = (day: string, startTime: string, endTime: string) => {
        const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' })
        if (day !== today) return false

        const currentHour = currentTime.getHours()
        const currentMinutes = currentTime.getMinutes()
        const currentTotalMinutes = currentHour * 60 + currentMinutes

        const [startHour, startMin] = startTime.split(':').map(Number)
        const [endHour, endMin] = endTime.split(':').map(Number)

        const startTotalMinutes = startHour * 60 + startMin
        const endTotalMinutes = endHour * 60 + endMin

        return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes
    }

    const getClassesForTimeSlot = (day: string, timeSlot: string) => {
        return timetableData.filter(entry => {
            if (entry.day !== day) return false

            const entryStartHour = parseInt(entry.start_time.split(':')[0])
            const slotHour = parseInt(timeSlot.split(':')[0])

            return entryStartHour === slotHour
        })
    }

    const getUniqueCoursesCount = () => {
        const courses = timetableData.filter(entry => !isBreakEntry(entry)) as TimetableEntry[]
        const uniqueCourses = new Set(courses.map(entry => entry.course_id))
        return uniqueCourses.size
    }

    const getTotalClassesPerWeek = () => {
        return timetableData.filter(entry => !isBreakEntry(entry)).length
    }

    const getCurrentDayClasses = () => {
        const today = currentTime.toLocaleDateString('en-US', { weekday: 'long' })
        return timetableData.filter(entry => entry.day === today && !isBreakEntry(entry))
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
            <div className="p-6 space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Skeleton variant="shimmer" className="h-8 w-8" />
                            <Skeleton variant="shimmer" className="h-8 w-[160px]" />
                        </div>
                        <Skeleton variant="shimmer" className="h-4 w-[200px]" />
                    </div>
                </div>

                {/* Statistics Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="border-0">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-2">
                                        <Skeleton variant="shimmer" className="h-3 w-[100px] bg-white/40" />
                                        <Skeleton variant="shimmer" className="h-6 w-[40px] bg-white/50" />
                                    </div>
                                    <Skeleton variant="shimmer" className="h-8 w-8 bg-white/40" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Desktop Timetable Skeleton */}
                <div className="hidden lg:block">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton variant="shimmer" className="h-5 w-5" />
                                <Skeleton variant="shimmer" className="h-6 w-[180px]" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-auto">
                                <div className="min-w-[1000px]">
                                    {/* Header Row Skeleton */}
                                    <div className="grid grid-cols-7 gap-2 mb-4">
                                        <Skeleton variant="shimmer" className="h-12 rounded-lg" />
                                        {Array.from({ length: 6 }).map((_, i) => (
                                            <Skeleton key={i} variant="shimmer" className="h-12 rounded-lg" />
                                        ))}
                                    </div>

                                    {/* Time Slots Skeleton */}
                                    {Array.from({ length: 8 }).map((_, rowIndex) => (
                                        <div key={rowIndex} className="grid grid-cols-7 gap-2 mb-2">
                                            <Skeleton variant="shimmer" className="h-16 rounded-lg" />
                                            {Array.from({ length: 6 }).map((_, colIndex) => (
                                                <div key={colIndex} className="space-y-1">
                                                    {Math.random() > 0.3 ? (
                                                        <div className="border rounded-lg p-3 space-y-2 bg-muted/50">
                                                            <div className="flex items-center justify-between">
                                                                <Skeleton variant="shimmer" className="h-4 w-[60px]" />
                                                                <Skeleton variant="shimmer" className="h-3 w-[40px] rounded-full" />
                                                            </div>
                                                            <Skeleton variant="shimmer" className="h-3 w-[80px]" />
                                                            <div className="flex items-center gap-1">
                                                                <Skeleton variant="shimmer" className="h-3 w-3" />
                                                                <Skeleton variant="shimmer" className="h-3 w-[50px]" />
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <Skeleton variant="shimmer" className="h-3 w-3" />
                                                                <Skeleton variant="shimmer" className="h-3 w-[60px]" />
                                                            </div>
                                                            <Skeleton variant="shimmer" className="h-3 w-[70px]" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-16"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile View Skeleton */}
                <div className="lg:hidden space-y-4">
                    {Array.from({ length: 7 }).map((_, dayIndex) => (
                        <Card key={dayIndex}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton variant="shimmer" className="h-6 w-[100px]" />
                                    <Skeleton variant="shimmer" className="h-5 w-[60px] rounded-full" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map((_, classIndex) => (
                                        <div key={classIndex} className="border rounded-lg p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                                                <Skeleton variant="shimmer" className="h-3 w-[60px]" />
                                            </div>
                                            <Skeleton variant="shimmer" className="h-3 w-[120px]" />
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-1">
                                                    <Skeleton variant="shimmer" className="h-3 w-3" />
                                                    <Skeleton variant="shimmer" className="h-3 w-[50px]" />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Skeleton variant="shimmer" className="h-3 w-3" />
                                                    <Skeleton variant="shimmer" className="h-3 w-[60px]" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        My Timetable
                    </h1>
                    <p className="text-muted-foreground mt-1">Your weekly class schedule</p>
                </div>
            </div>

            {/* Statistics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Enrolled Courses</p>
                                <p className="text-2xl font-bold">{getUniqueCoursesCount()}</p>
                            </div>
                            <BookOpen className="h-8 w-8 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm">Weekly Classes</p>
                                <p className="text-2xl font-bold">{getTotalClassesPerWeek()}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-emerald-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-violet-100 text-sm">Today's Classes</p>
                                <p className="text-2xl font-bold">{getCurrentDayClasses().length}</p>
                            </div>
                            <Clock className="h-8 w-8 text-violet-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white border-0">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">Current Time</p>
                                <p className="text-xl font-bold">{currentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true
                                })}</p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Desktop Grid View */}
            <div className="hidden lg:block">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Weekly Schedule Grid
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <div className="min-w-[1000px]">
                                {/* Header Row */}
                                <div className="grid grid-cols-7 gap-2 mb-4">
                                    <div className="text-sm font-semibold text-center py-3 bg-muted rounded-lg">
                                        Time
                                    </div>
                                    {daysOfWeek.map(day => {
                                        const isToday = currentTime.toLocaleDateString('en-US', { weekday: 'long' }) === day
                                        return (
                                            <div
                                                key={day}
                                                className={`text-sm font-semibold text-center py-3 rounded-lg transition-colors ${isToday
                                                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                    : 'bg-muted'
                                                    }`}
                                            >
                                                {day}
                                                {isToday && <div className="text-xs opacity-70">Today</div>}
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Timetable Grid */}
                                {timeSlots.map(timeSlot => {
                                    const currentHour = currentTime.getHours()
                                    const slotHour = parseInt(timeSlot.split(':')[0])
                                    const isCurrentHour = currentHour === slotHour

                                    return (
                                        <div key={timeSlot} className="grid grid-cols-7 gap-2 mb-2">
                                            {/* Time Column */}
                                            <div className={`text-sm text-center py-4 rounded-lg font-medium ${isCurrentHour
                                                ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700'
                                                : 'bg-muted'
                                                }`}>
                                                {formatTime(timeSlot)}
                                            </div>

                                            {/* Day Columns */}
                                            {daysOfWeek.map(day => {
                                                const classes = getClassesForTimeSlot(day, timeSlot)
                                                const isToday = currentTime.toLocaleDateString('en-US', { weekday: 'long' }) === day

                                                if (classes.length > 0) {
                                                    return (
                                                        <div key={`${day}-${timeSlot}`} className="space-y-1">
                                                            {classes.map(entry => {
                                                                if (isBreakEntry(entry)) {
                                                                    // Render break entry
                                                                    const breakStyle = breakColors[entry.break_name as keyof typeof breakColors] || breakColors['Lunch Break']
                                                                    const isCurrent = isCurrentTimeSlot(day, entry.start_time, entry.end_time)
                                                                    const BreakIcon = breakStyle.icon

                                                                    return (
                                                                        <div
                                                                            key={entry.id}
                                                                            className={`
                                                                                ${breakStyle.bg} ${breakStyle.border} ${breakStyle.text}
                                                                                border rounded-lg p-3 transition-all duration-200 relative
                                                                                ${isCurrent ? 'ring-2 ring-orange-400 dark:ring-orange-600 shadow-lg animate-pulse' : ''}
                                                                            `}
                                                                        >
                                                                            <div className="space-y-1">
                                                                                <div className="font-bold text-sm flex items-center gap-1">
                                                                                    <BreakIcon className="w-3 h-3" />
                                                                                    {entry.break_name}
                                                                                </div>
                                                                                <div className="text-xs opacity-80 flex items-center gap-1">
                                                                                    <MapPin className="w-3 h-3" />
                                                                                    <span>{entry.room}</span>
                                                                                </div>
                                                                                <div className="text-xs opacity-70">
                                                                                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                                                                </div>
                                                                            </div>

                                                                            {isCurrent && (
                                                                                <Badge className="mt-2 bg-orange-500 text-white text-xs w-full justify-center">
                                                                                    BREAK TIME
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                } else {
                                                                    // Render regular class entry
                                                                    const classEntry = entry as TimetableEntry;
                                                                    const colorScheme = courseColors[getCourseColorIndex(classEntry.course_id)]
                                                                    const isCurrent = isCurrentTimeSlot(day, classEntry.start_time, classEntry.end_time)
                                                                    const attendanceClass = getAttendanceStatusClass(classEntry.id)

                                                                    return (
                                                                        <div
                                                                            key={classEntry.id}
                                                                            className={`
                                                                            ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}
                                                                            border rounded-lg p-3 transition-all duration-200 cursor-pointer relative
                                                                            hover:shadow-lg hover:scale-105
                                                                            ${isCurrent ? 'ring-2 ring-red-400 dark:ring-red-600 shadow-lg' : ''}
                                                                            ${attendanceClass}
                                                                        `}
                                                                        >
                                                                            {getAttendanceIndicator(classEntry.id)}
                                                                            <div className="space-y-1">
                                                                                <div className="font-bold text-sm truncate">
                                                                                    {classEntry.course_code}
                                                                                </div>
                                                                                <div className="text-xs opacity-90 truncate">
                                                                                    {classEntry.course_name}
                                                                                </div>
                                                                                <div className="flex items-center gap-1 text-xs opacity-80">
                                                                                    <MapPin className="w-3 h-3" />
                                                                                    <span className="truncate">{classEntry.room}</span>
                                                                                </div>
                                                                                <div className="flex items-center gap-1 text-xs opacity-80">
                                                                                    <User className="w-3 h-3" />
                                                                                    <span className="truncate">{classEntry.faculty_name}</span>
                                                                                </div>
                                                                                <div className="text-xs opacity-70">
                                                                                    {formatTime(classEntry.start_time)} - {formatTime(classEntry.end_time)}
                                                                                </div>
                                                                            </div>

                                                                            {isCurrent && (
                                                                                <Badge className="mt-2 bg-red-500 text-white text-xs w-full justify-center">
                                                                                    LIVE NOW
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                }
                                                            })}
                                                        </div>
                                                    )
                                                } else {
                                                    return (
                                                        <div
                                                            key={`${day}-${timeSlot}`}
                                                            className={`
                                                                py-4 rounded-lg border-2 border-dashed transition-colors
                                                                ${isToday && isCurrentHour
                                                                    ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950'
                                                                    : 'border-muted-foreground/20 bg-muted/30'
                                                                }
                                                            `}
                                                        >
                                                            <div className="text-center text-xs text-muted-foreground">
                                                                Free
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="lg:hidden space-y-4">
                {daysOfWeek.map(day => {
                    const dayClasses = timetableData.filter(entry => entry.day === day)
                    const isToday = currentTime.toLocaleDateString('en-US', { weekday: 'long' }) === day

                    return (
                        <Card key={day} className={`${isToday ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/50' : ''}`}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className={`text-lg flex items-center gap-2 ${isToday ? 'text-blue-800 dark:text-blue-200' : ''
                                        }`}>
                                        {day}
                                        {isToday && (
                                            <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700">
                                                Today
                                            </Badge>
                                        )}
                                    </CardTitle>
                                    <Badge variant="outline" className="text-xs">
                                        {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {dayClasses.length === 0 ? (
                                    <div className="text-center py-8">
                                        <GraduationCap className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                                        <div className="text-muted-foreground text-sm">No classes scheduled</div>
                                        <p className="text-muted-foreground/70 text-xs mt-1">
                                            {isToday ? 'Enjoy your free day!' : 'Day off'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {dayClasses
                                            .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                            .map(entry => {
                                                if (isBreakEntry(entry)) {
                                                    // Render break entry in mobile view
                                                    const breakStyle = breakColors[entry.break_name as keyof typeof breakColors] || breakColors['Lunch Break']
                                                    const isCurrent = isCurrentTimeSlot(day, entry.start_time, entry.end_time)
                                                    const BreakIcon = breakStyle.icon

                                                    return (
                                                        <div
                                                            key={entry.id}
                                                            className={`
                                                                ${breakStyle.bg} ${breakStyle.border} ${breakStyle.text}
                                                                border rounded-lg p-4 transition-all duration-200 relative
                                                                ${isCurrent ? 'ring-2 ring-orange-400 dark:ring-orange-600 shadow-lg animate-pulse' : ''}
                                                        `}
                                                        >
                                                            {isCurrent && (
                                                                <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">
                                                                    BREAK
                                                                </Badge>
                                                            )}

                                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                                {/* Time */}
                                                                <div className="col-span-3">
                                                                    <div className="font-bold text-sm">
                                                                        {formatTime(entry.start_time)}
                                                                    </div>
                                                                    <div className="text-xs opacity-70">
                                                                        {formatTime(entry.end_time)}
                                                                    </div>
                                                                </div>

                                                                {/* Break Info */}
                                                                <div className="col-span-6">
                                                                    <div className="font-bold text-sm flex items-center gap-2">
                                                                        <BreakIcon className="w-4 h-4" />
                                                                        {entry.break_name}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        <span>{entry.room}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Empty column for layout consistency */}
                                                                <div className="col-span-3"></div>
                                                            </div>
                                                        </div>
                                                    )
                                                } else {
                                                    // Render regular class entry in mobile view
                                                    const classEntry = entry as TimetableEntry;
                                                    const colorScheme = courseColors[getCourseColorIndex(classEntry.course_id)]
                                                    const isCurrent = isCurrentTimeSlot(day, classEntry.start_time, classEntry.end_time)
                                                    const attendanceClass = getAttendanceStatusClass(classEntry.id)

                                                    return (
                                                        <div
                                                            key={classEntry.id}
                                                            className={`
                                                                ${colorScheme.bg} ${colorScheme.border} ${colorScheme.text}
                                                                border rounded-lg p-4 transition-all duration-200 cursor-pointer
                                                                hover:shadow-lg hover:scale-[1.02] relative
                                                                ${isCurrent ? 'ring-2 ring-red-400 dark:ring-red-600 shadow-lg' : ''}
                                                                ${attendanceClass}
                                                            `}
                                                        >
                                                            {getAttendanceIndicator(classEntry.id)}
                                                            {isCurrent && (
                                                                <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
                                                                    LIVE
                                                                </Badge>
                                                            )}

                                                            <div className="grid grid-cols-12 gap-3 items-center">
                                                                {/* Time */}
                                                                <div className="col-span-3">
                                                                    <div className="font-bold text-sm">
                                                                        {formatTime(classEntry.start_time)}
                                                                    </div>
                                                                    <div className="text-xs opacity-70">
                                                                        {formatTime(classEntry.end_time)}
                                                                    </div>
                                                                </div>

                                                                {/* Course Info */}
                                                                <div className="col-span-6">
                                                                    <div className="font-bold text-sm">
                                                                        {classEntry.course_code}
                                                                    </div>
                                                                    <div className="text-xs opacity-90 truncate">
                                                                        {classEntry.course_name}
                                                                    </div>
                                                                    <div className="flex items-center gap-1 text-xs opacity-80 mt-1">
                                                                        <MapPin className="w-3 h-3" />
                                                                        <span>{classEntry.room}</span>
                                                                    </div>
                                                                </div>

                                                                {/* Faculty */}
                                                                <div className="col-span-3 text-right">
                                                                    <div className="flex items-center justify-end gap-1 text-xs opacity-80">
                                                                        <User className="w-3 h-3" />
                                                                        <span className="truncate">{classEntry.faculty_name}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Legend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Legend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                            <span>Current time slot</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded"></div>
                            <span>Today's column</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span>Current class (LIVE)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-dashed border-muted-foreground/20 bg-muted/30 rounded"></div>
                            <span>Free time slot</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded"></div>
                            <span>Lunch Break</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                            <span>Short Break</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900 border border-amber-300 dark:border-amber-700 rounded"></div>
                            <span>Tea Break</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500 rounded"></div>
                            <span>Current break</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 