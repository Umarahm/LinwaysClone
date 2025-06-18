import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    try {
        const users = await sql`
      SELECT id, email, full_name, role, department, roll_no, created_at 
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
        const { email, password, full_name, role, department, roll_no } = await request.json();

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

        // Generate roll number if not provided
        let finalRollNo = roll_no;
        if (!finalRollNo) {
            // Get the next available ID to generate roll number
            const maxId = await sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM users`;
            const nextId = maxId[0].next_id;
            finalRollNo = role === 'student' ? `STU${String(nextId).padStart(4, '0')}` :
                role === 'faculty' ? `FAC${String(nextId).padStart(4, '0')}` :
                    `USR${String(nextId).padStart(4, '0')}`;
        }

        // Create user
        const newUser = await sql`
      INSERT INTO users (email, password_hash, full_name, role, department, roll_no)
      VALUES (${email}, ${hashedPassword}, ${full_name}, ${role}, ${department}, ${finalRollNo})
      RETURNING id, email, full_name, role, department, roll_no, created_at
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