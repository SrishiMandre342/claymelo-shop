import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getDb } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'claymelo_super_secret_jwt_key_2026_boutique';

export interface UserSession {
  id: number;
  email: string;
  fullName: string;
  role: 'customer' | 'admin';
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

export function createToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('claymelo_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<UserSession | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return null;
  }
  return user;
}
