import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, password, phone } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db.prepare(`SELECT id FROM users WHERE LOWER(email) = LOWER(?)`).get(email.trim());
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const insert = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role)
      VALUES (?, ?, ?, ?, 'customer')
    `);

    insert.run(email.trim().toLowerCase(), passwordHash, fullName.trim(), (phone || '').trim());
    
    const newUser = db.prepare(`SELECT id, email, full_name, role FROM users WHERE LOWER(email) = LOWER(?)`).get(email.trim()) as { id: number; email: string; full_name: string; role: 'customer' | 'admin' };

    const token = createToken({
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
      },
    });

    response.cookies.set('claymelo_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Registration could not be completed. Please try again.' },
      { status: 500 }
    );
  }
}
