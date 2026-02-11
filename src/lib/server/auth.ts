import { env } from '$env/dynamic/private';
import jwt from 'jsonwebtoken';
import { prisma } from '$lib/server/db.js';

const JWT_SECRET = env.JWT_SECRET ?? 'dev-secret-change-in-production';

export type JwtPayload = { sub: string; email: string };

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export async function getUserFromToken(token: string | undefined) {
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
