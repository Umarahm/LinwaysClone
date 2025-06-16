-- Migration: Add timetable_id to attendance table
-- This allows tracking attendance for specific class sessions

-- First, add the timetable_id column
ALTER TABLE attendance 
ADD COLUMN timetable_id INTEGER REFERENCES timetable(id);

-- Drop the old unique constraint
ALTER TABLE attendance 
DROP CONSTRAINT IF EXISTS attendance_student_id_course_id_date_key;

-- Add new unique constraint that includes timetable_id
ALTER TABLE attendance 
ADD CONSTRAINT attendance_student_id_course_id_date_timetable_id_key 
UNIQUE(student_id, course_id, date, timetable_id);

-- Update existing records to have timetable_id 
-- This is a best-effort update - in production you'd need to handle this more carefully
UPDATE attendance 
SET timetable_id = (
    SELECT t.id 
    FROM timetable t 
    WHERE t.course_id = attendance.course_id 
    AND t.faculty_id = attendance.marked_by
    LIMIT 1
)
WHERE timetable_id IS NULL; 