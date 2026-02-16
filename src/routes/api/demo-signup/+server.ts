import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { signToken, hashPassword } from '$lib/server/auth.js';

const INITIAL_CREDITS = 20;
const MIN_PASSWORD_LEN = 8;

/** Quick signup from audit page: name, email, password. Creates account and logs in. */
export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = (await request.json()) as { fullName?: string; email?: string; cell?: string; password?: string };
  const name = typeof body.fullName === 'string' ? body.fullName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email) {
    return json({ error: 'Email required' }, { status: 400 });
  }
  if (!password || password.length < MIN_PASSWORD_LEN) {
    return json({ error: `Password must be at least ${MIN_PASSWORD_LEN} characters` }, { status: 400 });
  }

  let user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, credits: true, createdAt: true, passwordHash: true },
  });

  if (user) {
    if (!user.passwordHash) {
      return json(
        { error: 'This email is already registered without a password. Log in with password reset or use a different email.' },
        { status: 409 }
      );
    }
    // Existing user: don't re-create; they must log in
    return json({ error: 'Email already registered. Please log in.' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  user = await prisma.user.create({
    data: {
      name: name || email.split('@')[0],
      email,
      passwordHash,
      credits: INITIAL_CREDITS,
    },
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
