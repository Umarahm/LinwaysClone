-- Create course_faculty junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS course_faculty (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    faculty_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN DEFAULT FALSE,
    UNIQUE(course_id, faculty_id)
);

-- Migrate existing data from courses.faculty_id to course_faculty table
INSERT INTO course_faculty (course_id, faculty_id, is_primary)
SELECT id, faculty_id, TRUE
FROM courses 
WHERE faculty_id IS NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_course_faculty_course_id ON course_faculty(course_id);
CREATE INDEX IF NOT EXISTS idx_course_faculty_faculty_id ON course_faculty(faculty_id);

-- We'll keep the faculty_id column for now for backward compatibility
-- In a real migration, you might want to drop it after ensuring everything works
-- ALTER TABLE courses DROP COLUMN faculty_id; 