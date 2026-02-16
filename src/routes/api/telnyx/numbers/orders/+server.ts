import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { requireAuth } from '$lib/server/auth.js';

const TELNYX_API = 'https://api.telnyx.com/v2';

export const GET: RequestHandler = async ({ url, locals }) => {
  const user = requireAuth(locals);
  const apiKey = env.TELNYX_API_KEY;
  if (!apiKey) {
    return json({ success: false, error: 'Telnyx not configured' }, { status: 503 });
  }

  try {
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '20';

    const res = await fetch(
      `${TELNYX_API}/number_orders?page[number]=${page}&page[size]=${limit}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );
    const data = await res.json();

    if (!res.ok) {
      return json(
        { success: false, error: data.errors?.[0]?.detail || 'Failed to fetch orders' },
        { status: res.status }
      );
    }

    const userNumbers = await prisma.phoneNumber.findMany({
      where: { userId: user.id },
      select: { phoneNumber: true },
    });
    const userSet = new Set(userNumbers.map((n) => n.phoneNumber));

    const allOrders = data.data ?? [];
    const orders = allOrders
      .filter((order: { phone_numbers?: { phone_number?: string }[] }) =>
        (order.phone_numbers ?? []).some((p: { phone_number?: string }) => userSet.has(p.phone_number))
      )
      .map((order: { id: string; created_at?: string; phone_numbers?: { phone_number?: string }[]; status?: string }) => ({
        orderId: order.id,
        subOrderId: order.id,
        date: order.created_at ? new Date(order.created_at).toLocaleString() : '—',
        status: order.status ?? 'Unknown',
        country: order.phone_numbers?.[0]?.phone_number?.startsWith('+1') ? 'US' : 'Other',
        numberType: 'Local',
      }));

    return json({ success: true, orders, meta: data.meta });
  } catch (e) {
    console.error('Telnyx orders error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Failed to fetch orders' }, { status: 500 });
  }
};
