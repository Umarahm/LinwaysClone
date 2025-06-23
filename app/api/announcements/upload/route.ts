import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No files provided' },
                { status: 400 }
            );
        }

        const uploadedFiles = [];
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'announcements');

        // Create uploads directory if it doesn't exist
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        for (const file of files) {
            if (file.size === 0) continue;

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                return NextResponse.json(
                    { success: false, error: `File ${file.name} is too large. Maximum size is 10MB.` },
                    { status: 400 }
                );
            }

            // Validate file type
            const allowedTypes = [
                'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                'application/pdf', 'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain'
            ];

            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json(
                    { success: false, error: `File type ${file.type} is not allowed.` },
                    { status: 400 }
                );
            }

            // Generate unique filename
            const timestamp = Date.now();
            const extension = file.name.split('.').pop();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const fileName = `${timestamp}_${sanitizedName}`;
            const filePath = join(uploadsDir, fileName);

            // Save file
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filePath, buffer);

            uploadedFiles.push({
                name: file.name,
                url: `/uploads/announcements/${fileName}`,
                type: file.type,
                size: file.size
            });
        }

        return NextResponse.json({
            success: true,
            files: uploadedFiles
        });
    } catch (error) {
        console.error('Error uploading files:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to upload files' },
            { status: 500 }
        );
    }
} 