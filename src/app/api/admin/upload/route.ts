import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import path from 'path';
import fs from 'fs';

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Validate file extension
      const originalName = file.name || 'image.jpg';
      const ext = path.extname(originalName).toLowerCase() || '.jpg';
      const allowedExts = ['.jpg', '.jpeg', '.png', '.webp'];

      if (!allowedExts.includes(ext)) {
        continue;
      }

      // Generate clean unique filename
      const safeName = `clay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
      const filePath = path.join(uploadsDir, safeName);

      fs.writeFileSync(filePath, buffer);
      uploadedUrls.push(`/uploads/${safeName}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'Please upload valid image files (JPG, PNG, or WEBP).' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0], // for single image convenience
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}
