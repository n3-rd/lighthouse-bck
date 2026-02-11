<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { conversationalAiPage } from '$lib/featurePageData.js';
</script>

<svelte:head>
  <title>Conversational AI — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={conversationalAiPage} />
