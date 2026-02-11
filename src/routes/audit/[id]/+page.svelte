<script lang="ts">
  import RadialScore from '$lib/components/RadialScore.svelte';

  let { data } = $props();
  let openSections = $state<Record<string, boolean>>({
    performance: true,
    seo: true,
    accessibility: true,
    'best-practices': true,
  });

  const mainCategories = $derived(
    ['performance', 'seo', 'accessibility', 'best-practices'].map((key) => {
      const cat = data.categories[key];
      const score = cat?.score != null ? Math.round(cat.score * 100) : 0;
      const title = cat?.title ?? key;
      return { key, title, score, auditRefs: cat?.auditRefs ?? [] };
    })
  );

  function getAudit(auditId: string) {
    return data.audits[auditId];
  }

  function scoreColor(score: number): string {
    return score >= 50 ? 'text-green-600' : 'text-red-600';
  }

  function toggleSection(key: string) {
    openSections[key] = !openSections[key];
  }
</script>

<svelte:head>
  <title>Audit details — {data.audit.url}</title>
</svelte:head>

<div class="max-w-4xl">
  <p class="text-sm text-zinc-500 mb-2">
    <a href="/audit" class="text-zinc-600 hover:text-zinc-900 hover:underline">← Back to audit</a>
  </p>
  <h1 class="text-xl font-semibold text-zinc-900 mb-1">{data.audit.url}</h1>
  <p class="text-sm text-zinc-500 mb-8">Audit run at {new Date(data.audit.createdAt).toLocaleString()}</p>

  <div class="flex flex-wrap gap-8 justify-center mb-12">
    {#each mainCategories as cat}
      <RadialScore score={cat.score} label={cat.title} />
    {/each}
  </div>

  <div class="space-y-3">
    {#each mainCategories as cat}
      <section class="border border-zinc-300 rounded-lg overflow-hidden bg-white shadow-sm">
        <button
          type="button"
          class="w-full px-4 py-3 flex items-center justify-between gap-3 text-left bg-neutral-100 hover:bg-neutral-200 border-b border-neutral-300 transition-colors"
          onclick={() => toggleSection(cat.key)}
          aria-expanded={openSections[cat.key]}
        >
          <span class="font-semibold text-neutral-900">{cat.title}</span>
          <span class="flex items-center gap-2 shrink-0">
            <span class="text-sm font-semibold tabular-nums {scoreColor(cat.score)}">{cat.score}/100</span>
            <svg
              class="w-5 h-5 text-neutral-700 transition-transform"
              class:rotate-180={openSections[cat.key]}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
        {#if openSections[cat.key]}
          <ul class="divide-y divide-zinc-100">
            {#each cat.auditRefs as ref}
              {@const audit = getAudit(ref.id)}
              {#if audit}
                <li class="px-4 py-3 flex items-start sm:items-center gap-4">
                  <div class="min-w-0 flex-1">
                    <span class="font-medium text-zinc-900">{audit.title ?? ref.id}</span>
                    {#if audit.description}
                      <p class="text-sm text-zinc-600 mt-0.5 line-clamp-2">{audit.description}</p>
                    {/if}
                  </div>
                  <div class="flex items-center gap-2 shrink-0 w-24 justify-end text-right tabular-nums">
                    {#if audit.score != null}
                      {@const isGood = audit.score >= 0.5}
                      <span class="text-sm font-semibold {isGood ? 'text-green-600' : 'text-red-600'}">
                        {audit.score === 1 ? 'Pass' : audit.score === 0 ? 'Fail' : Math.round(audit.score * 100)}
                      </span>
                    {/if}
                    {#if audit.displayValue}
                      <span class="text-sm text-zinc-500">{audit.displayValue}</span>
                    {/if}
                  </div>
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      </section>
    {/each}
  </div>
</div>
