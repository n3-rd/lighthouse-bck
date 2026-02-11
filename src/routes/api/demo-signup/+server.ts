import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { signToken } from '$lib/server/auth.js';

const INITIAL_CREDITS = 20;

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = (await request.json()) as { fullName?: string; email?: string; cell?: string };
  const name = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) {
    return json({ error: 'Email required' }, { status: 400 });
  }
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { name: name || email.split('@')[0], email, credits: INITIAL_CREDITS },
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
  }
  const token = signToken({ sub: user.id, email: user.email });
  cookies.set('auth', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return json({ ok: true, user: { id: user.id, email: user.email, credits: user.credits } });
};
