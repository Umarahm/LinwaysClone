"use client"

import React, { useState, useEffect } from "react"
import { Bell, X, Clock, CheckCircle, AlertCircle, BookOpen, Calendar, User, GraduationCap } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface Notification {
    id: string
    type: 'announcement' | 'grade' | 'attendance' | 'assignment' | 'timetable' | 'message' | 'general'
    title: string
    message: string
    timestamp: Date | string
    read: boolean
    priority?: 'low' | 'medium' | 'high'
    metadata?: {
        courseCode?: string
        assignmentTitle?: string
        grade?: string
        from?: string
    }
}

interface NotificationPopoverProps {
    notifications: Notification[]
    onMarkAsRead?: (notificationId: string) => void
    onMarkAllAsRead?: () => void
    onClearAll?: () => void
    className?: string
}

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'announcement':
            return <AlertCircle className="h-4 w-4 text-blue-500" />
        case 'grade':
            return <GraduationCap className="h-4 w-4 text-green-500" />
        case 'attendance':
            return <CheckCircle className="h-4 w-4 text-orange-500" />
        case 'assignment':
            return <BookOpen className="h-4 w-4 text-purple-500" />
        case 'timetable':
            return <Calendar className="h-4 w-4 text-indigo-500" />
        case 'message':
            return <User className="h-4 w-4 text-pink-500" />
        default:
            return <Bell className="h-4 w-4 text-gray-500" />
    }
}

const getPriorityColor = (priority?: Notification['priority']) => {
    switch (priority) {
        case 'high':
            return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
        case 'medium':
            return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
        case 'low':
            return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
        default:
            return 'border-l-border bg-muted/20'
    }
}

const formatTimestamp = (timestamp: Date | string) => {
    try {
        const date = timestamp instanceof Date ? timestamp : new Date(timestamp)

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid date'
        }

        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Just now'
        if (minutes < 60) return `${minutes}m ago`
        if (hours < 24) return `${hours}h ago`
        if (days < 7) return `${days}d ago`
        return date.toLocaleDateString()
    } catch (error) {
        console.error('Error formatting timestamp:', error)
        return 'Unknown time'
    }
}

export function NotificationPopover({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClearAll,
    className
}: NotificationPopoverProps) {
    const [open, setOpen] = useState(false)
    const unreadCount = notifications.filter(n => !n.read).length

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read && onMarkAsRead) {
            onMarkAsRead(notification.id)
        }
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn("relative hover:bg-accent", className)}
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="w-80 p-0 bg-background/95 backdrop-blur-md border border-border shadow-lg dark:shadow-2xl rounded-lg"
                align="end"
                side="bottom"
                sideOffset={5}
            >
                <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
                    <h4 className="font-semibold text-foreground">Notifications</h4>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && onMarkAllAsRead && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onMarkAllAsRead}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                Mark all read
                            </Button>
                        )}
                        {notifications.length > 0 && onClearAll && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClearAll}
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-background">
                        <Bell className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-foreground">No notifications</p>
                        <p className="text-xs text-muted-foreground">You're all caught up!</p>
                    </div>
                ) : (
                    <div className="max-h-80 overflow-y-auto bg-background notification-scroll">
                        <div className="space-y-1 p-2">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={cn(
                                        "p-3 rounded-lg border-l-2 cursor-pointer transition-all duration-200 hover:bg-accent/50 dark:hover:bg-accent/20",
                                        notification.read ? "opacity-70 bg-muted/30" : "opacity-100 bg-background",
                                        getPriorityColor(notification.priority)
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h5 className={cn(
                                                    "text-sm font-medium truncate text-foreground",
                                                    !notification.read && "font-semibold"
                                                )}>
                                                    {notification.title}
                                                </h5>
                                                {!notification.read && (
                                                    <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>

                                            {notification.metadata && (
                                                <div className="flex items-center gap-2 mt-2 text-xs">
                                                    {notification.metadata.courseCode && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {notification.metadata.courseCode}
                                                        </Badge>
                                                    )}
                                                    {notification.metadata.grade && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            Grade: {notification.metadata.grade}
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatTimestamp(notification.timestamp)}
                                                </span>

                                                {notification.priority === 'high' && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        Urgent
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {notifications.length > 0 && (
                    <div className="p-3 border-t border-border bg-muted/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            onClick={() => setOpen(false)}
                        >
                            View All Notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
} 