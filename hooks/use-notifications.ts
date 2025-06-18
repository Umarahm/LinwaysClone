"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Notification } from "@/components/ui/notification-popover"

interface UseNotificationsReturn {
    notifications: Notification[]
    unreadCount: number
    markAsRead: (notificationId: string) => void
    markAllAsRead: () => void
    clearAll: () => void
    addNotification: (notification: Omit<Notification, 'id'>) => void
    loading: boolean
    refreshNotifications: () => Promise<void>
}

export function useNotifications(userRole: 'student' | 'faculty' | 'admin' = 'student'): UseNotificationsReturn {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)

    // Fetch notifications from API
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/notifications')

            if (!response.ok) {
                throw new Error('Failed to fetch notifications')
            }

            const data = await response.json()

            if (data.success) {
                // Convert timestamp strings to Date objects
                const formattedNotifications = (data.notifications || []).map((notification: any) => ({
                    ...notification,
                    timestamp: new Date(notification.timestamp)
                }))
                setNotifications(formattedNotifications)
            } else {
                console.error('Failed to fetch notifications:', data.error)
                setNotifications([])
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
            setNotifications([])
        } finally {
            setLoading(false)
        }
    }, [])

    // Initialize notifications
    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Refresh notifications every 30 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            fetchNotifications()
        }, 30000) // 30 seconds

        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Calculate unread count
    const unreadCount = useMemo(() => {
        return notifications.filter(n => !n.read).length
    }, [notifications])

    // Mark single notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    notificationId,
                    action: 'markAsRead'
                })
            })

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notification =>
                        notification.id === notificationId
                            ? { ...notification, read: true }
                            : notification
                    )
                )
            }
        } catch (error) {
            console.error('Error marking notification as read:', error)
        }
    }

    // Mark all notifications as read
    const markAllAsRead = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'markAllAsRead'
                })
            })

            if (response.ok) {
                setNotifications(prev =>
                    prev.map(notification => ({ ...notification, read: true }))
                )
            }
        } catch (error) {
            console.error('Error marking all notifications as read:', error)
        }
    }

    // Clear all notifications
    const clearAll = async () => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'DELETE'
            })

            if (response.ok) {
                setNotifications([])
            }
        } catch (error) {
            console.error('Error clearing notifications:', error)
        }
    }

    // Add new notification (for creating notifications)
    const addNotification = async (newNotification: Omit<Notification, 'id'>) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: newNotification.type,
                    title: newNotification.title,
                    message: newNotification.message,
                    priority: newNotification.priority,
                    metadata: newNotification.metadata
                })
            })

            if (response.ok) {
                const data = await response.json()
                if (data.success) {
                    // Ensure timestamp is a Date object
                    const formattedNotification = {
                        ...data.notification,
                        timestamp: new Date(data.notification.timestamp)
                    }
                    setNotifications(prev => [formattedNotification, ...prev])
                }
            }
        } catch (error) {
            console.error('Error adding notification:', error)
        }
    }

    // Refresh notifications manually
    const refreshNotifications = async () => {
        await fetchNotifications()
    }

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        loading,
        refreshNotifications
    }
} 