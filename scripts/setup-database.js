// Database setup script
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function hashPassword(password) {
  const bcrypt = require('bcryptjs');
  return await bcrypt.hash(password, 10);
}

async function createTables() {
  console.log('Creating database tables...');

  // Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
        department VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create courses table
  await sql`
    CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        credits INTEGER DEFAULT 3,
        faculty_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create enrollments table
  await sql`
    CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id)
    )
  `;

  // Create assignments table
  await sql`
    CREATE TABLE IF NOT EXISTS assignments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        course_id INTEGER REFERENCES courses(id),
        faculty_id INTEGER REFERENCES users(id),
        due_date TIMESTAMP NOT NULL,
        max_marks INTEGER DEFAULT 100,
        file_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create submissions table
  await sql`
    CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        assignment_id INTEGER REFERENCES assignments(id),
        student_id INTEGER REFERENCES users(id),
        file_url VARCHAR(500),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        grade INTEGER,
        feedback TEXT,
        UNIQUE(assignment_id, student_id)
    )
  `;

  // Create attendance table
  await sql`
    CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        course_id INTEGER REFERENCES courses(id),
        date DATE NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent')),
        marked_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(student_id, course_id, date)
    )
  `;

  // Create announcements table
  await sql`
    CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        recipient VARCHAR(20) NOT NULL CHECK (recipient IN ('student', 'faculty', 'all')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create timetable table
  await sql`
    CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        faculty_id INTEGER REFERENCES users(id),
        day VARCHAR(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        room VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // Create course_faculty relationship table for multi-faculty courses
  await sql`
    CREATE TABLE IF NOT EXISTS course_faculty (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        faculty_id INTEGER REFERENCES users(id),
        is_primary BOOLEAN DEFAULT false,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(course_id, faculty_id)
    )
  `;

  console.log('✅ Tables created successfully');
}

async function seedData() {
  console.log('Seeding database with demo data...');

  // Clear existing data in correct order (to avoid foreign key constraints)
  await sql`DELETE FROM submissions`;
  await sql`DELETE FROM attendance`;
  await sql`DELETE FROM announcements`;
  await sql`DELETE FROM assignments`;
  await sql`DELETE FROM timetable`;
  await sql`DELETE FROM course_faculty`;
  await sql`DELETE FROM enrollments`;
  await sql`DELETE FROM courses`;
  await sql`DELETE FROM users`;

  // Generate password hashes
  const passwordHash = await hashPassword('password');
  console.log(`Generated password hash: ${passwordHash}`);

  // Insert users and get their IDs
  const users = await sql`
    INSERT INTO users (email, password_hash, full_name, role, department) VALUES
    ('john.doe@presidency.edu', ${passwordHash}, 'John Doe', 'student', 'Computer Science'),
    ('jane.smith@presidency.edu', ${passwordHash}, 'Jane Smith', 'student', 'Information Technology'),
    ('dr.sarah@presidency.edu', ${passwordHash}, 'Dr. Sarah Johnson', 'faculty', 'Computer Science'),
    ('prof.mike@presidency.edu', ${passwordHash}, 'Prof. Michael Brown', 'faculty', 'Information Technology'),
    ('admin@presidency.edu', ${passwordHash}, 'Admin User', 'admin', 'Administration')
    RETURNING id, email, role
  `;

  console.log('✅ Users created:', users);

  // Find faculty IDs
  const drSarahId = users.find(u => u.email === 'dr.sarah@presidency.edu')?.id;
  const profMikeId = users.find(u => u.email === 'prof.mike@presidency.edu')?.id;
  const johnId = users.find(u => u.email === 'john.doe@presidency.edu')?.id;
  const janeId = users.find(u => u.email === 'jane.smith@presidency.edu')?.id;

  console.log(`Faculty IDs - Dr. Sarah: ${drSarahId}, Prof. Mike: ${profMikeId}`);

  // Insert courses with correct faculty IDs
  const courses = await sql`
    INSERT INTO courses (code, name, description, credits, faculty_id) VALUES
    ('CS201', 'Data Structures & Algorithms', 'Fundamental data structures and algorithms', 4, ${drSarahId}),
    ('CS301', 'Database Management Systems', 'Database design and management', 3, ${drSarahId}),
    ('IT401', 'Web Development', 'Modern web development technologies', 3, ${profMikeId}),
    ('CS401', 'Machine Learning', 'Introduction to machine learning', 4, ${drSarahId})
    RETURNING id, code
  `;

  console.log('✅ Courses created:', courses);

  // Insert enrollments
  if (johnId && janeId) {
    await sql`
    INSERT INTO enrollments (student_id, course_id) VALUES
    (${johnId}, ${courses[0].id}), (${johnId}, ${courses[1].id}), (${johnId}, ${courses[2].id}),
    (${janeId}, ${courses[0].id}), (${janeId}, ${courses[2].id}), (${janeId}, ${courses[3].id})
  `;
    console.log('✅ Enrollments created');
  }

  // Insert sample assignments
  await sql`
    INSERT INTO assignments (title, description, course_id, faculty_id, due_date, max_marks) VALUES
    ('Binary Search Tree Implementation', 'Implement BST with all operations', ${courses[0].id}, ${drSarahId}, '2024-12-15 23:59:00', 100),
    ('Database Design Project', 'Design a complete database schema', ${courses[1].id}, ${drSarahId}, '2024-12-20 23:59:00', 100),
    ('React Portfolio Website', 'Create a personal portfolio using React', ${courses[2].id}, ${profMikeId}, '2024-12-25 23:59:00', 100)
  `;
  console.log('✅ Assignments created');

  // Insert course-faculty relationships
  await sql`
    INSERT INTO course_faculty (course_id, faculty_id, is_primary) VALUES
    (${courses[0].id}, ${drSarahId}, true),
    (${courses[1].id}, ${drSarahId}, true),
    (${courses[2].id}, ${profMikeId}, true),
    (${courses[3].id}, ${drSarahId}, true)
  `;
  console.log('✅ Course-faculty relationships created');

  // Insert sample timetable entries
  await sql`
    INSERT INTO timetable (course_id, faculty_id, day, start_time, end_time, room) VALUES
    (${courses[0].id}, ${drSarahId}, 'Monday', '09:00', '10:30', 'CS-101'),
    (${courses[1].id}, ${drSarahId}, 'Tuesday', '11:00', '12:30', 'CS-102'),
    (${courses[2].id}, ${profMikeId}, 'Wednesday', '14:00', '15:30', 'IT-Lab-1'),
    (${courses[3].id}, ${drSarahId}, 'Thursday', '10:00', '11:30', 'CS-103'),
    (${courses[0].id}, ${drSarahId}, 'Friday', '09:30', '11:00', 'CS-101'),
    (${courses[2].id}, ${profMikeId}, 'Friday', '13:00', '14:30', 'IT-Lab-2')
  `;
  console.log('✅ Timetable entries created');

  console.log('✅ Database seeded successfully');
  console.log('\nDemo Login Credentials:');
  console.log('Student: john.doe@presidency.edu / password');
  console.log('Faculty: dr.sarah@presidency.edu / password');
  console.log('Admin: admin@presidency.edu / password');
}

async function setupDatabase() {
  try {
    console.log('Starting database setup...\n');
    await createTables();
    await seedData();
    console.log('\n🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase(); 