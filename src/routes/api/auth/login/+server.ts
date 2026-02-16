import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { signToken, verifyPassword } from '$lib/server/auth.js';

export const POST: RequestHandler = async ({ request, cookies }) => {
  const body = (await request.json()) as { email?: string; password?: string };
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!email || !password) {
    return json({ error: 'Email and password required' }, { status: 400 });
  }

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, credits: true, createdAt: true, passwordHash: true },
    });
  } catch {
    return json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (!user) {
    return json({ error: 'Invalid email or password' }, { status: 401 });
  }

  if (!user.passwordHash) {
    return json(
      { error: 'This account has no password set. Use "Forgot password" or sign up again.' },
      { status: 401 }
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const token = signToken({ sub: user.id, email: user.email });
  cookies.set('auth', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  const { passwordHash: _, ...safe } = user;
  return json({ user: safe });
};
