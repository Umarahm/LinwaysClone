'use client';

import React, { useState } from 'react';
import {
    UniversityPortalLayout,
    Card,
    Button,
    Table,
    SidebarNavigation,
    type SidebarSection,
    type NavigationItem
} from './university-portal-layout';
import designSystem from '@/university_design_system.json';
import {
    Home,
    Users,
    BookOpen,
    Calendar,
    BarChart3,
    Settings,
    Bell,
    Search,
    Menu,
    GraduationCap,
    User,
    FileText,
    Clock,
    Award
} from 'lucide-react';

const DS = designSystem.designSystem;

// Example Dashboard Content
const DashboardExample: React.FC = () => {
    return (
        <div className="space-y-6">
            {/* Stats Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                            <p className="text-3xl font-bold">1,234</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Courses</p>
                            <p className="text-3xl font-bold">45</p>
                        </div>
                        <div className="p-3 bg-secondary/10 rounded-full">
                            <BookOpen className="h-6 w-6 text-secondary" />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Faculty</p>
                            <p className="text-3xl font-bold">89</p>
                        </div>
                        <div className="p-3 bg-accent/10 rounded-full">
                            <GraduationCap className="h-6 w-6 text-accent-foreground" />
                        </div>
                    </div>
                </Card>

                <Card variant="elevated" className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Assignments</p>
                            <p className="text-3xl font-bold">156</p>
                        </div>
                        <div className="p-3 bg-destructive/10 rounded-full">
                            <FileText className="h-6 w-6 text-destructive" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity and Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                        <div className="space-y-4">
                            {[
                                { action: 'New assignment submitted', time: '2 minutes ago', icon: FileText },
                                { action: 'Student enrolled in course', time: '1 hour ago', icon: Users },
                                { action: 'Lecture scheduled', time: '3 hours ago', icon: Calendar },
                                { action: 'Grade published', time: '1 day ago', icon: Award },
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <activity.icon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div>
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button variant="primary" className="w-full justify-start">
                                <Users className="h-4 w-4 mr-2" />
                                Add Student
                            </Button>
                            <Button variant="secondary" className="w-full justify-start">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Create Course
                            </Button>
                            <Button variant="secondary" className="w-full justify-start">
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Class
                            </Button>
                            <Button variant="secondary" className="w-full justify-start">
                                <FileText className="h-4 w-4 mr-2" />
                                New Assignment
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Example Data Table Content
const DataTableExample: React.FC = () => {
    const students = [
        { id: 1, name: 'John Doe', email: 'john@university.edu', course: 'Computer Science', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'jane@university.edu', course: 'Mathematics', status: 'Active' },
        { id: 3, name: 'Bob Johnson', email: 'bob@university.edu', course: 'Physics', status: 'Inactive' },
        { id: 4, name: 'Alice Brown', email: 'alice@university.edu', course: 'Chemistry', status: 'Active' },
    ];

    return (
        <div className="space-y-6">
            {/* Filter Controls */}
            <Card className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background"
                                style={{
                                    fontSize: DS.typography.fontSizes.sm,
                                    padding: '8px 12px 8px 36px',
                                }}
                            />
                        </div>
                    </div>
                    <Button variant="filter">
                        All Courses
                    </Button>
                    <Button variant="filter">
                        Active Only
                    </Button>
                    <Button variant="primary">
                        <Users className="h-4 w-4 mr-2" />
                        Add Student
                    </Button>
                </div>
            </Card>

            {/* Data Table */}
            <Table>
                <thead>
                    <tr style={{ backgroundColor: DS.components.tables.header.backgroundColor }}>
                        <th
                            className="text-left p-4"
                            style={{
                                fontSize: DS.components.tables.header.fontSize,
                                fontWeight: DS.components.tables.header.fontWeight,
                                color: `hsl(var(--muted-foreground))`,
                                padding: DS.components.tables.header.padding,
                            }}
                        >
                            Name
                        </th>
                        <th
                            className="text-left p-4"
                            style={{
                                fontSize: DS.components.tables.header.fontSize,
                                fontWeight: DS.components.tables.header.fontWeight,
                                color: `hsl(var(--muted-foreground))`,
                                padding: DS.components.tables.header.padding,
                            }}
                        >
                            Email
                        </th>
                        <th
                            className="text-left p-4"
                            style={{
                                fontSize: DS.components.tables.header.fontSize,
                                fontWeight: DS.components.tables.header.fontWeight,
                                color: `hsl(var(--muted-foreground))`,
                                padding: DS.components.tables.header.padding,
                            }}
                        >
                            Course
                        </th>
                        <th
                            className="text-left p-4"
                            style={{
                                fontSize: DS.components.tables.header.fontSize,
                                fontWeight: DS.components.tables.header.fontWeight,
                                color: `hsl(var(--muted-foreground))`,
                                padding: DS.components.tables.header.padding,
                            }}
                        >
                            Status
                        </th>
                        <th
                            className="text-left p-4"
                            style={{
                                fontSize: DS.components.tables.header.fontSize,
                                fontWeight: DS.components.tables.header.fontWeight,
                                color: `hsl(var(--muted-foreground))`,
                                padding: DS.components.tables.header.padding,
                            }}
                        >
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => (
                        <tr
                            key={student.id}
                            className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}
                            style={{
                                borderBottom: `1px solid hsl(var(--border))`,
                            }}
                        >
                            <td
                                className="p-4"
                                style={{
                                    fontSize: DS.components.tables.row.fontSize,
                                    color: `hsl(var(--foreground))`,
                                    padding: DS.components.tables.row.padding,
                                }}
                            >
                                {student.name}
                            </td>
                            <td
                                className="p-4"
                                style={{
                                    fontSize: DS.components.tables.row.fontSize,
                                    color: `hsl(var(--foreground))`,
                                    padding: DS.components.tables.row.padding,
                                }}
                            >
                                {student.email}
                            </td>
                            <td
                                className="p-4"
                                style={{
                                    fontSize: DS.components.tables.row.fontSize,
                                    color: `hsl(var(--foreground))`,
                                    padding: DS.components.tables.row.padding,
                                }}
                            >
                                {student.course}
                            </td>
                            <td className="p-4">
                                <span
                                    className="px-2 py-1 rounded-full text-xs font-medium"
                                    style={{
                                        ...DS.components.badges[student.status === 'Active' ? 'success' : 'info'],
                                        backgroundColor: student.status === 'Active' ? DS.colorPalette.status.success : DS.colorPalette.status.info,
                                        color: DS.colorPalette.neutral.white,
                                    }}
                                >
                                    {student.status}
                                </span>
                            </td>
                            <td className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Button variant="secondary" className="text-xs px-2 py-1">
                                        Edit
                                    </Button>
                                    <Button variant="secondary" className="text-xs px-2 py-1">
                                        View
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Pagination */}
            <Card className="p-4">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing 1 to 4 of 4 results
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button variant="secondary" disabled>
                            Previous
                        </Button>
                        <Button variant="primary">
                            1
                        </Button>
                        <Button variant="secondary" disabled>
                            Next
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// Main Example Component
export const UniversityPortalLayoutExample: React.FC = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');

    // Sidebar navigation sections following design system patterns
    const sidebarSections: SidebarSection[] = [
        {
            label: 'Main',
            items: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: <Home className="h-5 w-5" />,
                    active: currentPage === 'dashboard',
                    onClick: () => setCurrentPage('dashboard'),
                },
                {
                    id: 'students',
                    label: 'Students',
                    icon: <Users className="h-5 w-5" />,
                    active: currentPage === 'students',
                    onClick: () => setCurrentPage('students'),
                },
                {
                    id: 'courses',
                    label: 'Courses',
                    icon: <BookOpen className="h-5 w-5" />,
                    active: currentPage === 'courses',
                    onClick: () => setCurrentPage('courses'),
                },
                {
                    id: 'calendar',
                    label: 'Calendar',
                    icon: <Calendar className="h-5 w-5" />,
                    active: currentPage === 'calendar',
                    onClick: () => setCurrentPage('calendar'),
                },
            ],
        },
        {
            label: 'Analytics',
            items: [
                {
                    id: 'reports',
                    label: 'Reports',
                    icon: <BarChart3 className="h-5 w-5" />,
                    active: currentPage === 'reports',
                    onClick: () => setCurrentPage('reports'),
                },
                {
                    id: 'analytics',
                    label: 'Analytics',
                    icon: <BarChart3 className="h-5 w-5" />,
                    active: currentPage === 'analytics',
                    onClick: () => setCurrentPage('analytics'),
                },
            ],
        },
        {
            label: 'Settings',
            items: [
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: <Settings className="h-5 w-5" />,
                    active: currentPage === 'settings',
                    onClick: () => setCurrentPage('settings'),
                },
            ],
        },
    ];

    // Header content
    const headerContent = (
        <>
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-semibold">University Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
                <Button variant="secondary" className="p-2">
                    <Bell className="h-4 w-4" />
                </Button>
                <Button variant="secondary" className="p-2">
                    <User className="h-4 w-4" />
                </Button>
            </div>
        </>
    );

    // Sidebar content
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo/Header */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary rounded-lg">
                        <GraduationCap className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-sidebar-foreground">University</h2>
                        <p className="text-sm text-sidebar-foreground/70">Portal</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
                <SidebarNavigation sections={sidebarSections} />
            </div>
        </div>
    );

    // Content based on current page
    const renderContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardExample />;
            case 'students':
                return <DataTableExample />;
            case 'courses':
                return (
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Courses</h2>
                        <p className="text-muted-foreground">Course management content goes here.</p>
                    </Card>
                );
            default:
                return (
                    <Card className="p-6">
                        <h2 className="text-2xl font-bold mb-4 capitalize">{currentPage}</h2>
                        <p className="text-muted-foreground">Content for {currentPage} page goes here.</p>
                    </Card>
                );
        }
    };

    return (
        <UniversityPortalLayout
            variant={currentPage === 'dashboard' ? 'dashboard' : currentPage === 'students' ? 'dataTable' : 'default'}
            showSidebar={true}
            sidebarContent={sidebarContent}
            headerContent={headerContent}
        >
            {renderContent()}
        </UniversityPortalLayout>
    );
};

export default UniversityPortalLayoutExample;