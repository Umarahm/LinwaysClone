# LMS Portal - Learning Management System

A comprehensive Learning Management System built with Next.js, featuring role-based dashboards for students, faculty, and administrators.

## Features

- **Multi-role Authentication**: Student, Faculty, and Admin dashboards
- **Assignment Management**: Create, submit, and grade assignments
- **Attendance Tracking**: Mark and view attendance records
- **Grade Management**: Track academic performance and GPA
- **Announcements**: System-wide communication
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL (Neon)
- **UI Components**: shadcn/ui
- **Authentication**: Custom JWT-based auth

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd lms-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add the following variables:

```env
# Database Configuration (Required)
DATABASE_URL="postgresql://username:password@hostname:5432/database_name"

# Authentication & Security (Recommended)
SESSION_SECRET="your-super-secret-jwt-secret-key-here"
COOKIE_SECRET="your-cookie-secret-key-here"

# Application Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

1. Create a PostgreSQL database (recommended: use [Neon](https://neon.tech))
2. Update the `DATABASE_URL` in your `.env.local` file
3. Run the database scripts to create tables and seed data:

```bash
# The application will automatically create tables when you first run it
npm run dev
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Demo Credentials

Use these credentials to test the application:

### Students (Password: `student123`)
- `alice.johnson@presidency.edu` - Computer Science
- `bob.smith@presidency.edu` - Information Technology  
- `carol.davis@presidency.edu` - Computer Science
- `david.wilson@presidency.edu` - Electronics
- `emma.brown@presidency.edu` - Information Technology

### Admin & Faculty (Password: `password`)
- `admin@presidency.edu` - Admin User
- `dr.sarah@presidency.edu` - Dr. Sarah Johnson (Faculty)
- `prof.mike@presidency.edu` - Prof. Michael Brown (Faculty)

> **✅ All accounts now have working authentication with proper bcrypt password hashing.**

## Student Access

Students added to the database can log in using their email credentials. The system supports:

- **Automatic Authentication**: Students can log in at `/` or `/login` using their email and password
- **Role-based Dashboard**: Students are automatically redirected to their personalized dashboard
- **Default Password**: New students added via scripts get the password `student123`
- **Admin-added Students**: Students added through the admin panel use the password specified during creation

### Adding Students

**Via Command Line:**
```bash
# Add individual student with default password (student123)
node scripts/add-student.js "student@presidency.edu" "Student Name" "Department"

# Add multiple test students
node scripts/add-test-students-simple.js
```

**Via Admin Panel:**
1. Log in as admin
2. Go to User Management
3. Click "Add New User"
4. Select role as "Student" and specify a password

## Environment Variables Reference

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string

### Optional Variables

- `SESSION_SECRET`: Secret key for session management
- `COOKIE_SECRET`: Secret key for cookie encryption
- `NODE_ENV`: Environment mode (development/production)
- `NEXT_PUBLIC_APP_URL`: Public URL of the application

### Database Variables (Auto-configured by Neon)

- `POSTGRES_URL`: Main database URL
- `POSTGRES_PRISMA_URL`: Prisma-compatible URL
- `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`: Individual connection parameters

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── signup/           # Authentication pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── faculty/          # Faculty-specific components
│   ├── student/          # Student-specific components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                   # Utility functions
│   ├── auth-actions.ts   # Authentication logic
│   ├── db.ts             # Database connection
│   └── auth-config.ts    # Auth configuration
└── scripts/              # Database scripts
```

## API Endpoints

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/health` - Health check

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/) and [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Neon PostgreSQL](https://neon.tech/)
- Icons by [Lucide](https://lucide.dev/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for Presidency University**
