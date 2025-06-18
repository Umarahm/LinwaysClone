"use client"

import * as React from "react"
import { Lock, Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

interface ChangePasswordModalProps {
    trigger?: React.ReactNode
    isOpen?: boolean
    onOpenChange?: (open: boolean) => void
}

export function ChangePasswordModal({
    trigger,
    isOpen: controlledIsOpen,
    onOpenChange: controlledOnOpenChange
}: ChangePasswordModalProps) {
    const { toast } = useToast()
    const [internalIsOpen, setInternalIsOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    const [formData, setFormData] = React.useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    })

    // Use controlled state if provided, otherwise use internal state
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen
    const onOpenChange = controlledOnOpenChange || setInternalIsOpen

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            toast({
                variant: "destructive",
                title: "Password Mismatch",
                description: "New passwords don't match!",
            })
            return
        }

        // Validate password length
        if (formData.newPassword.length < 6) {
            toast({
                variant: "destructive",
                title: "Password Too Short",
                description: "New password must be at least 6 characters long!",
            })
            return
        }

        setIsLoading(true)

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (data.success) {
                toast({
                    title: "Password Changed",
                    description: "Your password has been changed successfully!",
                })

                // Reset form and close modal
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                })
                onOpenChange(false)
            } else {
                toast({
                    variant: "destructive",
                    title: "Password Change Failed",
                    description: data.message || "Failed to change password",
                })
            }
        } catch (error) {
            console.error('Error changing password:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to change password. Please try again.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const resetForm = () => {
        setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        })
        setShowCurrentPassword(false)
        setShowNewPassword(false)
        setShowConfirmPassword(false)
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) resetForm()
                onOpenChange(open)
            }}
        >
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                        Enter your current password and choose a new secure password.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Current Password */}
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="currentPassword"
                                type={showCurrentPassword ? "text" : "password"}
                                value={formData.currentPassword}
                                onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                placeholder="Enter current password"
                                className="pl-9 pr-9"
                                required
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                disabled={isLoading}
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="newPassword"
                                type={showNewPassword ? "text" : "password"}
                                value={formData.newPassword}
                                onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                placeholder="Enter new password"
                                className="pl-9 pr-9"
                                required
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                disabled={isLoading}
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Password must be at least 6 characters long
                        </p>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                placeholder="Confirm new password"
                                className="pl-9 pr-9"
                                required
                                disabled={isLoading}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Changing...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Change Password
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 