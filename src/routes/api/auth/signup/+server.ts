import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { signToken, hashPassword } from '$lib/server/auth.js';

const INITIAL_CREDITS = 20;
const MIN_PASSWORD_LEN = 8;

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = (await request.json()) as { name?: string; email?: string; password?: string };
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email) {
      return json({ error: 'Name and email required' }, { status: 400 });
    }
    if (!password || password.length < MIN_PASSWORD_LEN) {
      return json({ error: `Password must be at least ${MIN_PASSWORD_LEN} characters` }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, credits: INITIAL_CREDITS },
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

    return json({ user }, { status: 201 });
  } catch (err) {
    console.error('[signup]', err);
    return json({ error: 'Signup failed. Please try again.', message: 'Internal Error' }, { status: 500 });
  }
};
