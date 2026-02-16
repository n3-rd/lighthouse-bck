<script lang="ts">
  import { invalidateAll } from '$app/navigation';

  let { data } = $props();

  let syncing = $state(false);
  let syncError = $state<string | null>(null);

  async function syncNumbers() {
    syncing = true;
    syncError = null;
    try {
      const res = await fetch('/api/telnyx/numbers/sync', { method: 'POST', credentials: 'include' });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Sync failed');
      await invalidateAll();
    } catch (e) {
      syncError = e instanceof Error ? e.message : 'Sync failed';
    } finally {
      syncing = false;
    }
  }

  function formatDate(d: Date | string) {
    const x = typeof d === 'string' ? new Date(d) : d;
    return x.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function formatDuration(seconds: number) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }

  function formatPeakDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<svelte:head>
  <title>Call tracking — ClearSKY</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">Call tracking</h1>
    <div class="flex items-center gap-2">
      <label for="period" class="text-sm text-zinc-600">Period</label>
      <select
        id="period"
        class="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-[15px] font-medium text-primary focus:outline-none focus:ring-2 focus:ring-primary-light/20"
        value={data.period}
        onchange={(e) => {
          const v = (e.currentTarget as HTMLSelectElement).value;
          window.location.href = `/call-tracking?period=${encodeURIComponent(v)}`;
        }}
      >
        <option value="this_month">This month</option>
        <option value="last_7">Last 7 days</option>
        <option value="last_30">Last 30 days</option>
      </select>
    </div>
  </div>

  <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p class="text-[13px] font-medium text-zinc-500">Total calls</p>
      <p class="mt-1 text-2xl font-bold text-primary">{data.stats.totalCalls.toLocaleString()}</p>
    </div>
    <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p class="text-[13px] font-medium text-zinc-500">Inbound</p>
      <p class="mt-1 text-2xl font-bold text-primary">{data.stats.inboundTotal.toLocaleString()}</p>
    </div>
    <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p class="text-[13px] font-medium text-zinc-500">Outbound</p>
      <p class="mt-1 text-2xl font-bold text-primary">{data.stats.outboundTotal.toLocaleString()}</p>
    </div>
    <div class="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p class="text-[13px] font-medium text-zinc-500">Avg duration</p>
      <p class="mt-1 text-2xl font-bold text-primary">
        {#if data.avgDurationSeconds != null}
          {formatDuration(data.avgDurationSeconds)}
        {:else}
          —
        {/if}
      </p>
      {#if data.callsWithDuration > 0}
        <p class="mt-0.5 text-xs text-zinc-400">From {data.callsWithDuration} call(s)</p>
      {/if}
    </div>
  </div>

  {#if data.peakDay && data.peakDay.count > 0}
    <p class="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm text-primary">
      <strong>Busiest day:</strong> {formatPeakDate(data.peakDay.date)} — {data.peakDay.count} call(s).
    </p>
  {/if}

  <section class="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-zinc-900">Your numbers</h2>
    <ul class="mt-2 flex flex-wrap gap-2">
      {#each data.numbers as num}
        <li class="rounded-lg bg-zinc-100 px-3 py-1.5 text-[15px] font-medium text-zinc-800">{num.phoneNumber}</li>
      {/each}
    </ul>
    <p class="mt-3 flex flex-wrap items-center gap-3">
      <a href="/call-tracking/buy" class="text-primary font-semibold underline hover:opacity-90">Buy another number</a>
      <button
        type="button"
        class="rounded-lg bg-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-300 disabled:opacity-50"
        onclick={syncNumbers}
        disabled={syncing}
      >
        {syncing ? 'Syncing…' : 'Sync from Telnyx'}
      </button>
    </p>
    {#if syncError}
      <p class="mt-2 text-sm text-red-600">{syncError}</p>
    {/if}
  </section>

  <section class="mt-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-zinc-900">Recent calls</h2>
    <p class="mt-1 text-sm text-zinc-500">Calls to/from your tracking numbers in the selected period.</p>
    <div class="mt-4 overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-zinc-200 text-left text-zinc-600">
            <th class="pb-2 pr-4">Date</th>
            <th class="pb-2 pr-4">Direction</th>
            <th class="pb-2 pr-4">From / To</th>
            <th class="pb-2 pr-4">Number</th>
            <th class="pb-2">Duration</th>
          </tr>
        </thead>
        <tbody>
          {#if data.voiceLogs.length === 0}
            <tr>
              <td colspan="5" class="py-8 text-center text-zinc-500">No calls in this period.</td>
            </tr>
          {:else}
            {#each data.voiceLogs as log}
              <tr class="border-b border-zinc-100">
                <td class="py-2 pr-4 text-zinc-700">{formatDate(log.createdAt)}</td>
                <td class="py-2 pr-4">
                  <span
                    class="rounded px-1.5 py-0.5 text-xs font-medium {log.direction === 'inbound'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'}"
                  >
                    {log.direction === 'inbound' ? 'In' : 'Out'}
                  </span>
                </td>
                <td class="py-2 pr-4 text-zinc-600">
                  {log.direction === 'inbound' ? log.fromNumber : log.toNumber} → {log.direction === 'inbound' ? log.toNumber : log.fromNumber}
                </td>
                <td class="py-2 pr-4 text-zinc-600">{log.phoneNumber.phoneNumber}</td>
                <td class="py-2 text-zinc-600">
                  {#if log.durationSeconds != null}
                    {formatDuration(log.durationSeconds)}
                  {:else}
                    —
                  {/if}
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </section>

  <p class="mt-8">
    <a href="/marketing" class="text-primary font-semibold underline hover:opacity-90">← Marketing</a>
  </p>
</div>
