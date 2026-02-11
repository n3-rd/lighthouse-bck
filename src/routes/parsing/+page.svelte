<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { parsingPage } from '$lib/featurePageData.js';
</script>

<svelte:head>
  <title>Parsing — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={parsingPage} />
