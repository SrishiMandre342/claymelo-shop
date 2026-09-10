import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const db = getDb();
    const user = db.prepare(`SELECT id, email, full_name, phone, role FROM users WHERE id = ?`).get(session.id) as any;

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ user: null });
  }
}
