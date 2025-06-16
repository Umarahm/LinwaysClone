import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const role = searchParams.get('role') || 'all';

        let whereClause = '';
        if (role !== 'all') {
            whereClause = `WHERE a.recipient = '${role}' OR a.recipient = 'all'`;
        } else {
            whereClause = `WHERE a.recipient = 'all'`;
        }

        const announcements = await sql`
      SELECT a.*, u.full_name as author_name
      FROM announcements a
      LEFT JOIN users u ON a.author_id = u.id
      ${whereClause ? sql.unsafe(whereClause) : sql``}
      ORDER BY a.created_at DESC
    `;

        return NextResponse.json({ announcements });
    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json(
            { error: 'Failed to fetch announcements' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { title, message, recipient, author_id } = await request.json();

        // Validate required fields
        if (!title || !message || !recipient || !author_id) {
            return NextResponse.json(
                { error: 'Title, message, recipient, and author are required' },
                { status: 400 }
            );
        }

        // Validate recipient value
        if (!['student', 'faculty', 'all'].includes(recipient)) {
            return NextResponse.json(
                { error: 'Invalid recipient. Must be student, faculty, or all' },
                { status: 400 }
            );
        }

        // Create announcement
        const newAnnouncement = await sql`
      INSERT INTO announcements (title, message, author_id, recipient)
      VALUES (${title}, ${message}, ${author_id}, ${recipient})
      RETURNING *
    `;

        return NextResponse.json({
            message: 'Announcement created successfully',
            announcement: newAnnouncement[0]
        });
    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json(
            { error: 'Failed to create announcement' },
            { status: 500 }
        );
    }
} 