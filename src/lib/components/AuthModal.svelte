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
    class="auth-modal-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-title"
    tabindex="-1"
    onclick={handleBackdropClick}
    onkeydown={(e) => e.key === 'Escape' && close()}
  >
    <div
      class="auth-modal-card relative w-full max-w-[400px] rounded-2xl border border-zinc-200 bg-white shadow-xl"
    >
      <h2 id="auth-modal-title" class="sr-only">{tab === 'login' ? 'Log in' : 'Sign up'}</h2>
      <div class="flex border-b border-zinc-200">
        <button
          type="button"
          class="flex-1 py-3.5 text-[15px] font-semibold transition-colors {tab === 'login'
            ? 'border-b-2 border-b-primary text-primary'
            : 'border-b-2 border-transparent text-zinc-500 hover:text-primary-light'}"
          onclick={() => { tab = 'login'; message = ''; }}
        >
          Log in
        </button>
        <button
          type="button"
          class="flex-1 py-3.5 text-[15px] font-semibold transition-colors {tab === 'signup'
            ? 'border-b-2 border-b-primary text-primary'
            : 'border-b-2 border-transparent text-zinc-500 hover:text-primary-light'}"
          onclick={() => { tab = 'signup'; message = ''; }}
        >
          Sign up
        </button>
      </div>

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
              class="mt-1 h-11 rounded-lg bg-primary-light px-4 text-[15px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p class="mt-4 text-center text-[14px] text-zinc-600">
              Don't have an account?
              <button
                type="button"
                class="ml-1 font-semibold text-primary underline hover:opacity-90"
                onclick={() => { tab = 'signup'; message = ''; }}
              >
                Sign up
              </button>
            </p>
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
              class="mt-1 h-11 rounded-lg bg-primary-light px-4 text-[15px] font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Sign up'}
            </button>
            <p class="mt-4 text-center text-[14px] text-zinc-600">
              Already have an account?
              <button
                type="button"
                class="ml-1 font-semibold text-primary underline hover:opacity-90"
                onclick={() => { tab = 'login'; message = ''; }}
              >
                Log in
              </button>
            </p>
          </form>
        {/if}
      </div>

      <button
        type="button"
        class="absolute right-4 top-4 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-primary-light/10 hover:text-primary"
        aria-label="Close"
        onclick={close}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
        </svg>
      </button>
    </div>
  </div>
{/if}
