'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ProtectedLayout } from '@/components/layout/protected-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    Users,
    ClipboardList,
    Calendar,
    Upload,
    Download,
    Eye,
    GraduationCap
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import Gradebook from '@/components/gradebook';

interface Course {
    id: string;
    name: string;
    description: string;
    faculty_name: string;
    faculty_email: string;
    userRole: 'admin' | 'faculty' | 'student';
    enrolledStudents?: number;
    totalAssignments?: number;
}

interface Assignment {
    id: string;
    title: string;
    description: string;
    due_date: string;
    max_points: number;
    submissions_count?: number;
    submitted_count?: number;
    submission_status?: 'submitted' | 'pending' | 'overdue';
    submission_id?: string;
    submitted_at?: string;
}

export default function CourseDetailPage() {
    const params = useParams();
    const courseId = params.courseId as string;
    const { user } = useAuth();

    const [course, setCourse] = useState<Course | null>(null);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (courseId) {
            fetchCourseData();
            fetchAssignments();
        }
    }, [courseId]);

    const fetchCourseData = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/courses/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch course data');
            }

            const data = await response.json();
            setCourse(data);
        } catch (err) {
            setError(err && typeof err === 'object' && 'message' in err ? (err as Error).message : 'An error occurred');
        }
    };

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/courses/${courseId}/assignments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch assignments');
            }

            const data = await response.json();
            setAssignments(data);
        } catch (err) {
            console.error('Error fetching assignments:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
                return <Badge variant="secondary" className="bg-green-100 text-green-800">Submitted</Badge>;
            case 'overdue':
                return <Badge variant="destructive">Overdue</Badge>;
            case 'pending':
                return <Badge variant="outline">Pending</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (loading) {
        return (
            <ProtectedLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </ProtectedLayout>
        );
    }

    if (error || !course) {
        return (
            <ProtectedLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-destructive">Error</h3>
                        <p className="text-muted-foreground">{error || 'Course not found'}</p>
                    </div>
                </div>
            </ProtectedLayout>
        );
    }

    return (
        <ProtectedLayout>
            <div className="space-y-6">
                {/* Course Header */}
                <div className="bg-card border rounded-lg p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">{course.name}</h1>
                            <p className="text-muted-foreground mb-4">{course.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    Faculty: {course.faculty_name}
                                </span>
                                {course.enrolledStudents !== undefined && (
                                    <span className="flex items-center">
                                        <Users className="h-4 w-4 mr-1" />
                                        {course.enrolledStudents} Students
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <Badge variant="outline" className="mb-2">
                                {course.userRole.charAt(0).toUpperCase() + course.userRole.slice(1)} View
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Course Tabs */}
                <Tabs defaultValue="assignments" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="assignments" className="flex items-center">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Assignments
                        </TabsTrigger>
                        <TabsTrigger value="gradebook" className="flex items-center">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Gradebook
                        </TabsTrigger>
                        <TabsTrigger value="attendance" className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            Attendance
                        </TabsTrigger>
                        {(course.userRole === 'faculty' || course.userRole === 'admin') && (
                            <TabsTrigger value="students" className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                Students
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Assignments</h2>
                            {(course.userRole === 'faculty' || course.userRole === 'admin') && (
                                <Button>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Create Assignment
                                </Button>
                            )}
                        </div>

                        <div className="grid gap-4">
                            {assignments.length === 0 ? (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <ClipboardList className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground">No assignments found for this course.</p>
                                    </CardContent>
                                </Card>
                            ) : (
                                assignments.map((assignment) => (
                                    <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <CardTitle className="text-lg">{assignment.title}</CardTitle>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {course.userRole === 'student' && assignment.submission_status && (
                                                        getStatusBadge(assignment.submission_status)
                                                    )}
                                                    <Badge variant="outline">
                                                        {assignment.max_points} pts
                                                    </Badge>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                {assignment.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                {course.userRole === 'faculty' || course.userRole === 'admin' ? (
                                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                                        <span>
                                                            Submissions: {assignment.submitted_count}/{assignment.submissions_count}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        {assignment.submission_status === 'submitted' ? (
                                                            <span className="text-sm text-green-600">
                                                                Submitted on {assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleDateString() : 'Unknown'}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-muted-foreground">
                                                                No submission yet
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="flex space-x-2">
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-1" />
                                                        View
                                                    </Button>
                                                    {course.userRole === 'student' && assignment.submission_status !== 'submitted' && (
                                                        <Button size="sm">
                                                            <Upload className="h-4 w-4 mr-1" />
                                                            Submit
                                                        </Button>
                                                    )}
                                                    {course.userRole === 'student' && assignment.submission_status === 'submitted' && (
                                                        <Button variant="outline" size="sm">
                                                            <Download className="h-4 w-4 mr-1" />
                                                            Download
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    {/* Gradebook Tab */}
                    <TabsContent value="gradebook" className="space-y-4">
                        <Gradebook courseId={courseId} />
                    </TabsContent>

                    {/* Attendance Tab */}
                    <TabsContent value="attendance" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Attendance</h2>
                            {(course.userRole === 'faculty' || course.userRole === 'admin') && (
                                <Button>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Take Attendance
                                </Button>
                            )}
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground text-center">
                                    {course.userRole === 'faculty'
                                        ? 'Attendance management interface will be implemented here.'
                                        : 'Your attendance records will be displayed here.'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Students Tab (Faculty only) */}
                    {(course.userRole === 'faculty' || course.userRole === 'admin') && (
                        <TabsContent value="students" className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold">Enrolled Students</h2>
                                <Button variant="outline">
                                    <Users className="h-4 w-4 mr-2" />
                                    Manage Enrollment
                                </Button>
                            </div>

                            <Card>
                                <CardContent className="p-6">
                                    <p className="text-muted-foreground text-center">
                                        Student management interface will be implemented here.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </ProtectedLayout>
    );
} 