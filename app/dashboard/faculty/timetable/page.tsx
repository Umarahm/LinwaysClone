import { getCurrentUserServer } from '@/lib/auth-server'
import { getTimetableByUser } from '@/lib/timetable-actions'
import { FacultyTimetable } from '@/components/faculty/faculty-timetable'
import { redirect } from 'next/navigation'

export default async function FacultyTimetablePage() {
    // Get the current user
    const user = await getCurrentUserServer()

    if (!user) {
        redirect('/login')
    }

    if (user.role !== 'faculty') {
        redirect('/dashboard')
    }

    // Fetch the faculty member's timetable
    const timetableData = await getTimetableByUser(user.id, 'faculty') as any[]

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    My Teaching Timetable
                </h1>
                <p className="text-gray-600">
                    View your class schedule and mark attendance for your courses.
                    Attendance can only be marked during scheduled class times.
                </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                {timetableData.length > 0 ? (
                    <FacultyTimetable
                        timetableData={timetableData}
                        userRole={user.role}
                        currentUser={user}
                    />
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">No classes scheduled</div>
                        <p className="text-gray-500">
                            You don't have any classes assigned in the timetable yet.
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Attendance Marking Guidelines</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• You can only mark attendance for your own classes</li>
                    <li>• Attendance can only be marked during the scheduled class time</li>
                    <li>• All enrolled students will be marked as present by default</li>
                    <li>• You can modify individual attendance later if needed</li>
                    <li>• Attendance marked here will be visible to administrators</li>
                </ul>
            </div>
        </div>
    )
} 