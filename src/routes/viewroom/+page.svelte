<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { viewroomPage } from '$lib/featurePageData.js';
</script>

<svelte:head>
  <title>ViewRoom — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={viewroomPage} />
