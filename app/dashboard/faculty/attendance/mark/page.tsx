import { getCurrentUserServer } from "@/lib/auth-server"
import { getTimetableByUser } from "@/lib/timetable-actions"
import { getCourseStudents } from "@/lib/attendance-actions"
import { redirect } from "next/navigation"
import { FacultyAttendanceMarking } from "@/components/faculty/attendance-marking-page"
import { Suspense } from "react"

interface SearchParams {
    courseId?: string
    timetableId?: string
    date?: string
}

interface PageProps {
    searchParams: Promise<SearchParams>
}

function LoadingComponent() {
    return (
        <div className="container mx-auto py-6">
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading attendance page...</p>
                </div>
            </div>
        </div>
    )
}

export default async function MarkAttendancePage({ searchParams }: PageProps) {
    const user = await getCurrentUserServer()

    if (!user || user.role !== 'faculty') {
        redirect('/login')
    }

    const { courseId, timetableId, date } = await searchParams

    if (!courseId || !timetableId) {
        redirect('/dashboard/faculty/timetable')
    }

    try {
        console.log('Loading attendance page for:', { courseId, timetableId, date })

        // Get course details from timetable
        console.log('Fetching timetable entries...')
        const timetableEntries = await getTimetableByUser(user.id, 'faculty') as any[]
        console.log('Timetable entries:', timetableEntries.length)

        const timetableEntry = timetableEntries.find(entry => entry.id === parseInt(timetableId))
        console.log('Found timetable entry:', !!timetableEntry)

        if (!timetableEntry || timetableEntry.faculty_id !== user.id) {
            console.log('Timetable entry not found or access denied')
            redirect('/dashboard/faculty/timetable')
        }

        const currentDate = date || new Date().toISOString().split('T')[0]

        // Get enrolled students for the course
        console.log('Fetching course students...')
        const students = await getCourseStudents(parseInt(courseId), currentDate, parseInt(timetableId))
        console.log('Students loaded:', students.length)

        return (
            <Suspense fallback={<LoadingComponent />}>
                <div className="container mx-auto py-6">
                    <FacultyAttendanceMarking
                        courseId={parseInt(courseId)}
                        timetableId={parseInt(timetableId)}
                        courseName={timetableEntry.course_name}
                        courseCode={timetableEntry.course_code}
                        students={students}
                        date={currentDate}
                        startTime={timetableEntry.start_time}
                        endTime={timetableEntry.end_time}
                        room={timetableEntry.room}
                        day={timetableEntry.day}
                    />
                </div>
            </Suspense>
        )
    } catch (error) {
        console.error('Error loading attendance page:', error)

        // Return error page instead of redirect for better debugging
        return (
            <div className="container mx-auto py-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Attendance Page</h1>
                    <p className="text-muted-foreground mb-4">
                        {error instanceof Error ? error.message : 'An unexpected error occurred'}
                    </p>
                    <a
                        href="/dashboard/faculty/timetable"
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Timetable
                    </a>
                </div>
            </div>
        )
    }
} 