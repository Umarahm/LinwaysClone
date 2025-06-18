import { type NextRequest, NextResponse } from "next/server"
import { sql, safeQuery } from "@/lib/db"
import { hashPassword } from "@/lib/db"
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
    const { email, password, fullName, role, department, rollNo } = await request.json()

    // Validate input
    if (!email || !password || !fullName || !role || !department) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json({ success: false, message: passwordValidation.message }, { status: 400 })
    }

    // Validate role
    const validRoles = ["student", "faculty", "admin"]
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, message: "Invalid role selected" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    // Generate roll number if not provided
    let finalRollNo = rollNo;
    if (!finalRollNo) {
      // Get the next available ID to generate roll number
      const maxId = await safeQuery(
        () => sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM users`,
        "Failed to get next user ID"
      );
      const nextId = maxId[0].next_id;
      finalRollNo = role === 'student' ? `STU${String(nextId).padStart(4, '0')}` :
        role === 'faculty' ? `FAC${String(nextId).padStart(4, '0')}` :
          `USR${String(nextId).padStart(4, '0')}`;
    }

    await safeQuery(
      () => sql`
        INSERT INTO users (email, password_hash, full_name, role, department, roll_no)
        VALUES (${email.toLowerCase()}, ${hashedPassword}, ${fullName}, ${role}, ${department}, ${finalRollNo})
      `,
      "Failed to create user account",
    )

    return NextResponse.json({
      success: true,
      message: "Account created successfully",
    })
  } catch (error: any) {
    console.error("Sign up error:", error)

    if (error.message.includes("duplicate key") || error.message.includes("unique constraint")) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 400 },
      )
    }

    return NextResponse.json(
      { success: false, message: "Failed to create account. Please try again." },
      { status: 500 },
    )
  }
}
