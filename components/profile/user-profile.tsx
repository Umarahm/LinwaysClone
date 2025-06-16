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

interface UserProfile {
    id: number
    fullName: string
    email: string
    role: string
    department: string
    phoneNumber: string
    avatar?: string
    joinedAt: string
    lastActive: string
}

interface EditableFields {
    fullName: string
    phoneNumber: string
    currentPassword: string
    newPassword: string
    confirmPassword: string
}

export function UserProfile() {
    const [user, setUser] = React.useState<UserProfile | null>(null)
    const [isEditing, setIsEditing] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [avatarFile, setAvatarFile] = React.useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = React.useState<string>("")

    const [editableFields, setEditableFields] = React.useState<EditableFields>({
        fullName: "",
        phoneNumber: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    // Mock data - replace with actual API calls
    React.useEffect(() => {
        // Simulate API call to fetch user profile
        setTimeout(() => {
            const mockUser: UserProfile = {
                id: 1,
                fullName: "John Doe",
                email: "john.doe@presidency.edu",
                role: "student",
                department: "Computer Science",
                phoneNumber: "+1 (555) 123-4567",
                avatar: "/placeholder.svg?height=200&width=200",
                joinedAt: "2023-09-01T00:00:00Z",
                lastActive: "2024-12-23T10:30:00Z"
            }

            setUser(mockUser)
            setEditableFields({
                fullName: mockUser.fullName,
                phoneNumber: mockUser.phoneNumber,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            })
        }, 1000)
    }, [])

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
            phoneNumber: user.phoneNumber,
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        })
    }

    const handleSave = async () => {
        if (!user) return

        // Validation
        if (editableFields.newPassword && editableFields.newPassword !== editableFields.confirmPassword) {
            alert("New passwords don't match!")
            return
        }

        if (editableFields.newPassword && editableFields.newPassword.length < 6) {
            alert("New password must be at least 6 characters long!")
            return
        }

        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            const updatedUser: UserProfile = {
                ...user,
                fullName: editableFields.fullName,
                phoneNumber: editableFields.phoneNumber,
                avatar: avatarPreview || user.avatar
            }

            setUser(updatedUser)
            setIsEditing(false)
            setAvatarFile(null)
            setAvatarPreview("")
            setEditableFields({
                ...editableFields,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            })
            setIsLoading(false)

            alert("Profile updated successfully!")
        }, 2000)
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
        switch (role.toLowerCase()) {
            case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            case 'faculty': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto bg-background text-foreground">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">My Profile</h2>
                    <p className="text-muted-foreground">
                        Manage your personal information and account settings
                    </p>
                </div>

                {!isEditing ? (
                    <Button onClick={handleEdit}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button onClick={handleSave} disabled={isLoading}>
                            <Save className="mr-2 h-4 w-4" />
                            {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                            <X className="mr-2 h-4 w-4" />
                            Cancel
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Avatar Section */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>
                            {isEditing ? "Click to change your profile picture" : "Your current profile picture"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <Avatar className="h-32 w-32">
                                <AvatarImage src={avatarPreview || user.avatar} alt={user.fullName} />
                                <AvatarFallback className="text-2xl">
                                    {user.fullName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>

                            {isEditing && (
                                <label
                                    htmlFor="avatar-upload"
                                    className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 cursor-pointer transition-colors"
                                >
                                    <Camera className="h-4 w-4" />
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <div className="text-center">
                            <h3 className="text-xl font-semibold">{user.fullName}</h3>
                            <p className="text-muted-foreground">{user.email}</p>
                            <Badge className={getRoleColor(user.role)}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
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
                                    <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
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
                                    <span>{new Date(user.joinedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <>
                                <Separator />
                                <div className="space-y-4">
                                    <h4 className="text-lg font-medium">Change Password</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Leave password fields empty if you don't want to change your password.
                                    </p>

                                    <div className="grid gap-4 md:grid-cols-1 max-w-md">
                                        <div className="space-y-2">
                                            <Label htmlFor="currentPassword">Current Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    value={editableFields.currentPassword}
                                                    onChange={(e) => setEditableFields({ ...editableFields, currentPassword: e.target.value })}
                                                    placeholder="Enter current password"
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="newPassword">New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    value={editableFields.newPassword}
                                                    onChange={(e) => setEditableFields({ ...editableFields, newPassword: e.target.value })}
                                                    placeholder="Enter new password"
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    value={editableFields.confirmPassword}
                                                    onChange={(e) => setEditableFields({ ...editableFields, confirmPassword: e.target.value })}
                                                    placeholder="Confirm new password"
                                                    className="pl-9"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
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
                                {new Date(user.lastActive).toLocaleString()}
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