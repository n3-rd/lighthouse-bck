<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { aiAutomationPage } from '$lib/featurePageData.js';
</script>

<svelte:head>
  <title>AI Automation — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={aiAutomationPage} />
