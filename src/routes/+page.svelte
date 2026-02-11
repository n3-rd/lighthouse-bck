<script lang="ts">
  let { data } = $props();
  let url = $state('https://example.com');
  const flash = $derived(
    data.signedIn ? 'Signed in.' : data.error === 'invalid_or_expired' ? 'Link invalid or expired.' : data.error === 'token_required' ? 'Missing token.' : ''
  );
  let status = $state('');
  let resultHtml = $state('');
  let loading = $state(false);
  let error = $state('');

  async function createAccount() {
    const email = `test-${Date.now()}@example.com`;
    const name = 'Test User';
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const out = await res.json();
      if (out.loginLink) {
        await fetch(out.loginLink);
        alert(`Created account ${email} and logged in! Credits: ${out.user.credits}`);
        window.location.reload();
      } else {
        alert('Failed: ' + JSON.stringify(out));
      }
    } catch (e) {
      alert(String(e));
    }
  }

  async function checkMe() {
    try {
      const res = await fetch('/api/auth/me');
      const out = await res.json();
      alert(JSON.stringify(out, null, 2));
    } catch {
      alert('Not logged in');
    }
  }

  async function runAudit(e: Event) {
    e.preventDefault();
    error = '';
    resultHtml = '';
    status = 'Analyzing… (Chrome may take 10–20s)';
    loading = true;
    try {
      const res = await fetch('/api/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const out = await res.json();
      if (res.ok) {
        status = `Done. Credits remaining: ${out.creditsRemaining}`;
        resultHtml = out.html;
      } else {
        status = '';
        error = out.error ?? 'Request failed';
      }
    } catch (err) {
      status = '';
      error = err instanceof Error ? err.message : 'Request failed';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>ClearSky Audit</title>
</svelte:head>

<h1>Running Audit</h1>
{#if flash}
  <p class="flash">{flash}</p>
{/if}
<p>Enter a URL to audit (cost: 5 credits).</p>

{#if data.user}
  <p>Signed in as {data.user.email} · {data.user.credits} credits</p>
  <form onsubmit={runAudit}>
    <input type="url" bind:value={url} placeholder="https://example.com" required />
    <button type="submit" disabled={loading}>Run Audit</button>
  </form>
{:else}
  <p>Create a test account to run audits (20 free credits).</p>
  <p><a href="/auth/login">Log in with magic link</a></p>
{/if}

{#if status}
  <p>{status}</p>
{/if}
{#if error}
  <div class="error">{error}</div>
{/if}
{#if resultHtml}
  {@html resultHtml}
{/if}

<div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px;">
  <strong>Debug</strong><br />
  <button type="button" onclick={createAccount}>Create test account &amp; log in</button>
  <button type="button" onclick={checkMe}>Check user &amp; credits</button>
</div>
