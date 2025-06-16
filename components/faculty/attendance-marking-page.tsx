"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Check, X, Save, ArrowLeft, UserCheck, GraduationCap, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { markAttendance, checkAttendanceStatus } from "@/lib/attendance-actions"

interface Student {
    id: number
    full_name: string
    email: string
    roll_number?: string
    attendance_status?: 'present' | 'absent' | null
    attendance_id?: number
    total_attendance_count: number
    present_count: number
    attendance_percentage: number
}

interface FacultyAttendanceMarkingProps {
    courseId: number
    timetableId: number
    courseName: string
    courseCode: string
    students: Student[]
    date: string
    startTime: string
    endTime: string
    room: string
    day: string
}

export function FacultyAttendanceMarking({
    courseId,
    timetableId,
    courseName,
    courseCode,
    students,
    date,
    startTime,
    endTime,
    room,
    day
}: FacultyAttendanceMarkingProps) {
    const router = useRouter()
    const [attendanceData, setAttendanceData] = useState<{ [key: number]: 'present' | 'absent' }>({})
    const [saving, setSaving] = useState(false)
    const [isAlreadyMarked, setIsAlreadyMarked] = useState(false)
    const [existingAttendance, setExistingAttendance] = useState<any>(null)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        // Check if attendance is already marked for this date
        const checkExistingAttendance = async () => {
            try {
                console.log('Checking existing attendance for courseId:', courseId, 'timetableId:', timetableId, 'date:', date)
                const status = await checkAttendanceStatus(courseId, date, timetableId)
                console.log('Attendance status result:', status)

                if (status.isMarked) {
                    setIsAlreadyMarked(true)
                    setExistingAttendance(status)

                    // Load existing attendance data
                    const initialData: { [key: number]: 'present' | 'absent' } = {}
                    students.forEach(student => {
                        // Set default based on existing data or present
                        initialData[student.id] = student.attendance_status || 'present'
                    })
                    setAttendanceData(initialData)
                    console.log('Loaded existing attendance data:', initialData)
                } else {
                    // Initialize with all students marked as present by default
                    const initialData: { [key: number]: 'present' | 'absent' } = {}
                    students.forEach(student => {
                        initialData[student.id] = 'present'
                    })
                    setAttendanceData(initialData)
                    console.log('Initialized new attendance data:', initialData)
                }
            } catch (error) {
                console.error('Error checking attendance status:', error)
                // Initialize with all students marked as present by default
                const initialData: { [key: number]: 'present' | 'absent' } = {}
                students.forEach(student => {
                    initialData[student.id] = 'present'
                })
                setAttendanceData(initialData)
                console.log('Fallback initialization:', initialData)
            } finally {
                // Add a small delay for smooth animation
                setTimeout(() => setIsLoaded(true), 100)
            }
        }

        console.log('useEffect triggered with students:', students.length)
        checkExistingAttendance()
    }, [courseId, date, students])

    const formatTime = (time: string) => {
        const [hour, minute] = time.split(':')
        const hourNum = parseInt(hour)
        const ampm = hourNum >= 12 ? 'PM' : 'AM'
        const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
        return `${displayHour}:${minute} ${ampm}`
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const toggleAttendance = (studentId: number) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'present' ? 'absent' : 'present'
        }))
    }

    const markAllPresent = () => {
        const allPresentData: { [key: number]: 'present' | 'absent' } = {}
        students.forEach(student => {
            allPresentData[student.id] = 'present'
        })
        setAttendanceData(allPresentData)
    }

    const markAllAbsent = () => {
        const allAbsentData: { [key: number]: 'present' | 'absent' } = {}
        students.forEach(student => {
            allAbsentData[student.id] = 'absent'
        })
        setAttendanceData(allAbsentData)
    }

    const handleSaveAttendance = async () => {
        setSaving(true)
        try {
            // Convert attendance data to the expected format
            const attendanceArray = Object.entries(attendanceData).map(([studentId, status]) => ({
                studentId: parseInt(studentId),
                status
            }))

            const formData = new FormData()
            formData.append('courseId', courseId.toString())
            formData.append('timetableId', timetableId.toString())
            formData.append('date', date)
            formData.append('attendanceData', JSON.stringify(attendanceArray))

            const result = await markAttendance(formData)

            if (result.success) {
                toast({
                    title: "✅ Attendance Saved Successfully",
                    description: result.message,
                })
                router.push('/dashboard/faculty/timetable')
            } else {
                toast({
                    title: "Failed to Save Attendance",
                    description: result.message,
                    variant: "destructive"
                })
            }
        } catch (error) {
            console.error('Error saving attendance:', error)
            toast({
                title: "Error",
                description: "An unexpected error occurred while saving attendance.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const presentCount = Object.values(attendanceData).filter(status => status === 'present').length
    const absentCount = students.length - presentCount
    const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className={`container mx-auto px-4 py-8 space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                {/* Header */}
                <div className="flex items-center justify-between animate-fade-in">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-105"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Timetable
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Mark Attendance
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Record attendance for your class session
                            </p>
                        </div>
                    </div>

                    {isAlreadyMarked && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg animate-slide-in-right">
                            <UserCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            <span className="text-amber-800 dark:text-amber-200 font-medium">Already Marked</span>
                        </div>
                    )}
                </div>

                {/* Class Details Card */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-700 dark:to-gray-600 text-white rounded-t-lg">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <GraduationCap className="w-6 h-6" />
                            Class Session Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Course</p>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{courseCode}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{courseName}</p>
                                </div>
                            </div>
                            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date & Day</p>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="font-bold text-gray-900 dark:text-gray-100">{formatDate(date)}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{day}</p>
                                </div>
                            </div>
                            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Time</p>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {formatTime(startTime)} - {formatTime(endTime)}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Room</p>
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                                    <p className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        {room}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Summary */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 animate-slide-up" style={{ animationDelay: '200ms' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <Users className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            Attendance Overview
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30 hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{students.length}</div>
                                <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mt-1">Total Students</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-800/30 hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{presentCount}</div>
                                <div className="text-sm font-medium text-green-700 dark:text-green-300 mt-1">Present</div>
                            </div>
                            <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30 hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{absentCount}</div>
                                <div className="text-sm font-medium text-red-700 dark:text-red-300 mt-1">Absent</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-600 hover:scale-105 transition-all duration-300">
                                <div className="text-3xl font-bold text-gray-700 dark:text-gray-300">{attendancePercentage}%</div>
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">Attendance Rate</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={markAllPresent}
                                className="flex items-center gap-2 border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-105"
                            >
                                <Check className="w-4 h-4" />
                                Mark All Present
                            </Button>
                            <Button
                                variant="outline"
                                onClick={markAllAbsent}
                                className="flex items-center gap-2 border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105"
                            >
                                <X className="w-4 h-4" />
                                Mark All Absent
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Student Cards Grid */}
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 animate-slide-up" style={{ animationDelay: '400ms' }}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            <User className="w-6 h-6" />
                            Student Attendance ({students.length} Students)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {students.map((student, index) => {
                                const isPresent = attendanceData[student.id] === 'present'
                                const studentRollNo = student.roll_number || `STU${student.id.toString().padStart(4, '0')}`

                                return (
                                    <div
                                        key={student.id}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer 
                                            hover:scale-[1.02] hover:shadow-lg animate-fade-in-up
                                            ${isPresent
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 shadow-green-100 dark:shadow-green-900/20'
                                                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 shadow-red-100 dark:shadow-red-900/20'
                                            }
                                        `}
                                        style={{ animationDelay: `${500 + (index * 50)}ms` }}
                                        onClick={() => toggleAttendance(student.id)}
                                    >
                                        {/* Status Badge */}
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge
                                                className={`
                                                    transition-all duration-200 font-medium px-3 py-1
                                                    ${isPresent
                                                        ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                                                        : 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                                                    }
                                                `}
                                            >
                                                {isPresent ? (
                                                    <div className="flex items-center gap-1">
                                                        <Check className="w-3 h-3" />
                                                        Present
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1">
                                                        <X className="w-3 h-3" />
                                                        Absent
                                                    </div>
                                                )}
                                            </Badge>
                                        </div>

                                        {/* Student Info */}
                                        <div className="space-y-2">
                                            <div>
                                                <h3 className={`font-bold text-lg leading-tight ${isPresent
                                                    ? 'text-green-900 dark:text-green-100'
                                                    : 'text-red-900 dark:text-red-100'
                                                    }`}>
                                                    {student.full_name}
                                                </h3>
                                                <p className={`text-sm font-mono ${isPresent
                                                    ? 'text-green-700 dark:text-green-300'
                                                    : 'text-red-700 dark:text-red-300'
                                                    }`}>
                                                    Roll: {studentRollNo}
                                                </p>
                                            </div>

                                            <div className={`pt-2 border-t ${isPresent
                                                ? 'border-green-200 dark:border-green-700'
                                                : 'border-red-200 dark:border-red-700'
                                                }`}>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className={`${isPresent
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        Overall: {student.attendance_percentage}%
                                                    </span>
                                                    <span className={`${isPresent
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-red-600 dark:text-red-400'
                                                        }`}>
                                                        {student.present_count}/{student.total_attendance_count}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Interactive Toggle */}
                                        <div className={`mt-4 pt-3 border-t ${isPresent
                                            ? 'border-green-200 dark:border-green-700'
                                            : 'border-red-200 dark:border-red-700'
                                            }`}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className={`w-full transition-all duration-200 ${isPresent
                                                    ? 'text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                    : 'text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30'
                                                    }`}
                                            >
                                                {isPresent ? 'Mark Absent' : 'Mark Present'}
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-center animate-slide-up" style={{ animationDelay: '600ms' }}>
                    <Button
                        onClick={handleSaveAttendance}
                        disabled={saving}
                        className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold px-8 py-4 text-lg shadow-lg transition-all duration-200 hover:scale-105"
                        size="lg"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Saving Attendance...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5 mr-2" />
                                Save Attendance
                            </>
                        )}
                    </Button>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slide-up {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }

                @keyframes slide-in-right {
                    from { 
                        opacity: 0; 
                        transform: translateX(20px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateX(0); 
                    }
                }

                @keyframes fade-in-up {
                    from { 
                        opacity: 0; 
                        transform: translateY(10px); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0); 
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.6s ease-out;
                }

                .animate-slide-up {
                    animation: slide-up 0.6s ease-out;
                    animation-fill-mode: both;
                }

                .animate-slide-in-right {
                    animation: slide-in-right 0.6s ease-out;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.4s ease-out;
                    animation-fill-mode: both;
                }
            `}</style>
        </div>
    )
} 