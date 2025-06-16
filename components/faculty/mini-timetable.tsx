"use client"

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTimetableByUser, checkTimetableAttendance } from '@/lib/timetable-actions'
import { Clock, MapPin, BookOpen, Users, Check } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

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

interface MiniTimetableProps {
    userId: number
    userRole: string
}

const facultyColors = [
    {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900',
        text: 'text-blue-900 dark:text-blue-100',
        border: 'border-blue-200 dark:border-blue-800',
        button: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
    },
    {
        bg: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900',
        text: 'text-emerald-900 dark:text-emerald-100',
        border: 'border-emerald-200 dark:border-emerald-800',
        button: 'bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white'
    },
    {
        bg: 'bg-gradient-to-r from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900',
        text: 'text-violet-900 dark:text-violet-100',
        border: 'border-violet-200 dark:border-violet-800',
        button: 'bg-violet-500 hover:bg-violet-600 dark:bg-violet-600 dark:hover:bg-violet-700 text-white'
    },
    {
        bg: 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900',
        text: 'text-orange-900 dark:text-orange-100',
        border: 'border-orange-200 dark:border-orange-800',
        button: 'bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white'
    },
]

export function MiniTimetable({ userId, userRole }: MiniTimetableProps) {
    const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([])
    const [attendanceStatus, setAttendanceStatus] = useState<{ [key: number]: boolean }>({})
    const [loading, setLoading] = useState(true)

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const currentTime = new Date().getHours() * 100 + new Date().getMinutes()

    useEffect(() => {
        const fetchTodayClasses = async () => {
            try {
                console.log('MiniTimetable: Starting to fetch classes for userId:', userId, 'userRole:', userRole)
                setLoading(true)
                const allClasses = await getTimetableByUser(userId, userRole) as TimetableEntry[]
                console.log('MiniTimetable: Received all classes:', allClasses)
                console.log('MiniTimetable: All classes count:', allClasses.length)
                const todaySchedule = allClasses.filter(entry => entry.day === today)
                console.log('MiniTimetable: Today is:', today)
                console.log('MiniTimetable: Today classes filtered:', todaySchedule)
                console.log('MiniTimetable: Today classes count:', todaySchedule.length)
                setTodayClasses(todaySchedule)

                // Check attendance status for today's classes
                if (userRole === 'faculty' && todaySchedule.length > 0) {
                    console.log('MiniTimetable: Checking attendance status for', todaySchedule.length, 'classes')
                    const statusPromises = todaySchedule.map(async (entry) => {
                        try {
                            const result = await checkTimetableAttendance(entry.id)
                            return { id: entry.id, isMarked: result.isMarked }
                        } catch (error) {
                            console.error('MiniTimetable: Error checking attendance for entry', entry.id, error)
                            return { id: entry.id, isMarked: false }
                        }
                    })

                    const statuses = await Promise.all(statusPromises)
                    console.log('MiniTimetable: Attendance statuses:', statuses)
                    const statusMap = statuses.reduce((acc, { id, isMarked }) => {
                        acc[id] = isMarked
                        return acc
                    }, {} as { [key: number]: boolean })

                    console.log('MiniTimetable: Final status map:', statusMap)
                    setAttendanceStatus(statusMap)
                }
            } catch (error) {
                console.error('MiniTimetable: Error fetching today\'s classes:', error)
            } finally {
                console.log('MiniTimetable: Loading completed, setting loading to false')
                setLoading(false)
            }
        }

        fetchTodayClasses()
    }, [userId, userRole, today])

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':')
        const hourNum = parseInt(hour)
        const ampm = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
        return `${displayHour}:${minute} ${ampm}`
    }

    const getFacultyColorIndex = (facultyId: number) => {
        return facultyId % facultyColors.length
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

    const handleMarkAttendance = (entry: TimetableEntry) => {
        if (userRole !== 'faculty' || entry.faculty_id !== userId) {
            toast({
                title: "Access Denied",
                description: "You can only mark attendance for your own classes.",
                variant: "destructive"
            })
            return
        }

        // Navigate to attendance marking page
        const searchParams = new URLSearchParams({
            courseId: entry.course_id.toString(),
            timetableId: entry.id.toString(),
            date: new Date().toISOString().split('T')[0]
        })

        window.open(`/dashboard/faculty/attendance/mark?${searchParams.toString()}`, '_self')
    }

    if (loading) {
        return (
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Today's Classes
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
                        Today's Classes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6">
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
                        Today's Classes
                    </CardTitle>
                    <Badge variant="outline" className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 text-xs">
                        {today}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {todayClasses
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((entry) => {
                            const colorScheme = facultyColors[getFacultyColorIndex(entry.faculty_id)]
                            const isMarked = attendanceStatus[entry.id] || false
                            const isCurrent = isCurrentClass(entry.start_time, entry.end_time)
                            const upcoming = isUpcoming(entry.start_time)
                            const canMarkAttendance = userRole === 'faculty' && entry.faculty_id === userId

                            return (
                                <div
                                    key={entry.id}
                                    className={`
                    ${colorScheme.bg} ${colorScheme.border} border rounded-lg p-3
                    transition-all duration-200 relative
                    ${isCurrent ? 'ring-2 ring-blue-400 dark:ring-blue-500 shadow-md' : ''}
                  `}
                                >
                                    {/* Status indicators */}
                                    <div className="absolute top-2 right-2 flex gap-1">
                                        {isMarked && (
                                            <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center">
                                                <Check className="w-2 h-2 text-white" />
                                            </div>
                                        )}
                                        {isCurrent && (
                                            <Badge className="bg-red-500 dark:bg-red-600 text-white text-xs px-1.5 py-0.5 h-auto">
                                                LIVE
                                            </Badge>
                                        )}
                                        {upcoming && (
                                            <Badge variant="outline" className="text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 text-xs px-1.5 py-0.5 h-auto">
                                                Upcoming
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
                                        <div className="col-span-5">
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

                                        {/* Action */}
                                        <div className="col-span-4 flex justify-end">
                                            {canMarkAttendance && (
                                                <>
                                                    {isMarked ? (
                                                        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800 text-xs">
                                                            Marked
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleMarkAttendance(entry)}
                                                            disabled={!isCurrent && currentTime < parseInt(entry.start_time.replace(':', ''))}
                                                            className={`${colorScheme.button} text-xs h-7 px-2`}
                                                        >
                                                            <>
                                                                <Users className="w-3 h-3 mr-1" />
                                                                Take
                                                            </>
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                </div>
            </CardContent>
        </Card>
    )
} 