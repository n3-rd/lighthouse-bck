<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
</script>

<div class="min-h-screen bg-white text-zinc-900 w-full">
  <div class="mx-auto w-full max-w-[1300px] px-4 py-6 overflow-x-hidden" data-testid="container-page">
    <Header />
    <main class="mt-8">
      <slot />
    </main>
  </div>
</div>
