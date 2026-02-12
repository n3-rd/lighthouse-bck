<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { marketingPage } from '$lib/featurePageData.js';

  const topRow = ['Local Ranking Tool', 'Citations', 'Reviews'];
  const bottomRow = [
    { label: 'Call Tracking', href: null },
    { label: 'Audit\nHidden Lighthouse', href: '/audit' },
    { label: 'AI Search', href: null },
  ];
</script>

<svelte:head>
  <title>Marketing — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={marketingPage} />

<div class="mx-auto mt-12 w-full max-w-[1300px] px-4 pb-12">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
    {#each topRow as label}
      <div
        class="flex min-h-[340px] items-center justify-center rounded-lg bg-[#FF7272] px-4 py-4 text-center font-semibold text-zinc-900"
      >
        {label}
      </div>
    {/each}
    {#each bottomRow as item}
      {#if item.href}
        <a
          href={item.href}
          class="flex min-h-[340px] items-center justify-center rounded-lg bg-[#FFDADA] px-4 py-4 text-center font-semibold text-zinc-900 whitespace-pre-line transition-opacity hover:opacity-90"
        >
          {item.label}
        </a>
      {:else}
        <div
          class="flex min-h-[340px] items-center justify-center rounded-lg bg-[#FFDADA] px-4 py-4 text-center font-semibold text-zinc-900 whitespace-pre-line"
        >
          {item.label}
        </div>
      {/if}
    {/each}
  </div>
</div>
