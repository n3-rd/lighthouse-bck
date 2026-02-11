<script lang="ts">
  let email = $state('');
  let message = $state('');
  let loading = $state(false);

  async function sendLink() {
    if (!email.trim()) return;
    loading = true;
    message = '';
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const out = await res.json();
      if (res.ok && out.loginLink) {
        message = `Use this link to sign in: ${out.loginLink}`;
      } else {
        message = out.error ?? 'Failed';
      }
    } catch (e) {
      message = String(e);
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Log in – ClearSky</title>
</svelte:head>

<h1>Log in</h1>
<p>Enter your email to receive a magic link (or use the link returned in the response for dev).</p>

<form onsubmit={(e) => { e.preventDefault(); sendLink(); }}>
  <input type="email" bind:value={email} placeholder="you@example.com" required />
  <button type="submit" disabled={loading}>Send magic link</button>
</form>

{#if message}
  <p class="message">{message}</p>
{/if}

<p><a href="/">Back</a></p>

<style>
  .message {
    margin-top: 1rem;
    word-break: break-all;
    font-size: 0.9rem;
  }
</style>
