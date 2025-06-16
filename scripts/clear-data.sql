-- Clear existing data but preserve admin user
-- Delete in correct order to maintain referential integrity

-- Clear attendance records
DELETE FROM attendance;

-- Clear submissions
DELETE FROM submissions;

-- Clear assignments
DELETE FROM assignments;

-- Clear enrollments
DELETE FROM enrollments;

-- Clear courses
DELETE FROM courses;

-- Clear announcements
DELETE FROM announcements;

-- Clear all users except admin
DELETE FROM users WHERE role != 'admin';

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 2;
ALTER SEQUENCE courses_id_seq RESTART WITH 1;
ALTER SEQUENCE enrollments_id_seq RESTART WITH 1;
ALTER SEQUENCE assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE submissions_id_seq RESTART WITH 1;
ALTER SEQUENCE attendance_id_seq RESTART WITH 1;
ALTER SEQUENCE announcements_id_seq RESTART WITH 1;

-- Ensure admin user exists with known password
INSERT INTO users (id, email, password_hash, full_name, role, department) 
VALUES (1, 'admin@presidency.edu', '$2b$10$hash5', 'Admin User', 'admin', 'Administration')
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    department = EXCLUDED.department; 