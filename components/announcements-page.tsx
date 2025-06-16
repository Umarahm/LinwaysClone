"use client"

import * as React from "react"
import { Bell, Calendar, Plus, Search, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Announcement {
  id: number
  title: string
  message: string
  author_name: string
  author_role: string
  recipient: string
  created_at: string
}

interface AnnouncementsPageProps {
  announcements: Announcement[]
  userRole: string
}

export function AnnouncementsPage({ userRole }: { userRole: string }) {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedRecipient, setSelectedRecipient] = React.useState("")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)

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

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const canCreateAnnouncement = userRole === "admin" || userRole === "faculty"

  const handleCreateAnnouncement = async (formData: FormData) => {
    try {
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          message: formData.get('message'),
          recipient: formData.get('recipient'),
          author_id: 15 // Admin user ID - should come from user context in real implementation
        })
      })

      if (response.ok) {
        await fetchAnnouncements() // Refresh the list
        setIsCreateOpen(false)
        setSelectedRecipient("")
      } else {
        console.error('Failed to create announcement')
      }
    } catch (error) {
      console.error('Error creating announcement:', error)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground mt-1">Stay updated with the latest news and updates</p>
        </div>
        {canCreateAnnouncement && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <form action={handleCreateAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" placeholder="Announcement title" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea id="message" name="message" placeholder="Announcement message" rows={4} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <Select name="recipient" value={selectedRecipient} onValueChange={setSelectedRecipient} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select recipient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="student">Students Only</SelectItem>
                      <SelectItem value="faculty">Faculty Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
                    Post Announcement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search Bar */}
      <Card className="shadow-sm border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="shadow-sm border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-foreground mb-2">{announcement.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{announcement.author_name}</span>
                      <Badge variant="outline" className="ml-1">
                        {announcement.author_role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      announcement.recipient === "all"
                        ? "default"
                        : announcement.recipient === "student"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {announcement.recipient === "all"
                      ? "All"
                      : announcement.recipient === "student"
                        ? "Students"
                        : "Faculty"}
                  </Badge>
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground leading-relaxed">{announcement.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card className="shadow-sm border-0 bg-white">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms." : "No announcements have been posted yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
