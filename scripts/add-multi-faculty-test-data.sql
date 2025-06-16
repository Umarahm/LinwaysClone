-- Add additional faculty assignments to existing courses for testing multiple faculty per course

-- Assign multiple faculty to CSE2001 (Data Structures & Algorithms)
INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
SELECT c.id, u.id, false
FROM courses c, users u 
WHERE c.code = 'CSE2001' 
AND u.email = 'jamil.ahmed@presidency.edu'
AND NOT EXISTS (
    SELECT 1 FROM course_faculty cf 
    WHERE cf.course_id = c.id AND cf.faculty_id = u.id
);

-- Assign multiple faculty to CSE2006 (Database Management Systems)
INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
SELECT c.id, u.id, false
FROM courses c, users u 
WHERE c.code = 'CSE2006' 
AND u.email = 'nagaraja.sr@presidency.edu'
AND NOT EXISTS (
    SELECT 1 FROM course_faculty cf 
    WHERE cf.course_id = c.id AND cf.faculty_id = u.id
);

-- Assign multiple faculty to CSE3001 (Web Development)
INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
VALUES 
((SELECT id FROM courses WHERE code = 'CSE3001'), 
 (SELECT id FROM users WHERE email = 'praveen.pravaskar@presidency.edu'), 
 false);

-- Add another faculty to CSE4001 (AI & Machine Learning) 
INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
VALUES 
((SELECT id FROM courses WHERE code = 'CSE4001'), 
 (SELECT id FROM users WHERE email = 'dr.sarah@presidency.edu'), 
 false);

-- Assign multiple faculty to ENG1002 (Technical English)
INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
VALUES 
((SELECT id FROM courses WHERE code = 'ENG1002'), 
 (SELECT id FROM users WHERE email = 'pushpalatha@presidency.edu'), 
 false);

-- Fix CSE4001 which seems to be missing a primary faculty
UPDATE course_faculty 
SET is_primary = true 
WHERE course_id = (SELECT id FROM courses WHERE code = 'CSE4001') 
AND faculty_id = (SELECT id FROM users WHERE email = 'jamil.ahmed@presidency.edu');

-- Ensure missing primary faculty assignment
INSERT INTO course_faculty (course_id, faculty_id, is_primary) 
SELECT c.id, u.id, true
FROM courses c, users u 
WHERE c.code = 'CSE4001' 
AND u.email = 'jamil.ahmed@presidency.edu'
AND NOT EXISTS (
    SELECT 1 FROM course_faculty cf 
    WHERE cf.course_id = c.id AND cf.faculty_id = u.id
); 