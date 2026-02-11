<script lang="ts">
  import FeaturePage from '$lib/components/FeaturePage.svelte';
  import { chatbotPage } from '$lib/featurePageData.js';
</script>

<svelte:head>
  <title>Chatbot — ClearSKY Business Platform</title>
</svelte:head>

<FeaturePage config={chatbotPage} />
