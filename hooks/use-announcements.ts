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
    const [error, setError] = React.useState<string | null>(null)
    const lastCheckTimeRef = React.useRef<Date | null>(null)
    const previousAnnouncementsRef = React.useRef<Announcement[]>([])
    const { toast } = useToast()

    const fetchAnnouncements = React.useCallback(async () => {
        try {
            setError(null)
            const response = await fetch(`/api/announcements?role=${encodeURIComponent(userRole)}`)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            // Check if the API response indicates success
            if (!data.success) {
                throw new Error(data.message || data.error || 'Failed to fetch announcements')
            }

            const newAnnouncements = data.announcements || []

            // Check for new announcements since last check
            if (lastCheckTimeRef.current && previousAnnouncementsRef.current.length > 0) {
                const newItems = newAnnouncements.filter((announcement: Announcement) => {
                    const announcementDate = new Date(announcement.created_at)
                    return announcementDate > lastCheckTimeRef.current! &&
                        !previousAnnouncementsRef.current.some(existing => existing.id === announcement.id)
                })

                // Show toast for new announcements (limit to 3 to avoid spam)
                newItems.slice(0, 3).forEach((announcement: Announcement) => {
                    toast({
                        title: "New Announcement",
                        description: `${announcement.title} - ${announcement.message.substring(0, 100)}${announcement.message.length > 100 ? '...' : ''}`,
                        duration: 5000,
                    })
                })

                if (newItems.length > 3) {
                    toast({
                        title: "Multiple New Announcements",
                        description: `${newItems.length} new announcements received`,
                        duration: 5000,
                    })
                }
            }

            setAnnouncements(newAnnouncements)
            previousAnnouncementsRef.current = newAnnouncements
            lastCheckTimeRef.current = new Date()

        } catch (error) {
            console.error('Error fetching announcements:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to fetch announcements'
            setError(errorMessage)

            // Show error toast only on the first failure
            if (loading) {
                toast({
                    variant: "warning",
                    title: "Connection Error",
                    description: "Unable to fetch announcements. Will retry automatically.",
                    duration: 5000,
                })
            }
        } finally {
            setLoading(false)
        }
    }, [userRole, toast, loading])

    // Initial fetch
    React.useEffect(() => {
        fetchAnnouncements()
    }, [userRole]) // Only depend on userRole for initial fetch

    // Set up polling for new announcements
    React.useEffect(() => {
        if (pollingInterval <= 0) return

        const interval = setInterval(() => {
            // Only poll if not currently loading to prevent overlapping requests
            if (!loading) {
                fetchAnnouncements()
            }
        }, pollingInterval)

        return () => clearInterval(interval)
    }, [pollingInterval, loading]) // Remove fetchAnnouncements dependency to prevent recreating interval

    const unreadCount = React.useMemo(() => {
        if (!lastCheckTimeRef.current) return 0

        // Count announcements from the last 24 hours as potentially unread
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return announcements.filter(announcement => {
            const announcementDate = new Date(announcement.created_at)
            return announcementDate > oneDayAgo
        }).length
    }, [announcements])

    return {
        announcements,
        loading,
        error,
        unreadCount,
        refresh: fetchAnnouncements
    }
} 