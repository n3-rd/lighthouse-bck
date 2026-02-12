<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import { page } from '$app/stores';
  const isHome = $derived($page.url.pathname === '/');
</script>

<div class="min-h-screen bg-white text-zinc-900 w-full">
  <div class="mx-auto w-full max-w-[1300px] px-4 py-6 overflow-x-hidden" data-testid="container-page">
    <Header />
  </div>
  <main class:mt-8={!isHome} class={isHome ? 'w-full' : 'mx-auto w-full max-w-[1300px] px-4 overflow-x-hidden'}>
    <slot />
  </main>
</div>
