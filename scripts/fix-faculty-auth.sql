-- Fix faculty authentication - ensure all faculty users exist with correct passwords
-- Password for all users is "password" (hash: $2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)

-- First, update existing faculty passwords
UPDATE users SET password_hash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE role = 'faculty';

-- Insert additional faculty members (if they don't exist)
INSERT INTO users (email, password_hash, full_name, role, department) 
SELECT * FROM (VALUES
  ('dr.emily@presidency.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Emily Chen', 'faculty', 'Mathematics'),
  ('prof.david@presidency.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Prof. David Wilson', 'faculty', 'Physics'),
  ('dr.lisa@presidency.edu', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Lisa Rodriguez', 'faculty', 'Chemistry')
) AS t(email, password_hash, full_name, role, department)
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE users.email = t.email
);

-- Get the IDs of all faculty members and create courses for them
-- Add courses for the new faculty members (if they don't exist)
INSERT INTO courses (code, name, description, credits, faculty_id)
SELECT * FROM (
  SELECT 'MATH301', 'Linear Algebra', 'Advanced linear algebra concepts', 3, u.id
  FROM users u WHERE u.email = 'dr.emily@presidency.edu'
  UNION ALL
  SELECT 'PHYS201', 'Quantum Physics', 'Introduction to quantum mechanics', 4, u.id
  FROM users u WHERE u.email = 'prof.david@presidency.edu'
  UNION ALL
  SELECT 'CHEM301', 'Organic Chemistry', 'Advanced organic chemistry', 3, u.id
  FROM users u WHERE u.email = 'dr.lisa@presidency.edu'
) AS new_courses(code, name, description, credits, faculty_id)
WHERE NOT EXISTS (
  SELECT 1 FROM courses WHERE courses.code = new_courses.code
); 