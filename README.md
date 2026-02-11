# lighthouse-bck

SvelteKit (Svelte 5) app that runs Lighthouse audits on URLs. Supports signup/login (magic link), credit-based audit runs, and a standalone CLI audit script that works without auth or the database.

## Prerequisites

- **Node.js** 18+
- **pnpm** (or npm/yarn)
- **PostgreSQL** (for the API; not needed for the CLI audit script)
- **Chrome or Chromium** (for Lighthouse). The app looks for:
  - `CHROME_PATH` env var, or
  - `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
  - `/Applications/Chromium.app/Contents/MacOS/Chromium`  
  For other installs (e.g. Edge), set `CHROME_PATH` to the browser executable.

---

## Setup

```bash
pnpm install
cp .env.example .env   # then edit .env
```

### Environment variables

| Variable        | Required | Description |
|----------------|----------|-------------|
| `DATABASE_URL` | Yes (API) | PostgreSQL connection string |
| `JWT_SECRET`   | No       | Secret for JWT cookies (default: `dev-secret-change-in-production`) |
| `BASE_URL`     | No       | Base URL for magic links (default: `http://localhost:5173`) |
| `CHROME_PATH`  | No       | Path to Chrome/Chromium executable if not in default macOS locations |

Create `.env` with at least:

```
DATABASE_URL=postgresql://user:password@localhost:5432/lighthouse_bck
```

### Database

```bash
pnpm db:generate   # generate Prisma client
pnpm db:migrate    # run migrations (or db:push for dev)
```

---

## Scripts

| Command         | Description |
|-----------------|-------------|
| `pnpm dev`      | SvelteKit dev server (default port 5173) |
| `pnpm build`    | Production build |
| `pnpm preview`  | Preview production build |
| `pnpm audit`    | CLI: run Lighthouse on a URL (no auth, no DB) |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate`  | Run Prisma migrations |
| `pnpm db:push`     | Push schema to DB (dev) |

---

## CLI audit (no auth)

Run a Lighthouse audit from the terminal without starting the API or using the database:

```bash
pnpm run audit <url> [--out report.json]
```

Examples:

```bash
pnpm run audit https://example.com
pnpm run audit https://example.com --out report.json
```

Output: Performance, SEO, Best Practices, and Accessibility scores (0–100). With `--out`, the full Lighthouse JSON report is written to the given file.

---

## API

Base URL: `http://localhost:5173` (Vite dev) or your deployment URL. Auth uses HTTP-only cookie `auth`.

### Health

- **GET** `/api/health` — `{ "ok": true }`

### Auth

- **POST** `/api/auth/signup`  
  Body: `{ "name": string, "email": string }`  
  Creates user with 20 credits and returns a one-time `loginLink` (magic link). In production you’d email this; in dev you can open it in the browser.

- **POST** `/api/auth/login`  
  Body: `{ "email": string }`  
  Returns a one-time `loginLink` for that user.

- **GET** `/auth/verify?token=xxx`  
  Page route. Validates token, sets HTTP-only `auth` cookie (JWT), redirects to `/`.

- **GET** `/api/auth/me`  
  Requires auth cookie. Returns current `{ user }`.

- **POST** `/api/auth/logout`  
  Clears auth cookie.

### Audit (authenticated)

- **POST** `/api/audit/run`  
  Requires auth cookie.  
  Body: `{ "url": string }`  
  Cost: 5 credits per run. Deducts credits, runs Lighthouse, stores result, returns:
  - `html` — branded report HTML
  - `scores` — `{ performance, seo, bestPractices, accessibility }`
  - `creditsRemaining`

  Errors: `400` (no url), `401` (not authenticated), `402` (insufficient credits), `500` (audit failure).

---

## Data model (Prisma)

- **User** — id, name, email, credits (default 20), createdAt. Relations: loginTokens, transactions, audits.
- **LoginToken** — one-time token for magic link; userId, expiresAt.
- **Transaction** — userId, amount (+/-), reason (e.g. `audit`, `signup_bonus`), balanceAfter, createdAt.
- **Audit** — userId, url, performance, seo, accessibility, bestPractices (0–100), lighthouseJson (full report), createdAt.

---

## Project structure

```
lighthouse-bck/
├── prisma/
│   └── schema.prisma
├── scripts/
│   └── audit.ts           # CLI audit (no auth)
├── src/
│   ├── app.html
│   ├── app.d.ts
│   ├── hooks.server.ts    # Set locals.user from auth cookie
│   ├── lib/server/
│   │   ├── db.ts          # Prisma client (pg adapter)
│   │   ├── auth.ts        # JWT signToken, getUserFromToken
│   │   └── lighthouse.ts  # runLighthouseAudit(url)
│   └── routes/
│       ├── +layout.server.ts
│       ├── +page.svelte    # Home + audit UI
│       ├── auth/verify/    # Magic-link callback (sets cookie, redirects)
│       ├── auth/login/     # Login page
│       └── api/
│           ├── health/
│           ├── auth/signup|login|me|logout/
│           └── audit/run/
├── package.json
├── svelte.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## Lighthouse service

`src/lib/server/lighthouse.ts` exports `runLighthouseAudit(url: string): Promise<AuditResult>`:

- Launches headless Chrome (via `chromePath` or defaults).
- Runs Lighthouse (JSON output).
- Returns `{ performance, seo, bestPractices, accessibility, raw }` (scores 0–100; `raw` is the full Lighthouse report object).

Used by both the API route and the CLI script.
