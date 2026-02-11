<script lang="ts">
  import type { FeaturePageConfig } from '$lib/featurePageData.js';
  import heroImage from '../../static/hero-image.png';

  let { config } = $props();
  let fullName = $state('');
  let email = $state('');
  let cell = $state('');
  let code = $state('');
  let step = $state<'form' | 'code' | 'unlocked'>('form');
  let submitting = $state(false);
  let error = $state('');

  async function submitDemo() {
    if (!email.trim()) return;
    submitting = true;
    error = '';
    try {
      const res = await fetch('/api/demo-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          cell: cell.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        step = 'code';
      } else {
        error = data.error ?? 'Something went wrong';
      }
    } catch (e) {
      error = String(e);
    } finally {
      submitting = false;
    }
  }

  function submitCode() {
    if (code.trim().length >= 1) {
      step = 'unlocked';
    }
  }
</script>

<div class="w-full text-center" style="margin-top: -40px;">
  <div class="font-semibold text-[18px] md:text-[22px] px-4" data-testid="text-page-title">{config.pageTitle}</div>
</div>

<div class="mt-8 md:mt-[50px] flex flex-col lg:flex-row items-start justify-between gap-6" data-testid="row-main">
  <div class="w-full lg:w-[600px] max-w-full px-2 md:px-0 md:ml-[35px]" data-testid="panel-media">
    <img
      src={heroImage}
      alt=""
      class="w-full lg:w-[600px] max-w-full h-auto object-contain rounded-lg"
    />

    <div class="mt-8 md:mt-[54px] w-full lg:w-[600px] max-w-full border border-zinc-300 bg-white" data-testid="box-lift">
      <div class="hidden md:grid text-[14px] font-semibold text-zinc-800" style="grid-template-columns: 80px 90px 1fr;">
        <div class="px-4 py-3">
          <div>Sector</div>
          <div class="mt-1 h-px w-full bg-zinc-400"></div>
          {#each config.sectors as s}
            <div class="mt-1">{s.sector}</div>
          {/each}
        </div>
        <div class="px-4 py-3 text-center">
          <div>Lift</div>
          <div class="mt-1 h-px w-full bg-zinc-400"></div>
          {#each config.sectors as s}
            <div class="mt-1 font-normal text-zinc-700">{s.lift}</div>
          {/each}
        </div>
        <div class="px-4 py-3 flex-1">
          <div>Why</div>
          <div class="mt-1 h-px w-full bg-zinc-400"></div>
          {#each config.sectors as s}
            <div class="mt-1 text-[14px] font-normal text-zinc-700">{s.why}</div>
          {/each}
        </div>
      </div>
      <div class="md:hidden p-4 space-y-4 text-[14px] text-zinc-800">
        <div>
          <div class="font-semibold">Sector &amp; Lift</div>
          <div class="mt-2 space-y-2">
            {#each config.sectors as s}
              <div class="flex justify-between"><span>{s.sector}</span><span class="text-zinc-600">{s.lift}</span></div>
            {/each}
          </div>
        </div>
        <div class="h-px bg-zinc-300"></div>
        <div>
          <div class="font-semibold">Why</div>
          <div class="mt-2 text-zinc-700 space-y-2">
            {#each config.sectors as s}
              <p>{s.why}</p>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full lg:w-[600px] max-w-full px-2 md:px-0" data-testid="panel-text">
    <div class="min-h-[250px] md:min-h-[350px] border border-zinc-300 bg-white p-4 text-[14px] md:text-[16px] leading-relaxed text-zinc-800 rounded-none" data-testid="text-dummy">
      {@html config.description}
    </div>

    <div class="mt-6 md:mt-[40px] md:ml-[40px] w-full md:w-[520px] border border-zinc-300 bg-zinc-50 p-4 md:p-5" data-testid="form-demo">
      <div class="text-center text-[18px] font-semibold text-zinc-900" data-testid="text-form-title">{config.formTitle}</div>
      <div class="mt-4 grid gap-3" data-testid="group-form-fields">
        <label class="grid gap-1">
          <span class="text-[13px] font-medium text-zinc-700">First and Last Name</span>
          <input
            class="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none transition-colors focus:border-zinc-500"
            placeholder="Jane Doe"
            autocomplete="name"
            type="text"
            bind:value={fullName}
          />
        </label>
        <label class="grid gap-1">
          <span class="text-[13px] font-medium text-zinc-700">Email address</span>
          <input
            class="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none transition-colors focus:border-zinc-500"
            placeholder="jane@company.com"
            autocomplete="email"
            type="email"
            bind:value={email}
          />
        </label>
        <label class="grid gap-1">
          <span class="text-[13px] font-medium text-zinc-700">Cell number</span>
          <input
            class="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none transition-colors focus:border-zinc-500"
            placeholder="+1 555 555 5555"
            autocomplete="tel"
            type="tel"
            bind:value={cell}
          />
        </label>
        {#if error}
          <p class="text-red-600 text-sm">{error}</p>
        {/if}
        <div class="mt-1 flex items-center justify-between">
          <div class="text-[14px] font-medium text-zinc-600">We will send a 5 digit code to your Cell/Email</div>
          <button
            type="button"
            class="h-10 w-[60px] rounded-md bg-zinc-900 text-[14px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            disabled={submitting}
            onclick={submitDemo}
          >
            Submit
          </button>
        </div>
      </div>
      <div class="mt-4 flex flex-col items-center" data-testid="row-code-area">
        {#if step === 'code'}
          <div class="mb-4 rounded-md bg-blue-50 border border-blue-200 px-4 py-3 text-center max-w-sm" data-testid="popup-check-code">
            <div class="text-[14px] font-semibold text-blue-800">Check for SMS message or Email</div>
            <div class="text-[13px] text-blue-700 mt-1">Enter the 5 digit code below</div>
          </div>
          <div class="flex items-center justify-center gap-3" data-testid="row-code-input">
            <input
              class="h-10 w-[100px] rounded-md border-2 border-zinc-700 bg-white px-3 text-center text-[14px] font-semibold tracking-widest text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900"
              placeholder="12345"
              inputmode="numeric"
              maxlength="5"
              bind:value={code}
            />
            <button type="button" class="h-10 rounded-md bg-zinc-900 px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800" onclick={submitCode}>Submit</button>
          </div>
        {/if}
        {#if step === 'unlocked'}
          <div class="mt-6 flex justify-center w-full" data-testid="row-host-cta">
            <a
              href="/audit"
              class="inline-flex h-12 md:h-14 items-center justify-center rounded-md px-4 md:px-8 text-[16px] md:text-[24px] font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 bg-[#4db2ec]"
              data-testid="button-host-cta"
            >
              Run a Quick Audit
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
