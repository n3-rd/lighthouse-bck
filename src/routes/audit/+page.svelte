<script lang="ts">
  import RadialScore from '$lib/components/RadialScore.svelte';

  let { data } = $props();
  let url = $state('');
  let status = $state('');
  let result = $state<{
    auditId: string;
    url: string;
    scores: { performance: number; seo: number; bestPractices: number; accessibility: number };
    creditsRemaining: number;
  } | null>(null);
  let loading = $state(false);
  let progress = $state(0);
  let error = $state('');

  function normalizeUrl(input: string): string {
    const u = input.trim();
    if (!u) return '';
    if (u.startsWith('http://') || u.startsWith('https://')) return u;
    return 'https://' + u;
  }

  async function runAudit() {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      error = 'Enter a URL';
      return;
    }
    error = '';
    result = null;
    status = 'Starting…';
    loading = true;
    progress = 0;
    try {
      const res = await fetch(`/api/audit/run?stream=1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
        credentials: 'include',
      });
      if (!res.ok || !res.body) {
        const out = await res.json().catch(() => ({}));
        error = out.error ?? 'Request failed';
        status = '';
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let statusCount = 0;
      const PROGRESS_PER_STATUS = 3;
      const PROGRESS_CAP = 95;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const event = JSON.parse(line) as
              | { type: 'status'; message: string }
              | { type: 'result'; auditId: string; url: string; scores: Record<string, number>; creditsRemaining: number }
              | { type: 'error'; error: string; status?: number };
            if (event.type === 'status') {
              status = event.message;
              statusCount++;
              progress = Math.min(PROGRESS_CAP, statusCount * PROGRESS_PER_STATUS);
            } else if (event.type === 'result') {
              progress = 100;
              status = `Done. Credits remaining: ${event.creditsRemaining}`;
              const s = event.scores;
              result = {
                auditId: event.auditId,
                url: event.url,
                scores: {
                  performance: s.performance,
                  seo: s.seo,
                  bestPractices: s.bestPractices,
                  accessibility: s.accessibility,
                },
                creditsRemaining: event.creditsRemaining,
              };
            } else if (event.type === 'error') {
              status = '';
              error = event.error ?? 'Audit failed';
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err) {
      progress = 0;
      status = '';
      error = err instanceof Error ? err.message : 'Request failed';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Quick Audit — ClearSKY</title>
</svelte:head>

<p class="text-zinc-600">Signed in as {data.user!.email} · {data.user!.credits} credits (5 per audit)</p>
<form class="mt-4 flex flex-col sm:flex-row gap-3 max-w-xl" onsubmit={(e) => { e.preventDefault(); runAudit(); }}>
    <input
      type="text"
      class="h-10 flex-1 rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none focus:border-zinc-500"
      placeholder="e.g. github.com"
      bind:value={url}
      required
    />
    <button type="submit" class="h-10 rounded-md bg-zinc-900 px-4 text-[14px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50" disabled={loading}>Run audit</button>
  </form>

  {#if loading}
    <div class="mt-4 max-w-xl" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-valuetext={status}>
      <div class="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
        <div
          class="h-full rounded-full bg-primary-light transition-[width] duration-300 ease-out"
          style="width: {progress}%"
        ></div>
      </div>
    </div>
  {/if}
  {#if error}
    <div class="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">{error}</div>
  {/if}
  {#if result}
    <div class="mt-8">
      <p class="text-sm text-zinc-500 mb-4">URL: {result.url}</p>
      <div class="flex flex-wrap gap-8 justify-center mb-6">
        <RadialScore score={result.scores.performance} label="Performance" />
        <RadialScore score={result.scores.seo} label="SEO" />
        <RadialScore score={result.scores.bestPractices} label="Best practices" />
        <RadialScore score={result.scores.accessibility} label="Accessibility" />
      </div>
      <p>
        <a href="/audit/{result.auditId}" class="text-primary font-semibold underline">View full details →</a>
      </p>
    </div>
  {/if}
