<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { viewroomPage } from '$lib/featurePageData.js';

  let { data } = $props();
  const flash = $derived(
    data.signedIn ? 'Signed in.' : data.error === 'invalid_or_expired' ? 'Link invalid or expired.' : data.error === 'token_required' ? 'Missing token.' : ''
  );
</script>

<svelte:head>
  <title>ClearSKY — Business Platform</title>
</svelte:head>

{#if flash}
  <p class="text-center text-green-600 font-medium mb-4">{flash}</p>
{/if}

<FeaturePage config={viewroomPage} />
