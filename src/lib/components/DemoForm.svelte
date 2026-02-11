<script lang="ts">
  let { formTitle = 'Request a demo' } = $props();
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

<div class="mt-6 md:mt-[40px] w-full max-w-[520px] border border-zinc-300 bg-zinc-50 p-4 md:p-5 rounded-lg" data-testid="form-demo">
  <div class="text-center text-[18px] font-semibold text-zinc-900" data-testid="text-form-title">{formTitle}</div>
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
        <button
          type="button"
          class="h-10 rounded-md bg-zinc-900 px-4 text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
          onclick={submitCode}
        >
          Submit
        </button>
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
