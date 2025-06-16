import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { email, password, full_name, role, department } = await request.json();
        const resolvedParams = await params;
        const userId = parseInt(resolvedParams.id);

        // Validate required fields
        if (!email || !full_name || !role || !department) {
            return NextResponse.json(
                { error: 'Email, full name, role, and department are required' },
                { status: 400 }
            );
        }

        // Check if user exists
        const existingUser = await sql`
      SELECT id FROM users WHERE id = ${userId}
    `;

        if (existingUser.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if email is already taken by another user
        const emailCheck = await sql`
      SELECT id FROM users WHERE email = ${email} AND id != ${userId}
    `;

        if (emailCheck.length > 0) {
            return NextResponse.json(
                { error: 'Email is already taken by another user' },
                { status: 409 }
            );
        }

        // Prepare update query
        let updateQuery;
        if (password) {
            // Hash new password if provided
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery = sql`
        UPDATE users 
        SET email = ${email}, password_hash = ${hashedPassword}, 
            full_name = ${full_name}, role = ${role}, department = ${department},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, email, full_name, role, department, created_at
      `;
        } else {
            // Update without changing password
            updateQuery = sql`
        UPDATE users 
        SET email = ${email}, full_name = ${full_name}, role = ${role}, 
            department = ${department}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${userId}
        RETURNING id, email, full_name, role, department, created_at
      `;
        }

        const updatedUser = await updateQuery;

        return NextResponse.json({
            message: 'User updated successfully',
            user: updatedUser[0]
        });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json(
            { error: 'Failed to update user' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const resolvedParams = await params;
        const userId = parseInt(resolvedParams.id);

        // Check if user exists and is not admin
        const user = await sql`
      SELECT role FROM users WHERE id = ${userId}
    `;

        if (user.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (user[0].role === 'admin') {
            return NextResponse.json(
                { error: 'Cannot delete admin users' },
                { status: 403 }
            );
        }

        // Delete related records first (due to foreign key constraints)
        await sql`DELETE FROM attendance WHERE student_id = ${userId} OR marked_by = ${userId}`;
        await sql`DELETE FROM submissions WHERE student_id = ${userId}`;
        await sql`DELETE FROM assignments WHERE faculty_id = ${userId}`;
        await sql`DELETE FROM enrollments WHERE student_id = ${userId}`;
        await sql`UPDATE courses SET faculty_id = NULL WHERE faculty_id = ${userId}`;
        await sql`DELETE FROM announcements WHERE author_id = ${userId}`;

        // Delete the user
        await sql`DELETE FROM users WHERE id = ${userId}`;

        return NextResponse.json({
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json(
            { error: 'Failed to delete user' },
            { status: 500 }
        );
    }
} 