'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { createTimetableSlot, updateTimetableSlot, getCourses, getFaculty, TimetableFormData } from '@/lib/timetable-actions';
import { Loader2 } from 'lucide-react';

interface Course {
    id: number;
    code: string;
    name: string;
}

interface Faculty {
    id: number;
    full_name: string;
    department: string;
}

interface TimetableFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingEntry?: {
        id: number;
        course_id: number;
        faculty_id: number;
        day: string;
        start_time: string;
        end_time: string;
        room: string;
    } | null;
    onSuccess: () => void;
}

const weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
];

export function TimetableForm({ open, onOpenChange, editingEntry, onSuccess }: TimetableFormProps) {
    const [formData, setFormData] = useState<TimetableFormData>({
        course_id: 0,
        faculty_id: 0,
        day: '',
        start_time: '',
        end_time: '',
        room: ''
    });
    const [courses, setCourses] = useState<Course[]>([]);
    const [faculty, setFaculty] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [errors, setErrors] = useState<Partial<TimetableFormData>>({});
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadFormData();
            if (editingEntry) {
                setFormData({
                    course_id: editingEntry.course_id,
                    faculty_id: editingEntry.faculty_id,
                    day: editingEntry.day,
                    start_time: editingEntry.start_time,
                    end_time: editingEntry.end_time,
                    room: editingEntry.room
                });
            } else {
                setFormData({
                    course_id: 0,
                    faculty_id: 0,
                    day: '',
                    start_time: '',
                    end_time: '',
                    room: ''
                });
            }
            setErrors({});
        }
    }, [open, editingEntry]);

    const loadFormData = async () => {
        try {
            setDataLoading(true);
            const [coursesData, facultyData] = await Promise.all([
                getCourses(),
                getFaculty()
            ]);
            setCourses(coursesData as Course[]);
            setFaculty(facultyData as Faculty[]);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load form data',
                variant: 'destructive'
            });
        } finally {
            setDataLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<TimetableFormData> = {};

        if (!formData.course_id) {
            newErrors.course_id = 'Course is required' as any;
        }
        if (!formData.faculty_id) {
            newErrors.faculty_id = 'Faculty is required' as any;
        }
        if (!formData.day) {
            newErrors.day = 'Day is required';
        }
        if (!formData.start_time) {
            newErrors.start_time = 'Start time is required';
        }
        if (!formData.end_time) {
            newErrors.end_time = 'End time is required';
        }
        if (!formData.room.trim()) {
            newErrors.room = 'Room is required';
        }

        // Validate time logic
        if (formData.start_time && formData.end_time) {
            if (formData.start_time >= formData.end_time) {
                newErrors.end_time = 'End time must be after start time';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            let result;
            if (editingEntry && editingEntry.id > 0) {
                result = await updateTimetableSlot(editingEntry.id, formData);
            } else {
                result = await createTimetableSlot(formData);
            }

            if (result.success) {
                toast({
                    title: 'Success',
                    description: result.message
                });
                onOpenChange(false);
                onSuccess();
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
                description: 'An unexpected error occurred',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: keyof TimetableFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    if (dataLoading) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Loading...</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {editingEntry ? 'Edit Timetable Entry' : 'Create New Timetable Entry'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Course Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="course">Course *</Label>
                        <Select
                            value={formData.course_id.toString()}
                            onValueChange={(value) => handleInputChange('course_id', parseInt(value))}
                        >
                            <SelectTrigger className={errors.course_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                            <SelectContent>
                                {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id.toString()}>
                                        {course.code} - {course.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.course_id && (
                            <p className="text-sm text-destructive">{errors.course_id}</p>
                        )}
                    </div>

                    {/* Faculty Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="faculty">Faculty *</Label>
                        <Select
                            value={formData.faculty_id.toString()}
                            onValueChange={(value) => handleInputChange('faculty_id', parseInt(value))}
                        >
                            <SelectTrigger className={errors.faculty_id ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select a faculty member" />
                            </SelectTrigger>
                            <SelectContent>
                                {faculty.map((member) => (
                                    <SelectItem key={member.id} value={member.id.toString()}>
                                        {member.full_name} ({member.department})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.faculty_id && (
                            <p className="text-sm text-destructive">{errors.faculty_id}</p>
                        )}
                    </div>

                    {/* Day Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="day">Day *</Label>
                        <Select
                            value={formData.day}
                            onValueChange={(value) => handleInputChange('day', value)}
                        >
                            <SelectTrigger className={errors.day ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select a day" />
                            </SelectTrigger>
                            <SelectContent>
                                {weekdays.map((day) => (
                                    <SelectItem key={day} value={day}>
                                        {day}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.day && (
                            <p className="text-sm text-destructive">{errors.day}</p>
                        )}
                    </div>

                    {/* Time Selection */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start_time">Start Time *</Label>
                            <Input
                                id="start_time"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => handleInputChange('start_time', e.target.value)}
                                className={errors.start_time ? 'border-destructive' : ''}
                            />
                            {errors.start_time && (
                                <p className="text-sm text-destructive">{errors.start_time}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="end_time">End Time *</Label>
                            <Input
                                id="end_time"
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => handleInputChange('end_time', e.target.value)}
                                className={errors.end_time ? 'border-destructive' : ''}
                            />
                            {errors.end_time && (
                                <p className="text-sm text-destructive">{errors.end_time}</p>
                            )}
                        </div>
                    </div>

                    {/* Room */}
                    <div className="space-y-2">
                        <Label htmlFor="room">Room *</Label>
                        <Input
                            id="room"
                            type="text"
                            placeholder="e.g., CS-101, Lab-A, etc."
                            value={formData.room}
                            onChange={(e) => handleInputChange('room', e.target.value)}
                            className={errors.room ? 'border-destructive' : ''}
                        />
                        {errors.room && (
                            <p className="text-sm text-destructive">{errors.room}</p>
                        )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    {editingEntry ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                editingEntry ? 'Update Entry' : 'Create Entry'
                            )}
                        </Button>
                    </div>
                </form>

                {/* Validation Info */}
                <div className="mt-4 p-3 bg-muted rounded-md">
                    <h4 className="text-sm font-medium mb-2">Validation Notes:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• All fields marked with * are required</li>
                        <li>• End time must be after start time</li>
                        <li>• The system will check for scheduling conflicts</li>
                        <li>• Faculty and room conflicts will be prevented</li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
} 