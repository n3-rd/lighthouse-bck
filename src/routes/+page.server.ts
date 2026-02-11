import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => ({
  signedIn: url.searchParams.has('signed_in'),
  error: url.searchParams.get('error') ?? null,
});