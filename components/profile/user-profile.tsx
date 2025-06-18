"use client"

import * as React from "react"
import { Camera, User, Mail, Phone, Lock, Save, X, Edit } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { getAvatarColor } from "@/lib/utils"
import { ChangePasswordModal } from "@/components/profile/change-password-modal"

interface UserProfile {
    id: number
    fullName: string
    email: string
    role: string
    department: string
    rollNo?: string
    phoneNumber?: string
    avatar?: string
    joinedAt?: string
    lastActive?: string
}

interface EditableFields {
    fullName: string
    phoneNumber: string
}

interface UserProfileProps {
    user?: {
        id: number
        email: string
        fullName: string
        role: string
        department: string
        avatar?: string
    }
    setUser?: (user: any) => void
}

export function UserProfile({ user: propUser, setUser: externalSetUser }: UserProfileProps) {
    const { toast } = useToast()
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [isEditing, setIsEditing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [fetchLoading, setFetchLoading] = React.useState(true)
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = React.useState<string>("")

    const [editableFields, setEditableFields] = React.useState<EditableFields>({
        fullName: "",
        phoneNumber: ""
    })

    // Fetch user profile data
    React.useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setFetchLoading(true)
                const response = await fetch('/api/auth/me')
                const data = await response.json()

                if (data.success && data.user) {
                    const userProfile: UserProfile = {
                        id: data.user.id,
                        fullName: data.user.fullName,
                        email: data.user.email,
                        role: data.user.role,
                        department: data.user.department,
                        rollNo: data.user.rollNo || "",
                        phoneNumber: data.user.phoneNumber || "",
                        avatar: data.user.avatar || "",
                        joinedAt: data.user.createdAt || new Date().toISOString(),
                        lastActive: data.user.lastActive || new Date().toISOString()
                    }

                    setUser(userProfile)
                    setEditableFields({
                        fullName: userProfile.fullName,
                        phoneNumber: userProfile.phoneNumber || ""
                    })
                } else if (propUser) {
                    // Fallback to prop user if API fails
                    const userProfile: UserProfile = {
                        id: propUser.id,
                        fullName: propUser.fullName,
                        email: propUser.email,
                        role: propUser.role,
                        department: propUser.department,
                        phoneNumber: "",
                        avatar: "",
                        joinedAt: new Date().toISOString(),
                        lastActive: new Date().toISOString()
                    }

                    setUser(userProfile)
                    setEditableFields({
                        fullName: userProfile.fullName,
                        phoneNumber: userProfile.phoneNumber || ""
                    })
                }
            } catch (error) {
                console.error('Error fetching user profile:', error)

                // Fallback to prop user if API fails
                if (propUser) {
                    const userProfile: UserProfile = {
                        id: propUser.id,
                        fullName: propUser.fullName,
                        email: propUser.email,
                        role: propUser.role,
                        department: propUser.department,
                        phoneNumber: "",
                        avatar: "",
                        joinedAt: new Date().toISOString(),
                        lastActive: new Date().toISOString()
                    }

                    setUser(userProfile)
                    setEditableFields({
                        fullName: userProfile.fullName,
                        phoneNumber: userProfile.phoneNumber || ""
                    })
                }
            } finally {
                setFetchLoading(false)
            }
        }

        fetchUserProfile()
    }, [propUser])

    const handleEdit = () => {
        setIsEditing(true)
    }

    const handleCancel = () => {
        if (!user) return

        setIsEditing(false)
        setAvatarFile(null)
        setAvatarPreview("")
        setEditableFields({
            fullName: user.fullName,
            phoneNumber: user.phoneNumber || ""
        })
    }

    const handleSave = async () => {
        if (!user) return

        setIsLoading(true)

        try {
            // Create FormData for the profile update (without password)
            const formData = new FormData()
            formData.append('fullName', editableFields.fullName)
            formData.append('phoneNumber', editableFields.phoneNumber)

            if (avatarFile) {
                formData.append('avatar', avatarFile)
            }

            const response = await fetch('/api/auth/me', {
                method: 'PUT',
                body: formData
            })

            const data = await response.json()

            if (data.success) {
                const updatedUser: UserProfile = {
                    ...user,
                    fullName: editableFields.fullName,
                    phoneNumber: editableFields.phoneNumber,
                    avatar: avatarPreview || user.avatar
                }

                setUser(updatedUser)
                if (typeof externalSetUser === 'function') externalSetUser(updatedUser)
                setIsEditing(false)
                setAvatarFile(null)
                setAvatarPreview("")

                toast({
                    title: "Profile Updated",
                    description: "Profile updated successfully!",
                })
            } else {
                toast({
                    variant: "destructive",
                    title: "Update Failed",
                    description: data.message || "Failed to update profile",
                })
            }
        } catch (error) {
            console.error('Error updating profile:', error)
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update profile. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setAvatarFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'student': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            case 'faculty': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            case 'admin': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'student': return 'Student'
            case 'faculty': return 'Faculty'
            case 'admin': return 'Administrator'
            default: return role
        }
    }

    if (fetchLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Unable to load user profile</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header Card with Avatar */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src={avatarPreview || user.avatar} alt={user.fullName} />
                                    <AvatarFallback className={getAvatarColor(user.fullName)}>
                                        {user.fullName.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="absolute -bottom-2 -right-2">
                                        <label htmlFor="avatar-upload" className="cursor-pointer">
                                            <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90">
                                                <Camera className="w-4 h-4" />
                                            </div>
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>
                            <div className="text-center">
                                <h2 className="text-xl font-semibold">{user.fullName}</h2>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                            <Badge className={getRoleColor(user.role)}>
                                {getRoleDisplayName(user.role)}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Information */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>
                            {isEditing ? "Edit your personal details below" : "Your personal information"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                {isEditing ? (
                                    <Input
                                        id="fullName"
                                        value={editableFields.fullName}
                                        onChange={(e) => setEditableFields({ ...editableFields, fullName: e.target.value })}
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.fullName}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.email}</span>
                                    <Badge variant="outline">Verified</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Email cannot be changed. Contact admin if needed.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="rollNo">Roll Number</Label>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-mono">{user.rollNo || "Not assigned"}</span>
                                    <Badge variant="outline">System Generated</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Roll number is assigned by the system and cannot be modified.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                {isEditing ? (
                                    <Input
                                        id="phoneNumber"
                                        value={editableFields.phoneNumber}
                                        onChange={(e) => setEditableFields({ ...editableFields, phoneNumber: e.target.value })}
                                        placeholder="Enter your phone number"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span>{user.phoneNumber || "Not provided"}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{getRoleDisplayName(user.role)}</span>
                                    <Badge variant="outline">Read-only</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Role is assigned by the institution and cannot be modified.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{user.department}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="joinedAt">Member Since</Label>
                                <div className="flex items-center gap-2 p-2 bg-muted rounded">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span>{new Date(user.joinedAt || "").toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing ? (
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex justify-end gap-2 pt-4">
                                <ChangePasswordModal
                                    trigger={
                                        <Button variant="outline">
                                            <Lock className="w-4 h-4 mr-2" />
                                            Change Password
                                        </Button>
                                    }
                                />
                                <Button
                                    type="button"
                                    onClick={handleEdit}
                                    disabled={fetchLoading}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Account Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Account Activity</CardTitle>
                    <CardDescription>
                        Recent account activity and security information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Last Active</Label>
                            <p className="text-sm text-muted-foreground">
                                {new Date(user.lastActive || "").toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label>Account Status</Label>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    Active
                                </Badge>
                                <span className="text-sm text-muted-foreground">Account is in good standing</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 