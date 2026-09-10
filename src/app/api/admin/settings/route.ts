import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, hashPassword } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = getDb();
    const rows = db.prepare(`SELECT key, value FROM store_settings`).all() as Array<{ key: string; value: string }>;
    const settings: Record<string, string> = {};
    rows.forEach(r => {
      settings[r.key] = r.value;
    });

    const adminUser = db.prepare(`SELECT email, full_name FROM users WHERE role = 'admin' LIMIT 1`).get() as any;
    if (adminUser) {
      settings['admin_email'] = adminUser.email;
      settings['admin_name'] = adminUser.full_name;
    }

    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error('Fetch settings error:', err);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await req.json();
    const db = getDb();

    // If admin profile updates
    if (body.admin_email || body.admin_name || body.admin_password) {
      const updates: string[] = [];
      const params: any[] = [];

      if (body.admin_email) {
        updates.push('email = ?');
        params.push(body.admin_email.trim().toLowerCase());
      }
      if (body.admin_name) {
        updates.push('full_name = ?');
        params.push(body.admin_name.trim());
      }
      if (body.admin_password) {
        updates.push('password_hash = ?');
        params.push(hashPassword(body.admin_password.trim()));
      }

      if (updates.length > 0) {
        db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE role = 'admin'`).run(...params);
      }
    }

    const insert = db.prepare(`INSERT OR REPLACE INTO store_settings (key, value) VALUES (?, ?)`);

    for (const [key, value] of Object.entries(body)) {
      if (key !== 'admin_password' && (typeof value === 'string' || typeof value === 'number')) {
        let valStr = String(value);
        if (key === 'instagram_url' && typeof value === 'string') {
          let cleaned = value.trim();
          if (cleaned.includes('instagram.com/')) {
            try {
              const parsed = new URL(cleaned.startsWith('http') ? cleaned : 'https://' + cleaned);
              const parts = parsed.pathname.split('/').filter(Boolean);
              if (parts.length > 0) {
                cleaned = `https://www.instagram.com/${parts[0]}/`;
              }
            } catch {}
          } else if (cleaned) {
            const handle = cleaned.replace(/^@/, '').replace(/\/+$/, '');
            cleaned = `https://www.instagram.com/${handle}/`;
          }
          valStr = cleaned;
        }
        insert.run(key, valStr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Save settings error:', err);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
