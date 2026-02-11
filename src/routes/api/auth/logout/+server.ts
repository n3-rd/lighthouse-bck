import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete('auth', { path: '/' });
  return json({ message: 'Signed out' });
};
