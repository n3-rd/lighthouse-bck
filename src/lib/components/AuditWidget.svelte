<script lang="ts">
  import RadialScore from '$lib/components/RadialScore.svelte';

  type User = { email: string; credits: number } | null;
  let { user = null }: { user?: User } = $props();

  let url = $state('');
  let loading = $state(false);
  let error = $state('');
  let result = $state<{
    auditId: string;
    url: string;
    scores: { performance: number; seo: number; bestPractices: number; accessibility: number };
    creditsRemaining: number;
  } | null>(null);

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
    loading = true;
    try {
      const res = await fetch('/api/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: normalized }),
      });
      const out = await res.json();
      if (res.ok) {
        result = {
          auditId: out.auditId,
          url: out.url,
          scores: out.scores,
          creditsRemaining: out.creditsRemaining,
        };
      } else {
        error = out.error ?? 'Request failed';
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="w-full max-w-xl rounded-lg border border-zinc-300 bg-white p-5 shadow-sm">
  <h3 class="text-lg font-semibold text-zinc-900">Submit your URL</h3>

  {#if !user}
    <p class="mt-3 text-sm text-zinc-600">
      <a href="/audit" class="text-[#4db2ec] font-semibold underline hover:opacity-90">Sign in</a> to run an audit.
    </p>
  {:else}
    <p class="mt-1 text-[13px] text-zinc-500">{user.email} · {user.credits} credits (5 per audit)</p>
    <form
      class="mt-4 flex flex-col sm:flex-row gap-3"
      onsubmit={(e) => {
        e.preventDefault();
        runAudit();
      }}
    >
      <input
        type="text"
        class="h-10 flex-1 min-w-0 rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none transition-colors focus:border-zinc-500"
        placeholder="e.g. https://example.com"
        bind:value={url}
        disabled={loading}
      />
      <button
        type="submit"
        class="h-10 shrink-0 rounded-md bg-zinc-900 px-4 text-[14px] font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
        disabled={loading}
      >
        Run audit
      </button>
    </form>
    

    {#if loading}
      <div class="mt-4" role="progressbar" aria-valuetext="Running audit…">
        <div class="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div class="audit-progress-bar h-full rounded-full bg-[#4db2ec]"></div>
        </div>
      </div>
    {/if}

    {#if error}
      <div class="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
    {/if}

    {#if result && !loading}
      <div class="mt-6 border-t border-zinc-200 pt-6" data-testid="audit-results">
        <p class="text-[13px] text-zinc-500 mb-4">URL: {result.url}</p>
        <div class="flex flex-wrap gap-6 justify-start">
          <RadialScore score={result.scores.performance} label="Performance" />
          <RadialScore score={result.scores.seo} label="SEO" />
          <RadialScore score={result.scores.bestPractices} label="Best practices" />
          <RadialScore score={result.scores.accessibility} label="Accessibility" />
        </div>
        <p class="mt-4">
          <a href="/audit/{result.auditId}" class="text-[rgb(24,87,155)] font-semibold underline hover:opacity-90">View full details →</a>
        </p>
      </div>
    {/if}
  {/if}
</div>

<style>
  .audit-progress-bar {
    width: 40%;
    animation: audit-progress 1.2s ease-in-out infinite;
  }
  @keyframes audit-progress {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(250%);
    }
    100% {
      transform: translateX(-100%);
    }
  }
</style>
