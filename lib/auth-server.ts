import { NextRequest } from "next/server"
import { sql } from "@/lib/db"
import { cookies } from "next/headers"

interface User {
    id: number
    email: string
    fullName: string
    role: string
    department: string
    rollNo?: string
}

export async function getCurrentUserServer(): Promise<User | null> {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get('user')?.value

        if (!userCookie) {
            console.log('No user cookie found')
            return null
        }

        console.log('Found user cookie:', userCookie ? 'present' : 'missing')

        // Parse the user data from cookie (it's stored as JSON, not JWT)
        const userData = JSON.parse(userCookie)

        if (!userData.id || !userData.role) {
            console.log('Invalid user data in cookie')
            return null
        }

        console.log('User data parsed:', userData.email, userData.role)

        // Verify user still exists in database
        const users = await sql`
      SELECT id, email, full_name, role, department, roll_no
      FROM users 
      WHERE id = ${userData.id}
    `

        if (users.length === 0) {
            console.log('User not found in database')
            return null
        }

        const user = users[0]
        console.log('User verified in database:', user.email, user.role)

        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            department: user.department,
            rollNo: user.roll_no
        }

    } catch (error) {
        console.error('Error getting current user:', error)
        return null
    }
}

// Alternative method using request headers (in case cookies aren't working)
export async function getCurrentUserFromRequest(request?: NextRequest): Promise<User | null> {
    try {
        if (!request) {
            return await getCurrentUserServer()
        }

        // Try to get token from cookies
        const cookieToken = request.cookies.get('user')?.value

        if (!cookieToken) {
            console.log('No user cookie found in request')
            return null
        }

        console.log('Found user cookie in request:', cookieToken ? 'present' : 'missing')

        // Parse the user data from cookie
        const userData = JSON.parse(cookieToken)

        if (!userData.id || !userData.role) {
            console.log('Invalid user data in request cookie')
            return null
        }

        // Verify user still exists in database
        const users = await sql`
      SELECT id, email, full_name, role, department, roll_no
      FROM users 
      WHERE id = ${userData.id}
    `

        if (users.length === 0) {
            console.log('User not found in database')
            return null
        }

        const user = users[0]
        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            department: user.department,
            rollNo: user.roll_no
        }

    } catch (error) {
        console.error('Error getting current user from request:', error)
        return null
    }
}

export async function validateAdminAccess(request?: NextRequest): Promise<{ user: User | null, error?: string }> {
    // Try both methods
    let user = await getCurrentUserServer()

    if (!user && request) {
        user = await getCurrentUserFromRequest(request)
    }

    if (!user) {
        return { user: null, error: "Unauthorized - Please log in" }
    }

    if (user.role !== "admin") {
        return { user: null, error: "Unauthorized - Admin access required" }
    }

    return { user }
} 