'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import {
    GraduationCap,
    Users,
    BarChart3,
    Download,
    Save,
    Loader2,
    Award,
    TrendingUp
} from 'lucide-react';

interface GradebookProps {
    courseId: string;
}

interface Assignment {
    id: number;
    title: string;
    maxMarks: number;
    dueDate: string;
    submissionCount: number;
    totalStudents: number;
}

interface StudentGrade {
    studentId: number;
    studentName: string;
    studentEmail: string;
    studentRollNo?: string;
    assignmentGrades: { [assignmentId: number]: { grade: number | null; feedback: string } };
    totalGrade: number;
    averagePercentage: number;
    letterGrade: string;
}

interface CourseStats {
    totalStudents: number;
    totalAssignments: number;
    averageGrade: number;
    gradedSubmissions: number;
    pendingSubmissions: number;
}

export default function Gradebook({ courseId }: GradebookProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
    const [courseStats, setCourseStats] = useState<CourseStats>({
        totalStudents: 0,
        totalAssignments: 0,
        averageGrade: 0,
        gradedSubmissions: 0,
        pendingSubmissions: 0
    });
    const [loading, setLoading] = useState(true);
    const [savingGrades, setSavingGrades] = useState<Set<string>>(new Set());
    const [gradingData, setGradingData] = useState<{ [key: string]: { grade: string; feedback: string } }>({});

    useEffect(() => {
        fetchGradebookData();
    }, [courseId]);

    const fetchGradebookData = async () => {
        try {
            setLoading(true);

            // Fetch assignments for the course
            const assignmentsResponse = await fetch(`/api/courses/${courseId}/assignments`);
            const assignmentsData = await assignmentsResponse.json();

            if (assignmentsData.success) {
                setAssignments(assignmentsData.assignments || []);
            }

            // Fetch gradebook data (different endpoints for faculty vs students)
            if (user?.role === 'faculty') {
                const gradebookResponse = await fetch(`/api/faculty/courses/${courseId}/gradebook`);
                const gradebookData = await gradebookResponse.json();

                if (gradebookData.success) {
                    setStudentGrades(gradebookData.studentGrades || []);
                    setCourseStats(gradebookData.stats || {});
                }
            } else if (user?.role === 'student') {
                const gradesResponse = await fetch('/api/student/grades');
                const gradesData = await gradesResponse.json();

                if (gradesData.success) {
                    // Filter grades for this course
                    const courseGrades = gradesData.grades.filter((grade: any) =>
                        grade.courseId === courseId
                    );
                    setStudentGrades([{
                        studentId: user.id,
                        studentName: user.fullName,
                        studentEmail: user.email,
                        assignmentGrades: {},
                        totalGrade: 0,
                        averagePercentage: gradesData.summary.averageGrade,
                        letterGrade: getLetterGrade(gradesData.summary.averageGrade)
                    }]);
                }
            }
        } catch (error) {
            console.error('Error fetching gradebook data:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load gradebook data",
            });
        } finally {
            setLoading(false);
        }
    };

    const getLetterGrade = (percentage: number): string => {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 65) return 'D';
        return 'F';
    };

    const getGradeColor = (percentage: number): string => {
        if (percentage >= 90) return 'text-green-600 dark:text-green-400';
        if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
        if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
        if (percentage >= 60) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const handleGradeChange = (studentId: number, assignmentId: number, value: string) => {
        const key = `${studentId}-${assignmentId}`;
        setGradingData(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                grade: value
            }
        }));
    };

    const handleFeedbackChange = (studentId: number, assignmentId: number, value: string) => {
        const key = `${studentId}-${assignmentId}`;
        setGradingData(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                feedback: value
            }
        }));
    };

    const saveGrade = async (studentId: number, assignmentId: number) => {
        const key = `${studentId}-${assignmentId}`;
        const gradeData = gradingData[key];

        if (!gradeData?.grade) return;

        try {
            setSavingGrades(prev => new Set(prev).add(key));

            const response = await fetch('/api/faculty/submissions/grade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId,
                    assignmentId,
                    grade: parseInt(gradeData.grade),
                    feedback: gradeData.feedback || ''
                })
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Grade saved successfully",
                });

                // Update local state
                setStudentGrades(prev => prev.map(student => {
                    if (student.studentId === studentId) {
                        return {
                            ...student,
                            assignmentGrades: {
                                ...student.assignmentGrades,
                                [assignmentId]: {
                                    grade: parseInt(gradeData.grade),
                                    feedback: gradeData.feedback || ''
                                }
                            }
                        };
                    }
                    return student;
                }));

                // Clear temporary data
                setGradingData(prev => {
                    const updated = { ...prev };
                    delete updated[key];
                    return updated;
                });
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            console.error('Error saving grade:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to save grade",
            });
        } finally {
            setSavingGrades(prev => {
                const updated = new Set(prev);
                updated.delete(key);
                return updated;
            });
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                {/* Header Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <Skeleton variant="shimmer" className="h-8 w-[120px]" />
                        <Skeleton variant="shimmer" className="h-4 w-[300px]" />
                    </div>
                    <Skeleton variant="shimmer" className="h-8 w-[120px] rounded" />
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid gap-4 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                                <Skeleton variant="shimmer" className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton variant="shimmer" className="h-8 w-[40px]" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Tabs Skeleton */}
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} variant="shimmer" className="h-10 w-[100px] rounded" />
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton variant="shimmer" className="h-6 w-[150px]" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {/* Table Header */}
                                <div className="grid grid-cols-6 gap-4 p-4 border-b">
                                    <Skeleton variant="shimmer" className="h-4 w-[60px]" />
                                    <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                                    <Skeleton variant="shimmer" className="h-4 w-[80px]" />
                                    <Skeleton variant="shimmer" className="h-4 w-[60px]" />
                                    <Skeleton variant="shimmer" className="h-4 w-[70px]" />
                                    <Skeleton variant="shimmer" className="h-4 w-[90px]" />
                                </div>
                                {/* Table Rows */}
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="grid grid-cols-6 gap-4 p-4">
                                        <div className="space-y-1">
                                            <Skeleton variant="shimmer" className="h-4 w-[100px]" />
                                            <Skeleton variant="shimmer" className="h-3 w-[80px]" />
                                        </div>
                                        <Skeleton variant="shimmer" className="h-4 w-[40px]" />
                                        <Skeleton variant="shimmer" className="h-4 w-[40px]" />
                                        <Skeleton variant="shimmer" className="h-4 w-[40px]" />
                                        <Skeleton variant="shimmer" className="h-4 w-[50px]" />
                                        <Skeleton variant="shimmer" className="h-6 w-[30px] rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold">Gradebook</h3>
                    <p className="text-muted-foreground">
                        {user?.role === 'faculty' ? 'Manage grades for all students' : 'View your grades and progress'}
                    </p>
                </div>
                {user?.role === 'faculty' && (
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Grades
                    </Button>
                )}
            </div>

            {/* Stats Overview for Faculty */}
            {user?.role === 'faculty' && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{courseStats.totalStudents}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{courseStats.totalAssignments}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{courseStats.averageGrade.toFixed(1)}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Grades</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{courseStats.pendingSubmissions}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {user?.role === 'faculty' && <TabsTrigger value="detailed">Detailed Grading</TabsTrigger>}
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grade Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        {assignments.map(assignment => (
                                            <TableHead key={assignment.id} className="text-center">
                                                <div className="text-sm font-medium">{assignment.title}</div>
                                                <div className="text-xs text-muted-foreground">/{assignment.maxMarks}</div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-center">Average</TableHead>
                                        <TableHead className="text-center">Letter Grade</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentGrades.map(student => (
                                        <TableRow key={student.studentId}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{student.studentName}</div>
                                                    {student.studentRollNo && (
                                                        <div className="text-sm text-muted-foreground font-mono">{student.studentRollNo}</div>
                                                    )}
                                                    {user?.role === 'faculty' && (
                                                        <div className="text-sm text-muted-foreground">{student.studentEmail}</div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            {assignments.map(assignment => {
                                                const grade = student.assignmentGrades[assignment.id];
                                                return (
                                                    <TableCell key={assignment.id} className="text-center">
                                                        {grade?.grade !== null && grade?.grade !== undefined ? (
                                                            <span className={getGradeColor((grade.grade / assignment.maxMarks) * 100)}>
                                                                {grade.grade}
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                            <TableCell className="text-center">
                                                <span className={`font-medium ${getGradeColor(student.averagePercentage)}`}>
                                                    {student.averagePercentage.toFixed(1)}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">
                                                    {student.letterGrade}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {user?.role === 'faculty' && (
                    <TabsContent value="detailed" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Grading</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Enter grades and feedback for individual assignments
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {assignments.map(assignment => (
                                        <Card key={assignment.id}>
                                            <CardHeader>
                                                <CardTitle className="text-lg">{assignment.title}</CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    Max Marks: {assignment.maxMarks} | Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                </p>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {studentGrades.map(student => {
                                                        const key = `${student.studentId}-${assignment.id}`;
                                                        const currentGrade = student.assignmentGrades[assignment.id];
                                                        const tempData = gradingData[key];

                                                        return (
                                                            <div key={student.studentId} className="flex items-center gap-4 p-4 border rounded-lg">
                                                                <div className="flex-1">
                                                                    <div className="font-medium">{student.studentName}</div>
                                                                    {student.studentRollNo && (
                                                                        <div className="text-sm text-muted-foreground font-mono">{student.studentRollNo}</div>
                                                                    )}
                                                                    <div className="text-sm text-muted-foreground">{student.studentEmail}</div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        type="number"
                                                                        min="0"
                                                                        max={assignment.maxMarks}
                                                                        placeholder="Grade"
                                                                        value={tempData?.grade || currentGrade?.grade?.toString() || ''}
                                                                        onChange={(e) => handleGradeChange(student.studentId, assignment.id, e.target.value)}
                                                                        className="w-20"
                                                                    />
                                                                    <span className="text-sm text-muted-foreground">/{assignment.maxMarks}</span>
                                                                </div>
                                                                <Textarea
                                                                    placeholder="Feedback..."
                                                                    value={tempData?.feedback || currentGrade?.feedback || ''}
                                                                    onChange={(e) => handleFeedbackChange(student.studentId, assignment.id, e.target.value)}
                                                                    className="w-64"
                                                                    rows={2}
                                                                />
                                                                <Button
                                                                    onClick={() => saveGrade(student.studentId, assignment.id)}
                                                                    disabled={!tempData?.grade || savingGrades.has(key)}
                                                                    size="sm"
                                                                >
                                                                    {savingGrades.has(key) ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Save className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                <TabsContent value="analytics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Grade Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground">
                                Analytics and grade distribution charts coming soon...
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 