-- Add enrollments for existing students to new courses
INSERT INTO enrollments (student_id, course_id) VALUES
-- John Doe (id: 1) enrolled in additional courses
(1, 4),  -- CS401 - Machine Learning (Prof. Michael Brown)
(1, 7),  -- MATH301 - Linear Algebra (Dr. Emily Chen)

-- Jane Smith (id: 2) enrolled in additional courses  
(2, 2),  -- CS301 - Database Management Systems (Prof. Michael Brown)
(2, 8),  -- PHYS201 - Quantum Physics (Prof. David Wilson)
(2, 9);  -- CHEM301 - Organic Chemistry (Dr. Lisa Rodriguez) 