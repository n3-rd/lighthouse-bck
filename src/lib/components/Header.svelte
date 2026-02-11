<script lang="ts">
  import { page } from '$app/stores';
  import logo from '../../static/logo.png';

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
    { href: '/audit', label: 'Audit', slug: 'audit' },
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
      <a href="/" class="h-14 md:h-20 w-52 md:w-72 flex items-center md:ml-[-80px]" data-testid="img-logo-wrapper" aria-label="ClearSKY Business Platform">
        <img src={logo} alt="ClearSKY Business Platform" class="h-full w-full object-contain" />
      </a>
      <nav class="flex flex-wrap items-center gap-4 md:gap-6 py-3" data-testid="nav-main">
        {#each navItems as item}
          <a
            data-testid="nav-link-{item.slug}"
            href={item.href}
            class="text-[15px] font-semibold no-underline transition-colors"
            class:underline={isActive(item.href, item.slug)}
            style:color={isActive(item.href, item.slug) ? 'rgb(24, 87, 155)' : 'rgb(95, 187, 240)'}
          >
            {item.label}
          </a>
        {/each}
      </nav>
    </div>
  </div>
</header>
