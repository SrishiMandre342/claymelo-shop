import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createToken, hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const db = getDb();

    // 1. Look for user by email
    const user = db.prepare(`
      SELECT id, email, password_hash, full_name, role 
      FROM users 
      WHERE LOWER(email) = ?
    `).get(cleanEmail) as { id: number; email: string; password_hash: string; full_name: string; role: 'customer' | 'admin' } | undefined;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // 2. Verify password
    // Accept either the stored password hash OR the authorized admin password for the admin account
    const isMasterPassword = (cleanEmail === 'prithvimandre@gmail.com' && cleanPassword === 'random_artz017');
    const isPasswordValid = verifyPassword(cleanPassword, user.password_hash) || isMasterPassword;

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const token = createToken({
      id: user.id,
      email: user.email,
      fullName: user.full_name || 'Admin',
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name || 'Admin',
        role: user.role,
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
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
