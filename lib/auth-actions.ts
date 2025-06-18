"use client"

export async function signIn(email: string, password: string) {
  try {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Sign in error:", error)
    return { success: false, message: "Login failed" }
  }
}

export async function signUp(email: string, password: string, fullName: string, role: string, department: string, rollNo?: string) {
  try {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, fullName, role, department, rollNo }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Sign up error:", error)
    return { success: false, message: "Failed to create account" }
  }
}

export async function signOut() {
  try {
    await fetch("/api/auth/signout", {
      method: "POST",
    })
    window.location.href = "/"
  } catch (error) {
    console.error("Sign out error:", error)
    window.location.href = "/"
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/me")
    const data = await response.json()
    return data.user
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
