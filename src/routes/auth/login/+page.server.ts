import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const redirectTo = url.searchParams.get('redirect');
  return { redirect: redirectTo && redirectTo.startsWith('/') ? redirectTo : null };
};
