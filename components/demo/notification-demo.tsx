"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NotificationPopover } from "@/components/ui/notification-popover"
import { useNotifications } from "@/hooks/use-notifications"
import { Plus, Trash2, RotateCcw, GraduationCap, Calendar, BookOpen, AlertTriangle, User } from "lucide-react"

export function NotificationDemo() {
    const [userRole, setUserRole] = useState<'student' | 'faculty' | 'admin'>('student')
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAll,
        addNotification,
        loading
    } = useNotifications(userRole)

    const handleAddSampleNotification = () => {
        const sampleNotifications = [
            {
                type: 'grade' as const,
                title: 'Assignment Graded',
                message: 'Your Algorithms assignment has been graded. Score: 92/100',
                timestamp: new Date(),
                read: false,
                priority: 'medium' as const,
                metadata: {
                    courseCode: 'CS401',
                    assignmentTitle: 'Sorting Algorithms',
                    grade: '92/100'
                }
            },
            {
                type: 'attendance' as const,
                title: 'Attendance Alert',
                message: 'You were marked absent for Database Systems lecture.',
                timestamp: new Date(),
                read: false,
                priority: 'high' as const,
                metadata: {
                    courseCode: 'CS301'
                }
            }
        ]

        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)]
        addNotification(randomNotification)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-blue-600" />
                        </div>
                        Notification System Demo
                    </div>
                    <NotificationPopover
                        notifications={notifications}
                        onMarkAsRead={markAsRead}
                        onMarkAllAsRead={markAllAsRead}
                        onClearAll={clearAll}
                    />
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    {(['student', 'faculty'] as const).map((role) => (
                        <Button
                            key={role}
                            variant={userRole === role ? "default" : "outline"}
                            size="sm"
                            onClick={() => setUserRole(role)}
                            className="capitalize"
                        >
                            {role}
                        </Button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button onClick={handleAddSampleNotification} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Sample
                    </Button>

                    {unreadCount > 0 && (
                        <Button onClick={markAllAsRead} variant="outline" size="sm">
                            Mark All Read
                        </Button>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm">Notifications: {notifications.length} | Unread: {unreadCount}</p>
                </div>
            </CardContent>
        </Card>
    )
} 