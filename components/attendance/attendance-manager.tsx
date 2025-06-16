'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Users,
    Save,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

interface Student {
    id: string;
    name: string;
    email: string;
}

interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent' | 'late';
}

interface AttendanceManagerProps {
    courseId: string;
    courseName: string;
}

export function AttendanceManager({ courseId, courseName }: AttendanceManagerProps) {
    const [students, setStudents] = useState<Student[]>([]);
    const [sessionName, setSessionName] = useState('');
    const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchStudents();
    }, [courseId]);

    useEffect(() => {
        // Generate default session name based on current date
        const today = new Date();
        const defaultName = `Class Session - ${today.toLocaleDateString()}`;
        setSessionName(defaultName);
    }, []);

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/courses/${courseId}/attendance`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }

            const data = await response.json();
            setStudents(data.students || []);

            // Initialize attendance records with all students absent by default
            const initialRecords = (data.students || []).map((student: Student) => ({
                studentId: student.id,
                status: 'absent' as const
            }));
            setAttendanceRecords(initialRecords);

        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to load students'
            });
        } finally {
            setLoading(false);
        }
    };

    const updateAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
        setAttendanceRecords(prev =>
            prev.map(record =>
                record.studentId === studentId
                    ? { ...record, status }
                    : record
            )
        );
    };

    const handleSaveAttendance = async () => {
        if (!sessionName.trim()) {
            setMessage({
                type: 'error',
                text: 'Please enter a session name'
            });
            return;
        }

        if (!sessionDate) {
            setMessage({
                type: 'error',
                text: 'Please select a session date'
            });
            return;
        }

        setSaving(true);
        setMessage(null);

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/courses/${courseId}/attendance`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionName: sessionName.trim(),
                    sessionDate,
                    attendanceRecords: attendanceRecords.map(record => ({
                        studentId: record.studentId,
                        status: record.status
                    }))
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save attendance');
            }

            setMessage({
                type: 'success',
                text: 'Attendance saved successfully!'
            });

            // Reset form
            const today = new Date();
            const defaultName = `Class Session - ${today.toLocaleDateString()}`;
            setSessionName(defaultName);
            setSessionDate(new Date().toISOString().split('T')[0]);

            // Reset all to absent
            setAttendanceRecords(prev =>
                prev.map(record => ({ ...record, status: 'absent' as const }))
            );

        } catch (error) {
            setMessage({
                type: 'error',
                text: error && typeof error === 'object' && 'message' in error ? (error as Error).message : 'Failed to save attendance'
            });
        } finally {
            setSaving(false);
        }
    };

    const getAttendanceStats = () => {
        const present = attendanceRecords.filter(r => r.status === 'present').length;
        const late = attendanceRecords.filter(r => r.status === 'late').length;
        const absent = attendanceRecords.filter(r => r.status === 'absent').length;
        const total = attendanceRecords.length;

        return { present, late, absent, total };
    };

    const stats = getAttendanceStats();

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Session Details */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Take Attendance - {courseName}
                    </CardTitle>
                    <CardDescription>
                        Record attendance for your class session
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="session-name">Session Name</Label>
                            <Input
                                id="session-name"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                placeholder="Enter session name"
                                disabled={saving}
                            />
                        </div>
                        <div>
                            <Label htmlFor="session-date">Session Date</Label>
                            <Input
                                id="session-date"
                                type="date"
                                value={sessionDate}
                                onChange={(e) => setSessionDate(e.target.value)}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    {/* Attendance Statistics */}
                    <div className="flex gap-4 p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Present: {stats.present}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Late: {stats.late}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                                <XCircle className="h-3 w-3 mr-1" />
                                Absent: {stats.absent}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">
                                <Users className="h-3 w-3 mr-1" />
                                Total: {stats.total}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student Attendance List */}
            <Card>
                <CardHeader>
                    <CardTitle>Student Attendance</CardTitle>
                    <CardDescription>
                        Mark each student as present, late, or absent
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {students.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">No students enrolled in this course</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {students.map((student) => {
                                const record = attendanceRecords.find(r => r.studentId === student.id);
                                const status = record?.status || 'absent';

                                return (
                                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{student.name}</h4>
                                            <p className="text-sm text-muted-foreground">{student.email}</p>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Present */}
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`present-${student.id}`}
                                                    checked={status === 'present'}
                                                    onCheckedChange={(checked) =>
                                                        updateAttendance(student.id, checked ? 'present' : 'absent')
                                                    }
                                                    disabled={saving}
                                                />
                                                <Label
                                                    htmlFor={`present-${student.id}`}
                                                    className="text-sm font-medium text-green-700"
                                                >
                                                    Present
                                                </Label>
                                            </div>

                                            {/* Late */}
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`late-${student.id}`}
                                                    checked={status === 'late'}
                                                    onCheckedChange={(checked) =>
                                                        updateAttendance(student.id, checked ? 'late' : 'absent')
                                                    }
                                                    disabled={saving}
                                                />
                                                <Label
                                                    htmlFor={`late-${student.id}`}
                                                    className="text-sm font-medium text-yellow-700"
                                                >
                                                    Late
                                                </Label>
                                            </div>

                                            {/* Status Badge */}
                                            <div className="w-20">
                                                {status === 'present' && (
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 w-full justify-center">
                                                        Present
                                                    </Badge>
                                                )}
                                                {status === 'late' && (
                                                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 w-full justify-center">
                                                        Late
                                                    </Badge>
                                                )}
                                                {status === 'absent' && (
                                                    <Badge variant="secondary" className="bg-red-100 text-red-800 w-full justify-center">
                                                        Absent
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSaveAttendance}
                    disabled={saving || students.length === 0}
                    size="lg"
                >
                    {saving ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Attendance
                        </>
                    )}
                </Button>
            </div>

            {/* Messages */}
            {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}
        </div>
    );
} 