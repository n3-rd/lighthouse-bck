import type { Handle } from '@sveltejs/kit';
import { getUserFromToken } from '$lib/server/auth.js';

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('auth');
  event.locals.user = (await getUserFromToken(token)) ?? undefined;
  return resolve(event);
};
