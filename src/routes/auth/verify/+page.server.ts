import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';
import { signToken } from '$lib/server/auth.js';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const token = url.searchParams.get('token');
  if (!token) {
    throw redirect(302, '/?error=token_required');
  }
  const record = await prisma.loginToken.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!record || record.expiresAt < new Date()) {
    await prisma.loginToken.deleteMany({ where: { token } }).catch(() => {});
    throw redirect(302, '/?error=invalid_or_expired');
  }
  await prisma.loginToken.delete({ where: { id: record.id } });
  const jwtToken = signToken({ sub: record.user.id, email: record.user.email });
  cookies.set('auth', jwtToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7d
    path: '/',
  });
  throw redirect(302, '/?signed_in=1');
};
