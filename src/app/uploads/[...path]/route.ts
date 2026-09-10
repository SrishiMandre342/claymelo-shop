import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const pathSegments = resolvedParams?.path || [];

    if (pathSegments.length === 0) {
      return new NextResponse('File not found', { status: 404 });
    }

    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    const safePath = path.resolve(uploadsDir, ...pathSegments);

    // Prevent directory traversal attacks
    if (!safePath.startsWith(uploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!fs.existsSync(safePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const stat = await fs.promises.stat(safePath);
    if (!stat.isFile()) {
      return new NextResponse('Not a file', { status: 400 });
    }

    const ext = path.extname(safePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';
    const fileBuffer = await fs.promises.readFile(safePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Error serving upload:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
