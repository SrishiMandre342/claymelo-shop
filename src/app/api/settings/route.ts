import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`SELECT key, value FROM store_settings WHERE key IN ('store_name', 'store_tagline', 'instagram_url', 'contact_phone', 'contact_email')`).all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {
      instagram_url: 'https://www.instagram.com/random_artz2/',
    };
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    if (settings.instagram_url) {
      let url = settings.instagram_url.trim();
      if (url.includes('instagram.com/')) {
        try {
          const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
          const parts = parsed.pathname.split('/').filter(Boolean);
          if (parts.length > 0) {
            settings.instagram_url = `https://www.instagram.com/${parts[0]}/`;
          }
        } catch {}
      } else if (url) {
        const handle = url.replace(/^@/, '').replace(/\/+$/, '');
        settings.instagram_url = `https://www.instagram.com/${handle}/`;
      }
    }

    return NextResponse.json({ settings });
  } catch (err) {
    return NextResponse.json({
      settings: {
        instagram_url: 'https://www.instagram.com/random_artz2/',
      },
    });
  }
}
