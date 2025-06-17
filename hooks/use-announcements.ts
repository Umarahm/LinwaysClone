"use client"

import * as React from "react"
import { useToast } from "@/hooks/use-toast"

interface Announcement {
    id: number
    title: string
    message: string
    author_name: string
    author_role: string
    recipient: string
    created_at: string
}

interface UseAnnouncementsOptions {
    userRole: string
    pollingInterval?: number
}

export function useAnnouncements({ userRole, pollingInterval = 30000 }: UseAnnouncementsOptions) {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
    const [loading, setLoading] = React.useState(true)
    const [lastCheckTime, setLastCheckTime] = React.useState<Date | null>(null)
    const { toast } = useToast()

    const fetchAnnouncements = React.useCallback(async () => {
        try {
            const response = await fetch(`/api/announcements?role=${userRole}`)
            if (response.ok) {
                const data = await response.json()
                const newAnnouncements = data.announcements || []

                // Check for new announcements since last check
                if (lastCheckTime && announcements.length > 0) {
                    const newItems = newAnnouncements.filter((announcement: Announcement) => {
                        const announcementDate = new Date(announcement.created_at)
                        return announcementDate > lastCheckTime &&
                            !announcements.some(existing => existing.id === announcement.id)
                    })

                    // Show toast for new announcements
                    newItems.forEach((announcement: Announcement) => {
                        toast({
                            title: "New Announcement",
                            description: `${announcement.title} - ${announcement.message.substring(0, 100)}${announcement.message.length > 100 ? '...' : ''}`,
                            duration: 5000,
                        })
                    })
                }

                setAnnouncements(newAnnouncements)
                setLastCheckTime(new Date())
            } else {
                console.error('Failed to fetch announcements')
            }
        } catch (error) {
            console.error('Error fetching announcements:', error)
        } finally {
            setLoading(false)
        }
    }, [userRole, lastCheckTime, announcements, toast])

    // Initial fetch
    React.useEffect(() => {
        fetchAnnouncements()
    }, [userRole])

    // Set up polling for new announcements
    React.useEffect(() => {
        if (pollingInterval <= 0) return

        const interval = setInterval(() => {
            fetchAnnouncements()
        }, pollingInterval)

        return () => clearInterval(interval)
    }, [fetchAnnouncements, pollingInterval])

    const unreadCount = React.useMemo(() => {
        if (!lastCheckTime) return 0

        // Count announcements from the last 24 hours as potentially unread
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return announcements.filter(announcement => {
            const announcementDate = new Date(announcement.created_at)
            return announcementDate > oneDayAgo
        }).length
    }, [announcements, lastCheckTime])

    return {
        announcements,
        loading,
        unreadCount,
        refresh: fetchAnnouncements
    }
} 