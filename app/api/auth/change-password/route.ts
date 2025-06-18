import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"
import { PASSWORD_RULES } from "@/lib/auth-config"

// Password validation function
function validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < PASSWORD_RULES.minLength) {
        return { isValid: false, message: `Password must be at least ${PASSWORD_RULES.minLength} characters long` }
    }

    if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one uppercase letter" }
    }

    if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one lowercase letter" }
    }

    if (PASSWORD_RULES.requireNumbers && !/\d/.test(password)) {
        return { isValid: false, message: "Password must contain at least one number" }
    }

    if (PASSWORD_RULES.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        return { isValid: false, message: "Password must contain at least one special character" }
    }

    return { isValid: true }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get("user")

        if (!userCookie) {
            return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
        }

        const currentUser = JSON.parse(userCookie.value)
        const { currentPassword, newPassword, confirmPassword } = await request.json()

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            return NextResponse.json({
                success: false,
                message: "Current password, new password, and confirmation are required"
            }, { status: 400 })
        }

        // Validate password confirmation
        if (newPassword !== confirmPassword) {
            return NextResponse.json({
                success: false,
                message: "New password and confirmation do not match"
            }, { status: 400 })
        }

        // Validate new password against rules
        const passwordValidation = validatePassword(newPassword)
        if (!passwordValidation.isValid) {
            return NextResponse.json({
                success: false,
                message: passwordValidation.message
            }, { status: 400 })
        }

        // Verify current password
        const user = await sql`SELECT password_hash FROM users WHERE id = ${currentUser.id}`

        if (user.length === 0) {
            return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
        }

        const validPassword = await bcrypt.compare(currentPassword, user[0].password_hash)
        if (!validPassword) {
            return NextResponse.json({
                success: false,
                message: "Current password is incorrect"
            }, { status: 400 })
        }

        // Check if new password is same as current password
        const samePassword = await bcrypt.compare(newPassword, user[0].password_hash)
        if (samePassword) {
            return NextResponse.json({
                success: false,
                message: "New password must be different from current password"
            }, { status: 400 })
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10)

        // Update password in database
        const result = await sql`
      UPDATE users 
      SET password_hash = ${hashedNewPassword}, 
          updated_at = NOW()
      WHERE id = ${currentUser.id}
      RETURNING id, email, full_name, role
    `

        if (result.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Failed to update password"
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: "Password changed successfully"
        })

    } catch (error) {
        console.error("Change password error:", error)
        return NextResponse.json({
            success: false,
            message: "Internal server error"
        }, { status: 500 })
    }
} 