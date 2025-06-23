"use client"

import * as React from "react"
import { Bell, Calendar, Plus, Search, User, Edit, Trash2, Upload, X, Download, Image, FileText, Clock, AlertTriangle, Flag } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"

interface Attachment {
  name: string
  url: string
  type: string
  size: number
}

interface Announcement {
  id: number
  title: string
  message: string
  author_name: string
  author_role: string
  recipient: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  scheduled_date?: string
  expiry_date?: string
  attachments: Attachment[]
  created_at: string
  updated_at?: string
  author_id: number
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
  const [selectedPriority, setSelectedPriority] = React.useState("normal")
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = React.useState<Announcement | null>(null)
  const [attachments, setAttachments] = React.useState<Attachment[]>([])
  const [uploading, setUploading] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<any>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    fetchAnnouncements()
    fetchCurrentUser()
  }, [userRole])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      console.log(`🔍 Fetching announcements for role: ${userRole}`)
      const response = await fetch(`/api/announcements?role=${userRole}`)
      if (response.ok) {
        const data = await response.json()
        console.log(`📨 Received ${data.announcements?.length || 0} announcements:`, data.announcements)

        // Ensure attachments field is properly parsed
        const processedAnnouncements = (data.announcements || []).map((ann: any) => ({
          ...ann,
          attachments: typeof ann.attachments === 'string' ? JSON.parse(ann.attachments || '[]') : (ann.attachments || []),
          priority: ann.priority || 'normal'
        }))

        setAnnouncements(processedAnnouncements)
      } else {
        console.error('Failed to fetch announcements', response.status, response.statusText)
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
  const canEditAnnouncement = (announcement: Announcement) => {
    return userRole === "admin" || (userRole === "faculty" && announcement.author_id === currentUser?.id)
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return

    setUploading(true)
    const formData = new FormData()

    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('/api/announcements/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setAttachments(prev => [...prev, ...data.files])
        toast({
          title: "Files uploaded successfully",
          description: `${data.files.length} file(s) uploaded`
        })
      } else {
        const error = await response.json()
        toast({
          title: "Upload failed",
          description: error.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Upload error",
        description: "Failed to upload files",
        variant: "destructive"
      })
    } finally {
      setUploading(false)
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateAnnouncement = async (formData: FormData) => {
    try {
      if (!currentUser) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        })
        return
      }

      const scheduledDate = formData.get('scheduled_date') as string
      const expiryDate = formData.get('expiry_date') as string

      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.get('title'),
          message: formData.get('message'),
          recipient: formData.get('recipient'),
          priority: formData.get('priority'),
          scheduled_date: scheduledDate || null,
          expiry_date: expiryDate || null,
          attachments: attachments,
          author_id: currentUser.id
        })
      })

      if (response.ok) {
        await fetchAnnouncements()
        setIsCreateOpen(false)
        setSelectedRecipient("")
        setSelectedPriority("normal")
        setAttachments([])
        toast({
          title: "Success",
          description: "Announcement created successfully"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive"
      })
    }
  }

  const handleEditAnnouncement = async (formData: FormData) => {
    if (!editingAnnouncement || !currentUser) return

    try {
      const scheduledDate = formData.get('scheduled_date') as string
      const expiryDate = formData.get('expiry_date') as string

      const response = await fetch('/api/announcements', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingAnnouncement.id,
          title: formData.get('title'),
          message: formData.get('message'),
          recipient: formData.get('recipient'),
          priority: formData.get('priority'),
          scheduled_date: scheduledDate || null,
          expiry_date: expiryDate || null,
          attachments: attachments,
          user_id: currentUser.id,
          user_role: currentUser.role
        })
      })

      if (response.ok) {
        await fetchAnnouncements()
        setEditingAnnouncement(null)
        setAttachments([])
        toast({
          title: "Success",
          description: "Announcement updated successfully"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive"
      })
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!currentUser) return

    try {
      const response = await fetch(`/api/announcements?id=${id}&user_id=${currentUser.id}&user_role=${currentUser.role}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchAnnouncements()
        toast({
          title: "Success",
          description: "Announcement deleted successfully"
        })
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.error,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive"
      })
    }
  }

  const startEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setAttachments(announcement.attachments || [])
    setSelectedRecipient(announcement.recipient)
    setSelectedPriority(announcement.priority)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white'
      case 'high': return 'bg-orange-500 text-white'
      case 'normal': return 'bg-blue-500 text-white'
      case 'low': return 'bg-gray-500 text-white'
      default: return 'bg-blue-500 text-white'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="w-3 h-3" />
      case 'high': return <Flag className="w-3 h-3" />
      case 'normal': return <Bell className="w-3 h-3" />
      case 'low': return <Clock className="w-3 h-3" />
      default: return <Bell className="w-3 h-3" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const renderAttachment = (attachment: Attachment, index: number, canRemove = false) => {
    const isImage = attachment.type.startsWith('image/')

    return (
      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg border">
        {isImage ? <Image className="w-4 h-4 text-muted-foreground" /> : <FileText className="w-4 h-4 text-muted-foreground" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{attachment.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" asChild>
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              <Download className="w-3 h-3" />
            </a>
          </Button>
          {canRemove && (
            <Button size="sm" variant="ghost" onClick={() => removeAttachment(index)}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  const AnnouncementForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.currentTarget)
      isEdit ? handleEditAnnouncement(formData) : handleCreateAnnouncement(formData)
    }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Announcement title"
          defaultValue={isEdit ? editingAnnouncement?.title : ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          placeholder="Announcement message"
          rows={4}
          defaultValue={isEdit ? editingAnnouncement?.message : ""}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient</Label>
          <Select value={selectedRecipient} onValueChange={setSelectedRecipient} required>
            <SelectTrigger>
              <SelectValue placeholder="Select recipient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="student">Students Only</SelectItem>
              <SelectItem value="faculty">Faculty Only</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="recipient" value={selectedRecipient} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={selectedPriority} onValueChange={setSelectedPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="priority" value={selectedPriority} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="scheduled_date">Schedule For (Optional)</Label>
          <Input
            id="scheduled_date"
            name="scheduled_date"
            type="datetime-local"
            defaultValue={isEdit && editingAnnouncement?.scheduled_date ?
              new Date(editingAnnouncement.scheduled_date).toISOString().slice(0, 16) : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiry_date">Expires On (Optional)</Label>
          <Input
            id="expiry_date"
            name="expiry_date"
            type="datetime-local"
            defaultValue={isEdit && editingAnnouncement?.expiry_date ?
              new Date(editingAnnouncement.expiry_date).toISOString().slice(0, 16) : ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Attachments</Label>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
          <div className="text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Choose Files"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Images, PDFs, Documents up to 10MB each
            </p>
          </div>

          {attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              {attachments.map((attachment, index) =>
                renderAttachment(attachment, index, true)
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setEditingAnnouncement(null)
            } else {
              setIsCreateOpen(false)
            }
            setAttachments([])
            setSelectedRecipient("")
            setSelectedPriority("normal")
          }}
        >
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
          {isEdit ? "Update" : "Post"} Announcement
        </Button>
      </div>
    </form>
  )

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
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
              </DialogHeader>
              <AnnouncementForm />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && setEditingAnnouncement(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          <AnnouncementForm isEdit />
        </DialogContent>
      </Dialog>

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
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg font-semibold text-foreground">{announcement.title}</CardTitle>
                    <Badge className={`${getPriorityColor(announcement.priority)} flex items-center gap-1`}>
                      {getPriorityIcon(announcement.priority)}
                      {announcement.priority.toUpperCase()}
                    </Badge>
                  </div>
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
                    {announcement.updated_at && (
                      <div className="flex items-center gap-1">
                        <Edit className="w-4 h-4" />
                        <span>Updated {new Date(announcement.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
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
                  {canEditAnnouncement(announcement) && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => startEdit(announcement)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the announcement.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground leading-relaxed mb-4">{announcement.message}</p>

              {/* Scheduled/Expiry Dates */}
              {(announcement.scheduled_date || announcement.expiry_date) && (
                <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                  {announcement.scheduled_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Scheduled: {new Date(announcement.scheduled_date).toLocaleString()}</span>
                    </div>
                  )}
                  {announcement.expiry_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Expires: {new Date(announcement.expiry_date).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Attachments:</h4>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {announcement.attachments.map((attachment, index) =>
                      renderAttachment(attachment, index, false)
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card className="shadow-sm border bg-card">
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No announcements found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms." : "No announcements have been posted yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
