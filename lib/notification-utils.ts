import { cookies } from 'next/headers'

export interface NotificationData {
    type: 'announcement' | 'grade' | 'attendance' | 'assignment' | 'timetable' | 'message' | 'general'
    title: string
    message: string
    targetUserEmail?: string
    targetRole?: 'student' | 'faculty' | 'all'
    priority?: 'low' | 'medium' | 'high'
    metadata?: Record<string, any>
}

// Send notification to user(s)
export async function sendNotification(notificationData: NotificationData) {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: notificationData.title,
                content: notificationData.message,
                targetRole: notificationData.targetRole || 'all',
                targetUserId: notificationData.targetUserEmail,
                priority: notificationData.priority || 'medium'
            })
        })

        const result = await response.json()
        return result.success
    } catch (error) {
        console.error('Failed to send notification:', error)
        return false
    }
}

// Send attendance notification to a student
export async function sendAttendanceNotification(
    studentEmail: string,
    facultyName: string,
    courseCode: string,
    courseName: string,
    status: 'present' | 'absent',
    date: string
) {
    if (status === 'absent') {
        return await sendNotification({
            type: 'attendance',
            title: `Marked Absent - ${courseCode}`,
            message: `You were marked absent for ${courseName} (${courseCode}) lecture on ${new Date(date).toLocaleDateString()} by ${facultyName}.`,
            targetUserEmail: studentEmail,
            priority: 'high',
            metadata: {
                courseCode,
                courseName,
                facultyName,
                date,
                status
            }
        })
    }
    return true // Don't send notifications for present status
}

// Send grade notification to a student
export async function sendGradeNotification(
    studentEmail: string,
    assignmentTitle: string,
    courseCode: string,
    courseName: string,
    grade: number,
    maxMarks: number,
    feedback?: string
) {
    const percentage = Math.round((grade / maxMarks) * 100)

    return await sendNotification({
        type: 'grade',
        title: `Assignment Graded: ${assignmentTitle}`,
        message: `Your assignment "${assignmentTitle}" for ${courseName} (${courseCode}) has been graded. Grade: ${grade}/${maxMarks} (${percentage}%).${feedback ? ` Feedback: ${feedback}` : ''}`,
        targetUserEmail: studentEmail,
        priority: 'medium',
        metadata: {
            courseCode,
            courseName,
            assignmentTitle,
            grade: `${grade}/${maxMarks}`,
            percentage,
            feedback
        }
    })
}

// Send timetable change notification
export async function sendTimetableChangeNotification(
    courseCode: string,
    courseName: string,
    changes: string,
    affectedStudents: string[],
    facultyEmail?: string
) {
    // Notify students
    const studentNotifications = affectedStudents.map(studentEmail =>
        sendNotification({
            type: 'timetable',
            title: `Timetable Updated - ${courseCode}`,
            message: `Your class schedule has been updated for ${courseName} (${courseCode}). ${changes}`,
            targetUserEmail: studentEmail,
            priority: 'high',
            metadata: {
                courseCode,
                courseName,
                changes
            }
        })
    )

    // Notify faculty if provided
    if (facultyEmail) {
        studentNotifications.push(
            sendNotification({
                type: 'timetable',
                title: `Timetable Updated - ${courseCode}`,
                message: `The timetable for ${courseName} (${courseCode}) has been updated. ${changes}`,
                targetUserEmail: facultyEmail,
                priority: 'medium',
                metadata: {
                    courseCode,
                    courseName,
                    changes
                }
            })
        )
    }

    try {
        await Promise.all(studentNotifications)
        return true
    } catch (error) {
        console.error('Failed to send timetable notifications:', error)
        return false
    }
}

// Send assignment notification
export async function sendAssignmentNotification(
    title: string,
    message: string,
    courseCode: string,
    courseName: string,
    targetStudents: string[],
    priority: 'low' | 'medium' | 'high' = 'medium'
) {
    const notifications = targetStudents.map(studentEmail =>
        sendNotification({
            type: 'assignment',
            title: `${title} - ${courseCode}`,
            message: `${message} Course: ${courseName} (${courseCode})`,
            targetUserEmail: studentEmail,
            priority,
            metadata: {
                courseCode,
                courseName
            }
        })
    )

    try {
        await Promise.all(notifications)
        return true
    } catch (error) {
        console.error('Failed to send assignment notifications:', error)
        return false
    }
}

// Send bulk attendance notifications
export async function sendBulkAttendanceNotifications(
    attendanceData: Array<{
        studentEmail: string
        studentName: string
        status: 'present' | 'absent'
    }>,
    facultyName: string,
    courseCode: string,
    courseName: string,
    date: string
) {
    const absentStudents = attendanceData.filter(record => record.status === 'absent')

    if (absentStudents.length === 0) {
        return true // No absent students, no notifications needed
    }

    const notifications = absentStudents.map(student =>
        sendAttendanceNotification(
            student.studentEmail,
            facultyName,
            courseCode,
            courseName,
            'absent',
            date
        )
    )

    try {
        await Promise.all(notifications)
        return true
    } catch (error) {
        console.error('Failed to send bulk attendance notifications:', error)
        return false
    }
}

// Send general announcement
export async function sendGeneralNotification(
    title: string,
    message: string,
    targetRole: 'student' | 'faculty' | 'all' = 'all',
    priority: 'low' | 'medium' | 'high' = 'medium',
    targetUserEmail?: string
) {
    return await sendNotification({
        type: 'announcement',
        title,
        message,
        targetRole,
        targetUserEmail,
        priority
    })
} 