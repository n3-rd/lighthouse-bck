<script lang="ts">
  interface Props {
    value?: string;
    country: string;
    disabled?: boolean;
    placeholder?: string;
  }

  let {
    value = $bindable(''),
    country,
    disabled = false,
    placeholder = 'Select or search area code...',
  }: Props = $props();

  let areaCodes = $state<{ code: string; location: string }[]>([]);
  let loading = $state(false);
  let searchTerm = $state('');
  let isOpen = $state(false);
  let inputRef = $state<HTMLInputElement | undefined>();

  const filteredCodes = $derived(
    searchTerm.trim()
      ? areaCodes.filter(
          (ac) =>
            ac.code.includes(searchTerm) ||
            ac.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : areaCodes
  );

  async function loadAreaCodes() {
    if (country !== 'US' && country !== 'CA') {
      areaCodes = [];
      return;
    }
    loading = true;
    try {
      const res = await fetch(`/api/area-codes?country=${country}`);
      const data = await res.json();
      if (data.success) areaCodes = data.areaCodes ?? [];
      else areaCodes = [];
    } catch {
      areaCodes = [];
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    const c = country;
    loadAreaCodes();
    value = '';
  });

  function selectCode(code: string, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    value = code;
    isOpen = false;
    searchTerm = '';
  }

  function handleInputClick() {
    if (!disabled && !loading) isOpen = !isOpen;
  }

  $effect(() => {
    if (isOpen) {
      const handler = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (inputRef?.contains(target) || target.closest('.area-code-dropdown')) return;
        isOpen = false;
        searchTerm = '';
      };
      document.addEventListener('mousedown', handler, true);
      return () => document.removeEventListener('mousedown', handler, true);
    }
  });

  const displayValue = $derived.by(() => {
    if (!value) return '';
    const selected = areaCodes.find((ac) => ac.code === value);
    return selected ? `${selected.code} - ${selected.location}` : value;
  });

  let inputValue = $state('');
  $effect(() => {
    inputValue = isOpen ? searchTerm : displayValue;
  });
</script>

<div class="relative">
  <div class="relative">
    <input
      bind:this={inputRef}
      bind:value={inputValue}
      type="text"
      readonly={!isOpen}
      oninput={(e) => {
        if (isOpen) searchTerm = (e.target as HTMLInputElement).value;
      }}
      onclick={handleInputClick}
      placeholder={loading ? 'Loading…' : placeholder}
      {disabled}
      class="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 pr-10 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 disabled:opacity-50 cursor-pointer"
    />
    <svg
      class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500 transition-transform {isOpen ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>

  {#if isOpen && !loading && areaCodes.length > 0}
    <div
      class="area-code-dropdown absolute z-50 mt-1 max-h-[300px] w-full overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg"
    >
      {#if filteredCodes.length === 0}
        <div class="px-3 py-2 text-center text-sm text-zinc-500">No area codes found</div>
      {:else}
        {#each filteredCodes as ac}
          <button
            type="button"
            onmousedown={(e) => selectCode(ac.code, e)}
            class="w-full px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-100 focus:bg-zinc-100 focus:outline-none {value === ac.code ? 'bg-primary/10 text-primary' : ''}"
          >
            <span class="font-medium">{ac.code}</span>
            <span class="text-zinc-500"> — {ac.location}</span>
          </button>
        {/each}
      {/if}
    </div>
  {/if}
</div>
