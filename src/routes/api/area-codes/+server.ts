import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import US_AREA_CODES from '$lib/data/area-codes-us.json';
import CA_AREA_CODES from '$lib/data/area-codes-ca.json';

export const GET: RequestHandler = async ({ url }) => {
  const country = url.searchParams.get('country') || 'US';
  const areaCodes =
    country === 'US'
      ? (US_AREA_CODES as { code: string; location: string }[])
      : country === 'CA'
        ? (CA_AREA_CODES as { code: string; location: string }[])
        : [];
  return json({ success: true, areaCodes, country });
};
