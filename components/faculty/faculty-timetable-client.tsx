"use client"

import React, { useEffect, useState } from 'react'
import { FacultyTimetable } from './faculty-timetable'
import { getTimetableByUser } from '@/lib/timetable-actions'
import { Calendar, Users } from 'lucide-react'

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

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

interface FacultyTimetableClientProps {
    userId: number
    user: any
}

export function FacultyTimetableClient({ userId, user }: FacultyTimetableClientProps) {
    const [timetableData, setTimetableData] = useState<TimetableEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                console.log('FacultyTimetableClient: Starting to fetch timetable for userId:', userId)
                console.log('FacultyTimetableClient: User object:', user)
                setLoading(true)
                setError(null)
                const data = await getTimetableByUser(userId, 'faculty') as TimetableEntry[]
                console.log('FacultyTimetableClient: Received data:', data)
                console.log('FacultyTimetableClient: Data length:', data.length, 'entries')
                setTimetableData(data)
            } catch (err) {
                console.error('FacultyTimetableClient: Error fetching timetable:', err)
                setError('Failed to load timetable data')
            } finally {
                console.log('FacultyTimetableClient: Setting loading to false')
                setLoading(false)
            }
        }

        fetchTimetable()
    }, [userId])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-destructive text-lg mb-2">Error</div>
                <p className="text-muted-foreground">{error}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 dark:bg-white/30 rounded-lg">
                        <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">
                            My Teaching Timetable
                        </h1>
                        <p className="text-blue-100 dark:text-blue-200 text-sm">
                            Manage your classes and track attendance
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white/10 dark:bg-white/20 rounded-lg p-3">
                        <div className="text-xs text-blue-200 dark:text-blue-300 uppercase tracking-wide mb-1">Total Classes</div>
                        <div className="text-xl font-semibold">{timetableData.length}</div>
                    </div>
                    <div className="bg-white/10 dark:bg-white/20 rounded-lg p-3">
                        <div className="text-xs text-blue-200 dark:text-blue-300 uppercase tracking-wide mb-1">This Week</div>
                        <div className="text-xl font-semibold">
                            {weekdays.reduce((count, day) => {
                                return count + timetableData.filter(entry => entry.day === day).length
                            }, 0)}
                        </div>
                    </div>
                    <div className="bg-white/10 dark:bg-white/20 rounded-lg p-3">
                        <div className="text-xs text-blue-200 dark:text-blue-300 uppercase tracking-wide mb-1">Status</div>
                        <div className="text-xl font-semibold">Active</div>
                    </div>
                </div>
            </div>

            <div className="bg-background rounded-lg shadow-sm border border-border p-6">
                {timetableData.length > 0 ? (
                    <FacultyTimetable
                        timetableData={timetableData}
                        userRole="faculty"
                        currentUser={user}
                    />
                ) : (
                    <div className="text-center py-12">
                        <div className="text-muted-foreground text-lg mb-2">No classes scheduled</div>
                        <p className="text-muted-foreground/70">
                            You don't have any classes assigned in the timetable yet.
                        </p>
                    </div>
                )}
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                        <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-3">Attendance Guidelines</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-amber-800 dark:text-amber-200">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
                                    <span>Mark attendance only for your assigned classes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
                                    <span>Available only during scheduled class time</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
                                    <span>All students marked present by default</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
                                    <span>Modify individual records as needed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-400 dark:bg-amber-500 rounded-full"></div>
                                    <span>Visible to administrators instantly</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 