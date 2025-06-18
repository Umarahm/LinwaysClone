import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sql } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return NextResponse.json({ user: null })
    }

    const user = JSON.parse(userCookie.value)
    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ success: false, user: null })
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get("user")

    if (!userCookie) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    const currentUser = JSON.parse(userCookie.value)
    const formData = await request.formData()

    const fullName = formData.get("fullName") as string
    const phoneNumber = formData.get("phoneNumber") as string
    const currentPassword = formData.get("currentPassword") as string
    const newPassword = formData.get("newPassword") as string
    const avatarFile = formData.get("avatar") as File | null

    // Validate required fields
    if (!fullName) {
      return NextResponse.json({ success: false, message: "Full name is required" }, { status: 400 })
    }

    let hashedNewPassword = null

    // Handle password change
    if (currentPassword && newPassword) {
      // Verify current password
      const user = await sql`SELECT password_hash FROM users WHERE id = ${currentUser.id}`

      if (user.length === 0) {
        return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
      }

      const validPassword = await bcrypt.compare(currentPassword, user[0].password_hash)
      if (!validPassword) {
        return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
      }

      // Hash new password
      hashedNewPassword = await bcrypt.hash(newPassword, 10)
    }

    // Handle avatar upload (simplified - in production, use cloud storage)
    let avatarPath = null
    if (avatarFile && avatarFile.size > 0) {
      // For now, we'll just generate a placeholder path
      // In production, implement proper file upload to cloud storage
      avatarPath = `/uploads/avatars/${currentUser.id}_${Date.now()}.jpg`
    }

    // Update user in database
    let result
    if (hashedNewPassword && avatarPath) {
      result = await sql`
        UPDATE users 
        SET full_name = ${fullName}, 
            phone_number = ${phoneNumber}, 
            password_hash = ${hashedNewPassword},
            avatar = ${avatarPath},
            updated_at = NOW()
        WHERE id = ${currentUser.id}
        RETURNING id, email, full_name, role, department, roll_no, phone_number, avatar, created_at, updated_at
      `
    } else if (hashedNewPassword) {
      result = await sql`
        UPDATE users 
        SET full_name = ${fullName}, 
            phone_number = ${phoneNumber}, 
            password_hash = ${hashedNewPassword},
            updated_at = NOW()
        WHERE id = ${currentUser.id}
        RETURNING id, email, full_name, role, department, roll_no, phone_number, avatar, created_at, updated_at
      `
    } else if (avatarPath) {
      result = await sql`
        UPDATE users 
        SET full_name = ${fullName}, 
            phone_number = ${phoneNumber}, 
            avatar = ${avatarPath},
            updated_at = NOW()
        WHERE id = ${currentUser.id}
        RETURNING id, email, full_name, role, department, roll_no, phone_number, avatar, created_at, updated_at
      `
    } else {
      result = await sql`
        UPDATE users 
        SET full_name = ${fullName}, 
            phone_number = ${phoneNumber}, 
            updated_at = NOW()
        WHERE id = ${currentUser.id}
        RETURNING id, email, full_name, role, department, roll_no, phone_number, avatar, created_at, updated_at
      `
    }

    if (result.length === 0) {
      return NextResponse.json({ success: false, message: "Failed to update profile" }, { status: 500 })
    }

    const updatedUser = result[0]
    const userResponse = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      role: updatedUser.role,
      department: updatedUser.department,
      rollNo: updatedUser.roll_no,
      phoneNumber: updatedUser.phone_number,
      avatar: updatedUser.avatar,
      createdAt: updatedUser.created_at,
      updatedAt: updatedUser.updated_at
    }

    // Update cookie with new user data
    const cookieStore2 = await cookies()
    cookieStore2.set("user", JSON.stringify(userResponse), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse
    })

  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
