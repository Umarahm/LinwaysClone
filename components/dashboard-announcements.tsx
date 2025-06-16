"use client"

import * as React from "react"
import { Bell, Calendar, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Announcement {
    id: number
    title: string
    message: string
    author_name: string
    author_role: string
    recipient: string
    created_at: string
}

interface DashboardAnnouncementsProps {
    userRole: string
    limit?: number
    showTitle?: boolean
}

export function DashboardAnnouncements({
    userRole,
    limit = 3,
    showTitle = true
}: DashboardAnnouncementsProps) {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetchAnnouncements()
    }, [userRole])

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(`/api/announcements?role=${userRole}`)
            if (response.ok) {
                const data = await response.json()
                setAnnouncements(data.announcements || [])
            } else {
                console.error('Failed to fetch announcements')
            }
        } catch (error) {
            console.error('Error fetching announcements:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="shadow-sm border bg-card">
                {showTitle && (
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            Recent Announcements
                        </CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const limitedAnnouncements = announcements.slice(0, limit)

    return (
        <Card className="shadow-sm border bg-card">
            {showTitle && (
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        Recent Announcements
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>
                {limitedAnnouncements.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No announcements</h3>
                        <p className="text-muted-foreground">
                            No recent announcements to display
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {limitedAnnouncements.map((announcement) => (
                            <div key={announcement.id} className="p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border-l-4 border-blue-500 dark:border-blue-400">
                                <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-medium text-foreground text-sm line-clamp-2">
                                        {announcement.title}
                                    </h4>
                                    <Badge
                                        variant={
                                            announcement.recipient === "all"
                                                ? "default"
                                                : announcement.recipient === "student"
                                                    ? "secondary"
                                                    : "outline"
                                        }
                                        className="ml-2 text-xs"
                                    >
                                        {announcement.recipient === "all"
                                            ? "All"
                                            : announcement.recipient === "student"
                                                ? "Students"
                                                : "Faculty"}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {announcement.message}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        <span>{announcement.author_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 