'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
    id: number;
    email: string;
    full_name: string;
    role: 'student' | 'faculty';
    department: string;
    roll_no?: string;
    created_at: string;
}

interface UserFormData {
    email: string;
    password: string;
    full_name: string;
    role: 'student' | 'faculty';
    department: string;
    roll_no: string;
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        password: '',
        full_name: '',
        role: 'student',
        department: '',
        roll_no: ''
    });
    const { toast } = useToast();

    const departments = [
        'Computer Science',
        'Information Technology',
        'Electronics Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Business Administration',
        'Mathematics',
        'Physics',
        'Chemistry',
        'English'
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users || []);
            } else {
                throw new Error('Failed to fetch users');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load users',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
            const method = editingUser ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `User ${editingUser ? 'updated' : 'created'} successfully`
                });
                setDialogOpen(false);
                setEditingUser(null);
                setFormData({
                    email: '',
                    password: '',
                    full_name: '',
                    role: 'student',
                    department: '',
                    roll_no: ''
                });
                fetchUsers();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save user');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save user',
                variant: 'destructive'
            });
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            password: '', // Don't populate password for security
            full_name: user.full_name,
            role: user.role,
            department: user.department,
            roll_no: user.roll_no || ''
        });
        setDialogOpen(true);
    };

    const handleDelete = async (userId: number) => {
        if (!confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'User deleted successfully'
                });
                fetchUsers();
            } else {
                throw new Error('Failed to delete user');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete user',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Skeleton variant="shimmer" className="h-5 w-5" />
                            <Skeleton variant="shimmer" className="h-6 w-[140px]" />
                        </div>
                        <Skeleton variant="shimmer" className="h-9 w-[100px] rounded" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Table Header */}
                        <div className="grid grid-cols-7 gap-4 p-4 border-b">
                            <Skeleton variant="shimmer" className="h-4 w-[60px]" />
                            <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                            <Skeleton variant="shimmer" className="h-4 w-[70px]" />
                            <Skeleton variant="shimmer" className="h-4 w-[50px]" />
                            <Skeleton variant="shimmer" className="h-4 w-[90px]" />
                            <Skeleton variant="shimmer" className="h-4 w-[70px]" />
                            <Skeleton variant="shimmer" className="h-4 w-[70px]" />
                        </div>
                        {/* Table Rows */}
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-7 gap-4 p-4">
                                <Skeleton variant="shimmer" className="h-4 w-[100px]" />
                                <Skeleton variant="shimmer" className="h-4 w-[140px]" />
                                <Skeleton variant="shimmer" className="h-6 w-[80px] rounded-full" />
                                <Skeleton variant="shimmer" className="h-6 w-[60px] rounded-full" />
                                <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                                <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                                <div className="flex gap-2">
                                    <Skeleton variant="shimmer" className="h-8 w-8 rounded" />
                                    <Skeleton variant="shimmer" className="h-8 w-8 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        User Management
                    </CardTitle>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    setEditingUser(null);
                                    setFormData({
                                        email: '',
                                        password: '',
                                        full_name: '',
                                        role: 'student',
                                        department: '',
                                        roll_no: ''
                                    });
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingUser ? 'Edit User' : 'Add New User'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="password">
                                        Password {editingUser && '(leave blank to keep current)'}
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required={!editingUser}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="full_name">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="role">Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value: 'student' | 'faculty') =>
                                            setFormData({ ...formData, role: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="student">Student</SelectItem>
                                            <SelectItem value="faculty">Faculty</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="department">Department</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => setFormData({ ...formData, department: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="roll_no">
                                        Roll Number {formData.role && (
                                            <span className="text-xs text-muted-foreground">
                                                (Optional - will be auto-generated if empty)
                                            </span>
                                        )}
                                    </Label>
                                    <Input
                                        id="roll_no"
                                        type="text"
                                        placeholder={
                                            formData.role === "student" ? "STU0001" :
                                                formData.role === "faculty" ? "FAC0001" :
                                                    "Roll Number"
                                        }
                                        value={formData.roll_no}
                                        onChange={(e) => setFormData({ ...formData, roll_no: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingUser ? 'Update' : 'Create'} User
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.full_name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono">
                                        {user.roll_no || 'Not Set'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'faculty' ? 'default' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.department}</TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(user)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {users.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No users found. Add some users to get started.
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 