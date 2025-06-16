"use server"

import { sql } from "./db"
import { getCurrentUserServer } from "./auth-server"

export async function getAnnouncements() {
  const user = await getCurrentUserServer()
  if (!user) {
    throw new Error("Unauthorized")
  }

  const announcements = await sql`
    SELECT 
      a.id,
      a.title,
      a.message,
      u.full_name as author_name,
      u.role as author_role,
      a.recipient,
      a.created_at
    FROM announcements a
    JOIN users u ON a.author_id = u.id
    WHERE a.recipient = 'all' OR a.recipient = ${user.role}
    ORDER BY a.created_at DESC
  `

  return announcements
}

export async function createAnnouncement(formData: FormData) {
  const user = await getCurrentUserServer()
  if (!user || (user.role !== "admin" && user.role !== "faculty")) {
    throw new Error("Unauthorized")
  }

  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const recipient = formData.get("recipient") as string

  try {
    await sql`
      INSERT INTO announcements (title, message, author_id, recipient)
      VALUES (${title}, ${message}, ${user.id}, ${recipient})
    `

    return { success: true, message: "Announcement created successfully" }
  } catch (error) {
    return { success: false, message: "Failed to create announcement" }
  }
}
