import { env } from '$env/dynamic/private';
import { randomBytes } from 'node:crypto';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';

const TOKEN_TTL_MS = 1000 * 60 * 30;
const BASE_URL = env.BASE_URL ?? 'http://localhost:5173';

function toLoginLink(token: string): string {
  return `${BASE_URL}/auth/verify?token=${token}`;
}

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json()) as { email?: string };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) {
    return json({ error: 'email required' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return json({ error: 'No account with this email' }, { status: 404 });
  }
  const token = randomBytes(32).toString('hex');
  await prisma.loginToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  const loginLink = toLoginLink(token);
  return json({
    loginLink,
    message: 'Use the link to sign in (or check your email when configured)',
  });
};
