'use client';

import React, { useState } from 'react';
import Timetable from './timetable';
import { useToast } from '@/hooks/use-toast';

const TimetableExample: React.FC = () => {
    const { toast } = useToast();

    // Sample timetable data
    const [timetableData] = useState([
        {
            timetable_id: 1,
            day: 'Monday',
            start_time: '09:00',
            end_time: '10:30',
            course_name: 'Data Structures',
            room: 'CS-101',
            faculty_id: 1
        },
        {
            timetable_id: 2,
            day: 'Monday',
            start_time: '11:00',
            end_time: '12:30',
            course_name: 'Database Systems',
            room: 'CS-102',
            faculty_id: 2
        },
        {
            timetable_id: 3,
            day: 'Tuesday',
            start_time: '09:00',
            end_time: '10:30',
            course_name: 'Web Development',
            room: 'CS-103',
            faculty_id: 1
        },
        {
            timetable_id: 4,
            day: 'Tuesday',
            start_time: '14:00',
            end_time: '15:30',
            course_name: 'Machine Learning',
            room: 'CS-104',
            faculty_id: 3
        },
        {
            timetable_id: 5,
            day: 'Wednesday',
            start_time: '10:00',
            end_time: '11:30',
            course_name: 'Software Engineering',
            room: 'CS-105',
            faculty_id: 2
        },
        {
            timetable_id: 6,
            day: 'Thursday',
            start_time: '13:00',
            end_time: '14:30',
            course_name: 'Computer Networks',
            room: 'CS-106',
            faculty_id: 1
        },
        {
            timetable_id: 7,
            day: 'Friday',
            start_time: '09:30',
            end_time: '11:00',
            course_name: 'Operating Systems',
            room: 'CS-107',
            faculty_id: 3
        },
        {
            timetable_id: 8,
            day: 'Friday',
            start_time: '15:00',
            end_time: '16:30',
            course_name: 'Algorithms',
            room: 'CS-108',
            faculty_id: 2
        }
    ]);

    const handleMarkAttendance = async (timetableId: number) => {
        try {
            // This is where you would make an API call to mark attendance
            // For demonstration, we'll just show a toast
            const classEntry = timetableData.find(entry => entry.timetable_id === timetableId);

            if (classEntry) {
                toast({
                    title: "Attendance Marked Successfully",
                    description: `Attendance has been marked for ${classEntry.course_name} in ${classEntry.room}`,
                });

                // Example API call (commented out):
                /*
                const response = await fetch('/api/attendance/mark', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        timetable_id: timetableId,
                        date: new Date().toISOString().split('T')[0]
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to mark attendance');
                }

                const result = await response.json();
                toast({
                    title: "Attendance Marked",
                    description: result.message || "Attendance marked successfully",
                });
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

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">Class Timetable</h1>
                <p className="text-muted-foreground">
                    Weekly schedule with attendance marking for faculty members.
                    Faculty can only mark attendance during their assigned class times.
                </p>
            </div>

            <Timetable
                timetableData={timetableData}
                onMarkAttendance={handleMarkAttendance}
            />

            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-3">Component Features:</h3>
                <ul className="space-y-2 text-sm">
                    <li>✅ Responsive design - Desktop grid view and mobile card view</li>
                    <li>✅ 7-day week display (Monday to Sunday)</li>
                    <li>✅ Time slots from 9 AM to 5 PM (30-minute intervals)</li>
                    <li>✅ Course name and room number display</li>
                    <li>✅ Faculty attendance marking with three conditions:</li>
                    <ul className="ml-6 mt-1 space-y-1">
                        <li>• User must be the assigned faculty for the course</li>
                        <li>• Current day must match the class day</li>
                        <li>• Current time must be within the class time slot</li>
                    </ul>
                    <li>✅ Real-time time checking (updates every minute)</li>
                    <li>✅ Toast notifications for attendance marking</li>
                    <li>✅ Customizable attendance marking callback</li>
                </ul>
            </div>
        </div>
    );
};

export default TimetableExample; 