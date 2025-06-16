-- Insert sample users
INSERT INTO users (email, password_hash, full_name, role, department) VALUES
('john.doe@presidency.edu', '$2b$10$hash1', 'John Doe', 'student', 'Computer Science'),
('jane.smith@presidency.edu', '$2b$10$hash2', 'Jane Smith', 'student', 'Information Technology'),
('dr.sarah@presidency.edu', '$2b$10$hash3', 'Dr. Sarah Johnson', 'faculty', 'Computer Science'),
('prof.mike@presidency.edu', '$2b$10$hash4', 'Prof. Michael Brown', 'faculty', 'Information Technology'),
('admin@presidency.edu', '$2b$10$hash5', 'Admin User', 'admin', 'Administration');

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
('Binary Search Tree Implementation', 'Implement BST with all operations', 1, 3, '2024-02-15 23:59:00', 100),
('Database Design Project', 'Design a complete database schema', 2, 3, '2024-02-20 23:59:00', 100),
('React Portfolio Website', 'Create a personal portfolio using React', 3, 4, '2024-02-25 23:59:00', 100);

-- Insert sample submissions
INSERT INTO submissions (assignment_id, student_id, file_url, grade, feedback) VALUES
(1, 1, '/uploads/john_bst.zip', 85, 'Good implementation, minor optimization needed'),
(2, 1, '/uploads/john_db.pdf', 92, 'Excellent database design'),
(3, 2, '/uploads/jane_portfolio.zip', 88, 'Great UI design, good functionality');

-- Insert sample attendance
INSERT INTO attendance (student_id, course_id, date, status, marked_by) VALUES
(1, 1, '2024-01-15', 'present', 3),
(1, 1, '2024-01-17', 'present', 3),
(1, 1, '2024-01-19', 'absent', 3),
(1, 2, '2024-01-16', 'present', 3),
(2, 1, '2024-01-15', 'present', 3),
(2, 3, '2024-01-18', 'present', 4);

-- Insert sample announcements
INSERT INTO announcements (title, message, author_id, recipient) VALUES
('Mid-term Examination Schedule', 'Mid-term exams will be conducted from Feb 10-15. Please check your individual schedules.', 5, 'all'),
('Library Extended Hours', 'Library will remain open until 10 PM during exam period.', 5, 'student'),
('Faculty Meeting', 'Department meeting scheduled for tomorrow at 3 PM.', 5, 'faculty');
