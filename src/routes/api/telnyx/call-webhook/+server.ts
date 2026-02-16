import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';

/** Minimal Telnyx call webhook: on call.hangup, create a CallLog for analytics. */
export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const isEventApi = body.data && typeof (body.data as { event_type?: string }).event_type === 'string';
    const eventType = isEventApi
      ? (body.data as { event_type: string }).event_type
      : (body.event_type as string) ?? (body.hangup_cause ? 'call.hangup' : null);
    const payload = (isEventApi ? (body.data as { payload?: Record<string, unknown> }).payload : body) ?? body;

    if (eventType !== 'call.hangup') {
      return json({ received: true });
    }

    const toRaw = String(payload?.to ?? '').trim();
    const fromRaw = String(payload?.from ?? '').trim();
    const direction = payload?.direction === 'incoming' ? 'inbound' : 'outbound';
    const callControlId = String(payload?.call_control_id ?? payload?.call_control_id ?? '').trim();
    const startTime = payload?.start_time as string | undefined;
    const endTime = payload?.end_time as string | undefined;
    let durationSeconds: number | null = null;
    if (startTime && endTime) {
      try {
        const s = new Date(startTime).getTime();
        const e = new Date(endTime).getTime();
        if (!Number.isNaN(s) && !Number.isNaN(e) && e >= s) {
          durationSeconds = Math.round((e - s) / 1000);
        }
      } catch {
        // ignore
      }
    }

    const ourNumber = direction === 'inbound' ? toRaw : fromRaw;
    const theirNumber = direction === 'inbound' ? fromRaw : toRaw;
    if (!ourNumber || !theirNumber) return json({ received: true });

    const phone = await prisma.phoneNumber.findFirst({
      where: { phoneNumber: ourNumber },
      select: { id: true, userId: true },
    });
    if (!phone) return json({ received: true });

    if (callControlId) {
      const existing = await prisma.callLog.findFirst({
        where: { telnyxCallId: callControlId, userId: phone.userId },
      });
      if (existing) {
        await prisma.callLog.update({
          where: { id: existing.id },
          data: { durationSeconds, fromNumber: fromRaw, toNumber: toRaw },
        });
        return json({ received: true });
      }
    }

    await prisma.callLog.create({
      data: {
        userId: phone.userId,
        phoneNumberId: phone.id,
        direction,
        fromNumber: fromRaw,
        toNumber: toRaw,
        durationSeconds,
        telnyxCallId: callControlId || undefined,
      },
    });
  } catch (e) {
    console.error('Telnyx call webhook error:', e);
  }
  return json({ received: true });
};
