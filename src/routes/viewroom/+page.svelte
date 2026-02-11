<script lang="ts">
  const sectors = [
    { sector: 'Trades', lift: '10–16%', why: 'Visual walkthroughs + multi-camera demos drastically reduce uncertainty, boost quote acceptance, and shorten decision cycles' },
    { sector: 'Tourism', lift: '10–16%', why: 'Experience previews and sales-assisted virtual tours significantly improve booking confidence' },
    { sector: 'Services', lift: '6–10%', why: 'Improves clarity in consultations and onboarding; modest but meaningful lift for high-ticket services' },
    { sector: "OEM's", lift: '12-18%', why: 'Complex products benefit from guided demos, reducing friction in procurement and increasing close rates' },
  ];
  let fullName = $state('');
  let email = $state('');
  let cell = $state('');
  let code = $state('');
  let step = $state<'form' | 'code'>('form');
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
        body: JSON.stringify({ fullName: fullName.trim(), email: email.trim().toLowerCase(), cell: cell.trim() }),
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
      window.location.href = '/audit';
    }
  }
</script>

<svelte:head>
  <title>ViewRoom — ClearSKY Business Platform</title>
</svelte:head>

<div class="w-full text-center" style="margin-top: -40px;">
  <div class="font-semibold text-[18px] md:text-[22px] px-4" data-testid="text-page-title">ViewRoom: The Virtual Showroom that Closes Deals</div>
</div>

<div class="mt-8 md:mt-[50px] flex flex-col lg:flex-row items-start justify-between gap-6" data-testid="row-main">
  <div class="w-full lg:w-[600px] max-w-full px-2 md:px-0 md:ml-[35px]" data-testid="panel-media">
    <div class="w-full lg:w-[600px] h-64 md:h-80 max-w-full bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500" data-testid="img-viewroom-hero">ViewRoom hero graphic</div>

    <div class="mt-8 md:mt-[54px] w-full lg:w-[600px] max-w-full border border-zinc-300 bg-white" data-testid="box-lift">
      <div class="hidden md:grid text-[14px] font-semibold text-zinc-800" data-testid="row-lift-header" style="grid-template-columns: 80px 90px 1fr;">
        <div class="px-4 py-3" data-testid="title-sector">
          <div data-testid="text-sector-title">Sector</div>
          <div class="mt-1 h-px w-full bg-zinc-400" data-testid="line-sector"></div>
          {#each sectors as s}
            <div class="mt-1" data-testid="text-sector-value">{s.sector}</div>
          {/each}
        </div>
        <div class="px-4 py-3 text-center" data-testid="title-conservative-lift">
          <div data-testid="text-lift-title">Lift</div>
          <div class="mt-1 h-px w-full bg-zinc-400" data-testid="line-lift"></div>
          {#each sectors as s}
            <div class="mt-1 font-normal text-zinc-700" data-testid="text-lift-value">{s.lift}</div>
          {/each}
        </div>
        <div class="px-4 py-3 flex-1" data-testid="title-why">
          <div data-testid="text-why-title">Why</div>
          <div class="mt-1 h-px w-full bg-zinc-400" data-testid="line-why"></div>
          {#each sectors as s}
            <div class="mt-1 text-[14px] font-normal text-zinc-700" data-testid="text-why-line-1">{s.why}</div>
          {/each}
        </div>
      </div>
      <div class="md:hidden p-4 space-y-4 text-[14px] text-zinc-800" data-testid="row-lift-mobile">
        <div>
          <div class="font-semibold">Sector &amp; Lift</div>
          <div class="mt-2 space-y-2">
            {#each sectors as s}
              <div class="flex justify-between"><span>{s.sector}</span><span class="text-zinc-600">{s.lift}</span></div>
            {/each}
          </div>
        </div>
        <div class="h-px bg-zinc-300"></div>
        <div>
          <div class="font-semibold">Why</div>
          <div class="mt-2 text-zinc-700 space-y-2">
            {#each sectors as s}
              <p>{s.why}</p>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="w-full lg:w-[600px] max-w-full px-2 md:px-0" data-testid="panel-text">
    <div class="min-h-[250px] md:min-h-[350px] border border-zinc-300 bg-white p-4 text-[14px] md:text-[16px] leading-relaxed text-zinc-800" data-testid="text-dummy">
      ViewRoom is an interactive virtual sales room embedded directly into your website. With one click, visitors enter a branded space where the first person in becomes the host and can invite others instantly—no scheduling, no static pages.<br><br>
      Inside, businesses can present videos, PDFs, photos, demos, and proposals as a true on-demand showroom. Guests can co-watch content, chat in real time, and walk through options together. An integrated AI assistant answers questions, explains details, and can escalate the session to a live representative when needed. Reps can also join from the ViewRoom mobile app using multiple cameras to show job sites, run product demos, or guide inspections live.
    </div>

    <div class="mt-6 md:mt-[40px] md:ml-[40px] w-full md:w-[520px] border border-zinc-300 bg-zinc-50 p-4 md:p-5" data-testid="form-demo">
      <div class="text-center text-[18px] font-semibold text-zinc-900" data-testid="text-form-title">Demo the View Room</div>
      <div class="mt-4 grid gap-3" data-testid="group-form-fields">
        <label class="grid gap-1" data-testid="label-name">
          <span class="text-[13px] font-medium text-zinc-700" data-testid="text-label-name">First and Last Name</span>
          <input
            class="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none transition-colors focus:border-zinc-500"
            placeholder="Jane Doe"
            autocomplete="name"
            data-testid="input-full-name"
            type="text"
            bind:value={fullName}
          />
        </label>
        <label class="grid gap-1" data-testid="label-email">
          <span class="text-[13px] font-medium text-zinc-700" data-testid="text-label-email">Email address</span>
          <input
            class="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none transition-colors focus:border-zinc-500"
            placeholder="jane@company.com"
            autocomplete="email"
            data-testid="input-email"
            type="email"
            bind:value={email}
          />
        </label>
        <label class="grid gap-1" data-testid="label-cell">
          <span class="text-[13px] font-medium text-zinc-700" data-testid="text-label-cell">Cell number</span>
          <input
            class="h-10 w-full rounded-md border border-zinc-300 bg-white px-3 text-[14px] text-zinc-900 outline-none transition-colors focus:border-zinc-500"
            placeholder="+1 555 555 5555"
            autocomplete="tel"
            data-testid="input-cell"
            type="tel"
            bind:value={cell}
          />
        </label>
        {#if error}
        <p class="text-red-600 text-sm">{error}</p>
      {/if}
        <div class="mt-1 flex items-center justify-between" data-testid="row-submit">
          <div class="text-[14px] font-medium text-zinc-600" data-testid="text-code-note">We will send a 5 digit code to your Cell/Email</div>
          <button type="button" class="h-10 w-[60px] rounded-md bg-zinc-900 text-[14px] font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50" data-testid="button-submit" disabled={submitting} onclick={submitDemo}>Submit</button>
        </div>
      </div>
      <div class="mt-4 flex flex-col items-center" data-testid="row-code-area">
        {#if step === 'code'}
          <div class="flex items-center justify-center gap-3" data-testid="row-code-input">
            <input
              class="h-10 w-[100px] rounded-md border-2 border-zinc-700 bg-white px-3 text-center text-[14px] font-semibold tracking-widest text-zinc-900 shadow-sm outline-none transition-colors focus:border-zinc-900"
              placeholder="12345"
              inputmode="numeric"
              maxlength="5"
              data-testid="input-verify-code"
              bind:value={code}
            />
            <button type="button" class="h-10 rounded-md bg-zinc-900 px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800" data-testid="button-verify-code-submit" onclick={submitCode}>Submit</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>
