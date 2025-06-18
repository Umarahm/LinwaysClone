'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Trash2, Edit, Plus, GraduationCap, Upload, Download, FileSpreadsheet, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface Student {
    id: number;
    email: string;
    full_name: string;
    role: 'student';
    department: string;
    roll_no?: string;
    created_at: string;
}

interface StudentFormData {
    email: string;
    password: string;
    full_name: string;
    department: string;
    roll_no: string;
}

export function StudentManagement() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState<StudentFormData>({
        email: '',
        password: '',
        full_name: '',
        department: '',
        roll_no: ''
    });
    const [importData, setImportData] = useState<any[]>([]);
    const [isImporting, setIsImporting] = useState(false);

    // Pagination and filtering state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');

    const fileInputRef = useRef<HTMLInputElement>(null);
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
        fetchStudents();
    }, []);

    // Filter and paginate students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch = student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (student.roll_no && student.roll_no.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;

            return matchesSearch && matchesDepartment;
        });
    }, [students, searchTerm, departmentFilter]);

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, departmentFilter, itemsPerPage]);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/admin/students');
            if (response.ok) {
                const data = await response.json();
                setStudents(data.students || []);
            } else {
                throw new Error('Failed to fetch students');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load students',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingStudent ? `/api/admin/users/${editingStudent.id}` : '/api/admin/users';
            const method = editingStudent ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, role: 'student' })
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: `Student ${editingStudent ? 'updated' : 'created'} successfully`
                });
                setDialogOpen(false);
                setEditingStudent(null);
                setFormData({
                    email: '',
                    password: '',
                    full_name: '',
                    department: '',
                    roll_no: ''
                });
                fetchStudents();
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Failed to save student');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to save student',
                variant: 'destructive'
            });
        }
    };

    const handleEdit = (student: Student) => {
        setEditingStudent(student);
        setFormData({
            email: student.email,
            password: '',
            full_name: student.full_name,
            department: student.department,
            roll_no: student.roll_no || ''
        });
        setDialogOpen(true);
    };

    const handleDelete = async (studentId: number) => {
        if (!confirm('Are you sure you want to delete this student?')) return;

        try {
            const response = await fetch(`/api/admin/users/${studentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Student deleted successfully'
                });
                fetchStudents();
            } else {
                throw new Error('Failed to delete student');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete student',
                variant: 'destructive'
            });
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
            description: `Processing ${importData.length} students...`
        });

        try {
            const response = await fetch('/api/admin/students/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ students: importData })
            });

            if (response.ok) {
                const result = await response.json();

                if (result.imported > 0) {
                    toast({
                        title: 'Import Successful',
                        description: `Successfully imported ${result.imported} student${result.imported > 1 ? 's' : ''}. ${result.errors ? `${result.errors} error${result.errors > 1 ? 's' : ''} occurred.` : 'No errors occurred.'}`,
                        duration: 5000,
                        variant: 'success'
                    });
                } else {
                    toast({
                        title: 'Import Completed with Issues',
                        description: `No students were imported. ${result.errors || 0} error${result.errors !== 1 ? 's' : ''} occurred. Please check your data and try again.`,
                        variant: 'destructive',
                        duration: 7000
                    });
                }

                setImportDialogOpen(false);
                setImportData([]);
                fetchStudents();
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
                    description: error.message || 'Failed to import students. Please check your data format.',
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
                    'Full Name': 'John Doe',
                    'Email': 'john.doe@example.com',
                    'Department': 'Computer Science',
                    'Roll Number': 'STU0001',
                    'Password': 'defaultpassword123'
                }
            ];

            const worksheet = XLSX.utils.json_to_sheet(template);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Template');
            XLSX.writeFile(workbook, 'students_template.xlsx');

            toast({
                title: 'Template Downloaded',
                description: 'Student import template has been downloaded successfully.',
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
        return <div className="flex justify-center py-8">Loading students...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Student Management
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
                                        setEditingStudent(null);
                                        setFormData({
                                            email: '',
                                            password: '',
                                            full_name: '',
                                            department: '',
                                            roll_no: ''
                                        });
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Student
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingStudent ? 'Edit Student' : 'Add New Student'}
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
                                            Password {editingStudent && '(leave blank to keep current)'}
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required={!editingStudent}
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
                                            Roll Number
                                            <span className="text-xs text-muted-foreground">
                                                (Optional - will be auto-generated if empty)
                                            </span>
                                        </Label>
                                        <Input
                                            id="roll_no"
                                            type="text"
                                            placeholder="STU0001"
                                            value={formData.roll_no}
                                            onChange={(e) => setFormData({ ...formData, roll_no: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            {editingStudent ? 'Update' : 'Create'} Student
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

                {/* Search and Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Search by name, email, or roll number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>
                                        {dept}
                                    </SelectItem>
                                ))}
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
                <div className="mb-4 text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredStudents.length)} of {filteredStudents.length} students
                    {searchTerm || departmentFilter !== 'all' ? ` (filtered from ${students.length} total)` : ''}
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedStudents.map((student) => (
                            <TableRow key={student.id}>
                                <TableCell className="font-medium">{student.full_name}</TableCell>
                                <TableCell>{student.email}</TableCell>
                                <TableCell>
                                    {student.roll_no || 'Not Set'}
                                </TableCell>
                                <TableCell>{student.department}</TableCell>
                                <TableCell>
                                    {new Date(student.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleEdit(student)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleDelete(student.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Empty State */}
                {filteredStudents.length === 0 && students.length > 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No students match your search criteria. Try adjusting your filters.
                    </div>
                )}
                {students.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        No students found. Add some students to get started.
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

                {/* Import Preview Dialog */}
                <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5" />
                                Import Students Preview
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Preview of {importData.length} students to be imported:
                            </p>
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Full Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Roll Number</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {importData.slice(0, 10).map((student, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{student['Full Name'] || student.full_name || 'N/A'}</TableCell>
                                                <TableCell>{student['Email'] || student.email || 'N/A'}</TableCell>
                                                <TableCell>{student['Department'] || student.department || 'N/A'}</TableCell>
                                                <TableCell>{student['Roll Number'] || student.roll_no || 'Auto-generated'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {importData.length > 10 && (
                                <p className="text-sm text-muted-foreground">
                                    ... and {importData.length - 10} more students
                                </p>
                            )}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleImport} disabled={isImporting}>
                                    {isImporting ? 'Importing...' : `Import ${importData.length} Students`}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
} 