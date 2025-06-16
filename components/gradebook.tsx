'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GradebookProps {
    courseId: string;
}

export default function Gradebook({ courseId }: GradebookProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Gradebook</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Gradebook for course {courseId} is being developed.</p>
            </CardContent>
        </Card>
    );
} 