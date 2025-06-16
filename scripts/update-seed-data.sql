-- Updated seed data with correct password hashes
-- All users have password: "password"

-- Drop existing data if it exists
DELETE FROM submissions;
DELETE FROM attendance;
DELETE FROM announcements;
DELETE FROM assignments;
DELETE FROM enrollments;
DELETE FROM courses;
DELETE FROM users;

-- Reset sequences
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE courses_id_seq RESTART WITH 1;
ALTER SEQUENCE assignments_id_seq RESTART WITH 1;
ALTER SEQUENCE submissions_id_seq RESTART WITH 1;
ALTER SEQUENCE attendance_id_seq RESTART WITH 1;
ALTER SEQUENCE announcements_id_seq RESTART WITH 1;
ALTER SEQUENCE enrollments_id_seq RESTART WITH 1;

-- Insert sample users with correct password hashes
-- Password for all users is "password"
INSERT INTO users (email, password_hash, full_name, role, department) VALUES
('john.doe@presidency.edu', '$2b$10$cGFzc3dvcmRmNUFWMGJjbmUxMndQY0FtRUFJR09LN1lXNnJTbnAwZ21ScHFWRjA1S1ZJPXBhc3N3b3Jk', 'John Doe', 'student', 'Computer Science'),
('jane.smith@presidency.edu', '$2b$10$cGFzc3dvcmRmNUFWMGJjbmUxMndQY0FtRUFJR09LN1lXNnJTbnAwZ21ScHFWRjA1S1ZJPXBhc3N3b3Jk', 'Jane Smith', 'student', 'Information Technology'),
('dr.sarah@presidency.edu', '$2b$10$cGFzc3dvcmRmNUFWMGJjbmUxMndQY0FtRUFJR09LN1lXNnJTbnAwZ21ScHFWRjA1S1ZJPXBhc3N3b3Jk', 'Dr. Sarah Johnson', 'faculty', 'Computer Science'),
('prof.mike@presidency.edu', '$2b$10$cGFzc3dvcmRmNUFWMGJjbmUxMndQY0FtRUFJR09LN1lXNnJTbnAwZ21ScHFWRjA1S1ZJPXBhc3N3b3Jk', 'Prof. Michael Brown', 'faculty', 'Information Technology'),
('admin@presidency.edu', '$2b$10$cGFzc3dvcmRmNUFWMGJjbmUxMndQY0FtRUFJR09LN1lXNnJTbnAwZ21ScHFWRjA1S1ZJPXBhc3N3b3Jk', 'Admin User', 'admin', 'Administration');

-- Insert sample courses
INSERT INTO courses (code, name, description, credits, faculty_id) VALUES
('CS201', 'Data Structures & Algorithms', 'Fundamental data structures and algorithms', 4, 3),
('CS301', 'Database Management Systems', 'Database design and management', 3, 3),
('IT401', 'Web Development', 'Modern web development technologies', 3, 4),
('CS401', 'Machine Learning', 'Introduction to machine learning', 4, 3);

-- Insert sample enrollments
INSERT INTO enrollments (student_id, course_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 3), (2, 4);

-- Insert sample assignments
INSERT INTO assignments (title, description, course_id, faculty_id, due_date, max_marks) VALUES
('Binary Search Tree Implementation', 'Implement BST with all operations', 1, 3, '2024-12-15 23:59:00', 100),
('Database Design Project', 'Design a complete database schema', 2, 3, '2024-12-20 23:59:00', 100),
('React Portfolio Website', 'Create a personal portfolio using React', 3, 4, '2024-12-25 23:59:00', 100);

-- Insert sample submissions
INSERT INTO submissions (assignment_id, student_id, file_url, grade, feedback) VALUES
(1, 1, '/uploads/john_bst.zip', 85, 'Good implementation, minor optimization needed'),
(2, 1, '/uploads/john_db.pdf', 92, 'Excellent database design'),
(3, 2, '/uploads/jane_portfolio.zip', 88, 'Great UI design, good functionality');

-- Insert sample attendance (using recent dates)
INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES
(1, 1, '2024-12-10', 'present', 3),
(1, 1, '2024-12-11', 'present', 3),
(1, 1, '2024-12-12', 'absent', 3),
(1, 2, '2024-12-10', 'present', 3),
(2, 1, '2024-12-10', 'present', 3),
(2, 3, '2024-12-11', 'present', 4);

-- Insert sample announcements
INSERT INTO announcements (title, message, author_id, recipient) VALUES
('Mid-term Examination Schedule', 'Mid-term exams will be conducted from Dec 20-25. Please check your individual schedules.', 5, 'all'),
('Library Extended Hours', 'Library will remain open until 10 PM during exam period.', 5, 'student'),
('Faculty Meeting', 'Department meeting scheduled for tomorrow at 3 PM.', 5, 'faculty'); 