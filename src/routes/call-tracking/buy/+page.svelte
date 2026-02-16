<script lang="ts">
  import AreaCodeSelector from '$lib/components/AreaCodeSelector.svelte';

  let activeTab = $state<'buy' | 'orders'>('buy');
  let country = $state('US');
  let searchBy = $state<'Area Code' | 'Number'>('Area Code');
  let areaCode = $state('');
  let phoneNumbers = $state<{ number: string; location: string; type: string; upfront: string; monthly: string }[]>([]);
  let isLoading = $state(false);
  let cart = $state<Set<string>>(new Set());
  let numberOrders = $state<{ orderId: string; date: string; status: string; country: string }[]>([]);
  let error = $state('');

  const COUNTRY_OPTIONS = [
    { label: 'United States +1', code: 'US' },
    { label: 'Canada +1', code: 'CA' },
  ];

  async function loadOrders() {
    try {
      const res = await fetch('/api/telnyx/numbers/orders', { credentials: 'include' });
      const data = await res.json();
      if (data.success) numberOrders = data.orders;
    } catch {
      numberOrders = [];
    }
  }

  $effect(() => {
    if (activeTab === 'orders') loadOrders();
  });

  function toggleCart(num: string) {
    const next = new Set(cart);
    if (next.has(num)) next.delete(num);
    else next.add(num);
    cart = next;
  }

  async function handleSearch() {
    const value = areaCode.trim();
    if (!value) {
      error = searchBy === 'Area Code' ? 'Enter an area code' : 'Enter digits to search';
      return;
    }
    error = '';
    isLoading = true;
    try {
      const params = new URLSearchParams({ country_code: country });
      if (searchBy === 'Area Code') params.append('area_code', value);
      else params.append('phone_number', value);
      const res = await fetch(`/api/telnyx/numbers/search?${params}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        phoneNumbers = data.numbers ?? [];
      } else {
        error = data.error ?? 'Search failed';
        phoneNumbers = [];
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Search failed';
      phoneNumbers = [];
    } finally {
      isLoading = false;
    }
  }

  async function handleBuy() {
    if (cart.size === 0) {
      error = 'Select at least one number';
      return;
    }
    error = '';
    isLoading = true;
    try {
      const res = await fetch('/api/telnyx/numbers/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone_numbers: Array.from(cart) }),
      });
      const data = await res.json();
      if (data.success) {
        cart = new Set();
        phoneNumbers = [];
        await loadOrders();
        activeTab = 'orders';
      } else {
        error = data.error ?? 'Purchase failed';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Purchase failed';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Buy number — Call tracking</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8">
  <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">Buy number</h1>
  <p class="mt-1 text-zinc-600">Purchase a phone number to use for call tracking. You need at least one number before viewing analytics.</p>

  <div class="mt-6 border-b border-zinc-200">
    <button
      type="button"
      class="border-b-2 px-1 pb-2 text-[15px] font-semibold transition-colors {activeTab === 'buy' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}"
      onclick={() => (activeTab = 'buy')}
    >
      Buy number
    </button>
    <button
      type="button"
      class="ml-6 border-b-2 px-1 pb-2 text-[15px] font-semibold transition-colors {activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-zinc-500 hover:text-zinc-700'}"
      onclick={() => (activeTab = 'orders')}
    >
      Orders
    </button>
  </div>

  {#if activeTab === 'buy'}
    <div class="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
      <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-[13px] font-medium text-zinc-700">Country</span>
          <select
            bind:value={country}
            class="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
          >
            {#each COUNTRY_OPTIONS as opt}
              <option value={opt.code}>{opt.label}</option>
            {/each}
          </select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[13px] font-medium text-zinc-700">Search by</span>
          <select
            bind:value={searchBy}
            class="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
          >
            <option value="Area Code">Area code</option>
            <option value="Number">Number contains</option>
          </select>
        </label>
        <label class="flex flex-col gap-1.5">
          <span class="text-[13px] font-medium text-zinc-700">{searchBy === 'Area Code' ? 'Area code' : 'Digits'}</span>
          {#if searchBy === 'Area Code'}
            <AreaCodeSelector bind:value={areaCode} {country} placeholder="Select or search area code…" />
          {:else}
            <input
              type="text"
              bind:value={areaCode}
              placeholder="e.g. 555"
              inputmode="numeric"
              class="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-[15px] text-zinc-900 outline-none focus:border-primary-light focus:ring-2 focus:ring-primary-light/20"
            />
          {/if}
        </label>
        <div class="flex items-end gap-2">
          <button
            type="button"
            disabled={isLoading}
            onclick={handleSearch}
            class="h-11 rounded-lg bg-primary-light px-4 text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            {isLoading ? 'Searching…' : 'Search'}
          </button>
          {#if cart.size > 0}
            <button
              type="button"
              disabled={isLoading}
              onclick={handleBuy}
              class="h-11 rounded-lg bg-green-600 px-4 text-[15px] font-semibold text-white hover:bg-green-700 disabled:opacity-60"
            >
              Buy {cart.size}
            </button>
          {/if}
        </div>
      </div>
      {#if error}
        <p class="mt-3 text-[14px] text-red-600">{error}</p>
      {/if}

      <div class="mt-6 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-zinc-200 text-left text-zinc-600">
              <th class="pb-2 pr-4"></th>
              <th class="pb-2 pr-4">Number</th>
              <th class="pb-2 pr-4">Location</th>
              <th class="pb-2 pr-4">Type</th>
              <th class="pb-2 pr-4">Upfront</th>
              <th class="pb-2 pr-4">Monthly</th>
              <th class="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {#if isLoading && phoneNumbers.length === 0}
              <tr>
                <td colspan="7" class="py-8 text-center text-zinc-500">Searching…</td>
              </tr>
            {:else if phoneNumbers.length === 0}
              <tr>
                <td colspan="7" class="py-8 text-center text-zinc-500">Search for numbers above.</td>
              </tr>
            {:else}
              {#each phoneNumbers as num}
                <tr class="border-b border-zinc-100">
                  <td class="py-2 pr-2">
                    <input
                      type="checkbox"
                      checked={cart.has(num.number)}
                      onchange={() => toggleCart(num.number)}
                      class="h-4 w-4 rounded border-zinc-300 text-primary-light focus:ring-primary-light/20"
                    />
                  </td>
                  <td class="py-2 pr-4 font-medium text-zinc-900">{num.number}</td>
                  <td class="py-2 pr-4 text-zinc-600">{num.location}</td>
                  <td class="py-2 pr-4 text-zinc-600">{num.type}</td>
                  <td class="py-2 pr-4 text-zinc-600">{num.upfront}</td>
                  <td class="py-2 pr-4 text-zinc-600">{num.monthly}</td>
                  <td class="py-2">
                    <button
                      type="button"
                      class="rounded bg-primary-light px-2 py-1 text-[13px] font-medium text-white hover:opacity-90"
                      onclick={() => toggleCart(num.number)}
                    >
                      {cart.has(num.number) ? 'In cart' : 'Add'}
                    </button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>
  {:else}
    <div class="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-200 text-left text-zinc-600">
            <th class="pb-2 pr-4">Date</th>
            <th class="pb-2 pr-4">Status</th>
            <th class="pb-2 pr-4">Country</th>
          </tr>
        </thead>
        <tbody>
          {#if numberOrders.length === 0}
            <tr>
              <td colspan="3" class="py-8 text-center text-zinc-500">No orders yet.</td>
            </tr>
          {:else}
            {#each numberOrders as order}
              <tr class="border-b border-zinc-100">
                <td class="py-2 pr-4 text-zinc-700">{order.date}</td>
                <td class="py-2 pr-4 text-zinc-600">{order.status}</td>
                <td class="py-2 text-zinc-600">{order.country}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  {/if}

  <p class="mt-6">
    <a href="/call-tracking" class="text-primary font-semibold underline hover:opacity-90">← Call tracking</a>
  </p>
</div>
