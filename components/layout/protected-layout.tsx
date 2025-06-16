'use client';

import React from 'react';

interface ProtectedLayoutProps {
    children: React.ReactNode;
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </div>
    );
} 