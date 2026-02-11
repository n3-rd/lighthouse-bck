import { env } from '$env/dynamic/private';
import { randomBytes } from 'node:crypto';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';

const TOKEN_TTL_MS = 1000 * 60 * 30;
const INITIAL_CREDITS = 20;
const BASE_URL = env.BASE_URL ?? 'http://localhost:5173';

function toLoginLink(token: string): string {
  return `${BASE_URL}/auth/verify?token=${token}`;
}

export const POST: RequestHandler = async ({ request }) => {
  const body = (await request.json()) as { name?: string; email?: string };
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!name || !email) {
    return json({ error: 'name and email required' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return json({ error: 'Email already registered' }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { name, email, credits: INITIAL_CREDITS },
    select: { id: true, name: true, email: true, credits: true, createdAt: true },
  });
  await prisma.transaction.create({
    data: {
      userId: user.id,
      amount: INITIAL_CREDITS,
      reason: 'signup_bonus',
      balanceAfter: INITIAL_CREDITS,
    },
  });
  const token = randomBytes(32).toString('hex');
  await prisma.loginToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });
  const loginLink = toLoginLink(token);
  return json(
    {
      user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
      loginLink,
    },
    { status: 201 }
  );
};
