'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Course {
    id: number;
    code: string;
    name: string;
    description: string;
    credits: number;
    faculty_id: number;
    faculty_name: string;
    created_at: string;
}

interface Faculty {
    id: number;
    full_name: string;
    email: string;
    department: string;
}

interface CourseFormData {
    code: string;
    name: string;
    description: string;
    credits: number;
    faculty_id: number;
}

export function CourseManagement() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState<CourseFormData>({
        code: '',
        name: '',
        description: '',
        credits: 3,
        faculty_id: 0
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchCourses();
        fetchFaculty();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await fetch('/api/admin/courses');
            if (response.ok) {
                const data = await response.json();
                setCourses(data.courses || []);
            } else {
                throw new Error('Failed to fetch courses');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load courses',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchFaculty = async () => {
        try {
            const response = await fetch('/api/admin/faculty');
            if (response.ok) {
                const data = await response.json();
                setFaculty(data.faculty || []);
            } else {
                throw new Error('Failed to fetch faculty');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load faculty',
                variant: 'destructive'
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
            const method = editingCourse ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Course ${editingCourse ? 'updated' : 'created'} successfully`
                });
                setDialogOpen(false);
                setEditingCourse(null);
                setFormData({
                    code: '',
                    name: '',
                    description: '',
                    credits: 3,
                    faculty_id: 0
                });
                fetchCourses();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save course');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save course',
                variant: 'destructive'
            });
        }
    };

    const handleEdit = (course: Course) => {
        setEditingCourse(course);
        setFormData({
            code: course.code,
            name: course.name,
            description: course.description,
            credits: course.credits,
            faculty_id: course.faculty_id
        });
        setDialogOpen(true);
    };

    const handleDelete = async (courseId: number) => {
        if (!confirm('Are you sure you want to delete this course?')) return;

        try {
            const response = await fetch(`/api/admin/courses/${courseId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Course deleted successfully'
                });
                fetchCourses();
            } else {
                throw new Error('Failed to delete course');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete course',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8">Loading courses...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Course Management
                    </CardTitle>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                onClick={() => {
                                    setEditingCourse(null);
                                    setFormData({
                                        code: '',
                                        name: '',
                                        description: '',
                                        credits: 3,
                                        faculty_id: 0
                                    });
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="code">Course Code</Label>
                                        <Input
                                            id="code"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            placeholder="CS101"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="credits">Credits</Label>
                                        <Input
                                            id="credits"
                                            type="number"
                                            min="1"
                                            max="6"
                                            value={formData.credits}
                                            onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="name">Course Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Introduction to Computer Science"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Course description..."
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="faculty">Assigned Faculty</Label>
                                    <Select
                                        value={formData.faculty_id.toString()}
                                        onValueChange={(value) => setFormData({ ...formData, faculty_id: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select faculty member" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {faculty.map((member) => (
                                                <SelectItem key={member.id} value={member.id.toString()}>
                                                    {member.full_name} - {member.department}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingCourse ? 'Update' : 'Create'} Course
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
                            <TableHead>Course Code</TableHead>
                            <TableHead>Course Name</TableHead>
                            <TableHead>Credits</TableHead>
                            <TableHead>Faculty</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell className="font-medium">{course.code}</TableCell>
                                <TableCell>
                                    <div>
                                        <div className="font-medium">{course.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {course.description}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{course.credits}</Badge>
                                </TableCell>
                                <TableCell>{course.faculty_name || 'Not assigned'}</TableCell>
                                <TableCell>
                                    {new Date(course.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(course)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(course.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                {courses.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No courses found. Add some courses to get started.
                    </div>
                )}
            </CardContent>
        </Card>
    );
} 