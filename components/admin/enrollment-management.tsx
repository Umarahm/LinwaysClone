'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Users, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    const [selectedStudent, setSelectedStudent] = useState<string>('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

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

    const handleUnenroll = async (enrollmentId: number) => {
        if (!confirm('Are you sure you want to unenroll this student?')) return;

        try {
            const response = await fetch(`/api/admin/enrollments/${enrollmentId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Student unenrolled successfully'
                });
                fetchData();
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to unenroll student');
            }
        } catch (error) {
            console.error('Unenrollment error:', error);
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to unenroll student',
                variant: 'destructive'
            });
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Loading enrollment data...</p>
                    </div>
                </CardContent>
            </Card>
        );
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

            {/* Debug Information - Remove in production */}
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Debug Info: Students: {students.length}, Courses: {courses.length}, Enrollments: {enrollments.length}
                </AlertDescription>
            </Alert>

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
                            {enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                    <TableCell className="font-medium">{enrollment.student_name}</TableCell>
                                    <TableCell>{enrollment.student_email}</TableCell>
                                    <TableCell>
                                        <div>
                                            <Badge variant="outline">{enrollment.course_code}</Badge>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {enrollment.course_name}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleUnenroll(enrollment.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {enrollments.length === 0 && !loading && (
                        <div className="text-center py-8 text-muted-foreground">
                            No enrollments found. Start by adding some students and courses.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
} 