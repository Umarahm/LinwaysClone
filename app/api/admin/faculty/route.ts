import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        // Get all faculty members
        const faculty = await sql`
            SELECT 
                id,
                full_name,
                email,
                department
            FROM users 
            WHERE role = 'faculty'
            ORDER BY full_name
        `;

        return NextResponse.json({ faculty });
    } catch (error) {
        console.error('Error fetching faculty:', error);
        return NextResponse.json(
            { error: 'Failed to fetch faculty' },
            { status: 500 }
        );
    }
} 