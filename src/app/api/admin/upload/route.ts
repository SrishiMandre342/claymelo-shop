import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { syncFileToGitHub } from '@/lib/github-sync';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];
    const contentType = req.headers.get('content-type') || '';

    // Strategy 1: Multipart Form Data
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      let files = formData.getAll('files') as File[];
      
      // Also check single file field 'file'
      if (!files || files.length === 0) {
        const single = formData.get('file') as File | null;
        if (single) files = [single];
      }

      if (files && files.length > 0) {
        for (const file of files) {
          if (!file || typeof file.arrayBuffer !== 'function') continue;

          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          if (buffer.length === 0) continue;

          // Determine file extension
          const originalName = file.name || 'mobile_photo.jpg';
          let ext = path.extname(originalName).toLowerCase();

          if (!ext || ext === '.') {
            const mime = (file.type || '').toLowerCase();
            if (mime.includes('png')) ext = '.png';
            else if (mime.includes('webp')) ext = '.webp';
            else if (mime.includes('gif')) ext = '.gif';
            else ext = '.jpg';
          }

          if (ext === '.jpeg') ext = '.jpg';

          const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif'];
          if (!allowedExts.includes(ext)) {
            if ((file.type || '').startsWith('image/')) {
              ext = '.jpg';
            } else {
              continue;
            }
          }

          // Generate clean unique filename
          const safeName = `clay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
          const filePath = path.join(uploadsDir, safeName);

          fs.writeFileSync(filePath, buffer);
          uploadedUrls.push(`/uploads/${safeName}`);

          // Asynchronously persist to GitHub repository for permanent cloud survival
          syncFileToGitHub(`public/uploads/${safeName}`, `[ClayMelo Admin] Upload photo ${safeName}`)
            .catch((err) => console.error('[Upload Sync Error]', err));
        }
      }
    }

    // Strategy 2: JSON Body with Base64 Images (Fallback for mobile network/browser quirks)
    if (contentType.includes('application/json') || uploadedUrls.length === 0) {
      try {
        const body = await req.clone().json();
        const base64List: string[] = Array.isArray(body.images)
          ? body.images
          : body.image
          ? [body.image]
          : [];

        for (const item of base64List) {
          if (typeof item !== 'string') continue;
          const matches = item.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1].toLowerCase();
            const base64Data = matches[2];
            const buffer = Buffer.from(base64Data, 'base64');
            if (buffer.length === 0) continue;

            let ext = '.jpg';
            if (mimeType.includes('png')) ext = '.png';
            else if (mimeType.includes('webp')) ext = '.webp';
            else if (mimeType.includes('gif')) ext = '.gif';

            const safeName = `clay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
            const filePath = path.join(uploadsDir, safeName);

            fs.writeFileSync(filePath, buffer);
            uploadedUrls.push(`/uploads/${safeName}`);

            // Asynchronously persist to GitHub repository for permanent cloud survival
            syncFileToGitHub(`public/uploads/${safeName}`, `[ClayMelo Admin] Upload photo ${safeName}`)
              .catch((err) => console.error('[Upload Sync Error]', err));
          }
        }
      } catch {
        // Not a JSON request or empty body, ignore
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { error: 'Please upload valid image files (JPG, PNG, or WEBP).' },
        { status: 400 }
      );
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
