import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const user = JSON.parse(userCookie.value)
        const { type } = await request.json()

        let title = ''
        let message = ''
        let priority = 'medium'
        let targetRole = user.role

        // Generate different types of test notifications
        switch (type) {
            case 'grade':
                title = 'Assignment Graded: Data Structures Project'
                message = 'Your assignment "Binary Tree Implementation" for Computer Science (CS201) has been graded. Grade: 85/100 (85%). Feedback: Good work on the implementation. Consider optimizing the search function.'
                priority = 'medium'
                break
            case 'attendance':
                title = 'Marked Absent - CS301'
                message = 'You were marked absent for Database Systems (CS301) lecture on ' + new Date().toLocaleDateString() + ' by Dr. Smith.'
                priority = 'high'
                targetRole = 'student'
                break
            case 'timetable':
                title = 'Timetable Updated - CS201'
                message = 'Your class schedule has been updated for Computer Science (CS201). Time changed from 10:00-11:00 to 11:00-12:00. Room changed from 101 to 204.'
                priority = 'high'
                break
            case 'assignment':
                title = 'New Assignment Posted - CS302'
                message = 'A new assignment "Web Development Project" has been posted in Web Programming (CS302). Due date: ' + new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                priority = 'medium'
                targetRole = 'student'
                break
            case 'announcement':
                title = 'Academic Calendar Updated'
                message = 'The academic calendar for the upcoming semester has been published. Please review important dates and deadlines on the student portal.'
                priority = 'low'
                targetRole = 'all'
                break
            default:
                title = 'Test Notification'
                message = 'This is a test notification to demonstrate the notification system functionality.'
                priority = 'medium'
        }

        // Create the test notification
        await sql`
            INSERT INTO announcements (title, message, author_id, recipient, target_user_email, priority)
            VALUES (
                ${title},
                ${message},
                ${user.id},
                ${targetRole},
                ${targetRole === user.role ? user.email : null},
                ${priority}
            )
        `

        return NextResponse.json({
            success: true,
            message: `Test ${type} notification created successfully`,
            notification: {
                title,
                message,
                type,
                priority,
                targetRole
            }
        })
    } catch (error) {
        console.error('Error creating test notification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create test notification' },
            { status: 500 }
        )
    }
} 