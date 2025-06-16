import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { verifyPassword } from "@/lib/db"
import { AUTH_CONFIG } from "@/lib/auth-config"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Query user with error handling
    const users = await safeQuery(
      () => sql`
        SELECT id, email, password_hash, full_name, role, department
        FROM users 
        WHERE email = ${email.toLowerCase()}
      `,
      "Failed to query user",
    )

    if (users.length === 0) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const user = users[0]
    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    // Set session cookie with proper configuration
    const cookieStore = await cookies()
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
      department: user.department,
    }

    cookieStore.set("user", JSON.stringify(userData), {
      httpOnly: AUTH_CONFIG.cookieHttpOnly,
      secure: AUTH_CONFIG.cookieSecure,
      sameSite: AUTH_CONFIG.cookieSameSite,
      maxAge: AUTH_CONFIG.sessionMaxAge,
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: userData,
    })
  } catch (error) {
    console.error("Sign in error:", error)
    return NextResponse.json({ success: false, message: "Login failed. Please try again." }, { status: 500 })
  }
}
