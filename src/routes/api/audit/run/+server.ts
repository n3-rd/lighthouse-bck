import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/server/db.js';
import { requireAuth } from '$lib/server/auth.js';
import { runLighthouseAudit, runLighthouseAuditWithProgress } from '$lib/server/lighthouse.js';

const AUDIT_COST = 5;

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u.startsWith('http://') && !u.startsWith('https://')) return 'https://' + u;
  return u;
}

export const POST: RequestHandler = async ({ request, locals, url: requestUrl }) => {
  const user = requireAuth(locals);

  const body = (await request.json()) as { url?: string };
  let url = typeof body.url === 'string' ? body.url.trim() : '';
  if (!url) {
    return json({ error: 'URL is required' }, { status: 400 });
  }
  url = normalizeUrl(url);
  const stream = requestUrl.searchParams.get('stream') === '1';

  if (stream) {
    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          await prisma.$transaction(async (tx) => {
            const currentUser = await tx.user.findUniqueOrThrow({
              where: { id: user.id },
            });
            if (currentUser.credits < AUDIT_COST) {
              throw new Error('Insufficient credits');
            }
            await tx.user.update({
              where: { id: user.id },
              data: { credits: { decrement: AUDIT_COST } },
            });
            await tx.transaction.create({
              data: {
                userId: user.id,
                amount: -AUDIT_COST,
                reason: 'audit',
                balanceAfter: currentUser.credits - AUDIT_COST,
              },
            });
          });

          const auditResult = await runLighthouseAuditWithProgress(url, (message) => {
            controller.enqueue(encoder.encode(JSON.stringify({ type: 'status', message }) + '\n'));
          });

          const audit = await prisma.audit.create({
            data: {
              userId: user.id,
              url,
              performance: auditResult.performance,
              seo: auditResult.seo,
              accessibility: auditResult.accessibility,
              bestPractices: auditResult.bestPractices,
              lighthouseJson: auditResult.raw as object,
            },
          });

          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'result',
                auditId: audit.id,
                url,
                scores: {
                  performance: auditResult.performance,
                  seo: auditResult.seo,
                  bestPractices: auditResult.bestPractices,
                  accessibility: auditResult.accessibility,
                },
                creditsRemaining: user.credits - AUDIT_COST,
              }) + '\n'
            )
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Audit failed to run';
          if (message === 'Insufficient credits') {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'error', error: message, status: 402 }) + '\n')
            );
          } else {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'error', error: message, status: 500 }) + '\n')
            );
          }
        } finally {
          controller.close();
        }
      },
    });
    return new Response(streamResponse, {
      headers: { 'Content-Type': 'application/x-ndjson' },
    });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const currentUser = await tx.user.findUniqueOrThrow({
        where: { id: user.id },
      });
      if (currentUser.credits < AUDIT_COST) {
        throw new Error('Insufficient credits');
      }
      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: AUDIT_COST } },
      });
      await tx.transaction.create({
        data: {
          userId: user.id,
          amount: -AUDIT_COST,
          reason: 'audit',
          balanceAfter: currentUser.credits - AUDIT_COST,
        },
      });
    });

    const auditResult = await runLighthouseAudit(url);

    const audit = await prisma.audit.create({
      data: {
        userId: user.id,
        url,
        performance: auditResult.performance,
        seo: auditResult.seo,
        accessibility: auditResult.accessibility,
        bestPractices: auditResult.bestPractices,
        lighthouseJson: auditResult.raw as object,
      },
    });

    const reportHtml = `
<div class="cs-report">
  <div class="cs-header">
    <h2>ClearSky Quick Audit Report</h2>
    <p class="cs-url">URL Analyzed: ${url}</p>
  </div>
  <div class="cs-score-section">
    <div class="cs-score-card">
      <span class="label">Performance</span>
      <span class="value">${auditResult.performance}%</span>
    </div>
    <div class="cs-score-card">
      <span class="label">SEO</span>
      <span class="value">${auditResult.seo}%</span>
    </div>
    <div class="cs-score-card">
      <span class="label">Best Practices</span>
      <span class="value">${auditResult.bestPractices}%</span>
    </div>
    <div class="cs-score-card">
      <span class="label">Accessibility</span>
      <span class="value">${auditResult.accessibility}%</span>
    </div>
  </div>
  <div class="cs-overall">
    <h3>Overall Score</h3>
    <p class="score">${Math.round(
      (auditResult.performance +
        auditResult.seo +
        auditResult.bestPractices +
        auditResult.accessibility) /
        4
    )}%</p>
    <p class="explanation">This score reflects Lighthouse-based performance, SEO readiness, accessibility, and technical health.</p>
  </div>
  <div class="cs-footer">
    <p>Generated by ClearSky Quick Audit</p>
  </div>
</div>
`;

    return json({
      auditId: audit.id,
      url,
      html: reportHtml,
      scores: {
        performance: auditResult.performance,
        seo: auditResult.seo,
        bestPractices: auditResult.bestPractices,
        accessibility: auditResult.accessibility,
      },
      creditsRemaining: user.credits - AUDIT_COST,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Audit failed to run';
    if (message === 'Insufficient credits') {
      return json({ error: 'Insufficient credits' }, { status: 402 });
    }
    console.error('Audit failed:', err);
    return json({ error: 'Audit failed to run' }, { status: 500 });
  }
};
