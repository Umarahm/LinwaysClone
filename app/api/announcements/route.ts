import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') || 'all';
        const userEmail = searchParams.get('userEmail');

        let announcements;

        if (role === 'all') {
            announcements = await sql`
                SELECT a.*, u.full_name as author_name, u.role as author_role
                FROM announcements a
                LEFT JOIN users u ON a.author_id = u.id
                WHERE a.recipient = 'all'
                ORDER BY a.created_at DESC
            `;
        } else if (userEmail) {
            // Get announcements for specific user (role-based + user-specific)
            announcements = await sql`
                SELECT a.*, u.full_name as author_name, u.role as author_role
                FROM announcements a
                LEFT JOIN users u ON a.author_id = u.id
                WHERE a.recipient = ${role} OR a.recipient = 'all' OR a.target_user_email = ${userEmail}
                ORDER BY a.created_at DESC
            `;
        } else {
            announcements = await sql`
                SELECT a.*, u.full_name as author_name, u.role as author_role
                FROM announcements a
                LEFT JOIN users u ON a.author_id = u.id
                WHERE a.recipient = ${role} OR a.recipient = 'all'
                ORDER BY a.created_at DESC
            `;
        }

        return NextResponse.json({
            success: true,
            announcements
        });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch announcements',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { title, content, message, targetRole, targetUserId, priority, recipient, author_id } = await request.json();

        // Support both old and new API formats
        const announcementTitle = title;
        const announcementMessage = content || message;
        const announcementRecipient = targetRole || recipient;
        const targetUserEmail = targetUserId;

        // Validate required fields
        if (!announcementTitle || !announcementMessage || !announcementRecipient) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Title, message/content, and recipient/targetRole are required'
                },
                { status: 400 }
            );
        }

        // Validate recipient value
        if (!['student', 'faculty', 'all'].includes(announcementRecipient)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid recipient. Must be student, faculty, or all'
                },
                { status: 400 }
            );
        }

        // Get current user as author if not provided
        let authorId = author_id;
        if (!authorId) {
            // For now, we'll use a default faculty author ID
            // In a real implementation, you'd get this from the session
            const facultyUser = await sql`SELECT id FROM users WHERE role = 'faculty' LIMIT 1`;
            authorId = facultyUser[0]?.id || 1;
        }

        // Create announcement
        const newAnnouncement = await sql`
            INSERT INTO announcements (title, message, author_id, recipient, target_user_email, priority)
            VALUES (${announcementTitle}, ${announcementMessage}, ${authorId}, ${announcementRecipient}, ${targetUserEmail || null}, ${priority || 'normal'})
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            message: 'Notification sent successfully',
            announcement: newAnnouncement[0]
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create announcement',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 