'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Trash2, Plus, Users, AlertCircle, RefreshCw, Upload, Download, UsersRound, Search, Filter, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Enrollment {
    id: number;
    student_name: string;
    student_email: string;
    course_code: string;
    course_name: string;
    enrolled_at: string;
}

interface Student {
    id: number;
    full_name: string;
    email: string;
}

interface Course {
    id: number;
    code: string;
    name: string;
}

export function EnrollmentManagement() {
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [bulkCourse, setBulkCourse] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [bulkSubmitting, setBulkSubmitting] = useState(false);
    const [importData, setImportData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [courseFilter, setCourseFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    // Get unique courses for filter dropdown
    const availableCoursesForFilter = useMemo(() => {
        const uniqueCourses = enrollments.reduce((acc, enrollment) => {
            const key = `${enrollment.course_code}-${enrollment.course_name}`;
            if (!acc.find(c => c.key === key)) {
                acc.push({
                    key,
                    code: enrollment.course_code,
                    name: enrollment.course_name
                });
            }
            return acc;
        }, [] as Array<{ key: string, code: string, name: string }>);

        return uniqueCourses.sort((a, b) => a.code.localeCompare(b.code));
    }, [enrollments]);

    // Filter and paginate enrollments
    const filteredEnrollments = useMemo(() => {
        return enrollments.filter(enrollment => {
            const matchesSearch =
                enrollment.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.student_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                enrollment.course_name.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesCourse = courseFilter === 'all' || enrollment.course_code === courseFilter;

            let matchesDate = true;
            if (dateFilter !== 'all') {
                const enrolledDate = new Date(enrollment.enrolled_at);
                const now = new Date();

                switch (dateFilter) {
                    case 'today':
                        matchesDate = enrolledDate.toDateString() === now.toDateString();
                        break;
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        matchesDate = enrolledDate >= weekAgo;
                        break;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        matchesDate = enrolledDate >= monthAgo;
                        break;
                    case 'year':
                        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                        matchesDate = enrolledDate >= yearAgo;
                        break;
                }
            }

            return matchesSearch && matchesCourse && matchesDate;
        });
    }, [enrollments, searchTerm, courseFilter, dateFilter]);

    const totalPages = Math.ceil(filteredEnrollments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedEnrollments = filteredEnrollments.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, courseFilter, dateFilter, itemsPerPage]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('Fetching enrollment data...');

            const [enrollmentsRes, studentsRes, coursesRes] = await Promise.all([
                fetch('/api/admin/enrollments'),
                fetch('/api/admin/students'),
                fetch('/api/admin/courses')
            ]);

            console.log('API Response Status:', {
                enrollments: enrollmentsRes.status,
                students: studentsRes.status,
                courses: coursesRes.status
            });

            let fetchErrors = [];

            if (enrollmentsRes.ok) {
                const data = await enrollmentsRes.json();
                console.log('Enrollments data:', data);
                setEnrollments(data.enrollments || []);
            } else {
                const errorData = await enrollmentsRes.json().catch(() => ({}));
                fetchErrors.push(`Enrollments: ${errorData.error || 'Failed to fetch'}`);
            }

            if (studentsRes.ok) {
                const data = await studentsRes.json();
                console.log('Students data:', data);
                setStudents(data.students || []);
            } else {
                const errorData = await studentsRes.json().catch(() => ({}));
                fetchErrors.push(`Students: ${errorData.error || 'Failed to fetch'}`);
            }

            if (coursesRes.ok) {
                const data = await coursesRes.json();
                console.log('Courses data:', data);
                setCourses(data.courses || []);
            } else {
                const errorData = await coursesRes.json().catch(() => ({}));
                fetchErrors.push(`Courses: ${errorData.error || 'Failed to fetch'}`);
            }

            if (fetchErrors.length > 0) {
                setError(fetchErrors.join(', '));
                toast({
                    title: 'Partial Data Load',
                    description: fetchErrors.join(', '),
                    variant: 'destructive'
                });
            }

        } catch (error) {
            console.error('Fetch error:', error);
            setError('Network error occurred while fetching data');
            toast({
                title: 'Error',
                description: 'Failed to load data. Please check your network connection.',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedStudent || !selectedCourse) {
            toast({
                title: 'Error',
                description: 'Please select both student and course',
                variant: 'destructive'
            });
            return;
        }

        try {
            setSubmitting(true);
            console.log('Enrolling student:', { student_id: selectedStudent, course_id: selectedCourse });

            const response = await fetch('/api/admin/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_id: parseInt(selectedStudent),
                    course_id: parseInt(selectedCourse)
                })
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Student enrolled successfully'
                });
                setDialogOpen(false);
                setSelectedStudent('');
                setSelectedCourse('');
                fetchData();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to enroll student');
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to enroll student',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleBulkEnroll = async () => {
        if (selectedStudents.length === 0 || !bulkCourse) {
            toast({
                title: 'Error',
                description: 'Please select at least one student and a course',
                variant: 'destructive'
            });
            return;
        }

        setBulkSubmitting(true);

        toast({
            title: 'Bulk Enrollment Started',
            description: `Processing ${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''}...`
        });

        try {
            const response = await fetch('/api/admin/enrollments/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    student_ids: selectedStudents,
                    course_id: parseInt(bulkCourse)
                })
            });

            if (response.ok) {
                const result = await response.json();

                if (result.successful > 0) {
                    toast({
                        title: 'Bulk Enrollment Successful',
                        description: `Successfully enrolled ${result.successful} student${result.successful > 1 ? 's' : ''}. ${result.failed ? `${result.failed} enrollment${result.failed > 1 ? 's' : ''} failed.` : 'No failures.'}`,
                        duration: 5000,
                        variant: 'success'
                    });
                } else {
                    toast({
                        title: 'Bulk Enrollment Issues',
                        description: `No students were enrolled. ${result.failed || 0} enrollment${result.failed !== 1 ? 's' : ''} failed. Most likely already enrolled.`,
                        variant: 'destructive',
                        duration: 7000
                    });
                }

                setBulkDialogOpen(false);
                setSelectedStudents([]);
                setBulkCourse('');
                fetchData();
            } else if (response.status >= 500) {
                toast({
                    title: 'Server Error',
                    description: 'Internal server error occurred. Please try again later.',
                    variant: 'destructive',
                    duration: 7000
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Bulk Enrollment Failed',
                    description: error.error || 'Failed to enroll students.',
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
                    description: error instanceof Error ? error.message : 'An unexpected error occurred.',
                    variant: 'destructive',
                    duration: 7000
                });
            }
        } finally {
            setBulkSubmitting(false);
        }
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
                    description: `Found ${jsonData.length} row${jsonData.length > 1 ? 's' : ''} of enrollment data`,
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

        toast({
            title: 'Import Started',
            description: `Processing ${importData.length} enrollment${importData.length > 1 ? 's' : ''}...`
        });

        try {
            const response = await fetch('/api/admin/enrollments/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enrollments: importData })
            });

            if (response.ok) {
                const result = await response.json();

                if (result.successful > 0) {
                    toast({
                        title: 'Import Successful',
                        description: `Successfully imported ${result.successful} enrollment${result.successful > 1 ? 's' : ''}. ${result.failed ? `${result.failed} enrollment${result.failed > 1 ? 's' : ''} failed.` : 'No errors occurred.'}`,
                        duration: 5000,
                        variant: 'success'
                    });
                } else {
                    toast({
                        title: 'Import Completed with Issues',
                        description: `No enrollments were created. ${result.failed || 0} error${result.failed !== 1 ? 's' : ''} occurred. Please check your data.`,
                        variant: 'destructive',
                        duration: 7000
                    });
                }

                setImportDialogOpen(false);
                setImportData([]);
                fetchData();
            } else if (response.status >= 500) {
                toast({
                    title: 'Server Error',
                    description: 'Internal server error occurred. Please try again later.',
                    variant: 'destructive',
                    duration: 7000
                });
            } else {
                const error = await response.json();
                toast({
                    title: 'Import Failed',
                    description: error.error || 'Failed to import enrollments. Please check your data format.',
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
                    'Student Email': 'john.doe@example.com',
                    'Course Code': 'CS101'
                },
                {
                    'Student Email': 'jane.smith@example.com',
                    'Course Code': 'MATH201'
                }
            ];

            const worksheet = XLSX.utils.json_to_sheet(template);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Enrollments Template');
            XLSX.writeFile(workbook, 'bulk_enrollments_template.xlsx');

            toast({
                title: 'Template Downloaded',
                description: 'Bulk enrollment template has been downloaded successfully.',
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

    const handleStudentSelect = (studentId: number, checked: boolean) => {
        if (checked) {
            setSelectedStudents(prev => [...prev, studentId]);
        } else {
            setSelectedStudents(prev => prev.filter(id => id !== studentId));
        }
    };

    const handleSelectAllStudents = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(students.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleDelete = async (enrollmentId: number) => {
        if (!confirm('Are you sure you want to remove this enrollment?')) return;

        try {
            const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Enrollment removed successfully'
                });
                fetchData();
            } else {
                throw new Error('Failed to remove enrollment');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to remove enrollment',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return <div className="flex justify-center py-8">Loading enrollments...</div>;
    }

    return (
        <div className="space-y-4">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={fetchData}
                        >
                            Retry
                        </Button>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Enrollment Management
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={fetchData} disabled={loading}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Refresh
                            </Button>

                            {/* Template Download */}
                            <Button
                                variant="outline"
                                onClick={downloadTemplate}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Template
                            </Button>

                            {/* Excel Import */}
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Import Excel
                            </Button>

                            {/* Bulk Enrollment */}
                            <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        disabled={students.length === 0 || courses.length === 0}
                                    >
                                        <UsersRound className="h-4 w-4 mr-2" />
                                        Bulk Enroll
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Bulk Enroll Students</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium mb-2 block">Select Course</label>
                                            <Select value={bulkCourse} onValueChange={setBulkCourse}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select course for bulk enrollment" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id.toString()}>
                                                            {course.code} - {course.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-sm font-medium">Select Students</label>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="select-all"
                                                        checked={selectedStudents.length === students.length && students.length > 0}
                                                        onCheckedChange={handleSelectAllStudents}
                                                    />
                                                    <label htmlFor="select-all" className="text-sm">
                                                        Select All ({students.length})
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                                                {students.map((student) => (
                                                    <div key={student.id} className="flex items-center space-x-2 py-2">
                                                        <Checkbox
                                                            id={`student-${student.id}`}
                                                            checked={selectedStudents.includes(student.id)}
                                                            onCheckedChange={(checked) =>
                                                                handleStudentSelect(student.id, checked as boolean)
                                                            }
                                                        />
                                                        <label
                                                            htmlFor={`student-${student.id}`}
                                                            className="flex-1 cursor-pointer"
                                                        >
                                                            <div className="font-medium">{student.full_name}</div>
                                                            <div className="text-sm text-muted-foreground">{student.email}</div>
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>

                                            {selectedStudents.length > 0 && (
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    {selectedStudents.length} student{selectedStudents.length > 1 ? 's' : ''} selected
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setBulkDialogOpen(false);
                                                    setSelectedStudents([]);
                                                    setBulkCourse('');
                                                }}
                                                disabled={bulkSubmitting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={handleBulkEnroll}
                                                disabled={bulkSubmitting || selectedStudents.length === 0 || !bulkCourse}
                                            >
                                                {bulkSubmitting ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Enrolling...
                                                    </>
                                                ) : (
                                                    `Enroll ${selectedStudents.length} Student${selectedStudents.length > 1 ? 's' : ''}`
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            {/* Single Enrollment */}
                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button disabled={students.length === 0 || courses.length === 0}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Enroll Student
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Enroll Student in Course</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Student</label>
                                            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={students.length === 0 ? "No students available" : "Select student"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {students.map((student) => (
                                                        <SelectItem key={student.id} value={student.id.toString()}>
                                                            {student.full_name} - {student.email}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Course</label>
                                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={courses.length === 0 ? "No courses available" : "Select course"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {courses.map((course) => (
                                                        <SelectItem key={course.id} value={course.id.toString()}>
                                                            {course.code} - {course.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={submitting}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleEnroll} disabled={submitting || !selectedStudent || !selectedCourse}>
                                                {submitting ? (
                                                    <>
                                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                        Enrolling...
                                                    </>
                                                ) : (
                                                    'Enroll Student'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Hidden file input for Excel import */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                    />

                    {/* Search and Filter Controls */}
                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                    <Input
                                        placeholder="Search by student name, email, or course..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Filter Controls */}
                            <div className="flex gap-2">
                                <Select value={courseFilter} onValueChange={setCourseFilter}>
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Filter by course" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Courses</SelectItem>
                                        {availableCoursesForFilter.map((course) => (
                                            <SelectItem key={course.key} value={course.code}>
                                                {course.code} - {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={dateFilter} onValueChange={setDateFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Date filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        <SelectItem value="today">Today</SelectItem>
                                        <SelectItem value="week">This Week</SelectItem>
                                        <SelectItem value="month">This Month</SelectItem>
                                        <SelectItem value="year">This Year</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                                    <SelectTrigger className="w-24">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Results Summary */}
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>
                                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredEnrollments.length)} of {filteredEnrollments.length} enrollments
                                {(searchTerm || courseFilter !== 'all' || dateFilter !== 'all') ? ` (filtered from ${enrollments.length} total)` : ''}
                            </span>
                            {(searchTerm || courseFilter !== 'all' || dateFilter !== 'all') && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setCourseFilter('all');
                                        setDateFilter('all');
                                    }}
                                >
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {students.length === 0 && !loading && (
                        <Alert className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                No students found. Make sure you have students with the 'student' role in your database.
                            </AlertDescription>
                        </Alert>
                    )}

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Enrolled Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedEnrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                    <TableCell className="font-medium">{enrollment.student_name}</TableCell>
                                    <TableCell>{enrollment.student_email}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {enrollment.course_code}
                                        </Badge>
                                        <div className="text-sm text-muted-foreground">{enrollment.course_name}</div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(enrollment.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Empty States */}
                    {filteredEnrollments.length === 0 && enrollments.length > 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            No enrollments match your search criteria. Try adjusting your filters.
                        </div>
                    )}
                    {enrollments.length === 0 && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                            No enrollments found. Start by adding some students and courses.
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>

                                    {/* Page Numbers */}
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNumber;
                                        if (totalPages <= 5) {
                                            pageNumber = i + 1;
                                        } else if (currentPage <= 3) {
                                            pageNumber = i + 1;
                                        } else if (currentPage >= totalPages - 2) {
                                            pageNumber = totalPages - 4 + i;
                                        } else {
                                            pageNumber = currentPage - 2 + i;
                                        }

                                        return (
                                            <PaginationItem key={pageNumber}>
                                                <PaginationLink
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    isActive={currentPage === pageNumber}
                                                    className="cursor-pointer"
                                                >
                                                    {pageNumber}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Excel Import Preview Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview Excel Import</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Review the enrollment data below before importing:
                        </p>

                        <div className="border rounded-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student Email</TableHead>
                                        <TableHead>Course Code</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {importData.slice(0, 10).map((row: any, index: number) => (
                                        <TableRow key={index}>
                                            <TableCell>{row['Student Email'] || 'Missing Email'}</TableCell>
                                            <TableCell>{row['Course Code'] || 'Missing Course Code'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {importData.length > 10 && (
                            <p className="text-sm text-muted-foreground">
                                Showing first 10 rows of {importData.length} total entries.
                            </p>
                        )}

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setImportDialogOpen(false);
                                    setImportData([]);
                                }}
                                disabled={isImporting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={isImporting}
                            >
                                {isImporting ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                        Importing...
                                    </>
                                ) : (
                                    `Import ${importData.length} Enrollment${importData.length > 1 ? 's' : ''}`
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 