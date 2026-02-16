import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

function getDateRange(period: string): { start: Date; end: Date } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === 'last_7') {
    start.setDate(start.getDate() - 6);
  } else if (period === 'last_30') {
    start.setDate(start.getDate() - 29);
  } else {
    start.setDate(1);
  }
  return { start, end };
}

export const load: PageServerLoad = async ({ locals, url }) => {
  if (!locals.user) {
    throw redirect(302, '/auth/login?redirect=/call-tracking');
  }

  if (typeof (prisma as { phoneNumber?: { count: (a: unknown) => Promise<number> } }).phoneNumber?.count !== 'function') {
    throw redirect(302, '/call-tracking/buy');
  }
  const count = await prisma.phoneNumber.count({ where: { userId: locals.user.id } });
  if (count === 0) {
    throw redirect(302, '/call-tracking/buy');
  }

  const period = url.searchParams.get('period') ?? 'this_month';
  const { start, end } = getDateRange(period);

  const [numbers, logs, totals, byDay, durationAgg] = await Promise.all([
    prisma.phoneNumber.findMany({
      where: { userId: locals.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, phoneNumber: true },
    }),
    prisma.callLog.findMany({
      where: { userId: locals.user.id, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { phoneNumber: { select: { phoneNumber: true } } },
    }),
    prisma.callLog.groupBy({
      by: ['direction'],
      where: { userId: locals.user.id, createdAt: { gte: start, lte: end } },
      _count: { id: true },
    }),
    prisma.$queryRaw<{ day: Date; direction: string; count: bigint }[]>`
      SELECT "createdAt"::date as day, direction, COUNT(*)::bigint as count
      FROM "CallLog"
      WHERE "userId" = ${locals.user.id} AND "createdAt" >= ${start} AND "createdAt" <= ${end}
      GROUP BY "createdAt"::date, direction
      ORDER BY day
    `.then((rows) =>
      rows.map((r) => ({
        day: r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
        direction: r.direction,
        count: Number(r.count),
      }))
    ),
    prisma.callLog.aggregate({
      where: {
        userId: locals.user.id,
        createdAt: { gte: start, lte: end },
        durationSeconds: { not: null },
      },
      _avg: { durationSeconds: true },
      _count: { id: true },
    }),
  ]);

  const inboundTotal = totals.find((t) => t.direction === 'inbound')?._count?.id ?? 0;
  const outboundTotal = totals.find((t) => t.direction === 'outbound')?._count?.id ?? 0;

  const dayMap = new Map<string, { inbound: number; outbound: number }>();
  const days: string[] = [];
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (d <= endDay) {
    const key = d.toISOString().slice(0, 10);
    days.push(key);
    dayMap.set(key, { inbound: 0, outbound: 0 });
    d.setDate(d.getDate() + 1);
  }
  for (const row of byDay) {
    if (!dayMap.has(row.day)) dayMap.set(row.day, { inbound: 0, outbound: 0 });
    const entry = dayMap.get(row.day)!;
    if (row.direction === 'inbound') entry.inbound = row.count;
    else if (row.direction === 'outbound') entry.outbound = row.count;
  }
  const callsOverTime = days.sort().map((date) => ({ date, ...dayMap.get(date)! }));

  const avgDurationSeconds = durationAgg._avg.durationSeconds ?? null;
  const callsWithDuration = durationAgg._count.id;

  let peakDay: { date: string; count: number } | null = null;
  for (const row of callsOverTime) {
    const total = row.inbound + row.outbound;
    if (total > 0 && (!peakDay || total > peakDay.count)) {
      peakDay = { date: row.date, count: total };
    }
  }

  return {
    period,
    start: start.toISOString(),
    end: end.toISOString(),
    numbers,
    voiceLogs: logs,
    callsOverTime,
    avgDurationSeconds,
    callsWithDuration,
    peakDay,
    stats: {
      inboundTotal,
      outboundTotal,
      totalCalls: inboundTotal + outboundTotal,
    },
  };
};
