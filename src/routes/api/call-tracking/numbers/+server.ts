import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { requireAuth } from '$lib/server/auth.js';

/** List current user's purchased phone numbers for call tracking. */
export const GET: RequestHandler = async ({ locals }) => {
  const user = requireAuth(locals);
  const numbers = await prisma.phoneNumber.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, phoneNumber: true, createdAt: true },
  });
  return json({ numbers });
};
