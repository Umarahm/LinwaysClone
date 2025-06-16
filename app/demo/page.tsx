'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    GraduationCap,
    User,
    Database,
    ShieldAlert,
    LogOut,
    CheckCircle,
    ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DemoPage() {
    const router = useRouter();

    return (
        <div className="container mx-auto p-6">
            <div className="space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">🎯 Component Library Demo</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Interactive showcase of all the educational management system components.
                        Each component is fully integrated with JWT authentication and Tailwind styling.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4" />
                                Profile Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Edit name, password & view user info</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                <CheckCircle className="h-3 w-3" />
                                Available
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Database className="h-4 w-4" />
                                Data Fetcher
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">JWT-authenticated API data tables</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                                <ExternalLink className="h-3 w-3" />
                                Coming Soon
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <ShieldAlert className="h-4 w-4" />
                                Access Control
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Unauthorized access handling</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                                <ExternalLink className="h-3 w-3" />
                                Coming Soon
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <GraduationCap className="h-4 w-4" />
                                Gradebook
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">Grade management system</p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-yellow-600">
                                <ExternalLink className="h-3 w-3" />
                                Coming Soon
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Current Features */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Current Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    User Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Profile editing with avatar upload
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Password change functionality
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Role-based information display
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Form validation and error handling
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldAlert className="h-5 w-5" />
                                    Authentication
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    JWT token-based authentication
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Role-based access control
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Protected route layout
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    Automatic logout on token expiry
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Planned Features */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Planned Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5" />
                                    Gradebook System
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div>• Faculty: Editable grades & feedback</div>
                                <div>• Students: View-only grade display</div>
                                <div>• Color-coded grade badges</div>
                                <div>• Loading & error states</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    Data Fetcher Component
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <div>• Automatic loading states</div>
                                <div>• Error handling & retry</div>
                                <div>• Empty state handling</div>
                                <div>• TypeScript support</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
} 