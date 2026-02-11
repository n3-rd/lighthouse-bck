<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { communicationHubPage } from '$lib/featurePageData.js';
</script>

<svelte:head>
  <title>Communication Hub — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={communicationHubPage} />
