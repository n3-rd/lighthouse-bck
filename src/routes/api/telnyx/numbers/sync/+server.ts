import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { requireAuth } from '$lib/server/auth.js';

const TELNYX_API = 'https://api.telnyx.com/v2';

type TelnyxPhoneNumber = { id: string; phone_number: string; connection_id?: string | null };

/** Sync phone numbers from Telnyx (for TELNYX_CONNECTION_ID) into DB. Auth required. */
export const POST: RequestHandler = async ({ locals }) => {
  requireAuth(locals);
  const apiKey = env.TELNYX_API_KEY;
  const connectionId = env.TELNYX_CONNECTION_ID;
  const syncUserId = env.TELNYX_SYNC_USER_ID;

  if (!apiKey || !connectionId) {
    return json(
      { success: false, error: 'TELNYX_API_KEY and TELNYX_CONNECTION_ID are required' },
      { status: 503 }
    );
  }

  const allNumbers: TelnyxPhoneNumber[] = [];
  let pageNumber = 1;
  const pageSize = 100;

  try {
    while (true) {
      const params = new URLSearchParams({
        'filter[connection_id]': connectionId,
        'page[size]': String(pageSize),
        'page[number]': String(pageNumber),
      });
      const res = await fetch(`${TELNYX_API}/phone_numbers?${params}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();

      if (!res.ok) {
        return json(
          {
            success: false,
            error: data.errors?.[0]?.detail ?? data.errors?.[0]?.title ?? 'Telnyx API error',
          },
          { status: res.status >= 500 ? 503 : 400 }
        );
      }

      const list = data.data ?? [];
      allNumbers.push(...list);

      const totalPages = data.meta?.total_pages ?? 1;
      if (pageNumber >= totalPages || list.length < pageSize) break;
      pageNumber += 1;
    }

    const userId = syncUserId ?? undefined;
    let created = 0;
    let updated = 0;

    for (const num of allNumbers) {
      const phoneNumber = num.phone_number;
      const telnyxId = num.id ?? null;
      if (!phoneNumber) continue;

      const existing = await prisma.phoneNumber.findFirst({
        where: { OR: [{ telnyxPhoneNumberId: telnyxId }, { phoneNumber }] },
      });

      if (existing) {
        await prisma.phoneNumber.update({
          where: { id: existing.id },
          data: { telnyxPhoneNumberId: telnyxId },
        });
        updated += 1;
      } else if (userId) {
        await prisma.phoneNumber.upsert({
          where: { userId_phoneNumber: { userId, phoneNumber } },
          create: { userId, phoneNumber, telnyxPhoneNumberId: telnyxId },
          update: { telnyxPhoneNumberId: telnyxId },
        });
        created += 1;
      }
    }

    return json({
      success: true,
      synced: allNumbers.length,
      created,
      updated,
    });
  } catch (e) {
    console.error('Telnyx sync error:', e);
    return json(
      { success: false, error: e instanceof Error ? e.message : 'Sync failed' },
      { status: 500 }
    );
  }
};
