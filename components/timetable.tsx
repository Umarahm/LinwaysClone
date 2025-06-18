'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { injectUniversalBreaks, isBreakEntry, BreakEntry } from '@/lib/utils';
import { Clock, Calendar, MapPin, UserCheck, User, Edit, Plus, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

interface TimetableEntry {
    timetable_id: number;
    day: string; // "Monday", "Tuesday", etc.
    start_time: string; // "09:00" format
    end_time: string; // "10:00" format
    course_name: string;
    room: string;
    faculty_id: number;
    faculty_name?: string; // Added for better display
    attendance_marked?: boolean; // Added for attendance status
}

interface TimetableProps {
    timetableData: TimetableEntry[];
    onMarkAttendance?: (timetableId: number) => void;
    onEditEntry?: (entry: TimetableEntry) => void;
    onCreateEntry?: (day: string, timeSlot: string) => void;
    isAdminMode?: boolean;
}

// Break styling for admin view
const breakColors = {
    'Lunch Break': {
        bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900',
        text: 'text-green-900 dark:text-green-100',
        border: 'border-green-200 dark:border-green-800',
        icon: UtensilsCrossed
    }
}

// Default break style for unknown breaks
const defaultBreakStyle = {
    bg: 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900',
    text: 'text-gray-900 dark:text-gray-100',
    border: 'border-gray-200 dark:border-gray-800',
    icon: Clock
}

const Timetable: React.FC<TimetableProps> = ({
    timetableData,
    onMarkAttendance,
    onEditEntry,
    onCreateEntry,
    isAdminMode = false
}) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [enhancedTimetableData, setEnhancedTimetableData] = useState<(TimetableEntry | BreakEntry)[]>([]);

    // Inject universal breaks into the timetable data
    useEffect(() => {
        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        // Transform timetable data to match the expected interface for injectUniversalBreaks
        const transformedData = timetableData.map(entry => ({
            ...entry,
            id: entry.timetable_id // Map timetable_id to id for compatibility
        }));
        const dataWithBreaks = injectUniversalBreaks(transformedData, weekdays);
        setEnhancedTimetableData(dataWithBreaks);
    }, [timetableData]);

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Generate hourly time slots from 9 AM to 5 PM (1-hour intervals)
    const generateTimeSlots = () => {
        const slots = [];
        for (let hour = 9; hour <= 17; hour++) {
            slots.push(`${hour.toString().padStart(2, '0')}:00`);
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // Helper function to check if current time is within class time
    const isCurrentTimeInSlot = (startTime: string, endTime: string) => {
        const now = currentTime;
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

        return currentTimeString >= startTime && currentTimeString <= endTime;
    };

    // Helper function to check if current day matches class day
    const isCurrentDay = (classDay: string) => {
        const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
        return currentDay === classDay;
    };

    // Helper function to check if an hour slot is occupied by a class or break
    const isHourSlotOccupied = (day: string, hourSlot: string, entry: TimetableEntry | BreakEntry) => {
        if (entry.day !== day) return false;

        const slotHour = parseInt(hourSlot.split(':')[0]);
        const startHour = parseInt(entry.start_time.split(':')[0]);
        const endHour = parseInt(entry.end_time.split(':')[0]);
        const endMinute = parseInt(entry.end_time.split(':')[1]);

        // If class/break ends at exactly the hour (e.g., 10:00), don't include that hour
        const actualEndHour = endMinute === 0 ? endHour - 1 : endHour;

        return slotHour >= startHour && slotHour <= actualEndHour;
    };

    // Get the entry (class or break) for a specific day and hour slot
    const getEntryForSlot = (day: string, hourSlot: string) => {
        return enhancedTimetableData.find(entry => isHourSlotOccupied(day, hourSlot, entry));
    };

    // Check if faculty can mark attendance for a specific class (not applicable to breaks)
    const canMarkAttendance = (entry: TimetableEntry | BreakEntry) => {
        if (isBreakEntry(entry)) return false; // Can't mark attendance for breaks
        const classEntry = entry as TimetableEntry;
        if (user?.role !== 'faculty') return false;
        if (user?.id !== classEntry.faculty_id) return false;
        if (!isCurrentDay(classEntry.day)) return false;
        if (!isCurrentTimeInSlot(classEntry.start_time, classEntry.end_time)) return false;
        return true;
    };

    // Handle clicking on an occupied cell (edit entry) - only for regular classes
    const handleCellClick = useCallback((entry: TimetableEntry | BreakEntry) => {
        if (isBreakEntry(entry)) {
            // Handle break entry click - show break info
            toast({
                title: entry.break_name,
                description: `${entry.room} | ${formatTime(entry.start_time)} - ${formatTime(entry.end_time)}`,
            });
            return;
        }

        const classEntry = entry as TimetableEntry;
        if (isAdminMode && onEditEntry) {
            console.log('Cell clicked - editing entry:', classEntry);
            onEditEntry(classEntry);
        } else if (!isAdminMode) {
            // Show entry details for non-admin users
            toast({
                title: classEntry.course_name,
                description: `${classEntry.room} | ${formatTime(classEntry.start_time)} - ${formatTime(classEntry.end_time)}${classEntry.faculty_name ? ` | ${classEntry.faculty_name}` : ''}`,
            });
        }
    }, [isAdminMode, onEditEntry, toast]);

    // Handle clicking on an empty cell (create new entry) - optimized with useCallback
    const handleEmptyCellClick = useCallback((day: string, timeSlot: string) => {
        if (isAdminMode && onCreateEntry) {
            console.log('Empty cell clicked - creating entry for:', day, timeSlot);
            onCreateEntry(day, timeSlot);
        } else if (!isAdminMode) {
            toast({
                title: "Free Time Slot",
                description: `${day} at ${formatHourSlot(timeSlot)} is available`,
            });
        }
    }, [isAdminMode, onCreateEntry, toast]);

    const handleMarkAttendance = useCallback((timetableId: number) => {
        if (onMarkAttendance) {
            onMarkAttendance(timetableId);
        } else {
            toast({
                title: "Attendance Marked",
                description: "Attendance has been successfully marked for this class.",
            });
        }
    }, [onMarkAttendance, toast]);

    // Helper function to format time for display
    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Helper function to format hour slot display
    const formatHourSlot = (hourSlot: string) => {
        const hour = parseInt(hourSlot.split(':')[0]);
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour12} ${ampm}`;
    };

    // Helper function to determine if current time slot is active
    const isCurrentTimeSlot = (hourSlot: string) => {
        const currentHour = currentTime.getHours();
        const slotHour = parseInt(hourSlot.split(':')[0]);
        return currentHour === slotHour;
    };

    // Get unique faculty colors for better visualization - dark mode optimized
    const getFacultyColor = (facultyId: number) => {
        const colors = [
            'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200',
            'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200',
            'bg-purple-100 dark:bg-purple-900 border-purple-500 text-purple-800 dark:text-purple-200',
            'bg-orange-100 dark:bg-orange-900 border-orange-500 text-orange-800 dark:text-orange-200',
            'bg-pink-100 dark:bg-pink-900 border-pink-500 text-pink-800 dark:text-pink-200',
            'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 text-indigo-800 dark:text-indigo-200',
            'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200',
            'bg-yellow-100 dark:bg-yellow-900 border-yellow-500 text-yellow-800 dark:text-yellow-200'
        ];
        return colors[facultyId % colors.length];
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Weekly Timetable Grid
                    {isAdminMode && (
                        <Badge variant="secondary" className="ml-2">
                            Admin Mode
                        </Badge>
                    )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Each cell represents 1 hour. Highlighted cells show scheduled classes.
                    {isAdminMode && " Click on cells to edit or create entries."}
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-full">
                        {/* Desktop/Tablet View */}
                        <div className="hidden md:block">
                            {/* Header Row */}
                            <div className="grid grid-cols-8 gap-2 mb-4">
                                {/* Time column header */}
                                <div className="p-3 font-semibold text-center bg-muted rounded-lg">
                                    <Clock className="h-4 w-4 mx-auto mb-1" />
                                    Time
                                </div>

                                {/* Day headers */}
                                {weekdays.map(day => {
                                    const isToday = isCurrentDay(day);
                                    return (
                                        <div
                                            key={day}
                                            className={`p-3 font-semibold text-center rounded-lg ${isToday
                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700'
                                                : 'bg-muted'
                                                }`}
                                        >
                                            {day.slice(0, 3)}
                                            {isToday && (
                                                <Badge variant="secondary" className="ml-1 text-xs">
                                                    Today
                                                </Badge>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Time Slots Grid */}
                            {timeSlots.map(hourSlot => {
                                const isCurrentHour = isCurrentTimeSlot(hourSlot);

                                return (
                                    <div key={hourSlot} className="grid grid-cols-8 gap-2 mb-2">
                                        {/* Time column */}
                                        <div className={`p-3 text-sm font-medium text-center rounded-lg flex items-center justify-center ${isCurrentHour
                                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
                                            : 'bg-muted/50'
                                            }`}>
                                            {formatHourSlot(hourSlot)}
                                        </div>

                                        {/* Day columns */}
                                        {weekdays.map(day => {
                                            const entry = getEntryForSlot(day, hourSlot);
                                            const isCurrentCell = isCurrentHour && isCurrentDay(day);

                                            if (entry) {
                                                if (isBreakEntry(entry)) {
                                                    // Render break entry
                                                    const breakStyle = breakColors[entry.break_name as keyof typeof breakColors] || breakColors['Lunch Break']
                                                    const BreakIcon = breakStyle.icon

                                                    return (
                                                        <div
                                                            key={`${day}-${hourSlot}`}
                                                            className={`p-2 border-2 rounded-lg transition-colors cursor-pointer relative ${breakStyle.bg} ${breakStyle.border} ${breakStyle.text} ${isCurrentCell ? 'ring-2 ring-orange-400 dark:ring-orange-600' : ''}`}
                                                            title={`${entry.break_name} - ${entry.room} (${formatTime(entry.start_time)} - ${formatTime(entry.end_time)})`}
                                                            onClick={() => handleCellClick(entry)}
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-xs leading-tight flex items-center gap-1">
                                                                    <BreakIcon className="h-3 w-3" />
                                                                    {entry.break_name}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs opacity-80">
                                                                    <MapPin className="h-2.5 w-2.5" />
                                                                    {entry.room}
                                                                </div>
                                                                <div className="text-xs opacity-70">
                                                                    {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                } else {
                                                    // Render regular class entry
                                                    const classEntry = entry as TimetableEntry;
                                                    const facultyColorClass = getFacultyColor(classEntry.faculty_id);
                                                    const canMark = canMarkAttendance(classEntry);

                                                    return (
                                                        <div
                                                            key={`${day}-${hourSlot}`}
                                                            className={`p-2 border-2 rounded-lg transition-colors hover:shadow-sm cursor-pointer relative ${facultyColorClass} ${isCurrentCell ? 'ring-2 ring-green-400 dark:ring-green-600' : ''} ${isAdminMode ? 'hover:opacity-80' : ''}`}
                                                            title={`${classEntry.course_name} - ${classEntry.room} (${formatTime(classEntry.start_time)} - ${formatTime(classEntry.end_time)})${isAdminMode ? ' - Click to edit' : ''}`}
                                                            onClick={() => handleCellClick(classEntry)}
                                                        >
                                                            {/* Admin edit indicator */}
                                                            {isAdminMode && (
                                                                <div className="absolute top-1 right-1 opacity-60">
                                                                    <Edit className="h-3 w-3 text-gray-600" />
                                                                </div>
                                                            )}

                                                            {/* Attendance status indicator */}
                                                            {classEntry.attendance_marked && (
                                                                <div className="absolute top-1 left-1">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full" title="Attendance marked"></div>
                                                                </div>
                                                            )}

                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-xs leading-tight">
                                                                    {classEntry.course_name}
                                                                </div>
                                                                <div className="flex items-center gap-1 text-xs opacity-80">
                                                                    <MapPin className="h-2.5 w-2.5" />
                                                                    {classEntry.room}
                                                                </div>
                                                                {classEntry.faculty_name && (
                                                                    <div className="flex items-center gap-1 text-xs opacity-80">
                                                                        <User className="h-2.5 w-2.5" />
                                                                        {classEntry.faculty_name}
                                                                    </div>
                                                                )}
                                                                <div className="text-xs opacity-70">
                                                                    {formatTime(classEntry.start_time)} - {formatTime(classEntry.end_time)}
                                                                </div>

                                                                {canMark && !isAdminMode && (
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleMarkAttendance(classEntry.timetable_id);
                                                                        }}
                                                                        className="w-full text-xs h-6 mt-1"
                                                                        variant="secondary"
                                                                    >
                                                                        <UserCheck className="h-2.5 w-2.5 mr-1" />
                                                                        Mark
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                            }

                                            return (
                                                <div
                                                    key={`${day}-${hourSlot}`}
                                                    className={`p-2 border border-dashed border-muted-foreground/20 rounded-lg bg-background/50 transition-colors cursor-pointer relative ${isCurrentCell ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''
                                                        } ${isAdminMode
                                                            ? 'hover:bg-muted/50 hover:border-primary/50'
                                                            : 'hover:bg-muted/30'
                                                        }`}
                                                    title={isAdminMode ? `Click to add class on ${day} at ${formatHourSlot(hourSlot)}` : `Free time slot: ${day} at ${formatHourSlot(hourSlot)}`}
                                                    onClick={() => handleEmptyCellClick(day, hourSlot)}
                                                >
                                                    {/* Admin add indicator */}
                                                    {isAdminMode && (
                                                        <div className="absolute top-1 right-1 opacity-60">
                                                            <Plus className="h-3 w-3 text-gray-600" />
                                                        </div>
                                                    )}

                                                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                                        {isAdminMode ? (
                                                            <div className="text-center">
                                                                <Plus className="h-4 w-4 mx-auto mb-1 opacity-50" />
                                                                <span className="opacity-60">Add Class</span>
                                                            </div>
                                                        ) : (
                                                            'Free'
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile View */}
                        <div className="md:hidden space-y-4">
                            {weekdays.map(day => {
                                const dayClasses = timetableData.filter(entry => entry.day === day);
                                const isToday = isCurrentDay(day);

                                return (
                                    <Card key={day} className="w-full">
                                        <CardHeader className="pb-3">
                                            <CardTitle className={`text-lg flex items-center gap-2 ${isToday ? 'text-blue-800 dark:text-blue-200' : ''
                                                }`}>
                                                {day}
                                                {isToday && (
                                                    <Badge variant="default" className="text-xs">
                                                        Today
                                                    </Badge>
                                                )}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-3 gap-2">
                                                {timeSlots.map(hourSlot => {
                                                    const entry = getEntryForSlot(day, hourSlot);
                                                    const isCurrentHour = isCurrentTimeSlot(hourSlot);

                                                    if (entry) {
                                                        // Check if this is a break entry or regular timetable entry
                                                        if (isBreakEntry(entry)) {
                                                            // Handle break entry in mobile view
                                                            const breakStyle = breakColors[entry.break_name as keyof typeof breakColors] || defaultBreakStyle
                                                            const BreakIcon = breakStyle.icon

                                                            return (
                                                                <div
                                                                    key={`${day}-${hourSlot}`}
                                                                    className={`p-2 border-2 rounded-lg ${breakStyle.bg} ${breakStyle.border} ${isCurrentHour && isToday ? 'ring-2 ring-orange-400 dark:ring-orange-600' : ''}`}
                                                                >
                                                                    <div className="space-y-1">
                                                                        <div className="text-xs font-medium opacity-70">
                                                                            {formatHourSlot(hourSlot)}
                                                                        </div>
                                                                        <div className={`font-semibold text-xs ${breakStyle.text} flex items-center gap-1`}>
                                                                            <BreakIcon className="w-3 h-3" />
                                                                            {entry.break_name}
                                                                        </div>
                                                                        <div className={`text-xs ${breakStyle.text} opacity-80`}>
                                                                            {entry.room}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        // Handle regular timetable entry
                                                        const timetableEntry = entry as TimetableEntry;
                                                        const facultyColorClass = getFacultyColor(timetableEntry.faculty_id);
                                                        const canMark = canMarkAttendance(timetableEntry);

                                                        return (
                                                            <div
                                                                key={`${day}-${hourSlot}`}
                                                                className={`p-2 border-2 rounded-lg cursor-pointer relative ${facultyColorClass} ${isCurrentHour && isToday ? 'ring-2 ring-green-400 dark:ring-green-600' : ''
                                                                    } ${isAdminMode ? 'hover:opacity-80' : ''}`}
                                                                onClick={() => handleCellClick(timetableEntry)}
                                                            >
                                                                {/* Admin edit indicator */}
                                                                {isAdminMode && (
                                                                    <div className="absolute top-1 right-1 opacity-60">
                                                                        <Edit className="h-3 w-3 text-gray-600" />
                                                                    </div>
                                                                )}

                                                                {/* Attendance status indicator */}
                                                                {timetableEntry.attendance_marked && (
                                                                    <div className="absolute top-1 left-1">
                                                                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Attendance marked"></div>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-1">
                                                                    <div className="text-xs font-medium opacity-70">
                                                                        {formatHourSlot(hourSlot)}
                                                                    </div>
                                                                    <div className="font-semibold text-xs">
                                                                        {timetableEntry.course_name}
                                                                    </div>
                                                                    <div className="text-xs opacity-80">
                                                                        {timetableEntry.room}
                                                                    </div>
                                                                    {canMark && !isAdminMode && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleMarkAttendance(timetableEntry.timetable_id);
                                                                            }}
                                                                            className="w-full text-xs h-6"
                                                                            variant="secondary"
                                                                        >
                                                                            <UserCheck className="h-2.5 w-2.5 mr-1" />
                                                                            Mark
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div
                                                            key={`${day}-${hourSlot}`}
                                                            className={`p-2 border border-dashed border-muted-foreground/20 rounded-lg bg-background/50 cursor-pointer relative ${isCurrentHour && isToday ? 'ring-2 ring-green-400 dark:ring-green-600' : ''
                                                                } ${isAdminMode
                                                                    ? 'hover:bg-muted/50 hover:border-green-400 dark:hover:border-green-600'
                                                                    : ''
                                                                }`}
                                                            onClick={() => handleEmptyCellClick(day, hourSlot)}
                                                        >
                                                            {/* Admin add indicator */}
                                                            {isAdminMode && (
                                                                <div className="absolute top-1 right-1 opacity-60">
                                                                    <Plus className="h-3 w-3 text-gray-600" />
                                                                </div>
                                                            )}

                                                            <div className="text-xs text-muted-foreground text-center">
                                                                {formatHourSlot(hourSlot)}
                                                                <br />
                                                                <span className="opacity-60">
                                                                    {isAdminMode ? 'Add' : 'Free'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {dayClasses.length === 0 && (
                                                <div className="text-center text-muted-foreground py-8">
                                                    No classes scheduled
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-3">Legend:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                            <span>Current time slot</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 rounded"></div>
                            <span>Today's column</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-100 dark:bg-green-900 border-2 border-green-400 dark:border-green-600 rounded"></div>
                            <span>Can mark attendance</span>
                        </div>
                        {isAdminMode && (
                            <>
                                <div className="flex items-center gap-2">
                                    <Edit className="h-4 w-4 text-muted-foreground" />
                                    <span>Click occupied cells to edit</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                    <span>Click empty cells to add</span>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                        <span className="font-medium">Note:</span> Each colored cell represents a 1-hour time slot occupied by a faculty member.
                        {isAdminMode && " Click on any cell to edit existing classes or add new ones."}
                        {!isAdminMode && " Hover over cells on desktop to see full details."}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default Timetable; 