import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        const users = await sql`
      SELECT id, email, full_name, role, department, created_at 
      FROM users 
      WHERE role != 'admin'
      ORDER BY created_at DESC
    `;

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email, password, full_name, role, department } = await request.json();

        // Validate required fields
        if (!email || !password || !full_name || !role || !department) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, role, department)
      VALUES (${email}, ${hashedPassword}, ${full_name}, ${role}, ${department})
      RETURNING id, email, full_name, role, department, created_at
    `;

        return NextResponse.json({
            message: 'User created successfully',
            user: newUser[0]
        });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json(
            { error: 'Failed to create user' },
            { status: 500 }
        );
    }
} 