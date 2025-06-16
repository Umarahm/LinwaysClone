'use client';

import React, { useState } from 'react';
import Timetable from './timetable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Calendar, Info } from 'lucide-react';

const TimetableDemo: React.FC = () => {
    const { toast } = useToast();

    // Sample timetable data that matches the database structure
    const [timetableData] = useState([
        {
            timetable_id: 1,
            day: 'Monday',
            start_time: '09:00',
            end_time: '10:30',
            course_name: 'Data Structures & Algorithms',
            room: 'CS-101',
            faculty_id: 3 // Dr. Sarah Johnson
        },
        {
            timetable_id: 2,
            day: 'Tuesday',
            start_time: '11:00',
            end_time: '12:30',
            course_name: 'Database Management Systems',
            room: 'CS-102',
            faculty_id: 3 // Dr. Sarah Johnson
        },
        {
            timetable_id: 3,
            day: 'Wednesday',
            start_time: '14:00',
            end_time: '15:30',
            course_name: 'Web Development',
            room: 'IT-Lab-1',
            faculty_id: 4 // Prof. Michael Brown
        },
        {
            timetable_id: 4,
            day: 'Thursday',
            start_time: '10:00',
            end_time: '11:30',
            course_name: 'Machine Learning',
            room: 'CS-103',
            faculty_id: 3 // Dr. Sarah Johnson
        },
        {
            timetable_id: 5,
            day: 'Friday',
            start_time: '09:30',
            end_time: '11:00',
            course_name: 'Data Structures & Algorithms',
            room: 'CS-101',
            faculty_id: 3 // Dr. Sarah Johnson
        },
        {
            timetable_id: 6,
            day: 'Friday',
            start_time: '13:00',
            end_time: '14:30',
            course_name: 'Web Development',
            room: 'IT-Lab-2',
            faculty_id: 4 // Prof. Michael Brown
        }
    ]);

    const handleMarkAttendance = async (timetableId: number) => {
        try {
            // Find the class entry
            const classEntry = timetableData.find(entry => entry.timetable_id === timetableId);

            if (classEntry) {
                toast({
                    title: "Attendance Marked Successfully",
                    description: `Attendance has been marked for ${classEntry.course_name} in ${classEntry.room}`,
                });

                // In a real application, you would make an API call here:
                /*
                const response = await fetch('/api/attendance/mark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        timetable_id: timetableId,
                        date: new Date().toISOString().split('T')[0],
                        course_id: classEntry.course_id,
                        faculty_id: classEntry.faculty_id
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to mark attendance');
                }

                const result = await response.json();
                */
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark attendance. Please try again.",
                variant: "destructive",
            });
        }
    };

    const refreshTimetable = () => {
        toast({
            title: "Timetable Refreshed",
            description: "Timetable data has been refreshed successfully.",
        });
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Calendar className="h-8 w-8" />
                        Timetable Demo
                    </h1>
                    <p className="text-muted-foreground">
                        Interactive demonstration of the responsive timetable component with attendance marking functionality.
                    </p>
                </div>
                <Button onClick={refreshTimetable} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Info Card */}
            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
                <CardHeader>
                    <CardTitle className="text-blue-900 dark:text-blue-200 flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Demo Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800 dark:text-blue-300">
                    <div className="space-y-2">
                        <p>This demo shows the timetable component with sample data. Key features:</p>
                        <ul className="list-disc ml-6 space-y-1">
                            <li><strong>Faculty attendance marking:</strong> Only available to faculty members during their assigned class times</li>
                            <li><strong>Real-time validation:</strong> Checks current day and time before showing attendance buttons</li>
                            <li><strong>Responsive design:</strong> Desktop grid view and mobile card layout</li>
                            <li><strong>Sample data:</strong> Includes courses from CS and IT departments</li>
                        </ul>
                        <p className="mt-3 text-sm">
                            <strong>Note:</strong> To test attendance marking, you need to be logged in as a faculty member
                            (faculty_id 3 or 4) and access the timetable during the scheduled class times.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Timetable Component */}
            <Timetable
                timetableData={timetableData}
                onMarkAttendance={handleMarkAttendance}
            />

            {/* Usage Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Integration Guide</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold mb-2">Component Usage:</h4>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            {`<Timetable 
  timetableData={timetableEntries}
  onMarkAttendance={handleMarkAttendance}
/>`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Data Structure:</h4>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                            {`interface TimetableEntry {
  timetable_id: number;
  day: string; // "Monday", "Tuesday", etc.
  start_time: string; // "09:00" format
  end_time: string; // "10:30" format
  course_name: string;
  room: string;
  faculty_id: number;
}`}
                        </pre>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Props:</h4>
                        <div className="space-y-2">
                            <div className="p-3 bg-muted rounded-md">
                                <code className="text-sm">timetableData: TimetableEntry[]</code>
                                <p className="text-sm text-muted-foreground mt-1">Array of timetable entries to display</p>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                <code className="text-sm">onMarkAttendance?: (timetableId: number) =&gt; void</code>
                                <p className="text-sm text-muted-foreground mt-1">Optional callback for attendance marking</p>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                <code className="text-sm">onEditEntry?: (entry: TimetableEntry) =&gt; void</code>
                                <p className="text-sm text-muted-foreground mt-1">Optional callback for editing entries (admin mode)</p>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                <code className="text-sm">onCreateEntry?: (day: string, timeSlot: string) =&gt; void</code>
                                <p className="text-sm text-muted-foreground mt-1">Optional callback for creating new entries (admin mode)</p>
                            </div>
                            <div className="p-3 bg-muted rounded-md">
                                <code className="text-sm">isAdminMode?: boolean</code>
                                <p className="text-sm text-muted-foreground mt-1">Enable admin mode with edit/create functionality</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-2">Features:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium">For Students & Faculty:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                    <li>• View weekly class schedule</li>
                                    <li>• Real-time current class highlighting</li>
                                    <li>• Mobile-responsive design</li>
                                    <li>• Faculty attendance marking</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <h5 className="text-sm font-medium">For Administrators:</h5>
                                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                    <li>• Edit existing timetable entries</li>
                                    <li>• Create new class slots</li>
                                    <li>• Click-to-edit interface</li>
                                    <li>• Conflict detection</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TimetableDemo; 