import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/** Require auth for audit page: redirect to login with return URL. */
export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=' + encodeURIComponent(url.pathname));
  }
  return {};
};
