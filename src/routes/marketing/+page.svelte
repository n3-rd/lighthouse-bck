<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import AuthModal from '$lib/components/AuthModal.svelte';
  import { marketingPage } from '$lib/featurePageData.js';

  let { data } = $props();

  const topRow: { label: string; href?: string | null }[] = [
    { label: 'Local Ranking Tool', href: 'https://seo-rank-grid-tracker.vercel.app' },
    { label: 'Citations', href: null },
    { label: 'Reviews', href: null },
  ];
  const bottomRow = [
    { label: 'Call Tracking', href: '/call-tracking' },
    { label: 'Audit\nHidden Lighthouse', href: '/audit' },
    { label: 'AI Search', href: null },
  ];

  let authModalOpen = $state(false);

  function handleGridClick(item: { href?: string | null }) {
    if (data.user) return;
    authModalOpen = true;
  }

  const gridBaseClass = 'flex min-h-[340px] cursor-pointer items-center justify-center rounded-lg px-4 py-4 text-center font-semibold text-zinc-900 transition-opacity hover:opacity-90';
  const topCardClass = 'bg-[#FF7272]';
  const bottomCardClass = 'bg-[#FFDADA] whitespace-pre-line';
</script>

<svelte:head>
  <title>Marketing — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={marketingPage} />

<div class="mx-auto mt-12 w-full max-w-[1300px] px-4 pb-12">
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
    {#each topRow as item}
      {#if data.user && item.href}
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          class="{gridBaseClass} {topCardClass}"
        >
          {item.label}
        </a>
      {:else}
        <button
          type="button"
          class="{gridBaseClass} {topCardClass} border-0"
          onclick={() => handleGridClick(item)}
        >
          {item.label}
        </button>
      {/if}
    {/each}
    {#each bottomRow as item}
      {#if data.user && item.href}
        <a
          href={item.href}
          class="{gridBaseClass} {bottomCardClass}"
        >
          {item.label}
        </a>
      {:else}
        <button
          type="button"
          class="{gridBaseClass} {bottomCardClass} border-0"
          onclick={() => handleGridClick(item)}
        >
          {item.label}
        </button>
      {/if}
    {/each}
  </div>
</div>

<AuthModal
  open={authModalOpen}
  redirectAfter="/audit"
  onclose={() => (authModalOpen = false)}
/>
