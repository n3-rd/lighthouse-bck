import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { requireAuth } from '$lib/server/auth.js';

const TELNYX_API = 'https://api.telnyx.com/v2';

export const POST: RequestHandler = async ({ request, locals }) => {
  const user = requireAuth(locals);
  const apiKey = env.TELNYX_API_KEY;
  if (!apiKey) {
    return json({ success: false, error: 'Telnyx not configured' }, { status: 503 });
  }

  const body = (await request.json()) as { phone_numbers?: string[] };
  const phoneNumbers = Array.isArray(body.phone_numbers) ? body.phone_numbers.filter((n) => typeof n === 'string' && n.trim()) : [];
  if (phoneNumbers.length === 0) {
    return json({ success: false, error: 'phone_numbers array is required' }, { status: 400 });
  }

  try {
    const res = await fetch(`${TELNYX_API}/number_orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        phone_numbers: phoneNumbers.map((phone_number) => ({ phone_number })),
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      return json(
        { success: false, error: data.errors?.[0]?.detail || 'Failed to purchase numbers' },
        { status: res.status }
      );
    }

    const orderData = data.data;
    const purchased = orderData?.phone_numbers ?? [];

    for (const numData of purchased) {
      const phoneNumber = numData.phone_number;
      const telnyxId = numData.id ?? null;
      if (!phoneNumber) continue;
      await prisma.phoneNumber.upsert({
        where: { userId_phoneNumber: { userId: user.id, phoneNumber } },
        create: { userId: user.id, phoneNumber, telnyxPhoneNumberId: telnyxId },
        update: { telnyxPhoneNumberId: telnyxId },
      });
    }

    return json({
      success: true,
      orderId: orderData?.id,
      count: purchased.length,
    });
  } catch (e) {
    console.error('Telnyx buy error:', e);
    return json({ success: false, error: e instanceof Error ? e.message : 'Purchase failed' }, { status: 500 });
  }
};
