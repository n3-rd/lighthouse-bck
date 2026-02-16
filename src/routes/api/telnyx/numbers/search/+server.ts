import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requireAuth } from '$lib/server/auth.js';

const TELNYX_API = 'https://api.telnyx.com/v2';

export const GET: RequestHandler = async ({ url, locals }) => {
  requireAuth(locals);
  const apiKey = env.TELNYX_API_KEY;
  if (!apiKey) {
    return json({ success: false, error: 'Telnyx not configured' }, { status: 503 });
  }

  try {
    const countryCode = url.searchParams.get('country_code') || 'US';
    const areaCode = url.searchParams.get('area_code');
    const phoneNumber = url.searchParams.get('phone_number');
    const limit = url.searchParams.get('limit') || '20';
    const features = url.searchParams.get('features');

    const params = new URLSearchParams({
      'filter[country_code]': countryCode,
      'page[size]': limit,
    });
    if (countryCode === 'US' || countryCode === 'CA') {
      params.append('filter[best_effort]', 'true');
    }
    if (areaCode) params.append('filter[national_destination_code]', areaCode.trim());
    if (phoneNumber) params.append('filter[contains]', phoneNumber.trim());
    if (features) {
      features.split(',').forEach((f) => params.append('filter[features]', f.trim()));
    }

    const res = await fetch(`${TELNYX_API}/available_phone_numbers?${params}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();

    if (!res.ok) {
      return json(
        { success: false, error: data.errors?.[0]?.detail || 'Failed to search numbers' },
        { status: res.status }
      );
    }

    const numbers = (data.data ?? []).map((num: { phone_number?: string; region_information?: { region_name?: string }[]; phone_number_type?: string; cost_information?: { upfront_cost?: string; monthly_cost?: string }; features?: { sms?: boolean; voice?: boolean; mms?: boolean } }) => ({
      number: num.phone_number,
      location: num.region_information?.[0]?.region_name ?? 'Unknown',
      type: num.phone_number_type ?? 'Local',
      upfront: `$${num.cost_information?.upfront_cost ?? '0.00'}`,
      monthly: `$${num.cost_information?.monthly_cost ?? '0.00'}`,
    }));

    return json({ success: true, numbers, meta: data.meta });
  } catch (e) {
    console.error('Telnyx search error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Search failed' }, { status: 500 });
  }
};
