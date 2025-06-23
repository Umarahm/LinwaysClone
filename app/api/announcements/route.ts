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
                AND (a.scheduled_date IS NULL OR a.scheduled_date <= NOW())
                AND (a.expiry_date IS NULL OR a.expiry_date > NOW())
                ORDER BY 
                    CASE a.priority 
                        WHEN 'urgent' THEN 1 
                        WHEN 'high' THEN 2 
                        WHEN 'normal' THEN 3 
                        WHEN 'low' THEN 4 
                    END,
                    a.created_at DESC
            `;
        } else if (userEmail) {
            // Get announcements for specific user (role-based + user-specific)
            announcements = await sql`
                SELECT a.*, u.full_name as author_name, u.role as author_role
                FROM announcements a
                LEFT JOIN users u ON a.author_id = u.id
                WHERE (a.recipient = ${role} OR a.recipient = 'all' OR a.target_user_email = ${userEmail})
                AND (a.scheduled_date IS NULL OR a.scheduled_date <= NOW())
                AND (a.expiry_date IS NULL OR a.expiry_date > NOW())
                ORDER BY 
                    CASE a.priority 
                        WHEN 'urgent' THEN 1 
                        WHEN 'high' THEN 2 
                        WHEN 'normal' THEN 3 
                        WHEN 'low' THEN 4 
                    END,
                    a.created_at DESC
            `;
        } else {
            announcements = await sql`
                SELECT a.*, u.full_name as author_name, u.role as author_role
                FROM announcements a
                LEFT JOIN users u ON a.author_id = u.id
                WHERE (a.recipient = ${role} OR a.recipient = 'all')
                AND (a.scheduled_date IS NULL OR a.scheduled_date <= NOW())
                AND (a.expiry_date IS NULL OR a.expiry_date > NOW())
                ORDER BY 
                    CASE a.priority 
                        WHEN 'urgent' THEN 1 
                        WHEN 'high' THEN 2 
                        WHEN 'normal' THEN 3 
                        WHEN 'low' THEN 4 
                    END,
                    a.created_at DESC
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
        const {
            title,
            content,
            message,
            targetRole,
            targetUserId,
            target_user_email,
            priority = 'normal',
            recipient,
            author_id,
            scheduled_date,
            expiry_date,
            attachments = []
        } = await request.json();

        // Support both old and new API formats
        const announcementTitle = title;
        const announcementMessage = content || message;
        const announcementRecipient = targetRole || recipient;
        const targetUserEmail = target_user_email || targetUserId;

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

        // Validate priority value
        if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid priority. Must be low, normal, high, or urgent'
                },
                { status: 400 }
            );
        }

        // Get current user as author if not provided
        let authorId = author_id;
        if (!authorId) {
            // Get the current user from cookies
            const { cookies } = require('next/headers');
            const cookieStore = await cookies();
            const userCookie = cookieStore.get('user');

            if (userCookie) {
                try {
                    const userData = JSON.parse(userCookie.value);
                    authorId = userData.id;
                } catch (error) {
                    console.error('Failed to parse user cookie:', error);
                }
            }

            // Fallback to a default if still no author
            if (!authorId) {
                const facultyUser = await sql`SELECT id FROM users WHERE role = 'faculty' LIMIT 1`;
                authorId = facultyUser[0]?.id || 1;
            }
        }

        // Create announcement
        const newAnnouncement = await sql`
            INSERT INTO announcements (
                title, 
                message, 
                author_id, 
                recipient, 
                target_user_email, 
                priority,
                scheduled_date,
                expiry_date,
                attachments
            )
            VALUES (
                ${announcementTitle}, 
                ${announcementMessage}, 
                ${authorId}, 
                ${announcementRecipient}, 
                ${targetUserEmail || null}, 
                ${priority},
                ${scheduled_date || null},
                ${expiry_date || null},
                ${JSON.stringify(attachments)}
            )
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            message: 'Announcement created successfully',
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

export async function PUT(request: NextRequest) {
    try {
        const {
            id,
            title,
            message,
            recipient,
            priority,
            scheduled_date,
            expiry_date,
            attachments,
            user_id,
            user_role
        } = await request.json();

        // Validate required fields
        if (!id || !title || !message || !recipient) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'ID, title, message, and recipient are required'
                },
                { status: 400 }
            );
        }

        // Check if user has permission to edit
        if (user_role !== 'admin' && user_role !== 'faculty') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized: Only admins and faculty can edit announcements'
                },
                { status: 403 }
            );
        }

        // For non-admin users, check if they are the author
        if (user_role !== 'admin') {
            const existingAnnouncement = await sql`
                SELECT author_id FROM announcements WHERE id = ${id}
            `;

            if (existingAnnouncement.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Announcement not found'
                    },
                    { status: 404 }
                );
            }

            if (existingAnnouncement[0].author_id !== user_id) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unauthorized: You can only edit your own announcements'
                    },
                    { status: 403 }
                );
            }
        }

        // Update announcement
        const updatedAnnouncement = await sql`
            UPDATE announcements 
            SET 
                title = ${title},
                message = ${message},
                recipient = ${recipient},
                priority = ${priority || 'normal'},
                scheduled_date = ${scheduled_date || null},
                expiry_date = ${expiry_date || null},
                attachments = ${JSON.stringify(attachments || [])},
                updated_at = NOW()
            WHERE id = ${id}
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            message: 'Announcement updated successfully',
            announcement: updatedAnnouncement[0]
        });
    } catch (error) {
        console.error('Error updating announcement:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update announcement',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const user_id = searchParams.get('user_id');
        const user_role = searchParams.get('user_role');

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Announcement ID is required'
                },
                { status: 400 }
            );
        }

        // Check if user has permission to delete
        if (user_role !== 'admin' && user_role !== 'faculty') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized: Only admins and faculty can delete announcements'
                },
                { status: 403 }
            );
        }

        // For non-admin users, check if they are the author
        if (user_role !== 'admin') {
            const existingAnnouncement = await sql`
                SELECT author_id FROM announcements WHERE id = ${id}
            `;

            if (existingAnnouncement.length === 0) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Announcement not found'
                    },
                    { status: 404 }
                );
            }

            if (existingAnnouncement[0].author_id !== parseInt(user_id || '0')) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Unauthorized: You can only delete your own announcements'
                    },
                    { status: 403 }
                );
            }
        }

        // Delete announcement
        await sql`DELETE FROM announcements WHERE id = ${id}`;

        return NextResponse.json({
            success: true,
            message: 'Announcement deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting announcement:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete announcement',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
} 