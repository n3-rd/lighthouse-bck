<script lang="ts">
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';
  import logo from '../../static/logo.png';

  const user = $derived($page.data?.user ?? null);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    await invalidateAll();
  }

  type NavItem = { href: string; label: string; slug: string };
  const navItems: NavItem[] = [
    { href: '/', label: 'Home', slug: 'home' },
    { href: '/viewroom', label: 'ViewRoom', slug: 'viewroom' },
    { href: '/chatbot', label: 'Chatbot', slug: 'chatbot' },
    { href: '/ai-automation', label: 'AI Automation', slug: 'ai-automation' },
    { href: '/marketing', label: 'Marketing', slug: 'marketing' },
    { href: '/communication-hub', label: 'Communication Hub', slug: 'communication-hub' },
    { href: '/conversational-ai', label: 'Conversational AI', slug: 'conversational-ai' },
    { href: '/parsing', label: 'Parsing', slug: 'parsing' },
  ];

  function isActive(href: string, slug: string): boolean {
    const path = $page.url.pathname;
    if (href === '/') return path === '/';
    return path === href || path.startsWith(href + '/');
  }
</script>

<header class="relative overflow-hidden" data-testid="header-viewroom">
  <div class="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
    <div class="flex items-start gap-4">
      <a href="/" class="h-20 md:h-28 w-60 md:w-96 flex items-center md:ml-[-80px]" data-testid="img-logo-wrapper" aria-label="ClearSKY Business Platform">
        <img src={logo} alt="ClearSKY Business Platform" class="h-full w-full object-contain" />
      </a>
      <nav class="flex flex-wrap items-center gap-4 md:gap-6 py-3" data-testid="nav-main">
        {#each navItems as item}
          <a
            data-testid="nav-link-{item.slug}"
            href={item.href}
            class="text-[15px] font-semibold no-underline transition-colors"
            class:underline={isActive(item.href, item.slug)}
            class:text-primary={isActive(item.href, item.slug)}
            class:text-primary-light={!isActive(item.href, item.slug)}
          >
            {item.label}
          </a>
        {/each}
      </nav>
    </div>
    {#if user}
      <div class="flex items-center gap-2">
        <span class="text-[14px] text-zinc-500">{user.email}</span>
        <button
          type="button"
          onclick={logout}
          class="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[14px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          Log out
        </button>
      </div>
    {/if}
  </div>
</header>
