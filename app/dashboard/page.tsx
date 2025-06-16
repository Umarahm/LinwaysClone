import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DashboardClient } from "@/components/dashboard-client"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get("user")

  if (!userCookie) {
    redirect("/")
  }

  let user
  try {
    user = JSON.parse(userCookie.value)
  } catch (error) {
    redirect("/")
  }

  return <DashboardClient user={user} />
}
