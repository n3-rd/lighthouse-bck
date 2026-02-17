<script lang="ts">
  let {
    open = false,
    redirectAfter = null as string | null,
    onclose = () => {},
  }: {
    open?: boolean;
    redirectAfter?: string | null;
    onclose?: () => void;
  } = $props();

  let tab = $state<'login' | 'signup'>('login');
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let message = $state('');
  let loading = $state(false);

  function close() {
    onclose();
    message = '';
    email = '';
    password = '';
    name = '';
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) close();
  }

  $effect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  async function submitLogin(e: Event) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    loading = true;
    message = '';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: 'include',
      });
      const out = await res.json();
      if (res.ok) {
        close();
        window.location.href = redirectAfter && redirectAfter.startsWith('/') ? redirectAfter : '/';
        return;
      }
      message = out.error ?? 'Login failed';
    } catch (err) {
      message = String(err);
    } finally {
      loading = false;
    }
  }

  async function submitSignup(e: Event) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || password.length < 8) return;
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
        close();
        window.location.href = redirectAfter && redirectAfter.startsWith('/') ? redirectAfter : '/';
        return;
      }
      message = out.error ?? 'Signup failed';
    } catch (err) {
      message = String(err);
    } finally {
      loading = false;
    }
  }
</script>

{#if open}
  <div
    class="auth-modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-title"
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && close()}
  >
    <div
      class="auth-modal-card relative w-full max-w-[420px] rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200/80"
    >
      <div class="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
        <div class="flex rounded-lg bg-zinc-100 p-0.5">
          <button
            type="button"
            class="rounded-md px-4 py-2 text-[14px] font-medium transition-colors {tab === 'login' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-600'}"
            onclick={() => { tab = 'login'; message = ''; }}
          >
            Log in
          </button>
          <button
            type="button"
            class="rounded-md px-4 py-2 text-[14px] font-medium transition-colors {tab === 'signup' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-600'}"
            onclick={() => { tab = 'signup'; message = ''; }}
          >
            Sign up
          </button>
        </div>
        <button
          type="button"
          class="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          aria-label="Close"
          onclick={close}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>

      <h2 id="auth-modal-title" class="sr-only">{tab === 'login' ? 'Log in' : 'Sign up'}</h2>

      <div class="p-6">
        {#if tab === 'login'}
          <form class="flex flex-col gap-4" onsubmit={submitLogin}>
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
              <span class="text-[13px] font-medium text-zinc-700">Password</span>
              <input
                type="password"
                bind:value={password}
                placeholder="••••••••"
                required
                autocomplete="current-password"
                class="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 outline-none transition-colors focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
              />
            </label>
            {#if message}
              <p class="text-[14px] text-red-600">{message}</p>
            {/if}
            <button
              type="submit"
              disabled={loading}
              class="mt-2 h-11 w-full rounded-lg bg-primary-light px-4 text-[15px] font-semibold text-white transition-colors hover:bg-primary-light/90 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        {:else}
          <form class="flex flex-col gap-4" onsubmit={submitSignup}>
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
              class="mt-2 h-11 w-full rounded-lg bg-primary-light px-4 text-[15px] font-semibold text-white transition-colors hover:bg-primary-light/90 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
          </form>
        {/if}
      </div>
    </div>
  </div>
{/if}
