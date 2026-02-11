import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/db.js';

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user;
  if (!user) {
    throw error(401, 'Sign in to view this audit');
  }
  const id = params.id;
  if (!id) throw error(404, 'Not found');
  const audit = await prisma.audit.findFirst({
    where: { id, userId: user.id },
  });
  if (!audit) {
    throw error(404, 'Audit not found');
  }
  const report = audit.lighthouseJson as Record<string, unknown> | null;
  const categories = report?.categories as Record<string, { id?: string; title?: string; score?: number; auditRefs?: { id: string; weight?: number }[] }> | undefined;
  const audits = report?.audits as Record<string, { id?: string; title?: string; description?: string; score?: number | null; displayValue?: string }> | undefined;
  return {
    audit: {
      id: audit.id,
      url: audit.url,
      createdAt: audit.createdAt,
      performance: audit.performance,
      seo: audit.seo,
      accessibility: audit.accessibility,
      bestPractices: audit.bestPractices,
    },
    categories: categories ?? {},
    audits: audits ?? {},
  };
};
