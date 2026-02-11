<script lang="ts">
  import { goto } from '$app/navigation';
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
    status = 'Analyzing… (may take 10–20s)';
    loading = true;
    try {
      const res = await fetch('/api/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      const out = await res.json();
      if (res.ok) {
        status = `Done. Credits remaining: ${out.creditsRemaining}`;
        result = {
          auditId: out.auditId,
          url: out.url,
          scores: out.scores,
          creditsRemaining: out.creditsRemaining,
        };
      } else {
        status = '';
        error = out.error ?? 'Request failed';
      }
    } catch (err) {
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

{#if !data.user}
  <p class="text-zinc-600">Please complete a demo form first (ViewRoom or Marketing) to run an audit.</p>
  <p class="mt-2"><a href="/viewroom" class="text-[rgb(24,87,155)] font-semibold underline">ViewRoom</a> · <a href="/marketing" class="text-[rgb(24,87,155)] font-semibold underline">Marketing</a></p>
{:else}
  <p class="text-zinc-600">Signed in as {data.user.email} · {data.user.credits} credits (5 per audit)</p>
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

  {#if status}
    <p class="mt-4 text-zinc-600">{status}</p>
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
        <a href="/audit/{result.auditId}" class="text-[rgb(24,87,155)] font-semibold underline">View full details →</a>
      </p>
    </div>
  {/if}
{/if}
