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
    target_user_email?: string
    priority?: string
}

interface DashboardAnnouncementsProps {
    userRole: string
    userEmail?: string
    limit?: number
    showTitle?: boolean
}

export function DashboardAnnouncements({
    userRole,
    userEmail,
    limit = 3,
    showTitle = true
}: DashboardAnnouncementsProps) {
    const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        fetchAnnouncements()
    }, [userRole, userEmail])

    const fetchAnnouncements = async () => {
        try {
            const params = new URLSearchParams({ role: userRole })
            if (userEmail) {
                params.append('userEmail', userEmail)
            }
            const response = await fetch(`/api/announcements?${params}`)
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
            <Card className="border-0 bg-transparent text-white">
                {showTitle && (
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Bell className="w-5 h-5 text-blue-300" />
                            Recent Announcements
                        </CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-white/20 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-white/20 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const limitedAnnouncements = announcements.slice(0, limit)

    return (
        <Card className="border-0 bg-transparent text-white">
            {showTitle && (
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-white">
                        <Bell className="w-5 h-5 text-blue-300" />
                        Recent Announcements
                    </CardTitle>
                </CardHeader>
            )}
            <CardContent>
                {limitedAnnouncements.length === 0 ? (
                    <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-white/60 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-white mb-2">No announcements</h3>
                        <p className="text-white/80">
                            No recent announcements to display
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {limitedAnnouncements.map((announcement) => {
                            const isGradeNotification = announcement.title.includes('Assignment Graded')
                            const isPersonalNotification = announcement.target_user_email === userEmail
                            const priorityColor = announcement.priority === 'high' ? 'border-red-400' :
                                announcement.priority === 'urgent' ? 'border-red-500' :
                                    isGradeNotification ? 'border-green-400' : 'border-blue-300'

                            return (
                                <div
                                    key={announcement.id}
                                    className={`p-4 bg-white/10 rounded-lg border-l-4 ${priorityColor} hover:bg-white/15 transition-all duration-300 ${isPersonalNotification ? 'ring-2 ring-yellow-400/50' : ''}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium text-white text-sm line-clamp-2">
                                            {isGradeNotification && "🎓 "}{announcement.title}
                                        </h4>
                                        <div className="flex gap-1 ml-2">
                                            {isPersonalNotification && (
                                                <Badge className="text-xs bg-yellow-500/20 text-yellow-200 border-yellow-400/30">
                                                    Personal
                                                </Badge>
                                            )}
                                            {isGradeNotification && (
                                                <Badge className="text-xs bg-green-500/20 text-green-200 border-green-400/30">
                                                    Grade
                                                </Badge>
                                            )}
                                            <Badge
                                                variant="secondary"
                                                className="text-xs bg-white/20 text-white border-white/30"
                                            >
                                                {announcement.recipient === "all"
                                                    ? "All"
                                                    : announcement.recipient === "student"
                                                        ? "Students"
                                                        : "Faculty"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-xs text-white/80 mb-3 line-clamp-3">
                                        {announcement.message}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-white/70">
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
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
} 