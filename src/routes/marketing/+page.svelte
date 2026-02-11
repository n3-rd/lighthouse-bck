<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { marketingPage } from '$lib/featurePageData.js';
</script>

<svelte:head>
  <title>Marketing — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={marketingPage} />
