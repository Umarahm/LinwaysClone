'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Plus,
    Edit,
    Trash2,
    Search,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Grid3X3,
    Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTimetableByUser, deleteTimetableSlot, getTimetableAttendanceStatus, TimetableEntry } from '@/lib/timetable-actions';

interface ExtendedTimetableEntry extends TimetableEntry {
    attendance_marked?: boolean;
    marked_by?: number;
    marked_by_name?: string;
}
import { TimetableForm } from '@/components/admin/timetable-form';
import Timetable from '@/components/timetable';

const ITEMS_PER_PAGE = 10;

export function TimetableSidebar() {
    const [timetableEntries, setTimetableEntries] = useState<ExtendedTimetableEntry[]>([]);
    const [filteredEntries, setFilteredEntries] = useState<ExtendedTimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [formOpen, setFormOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchTimetableData();
    }, []);

    useEffect(() => {
        // Filter entries based on search term
        const filtered = timetableEntries.filter(entry =>
            entry.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.faculty_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.day.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEntries(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [searchTerm, timetableEntries]);

    const fetchTimetableData = async () => {
        try {
            setLoading(true);
            const data = await getTimetableAttendanceStatus();
            setTimetableEntries(data as any[]);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load timetable data',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (entry: TimetableEntry) => {
        setEditingEntry({
            id: entry.id,
            course_id: entry.course_id,
            faculty_id: entry.faculty_id,
            day: entry.day,
            start_time: entry.start_time,
            end_time: entry.end_time,
            room: entry.room
        });
        setFormOpen(true);
    };

    const handleDelete = async (id: number, courseName: string) => {
        if (!window.confirm(`Are you sure you want to delete the timetable slot for "${courseName}"?`)) {
            return;
        }

        try {
            const result = await deleteTimetableSlot(id);
            if (result.success) {
                toast({
                    title: 'Success',
                    description: result.message
                });
                fetchTimetableData(); // Refresh the data
            } else {
                toast({
                    title: 'Error',
                    description: result.message,
                    variant: 'destructive'
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete timetable slot',
                variant: 'destructive'
            });
        }
    };

    const handleFormSuccess = () => {
        setEditingEntry(null);
        fetchTimetableData();
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
    };

    // Dark mode optimized day badge colors
    const getDayBadgeColor = (day: string) => {
        const colors: { [key: string]: string } = {
            'Monday': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            'Tuesday': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            'Wednesday': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
            'Thursday': 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            'Friday': 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            'Saturday': 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200',
            'Sunday': 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
        };
        return colors[day] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    };

    // Transform timetable entries for the grid component
    const transformedTimetableData = timetableEntries.map(entry => ({
        timetable_id: entry.id,
        day: entry.day,
        start_time: entry.start_time,
        end_time: entry.end_time,
        course_name: entry.course_name,
        room: entry.room,
        faculty_id: entry.faculty_id,
        faculty_name: entry.faculty_name
    }));

    // Pagination logic
    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentEntries = filteredEntries.slice(startIndex, endIndex);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg text-muted-foreground">Loading timetable data...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        Timetable Management
                    </h2>
                    <p className="text-muted-foreground">
                        View the weekly timetable grid and manage class schedules, time slots, and room assignments
                    </p>
                </div>
            </div>

            {/* Shared Dialog for both Grid and Management */}
            <Dialog open={formOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingEntry && editingEntry.id > 0 ? 'Edit Timetable Slot' : 'Add New Timetable Slot'}
                        </DialogTitle>
                    </DialogHeader>
                    <TimetableForm
                        open={formOpen}
                        onOpenChange={setFormOpen}
                        editingEntry={editingEntry}
                        onSuccess={handleFormSuccess}
                    />
                </DialogContent>
            </Dialog>

            {/* Tabs for Grid View and Management View */}
            <Tabs defaultValue="grid" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="grid" className="flex items-center gap-2">
                        <Grid3X3 className="h-4 w-4" />
                        Grid View
                    </TabsTrigger>
                    <TabsTrigger value="management" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Management
                    </TabsTrigger>
                </TabsList>

                {/* Grid View Tab */}
                <TabsContent value="grid" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Weekly Timetable Grid</h3>
                            <p className="text-sm text-muted-foreground">
                                Visual representation of all scheduled classes with faculty color coding. Click cells to edit or add classes.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    setEditingEntry(null);
                                    setFormOpen(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Add Class
                            </Button>
                            <Button
                                onClick={fetchTimetableData}
                                variant="outline"
                                size="sm"
                            >
                                Refresh
                            </Button>
                        </div>
                    </div>

                    {/* Grid Timetable Component */}
                    <Timetable
                        timetableData={transformedTimetableData}
                        isAdminMode={true}
                        onEditEntry={(entry) => {
                            console.log('Edit entry clicked:', entry);
                            // Transform the grid entry back to edit format
                            const editEntry = timetableEntries.find(e => e.id === entry.timetable_id);
                            if (editEntry) {
                                console.log('Found edit entry:', editEntry);
                                setEditingEntry({
                                    id: editEntry.id,
                                    course_id: editEntry.course_id,
                                    faculty_id: editEntry.faculty_id,
                                    day: editEntry.day,
                                    start_time: editEntry.start_time,
                                    end_time: editEntry.end_time,
                                    room: editEntry.room
                                });
                                setFormOpen(true);
                            } else {
                                console.error('Could not find edit entry for timetable_id:', entry.timetable_id);
                                toast({
                                    title: "Error",
                                    description: "Could not find timetable entry to edit.",
                                    variant: "destructive"
                                });
                            }
                        }}
                        onCreateEntry={(day, timeSlot) => {
                            console.log('Create entry clicked:', day, timeSlot);
                            // Create new entry with pre-filled day and time
                            const endHour = parseInt(timeSlot.split(':')[0]) + 1;
                            const endTime = `${endHour.toString().padStart(2, '0')}:00`;

                            setEditingEntry({
                                id: 0, // 0 indicates new entry
                                course_id: 0,
                                faculty_id: 0,
                                day: day,
                                start_time: timeSlot,
                                end_time: endTime,
                                room: ''
                            });
                            setFormOpen(true);
                        }}
                        onMarkAttendance={() => {
                            toast({
                                title: "Admin View",
                                description: "Attendance marking is only available for faculty members during their class times.",
                            });
                        }}
                    />
                </TabsContent>

                {/* Management View Tab */}
                <TabsContent value="management" className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold">Timetable Administration</h3>
                            <p className="text-sm text-muted-foreground">
                                Add, edit, and delete timetable slots using the table interface
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                setEditingEntry(null);
                                setFormOpen(true);
                            }}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Timetable Slot
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{timetableEntries.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Active timetable entries
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Unique Courses</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {new Set(timetableEntries.map(e => e.course_id)).size}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Courses with schedules
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Active Faculty</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {new Set(timetableEntries.map(e => e.faculty_id)).size}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Faculty with schedules
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {timetableEntries.filter(e => {
                                        const today = new Date();
                                        const currentDay = today.toLocaleDateString('en-US', { weekday: 'long' });
                                        return e.day === currentDay;
                                    }).length}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Classes today
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Search and Filter */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by course, faculty, room, or day..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Button
                            onClick={() => setSearchTerm('')}
                            variant="outline"
                            disabled={!searchTerm}
                        >
                            Clear
                        </Button>
                    </div>

                    {/* Timetable Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Timetable Entries
                                {searchTerm && (
                                    <span className="text-sm font-normal text-muted-foreground ml-2">
                                        (Filtered: {filteredEntries.length} of {timetableEntries.length})
                                    </span>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {currentEntries.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    {searchTerm ? 'No entries found matching your search.' : 'No timetable entries found.'}
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Faculty</TableHead>
                                                <TableHead>Day</TableHead>
                                                <TableHead>Time</TableHead>
                                                <TableHead>Room</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {currentEntries.map((entry) => (
                                                <TableRow key={entry.id}>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium">{entry.course_name}</div>
                                                            <div className="text-sm text-muted-foreground">{entry.course_code}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                            {entry.faculty_name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getDayBadgeColor(entry.day)}>
                                                            {entry.day}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                                            <span className="text-sm">
                                                                {formatTime(entry.start_time)} - {formatTime(entry.end_time)}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                                            {entry.room}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(entry)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(entry.id, entry.course_name)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between space-x-2 py-4">
                                            <div className="text-sm text-muted-foreground">
                                                Showing {startIndex + 1} to {Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length} entries
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handlePreviousPage}
                                                    disabled={currentPage === 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                    Previous
                                                </Button>
                                                <div className="text-sm">
                                                    Page {currentPage} of {totalPages}
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 