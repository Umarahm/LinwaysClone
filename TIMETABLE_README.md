# Timetable Management System

A comprehensive timetable management system built with Next.js, React, TypeScript, and Tailwind CSS. This system provides responsive timetable views with faculty attendance marking capabilities.

## 🚀 Features

### ✅ Core Requirements Implemented

1. **📅 Responsive Timetable Component**
   - 7 weekdays display (Monday to Sunday) as columns
   - Time slots from 9 AM to 5 PM in 30-minute intervals
   - Course name and room number display
   - Desktop grid layout and mobile card layout

2. **👨‍🏫 Faculty Attendance Marking**
   - Smart validation with three required conditions:
     - User must be assigned as faculty for the course (`faculty_id` matches)
     - Current day must match the class day
     - Current time must fall within the class time slot
   - Real-time time checking (updates every minute)

3. **🔧 Admin Management Interface**
   - Paginated table view of all timetable entries
   - Create, edit, and delete timetable slots
   - Search and filter functionality
   - Form validation with conflict detection

## 📁 File Structure

```
├── components/
│   ├── timetable.tsx                    # Main responsive timetable component
│   ├── timetable-example.tsx            # Example usage with sample data
│   ├── timetable-demo.tsx               # Interactive demo component
│   └── admin/
│       └── timetable-form.tsx           # Admin form for creating/editing slots
├── app/dashboard/admin/timetable/
│   └── page.tsx                         # Admin timetable management page
├── lib/
│   └── timetable-actions.ts             # Server actions for timetable operations
└── scripts/
    └── setup-database.js                # Database schema and sample data
```

## 🗄️ Database Schema

### Timetable Table
```sql
CREATE TABLE IF NOT EXISTS timetable (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    faculty_id INTEGER REFERENCES users(id),
    day VARCHAR(20) NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    room VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Course-Faculty Relationship Table
```sql
CREATE TABLE IF NOT EXISTS course_faculty (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id),
    faculty_id INTEGER REFERENCES users(id),
    is_primary BOOLEAN DEFAULT false,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, faculty_id)
);
```

## 🔧 API Functions

### Server Actions (`lib/timetable-actions.ts`)

- `getTimetableByUser(userId?, userRole?)` - Fetch timetable entries based on user role
- `createTimetableSlot(data)` - Create new timetable slot with conflict validation
- `updateTimetableSlot(id, data)` - Update existing timetable slot
- `deleteTimetableSlot(id)` - Delete timetable slot
- `getCourses()` - Get all courses for form dropdowns
- `getFaculty()` - Get all faculty members for form dropdowns

### Data Interfaces

```typescript
interface TimetableEntry {
  id: number;
  course_id: number;
  course_name: string;
  course_code: string;
  faculty_id: number;
  faculty_name: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  created_at: string;
}

interface TimetableFormData {
  course_id: number;
  faculty_id: number;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
}
```

## 💻 Component Usage

### Basic Timetable Component

```tsx
import Timetable from '@/components/timetable';

function MyPage() {
  const handleMarkAttendance = (timetableId: number) => {
    // Handle attendance marking
    console.log('Marking attendance for slot:', timetableId);
  };

  return (
    <Timetable 
      timetableData={timetableEntries}
      onMarkAttendance={handleMarkAttendance}
    />
  );
}
```

### Admin Form Component

```tsx
import { TimetableForm } from '@/components/admin/timetable-form';

function AdminPage() {
  return (
    <TimetableForm
      open={formOpen}
      onOpenChange={setFormOpen}
      editingEntry={editingEntry}
      onSuccess={handleFormSuccess}
    />
  );
}
```

## 🎨 Styling Features

- **Responsive Design**: Desktop grid view and mobile card layout
- **Color-coded Days**: Each weekday has its own color scheme
- **Time Formatting**: 12-hour format with AM/PM
- **Visual Indicators**: Icons for time, location, and faculty
- **Loading States**: Skeleton loaders and spinners
- **Error States**: Validation messages and error handling

## 🔒 Security Features

- **Role-based Access**: Admin-only access for management functions
- **Conflict Detection**: Prevents double-booking of rooms and faculty
- **Input Validation**: Client and server-side validation
- **Time Logic Validation**: Ensures end time is after start time

## 📱 Responsive Behavior

### Desktop (md and larger)
- Grid layout with days as columns and time slots as rows
- Full table view for admin management
- Sidebar navigation support

### Mobile (below md)
- Card-based layout with one day per card
- Stacked time slots within each day
- Touch-friendly buttons and interactions

## 🚀 Setup Instructions

1. **Database Setup**
   ```bash
   node scripts/setup-database.js
   ```

2. **Environment Variables**
   Ensure your `.env.local` contains:
   ```
   DATABASE_URL=your_neon_database_url
   ```

3. **Demo Data**
   The setup script includes sample timetable entries for testing.

## 🧪 Testing

### Demo Components
- `TimetableDemo`: Interactive demonstration with sample data
- `TimetableExample`: Basic usage example

### Test Login Credentials
- **Faculty**: `dr.sarah@presidency.edu` / `password` (faculty_id: 3)
- **Faculty**: `prof.mike@presidency.edu` / `password` (faculty_id: 4)
- **Admin**: `admin@presidency.edu` / `password`

## 🎯 Key Features

### Attendance Marking Logic
The attendance button only appears when ALL conditions are met:
1. User is logged in as faculty (`user.role === 'faculty'`)
2. User is assigned to the course (`user.id === entry.faculty_id`)
3. Current day matches class day (`currentDay === entry.day`)
4. Current time is within class time (`currentTime >= start_time && currentTime <= end_time`)

### Conflict Prevention
- **Room Conflicts**: Prevents double-booking of rooms at the same time
- **Faculty Conflicts**: Prevents faculty from being assigned to multiple classes simultaneously
- **Time Validation**: Ensures logical time ranges

### Admin Features
- **Pagination**: 10 items per page with navigation controls
- **Search**: Filter by course, faculty, room, or day
- **Statistics**: Dashboard showing total slots, courses, faculty, and rooms
- **CRUD Operations**: Full create, read, update, delete functionality

## 🔄 Integration

This timetable system integrates seamlessly with:
- **Authentication**: Uses the existing auth context
- **Database**: Built on the existing Neon PostgreSQL setup
- **UI Components**: Uses shadcn/ui component library
- **Styling**: Follows existing Tailwind CSS patterns

## 📊 Performance

- **Optimized Queries**: Efficient database queries with proper joins
- **Client-side Filtering**: Fast search and pagination
- **Minimal Re-renders**: Optimized React components
- **Responsive Images**: No unnecessary asset loading

---

**Ready to use!** The timetable system is fully integrated and production-ready. Access the admin interface at `/dashboard/admin/timetable` to start managing your timetable entries. 