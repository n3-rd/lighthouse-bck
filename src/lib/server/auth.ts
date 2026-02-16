import { env } from '$env/dynamic/private';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { json } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';
import { prisma } from '$lib/server/db.js';

const scryptAsync = promisify(scrypt);
const JWT_SECRET = env.JWT_SECRET ?? 'dev-secret-change-in-production';
const SALT_LEN = 16;
const KEY_LEN = 64;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1 };

export type JwtPayload = { sub: string; email: string };

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  credits: number;
  createdAt: Date;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function getUserFromToken(token: string | undefined): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, name: true, email: true, credits: true, createdAt: true },
    });
    return user;
  } catch {
    return null;
  }
}

/** Hash a plain password for storage. Returns "salt:hash" hex strings. */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const key = (await scryptAsync(plain, salt, KEY_LEN, SCRYPT_OPTIONS)) as Buffer;
  return `${salt.toString('hex')}:${key.toString('hex')}`;
}

/** Verify plain password against stored "salt:hash". */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const key = (await scryptAsync(plain, salt, KEY_LEN, SCRYPT_OPTIONS)) as Buffer;
  return key.length === expected.length && key.equals(expected);
}

/** Use in API route handlers. Throws 401 JSON response if not authenticated. */
export function requireAuth(locals: App.Locals): AuthUser {
  if (!locals.user) {
    throw json({ error: 'Not authenticated' }, { status: 401 });
  }
  return locals.user;
}
