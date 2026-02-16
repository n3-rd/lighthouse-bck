<script lang="ts">
  import { page } from '$app/stores';
  let name = $state('');
  let email = $state('');
  let password = $state('');
  let message = $state('');
  let loading = $state(false);

  async function submitSignup(e: Event) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    loading = true;
    message = '';
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        credentials: 'include',
      });
      const out = await res.json();
      if (res.ok) {
        const to = new URL(document.location.href).searchParams.get('redirect');
        window.location.href = to && to.startsWith('/') ? to : '/';
        return;
      }
      message = out.error ?? 'Signup failed';
    } catch (e) {
      message = String(e);
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Sign up – ClearSky</title>
</svelte:head>

<h1 class="text-2xl font-semibold tracking-tight text-zinc-900">Create account</h1>
<p class="mt-1 text-zinc-600">Name, email, and a password (min 8 characters).</p>

<form class="flex flex-col gap-4 max-w-[320px]" onsubmit={submitSignup}>
  <label class="flex flex-col gap-1.5">
    <span class="text-[13px] font-medium text-zinc-700">Name</span>
    <input
      type="text"
      bind:value={name}
      placeholder="Jane Doe"
      required
      autocomplete="name"
      class="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
    />
  </label>
  <label class="flex flex-col gap-1.5">
    <span class="text-[13px] font-medium text-zinc-700">Email</span>
    <input
      type="email"
      bind:value={email}
      placeholder="you@example.com"
      required
      autocomplete="email"
      class="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
    />
  </label>
  <label class="flex flex-col gap-1.5">
    <span class="text-[13px] font-medium text-zinc-700">Password (min 8 characters)</span>
    <input
      type="password"
      bind:value={password}
      placeholder="••••••••"
      required
      minlength="8"
      autocomplete="new-password"
      class="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
    />
  </label>
  {#if message}
    <p class="text-[14px] text-red-600">{message}</p>
  {/if}
  <button
    type="submit"
    disabled={loading}
    class="h-11 rounded-lg bg-primary-light px-4 text-[15px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
  >
    {loading ? 'Creating account…' : 'Sign up'}
  </button>
</form>

<p class="mt-6 text-[15px] text-zinc-600">
  <a href="/auth/login{$page.url.search}" class="text-primary font-semibold underline hover:opacity-90">Already have an account? Log in</a>
  <span class="mx-2">·</span>
  <a href="/" class="text-primary font-semibold underline hover:opacity-90">Back</a>
</p>

