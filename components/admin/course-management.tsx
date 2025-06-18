'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Edit, Plus, BookOpen, Users, Crown, UserCog, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Course {
    id: number;
    code: string;
    name: string;
    description: string;
    credits: number;
    faculty_id: number;
    faculty_name: string;
    created_at: string;
    assigned_faculty?: Faculty[];
}

interface Faculty {
    id: number;
    full_name: string;
    email: string;
    department: string;
    is_primary?: boolean;
}

interface CourseFormData {
    code: string;
    name: string;
    description: string;
    credits: number;
    faculty_ids: number[];
    primary_faculty_id: number;
}

export function CourseManagement() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [primaryFacultyDialogOpen, setPrimaryFacultyDialogOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [editingPrimaryCourse, setEditingPrimaryCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState<CourseFormData>({
        code: '',
        name: '',
        description: '',
        credits: 3,
        faculty_ids: [],
        primary_faculty_id: 0
    });
    const [importData, setImportData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
                const coursesWithFaculty = await Promise.all(
                    (data.courses || []).map(async (course: Course) => {
                        try {
                            const facultyResponse = await fetch(`/api/admin/courses/${course.id}/faculty`);
                            if (facultyResponse.ok) {
                                const facultyData = await facultyResponse.json();
                                return {
                                    ...course,
                                    assigned_faculty: facultyData.faculty || []
                                };
                            }
                            return course;
                        } catch (error) {
                            console.error(`Error fetching faculty for course ${course.id}:`, error);
                            return course;
                        }
                    })
                );
                setCourses(coursesWithFaculty);
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

        if (formData.faculty_ids.length === 0) {
            toast({
                title: 'Error',
                description: 'Please select at least one faculty member',
                variant: 'destructive'
            });
            return;
        }

        if (formData.primary_faculty_id === 0) {
            toast({
                title: 'Error',
                description: 'Please select a primary faculty member',
                variant: 'destructive'
            });
            return;
        }

        if (!formData.faculty_ids.includes(formData.primary_faculty_id)) {
            toast({
                title: 'Error',
                description: 'Primary faculty must be one of the assigned faculty members',
                variant: 'destructive'
            });
            return;
        }

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
                    faculty_ids: [],
                    primary_faculty_id: 0
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

    const handleEdit = async (course: Course) => {
        setEditingCourse(course);

        // Fetch assigned faculty for this course
        try {
            const response = await fetch(`/api/admin/courses/${course.id}/faculty`);
            if (response.ok) {
                const data = await response.json();
                const assignedFaculty = data.faculty || [];
                const facultyIds = assignedFaculty.map((f: Faculty) => f.id);
                const primaryFaculty = assignedFaculty.find((f: Faculty) => f.is_primary);

                setFormData({
                    code: course.code,
                    name: course.name,
                    description: course.description,
                    credits: course.credits,
                    faculty_ids: facultyIds,
                    primary_faculty_id: primaryFaculty?.id || 0
                });
            } else {
                // Fallback to old single faculty assignment
                setFormData({
                    code: course.code,
                    name: course.name,
                    description: course.description,
                    credits: course.credits,
                    faculty_ids: course.faculty_id ? [course.faculty_id] : [],
                    primary_faculty_id: course.faculty_id || 0
                });
            }
        } catch (error) {
            console.error('Error fetching course faculty:', error);
        }

        setDialogOpen(true);
    };

    const handleChangePrimaryFaculty = async (course: Course) => {
        setEditingPrimaryCourse(course);
        setPrimaryFacultyDialogOpen(true);
    };

    const handlePrimaryFacultySubmit = async (newPrimaryFacultyId: number) => {
        if (!editingPrimaryCourse) return;

        try {
            // Get current faculty assignments
            const response = await fetch(`/api/admin/courses/${editingPrimaryCourse.id}/faculty`);
            if (!response.ok) throw new Error('Failed to fetch current faculty');

            const data = await response.json();
            const currentFaculty = data.faculty || [];
            const facultyIds = currentFaculty.map((f: Faculty) => f.id);

            // Update the course with new primary faculty
            const updateResponse = await fetch(`/api/admin/courses/${editingPrimaryCourse.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: editingPrimaryCourse.code,
                    name: editingPrimaryCourse.name,
                    description: editingPrimaryCourse.description,
                    credits: editingPrimaryCourse.credits,
                    faculty_ids: facultyIds,
                    primary_faculty_id: newPrimaryFacultyId
                })
            });

            if (updateResponse.ok) {
                toast({
                    title: 'Success',
                    description: 'Primary faculty updated successfully'
                });
                setPrimaryFacultyDialogOpen(false);
                setEditingPrimaryCourse(null);
                fetchCourses();
            } else {
                const error = await updateResponse.json();
                throw new Error(error.message || 'Failed to update primary faculty');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to update primary faculty',
                variant: 'destructive'
            });
        }
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

    const handleFacultyToggle = (facultyId: number, checked: boolean) => {
        let newFacultyIds = [...formData.faculty_ids];

        if (checked) {
            if (!newFacultyIds.includes(facultyId)) {
                newFacultyIds.push(facultyId);
            }
        } else {
            newFacultyIds = newFacultyIds.filter(id => id !== facultyId);
            // If removing primary faculty, reset primary selection
            if (formData.primary_faculty_id === facultyId) {
                setFormData(prev => ({ ...prev, primary_faculty_id: 0 }));
            }
        }

        setFormData(prev => ({ ...prev, faculty_ids: newFacultyIds }));
    };

    const renderFacultyBadges = (course: Course) => {
        if (!course.assigned_faculty || course.assigned_faculty.length === 0) {
            return <Badge variant="outline">No Faculty Assigned</Badge>;
        }

        const primaryFaculty = course.assigned_faculty.find(f => f.is_primary);
        const otherFaculty = course.assigned_faculty.filter(f => !f.is_primary);

        return (
            <div className="flex flex-col gap-1">
                {primaryFaculty && (
                    <Badge variant="default" className="text-xs inline-flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        {primaryFaculty.full_name}
                    </Badge>
                )}
                {otherFaculty.map((facultyMember) => (
                    <Badge key={facultyMember.id} variant="secondary" className="text-xs">
                        {facultyMember.full_name}
                    </Badge>
                ))}
            </div>
        );
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast({
                title: 'Invalid File Type',
                description: 'Please select a valid Excel file (.xlsx or .xls)',
                variant: 'destructive'
            });
            return;
        }

        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'File Too Large',
                description: 'File size must be less than 10MB',
                variant: 'destructive'
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = XLSX.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    toast({
                        title: 'Empty File',
                        description: 'The Excel file appears to be empty or has no data rows',
                        variant: 'destructive'
                    });
                    return;
                }

                toast({
                    title: 'File Loaded',
                    description: `Found ${jsonData.length} row${jsonData.length > 1 ? 's' : ''} of data`,
                    duration: 3000,
                    variant: 'success'
                });

                setImportData(jsonData);
                setImportDialogOpen(true);
            } catch (error) {
                toast({
                    title: 'File Parse Error',
                    description: 'Failed to read Excel file. Please ensure it\'s a valid Excel format.',
                    variant: 'destructive',
                    duration: 5000
                });
            }
        };

        reader.onerror = () => {
            toast({
                title: 'File Read Error',
                description: 'Failed to read the file. Please try again.',
                variant: 'destructive'
            });
        };

        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (importData.length === 0) {
            toast({
                title: 'Error',
                description: 'No data to import. Please select a valid Excel file.',
                variant: 'destructive'
            });
            return;
        }

        setIsImporting(true);

        // Show initial toast
        toast({
            title: 'Import Started',
            description: `Processing ${importData.length} courses...`
        });

        try {
            const response = await fetch('/api/admin/courses/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courses: importData })
            });

            if (response.ok) {
                const result = await response.json();

                if (result.imported > 0) {
                    toast({
                        title: 'Import Successful',
                        description: `Successfully imported ${result.imported} course${result.imported > 1 ? 's' : ''}. ${result.errors ? `${result.errors} error${result.errors > 1 ? 's' : ''} occurred.` : 'No errors occurred.'}`,
                        duration: 5000,
                        variant: 'success'
                    });
                } else {
                    toast({
                        title: 'Import Completed with Issues',
                        description: `No courses were imported. ${result.errors || 0} error${result.errors !== 1 ? 's' : ''} occurred. Please check your data and try again.`,
                        variant: 'destructive',
                        duration: 7000
                    });
                }

                setImportDialogOpen(false);
                setImportData([]);
                fetchCourses();
            } else if (response.status >= 500) {
                toast({
                    title: 'Server Error',
                    description: 'Internal server error occurred. Please try again later or contact support.',
                    variant: 'destructive',
                    duration: 7000
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Import Failed',
                    description: error.message || 'Failed to import courses. Please check your data format.',
                    variant: 'destructive',
                    duration: 7000
                });
            }
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('fetch')) {
                toast({
                    title: 'Connection Error',
                    description: 'Network error. Please check your internet connection and try again.',
                    variant: 'destructive',
                    duration: 7000
                });
            } else {
                toast({
                    title: 'Unexpected Error',
                    description: error instanceof Error ? error.message : 'An unexpected error occurred during import.',
                    variant: 'destructive',
                    duration: 7000
                });
            }
        } finally {
            setIsImporting(false);
        }
    };

    const downloadTemplate = () => {
        try {
            const template = [
                {
                    'Course Code': 'CS101',
                    'Course Name': 'Introduction to Computer Science',
                    'Description': 'Basic concepts of computer science',
                    'Credits': 3,
                    'Primary Faculty Email': 'faculty@example.com'
                }
            ];

            const worksheet = XLSX.utils.json_to_sheet(template);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses Template');
            XLSX.writeFile(workbook, 'courses_template.xlsx');

            toast({
                title: 'Template Downloaded',
                description: 'Course import template has been downloaded successfully.',
                duration: 3000,
                variant: 'success'
            });
        } catch (error) {
            toast({
                title: 'Download Failed',
                description: 'Failed to download template. Please try again.',
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
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={downloadTemplate}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Excel
                        </Button>
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
                                            faculty_ids: [],
                                            primary_faculty_id: 0
                                        });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Course
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                                                placeholder="e.g., CS101"
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
                                                onChange={(e) => setFormData(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="name">Course Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., Introduction to Computer Science"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Course description..."
                                            rows={3}
                                        />
                                    </div>

                                    {/* Faculty Assignment Section */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Assign Faculty Members
                                        </Label>

                                        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                                            {faculty.map((facultyMember) => (
                                                <div key={facultyMember.id} className="flex items-center space-x-2 py-2">
                                                    <Checkbox
                                                        id={`faculty-${facultyMember.id}`}
                                                        checked={formData.faculty_ids.includes(facultyMember.id)}
                                                        onCheckedChange={(checked) =>
                                                            handleFacultyToggle(facultyMember.id, checked as boolean)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`faculty-${facultyMember.id}`}
                                                        className="flex-1 cursor-pointer"
                                                    >
                                                        <div>
                                                            <div className="font-medium">{facultyMember.full_name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {facultyMember.email} • {facultyMember.department}
                                                            </div>
                                                        </div>
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>

                                        {formData.faculty_ids.length > 0 && (
                                            <div>
                                                <Label htmlFor="primary_faculty" className="flex items-center gap-2">
                                                    <Crown className="h-4 w-4" />
                                                    Primary Faculty
                                                </Label>
                                                <Select
                                                    value={formData.primary_faculty_id.toString()}
                                                    onValueChange={(value) =>
                                                        setFormData(prev => ({ ...prev, primary_faculty_id: parseInt(value) }))
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select primary faculty" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {faculty
                                                            .filter(f => formData.faculty_ids.includes(f.id))
                                                            .map((facultyMember) => (
                                                                <SelectItem
                                                                    key={facultyMember.id}
                                                                    value={facultyMember.id.toString()}
                                                                >
                                                                    {facultyMember.full_name}
                                                                </SelectItem>
                                                            ))
                                                        }
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end space-x-2">
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
                </div>
            </CardHeader>
            <CardContent>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
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
                                <TableCell>{course.name}</TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{course.credits}</Badge>
                                </TableCell>
                                <TableCell>
                                    {renderFacultyBadges(course)}
                                </TableCell>
                                <TableCell>
                                    {new Date(course.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(course)}
                                            title="Edit course details"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        {course.assigned_faculty && course.assigned_faculty.length > 1 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleChangePrimaryFaculty(course)}
                                                title="Change primary faculty"
                                                className="text-yellow-600 hover:text-yellow-700"
                                            >
                                                <UserCog className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(course.id)}
                                            title="Delete course"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>

            {/* Primary Faculty Change Dialog */}
            <Dialog open={primaryFacultyDialogOpen} onOpenChange={setPrimaryFacultyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Crown className="h-5 w-5" />
                            Change Primary Faculty
                        </DialogTitle>
                    </DialogHeader>

                    {editingPrimaryCourse && (
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Course: <span className="font-medium">{editingPrimaryCourse.name}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Select which faculty member should be the primary instructor:
                                </p>
                            </div>

                            <div className="space-y-2">
                                {editingPrimaryCourse.assigned_faculty?.map((facultyMember) => (
                                    <Button
                                        key={facultyMember.id}
                                        variant={facultyMember.is_primary ? "default" : "outline"}
                                        className="w-full justify-start"
                                        onClick={() => handlePrimaryFacultySubmit(facultyMember.id)}
                                        disabled={facultyMember.is_primary}
                                    >
                                        <div className="flex items-center gap-2">
                                            {facultyMember.is_primary && <Crown className="h-4 w-4" />}
                                            <div className="text-left">
                                                <div className="font-medium">{facultyMember.full_name}</div>
                                                <div className="text-sm opacity-70">{facultyMember.email}</div>
                                            </div>
                                        </div>
                                        {facultyMember.is_primary && (
                                            <Badge variant="secondary" className="ml-auto">Current</Badge>
                                        )}
                                    </Button>
                                ))}
                            </div>

                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setPrimaryFacultyDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Import Preview Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            Import Courses Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Preview of {importData.length} courses to be imported:
                        </p>
                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Course Code</TableHead>
                                        <TableHead>Course Name</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead>Primary Faculty Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importData.slice(0, 10).map((course, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{course['Course Code'] || course.code || 'N/A'}</TableCell>
                                            <TableCell>{course['Course Name'] || course.name || 'N/A'}</TableCell>
                                            <TableCell>{course['Credits'] || course.credits || 'N/A'}</TableCell>
                                            <TableCell>{course['Primary Faculty Email'] || course.primary_faculty_email || 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        {importData.length > 10 && (
                            <p className="text-sm text-muted-foreground">
                                ... and {importData.length - 10} more courses
                            </p>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleImport} disabled={isImporting}>
                                {isImporting ? 'Importing...' : `Import ${importData.length} Courses`}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 