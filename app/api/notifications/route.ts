import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import { cookies } from 'next/headers'

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const user = JSON.parse(userCookie.value)
        const { searchParams } = new URL(request.url)
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

        // Get notifications for the user - both targeted and role-based
        const notifications = await sql`
            SELECT a.*, u.full_name as author_name, u.role as author_role
            FROM announcements a
            LEFT JOIN users u ON a.author_id = u.id
            WHERE 
                a.target_user_email = ${user.email} 
                OR (a.recipient = ${user.role} AND a.target_user_email IS NULL)
                OR (a.recipient = 'all' AND a.target_user_email IS NULL)
            ORDER BY a.created_at DESC
            LIMIT ${limit}
        `

        // Transform to notification format
        const formattedNotifications = notifications.map(notification => ({
            id: notification.id.toString(),
            type: getNotificationType(notification.title, notification.message),
            title: notification.title,
            message: notification.message,
            timestamp: new Date(notification.created_at),
            read: notification.read || false,
            priority: notification.priority || 'medium',
            metadata: extractMetadata(notification.title, notification.message)
        }))

        return NextResponse.json({
            success: true,
            notifications: formattedNotifications
        })
    } catch (error) {
        console.error('Error fetching notifications:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notifications' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const user = JSON.parse(userCookie.value)
        const { type, title, message, targetUserEmail, targetRole, priority, metadata } = await request.json()

        // Validate required fields
        if (!title || !message) {
            return NextResponse.json(
                { success: false, error: 'Title and message are required' },
                { status: 400 }
            )
        }

        // Create notification
        const newNotification = await sql`
            INSERT INTO announcements (title, message, author_id, recipient, target_user_email, priority)
            VALUES (
                ${title}, 
                ${message}, 
                ${user.id}, 
                ${targetRole || 'all'}, 
                ${targetUserEmail || null}, 
                ${priority || 'medium'}
            )
            RETURNING *
        `

        return NextResponse.json({
            success: true,
            notification: {
                id: newNotification[0].id.toString(),
                type: type || 'general',
                title,
                message,
                timestamp: new Date(newNotification[0].created_at),
                read: false,
                priority: priority || 'medium',
                metadata: metadata || {}
            }
        })
    } catch (error) {
        console.error('Error creating notification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to create notification' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const user = JSON.parse(userCookie.value)
        const { notificationId, action } = await request.json()

        if (action === 'markAsRead') {
            await sql`
                UPDATE announcements 
                SET read = true 
                WHERE id = ${notificationId} 
                AND (target_user_email = ${user.email} OR recipient = ${user.role})
            `
        } else if (action === 'markAllAsRead') {
            await sql`
                UPDATE announcements 
                SET read = true 
                WHERE target_user_email = ${user.email} 
                OR (recipient = ${user.role} AND target_user_email IS NULL)
                OR (recipient = 'all' AND target_user_email IS NULL)
            `
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error updating notification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to update notification' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const user = JSON.parse(userCookie.value)
        const { searchParams } = new URL(request.url)
        const notificationId = searchParams.get('id')

        if (notificationId) {
            // Delete specific notification
            await sql`
                DELETE FROM announcements 
                WHERE id = ${notificationId} 
                AND (target_user_email = ${user.email} OR recipient = ${user.role})
            `
        } else {
            // Clear all notifications for user
            await sql`
                DELETE FROM announcements 
                WHERE target_user_email = ${user.email} 
                OR (recipient = ${user.role} AND target_user_email IS NULL)
                OR (recipient = 'all' AND target_user_email IS NULL)
            `
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting notification:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to delete notification' },
            { status: 500 }
        )
    }
}

// Helper functions
function getNotificationType(title: string, message: string): string {
    const titleLower = title.toLowerCase()
    const messageLower = message.toLowerCase()

    if (titleLower.includes('graded') || titleLower.includes('grade') || messageLower.includes('grade')) {
        return 'grade'
    }
    if (titleLower.includes('absent') || titleLower.includes('attendance') || messageLower.includes('attendance')) {
        return 'attendance'
    }
    if (titleLower.includes('timetable') || titleLower.includes('schedule') || messageLower.includes('timetable')) {
        return 'timetable'
    }
    if (titleLower.includes('assignment') || messageLower.includes('assignment')) {
        return 'assignment'
    }
    if (titleLower.includes('announcement') || titleLower.includes('notice')) {
        return 'announcement'
    }
    if (titleLower.includes('message') || titleLower.includes('from')) {
        return 'message'
    }
    return 'general'
}

function extractMetadata(title: string, message: string): any {
    const metadata: any = {}

    // Extract course code (e.g., CS301, CS201)
    const courseCodeMatch = message.match(/([A-Z]{2,4}\d{3})/g)
    if (courseCodeMatch) {
        metadata.courseCode = courseCodeMatch[0]
    }

    // Extract grade
    const gradeMatch = message.match(/(\d+\/\d+|Grade:\s*(\d+\/\d+))/g)
    if (gradeMatch) {
        metadata.grade = gradeMatch[0].replace('Grade: ', '')
    }

    // Extract assignment title
    const assignmentMatch = message.match(/"([^"]+)"/g)
    if (assignmentMatch) {
        metadata.assignmentTitle = assignmentMatch[0].replace(/"/g, '')
    }

    // Extract faculty name for attendance
    if (title.includes('Marked absent') && message.includes('by ')) {
        const facultyMatch = message.match(/by\s+([^.]+)/i)
        if (facultyMatch) {
            metadata.from = facultyMatch[1].trim()
        }
    }

    return metadata
} 