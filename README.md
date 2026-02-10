# lighthouse-bck

Express API that runs Lighthouse audits on URLs. Supports signup/login (magic link), credit-based audit runs, and a standalone CLI audit script that works without auth or the database.

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
| `BASE_URL`     | No       | Base URL for magic links (default: `http://localhost:3000`) |
| `PORT`         | No       | Server port (default: `3000`) |
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
| `pnpm dev`      | Run API with watch |
| `pnpm start`    | Run API |
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

Base URL: `http://localhost:3000` (or your `PORT`).

### Health

- **GET** `/health` — `{ "ok": true }`

### Auth

- **POST** `/auth/signup`  
  Body: `{ "name": string, "email": string }`  
  Creates user with 20 credits and returns a one-time `loginLink` (magic link). In production you’d email this; in dev you can open it in the browser.

- **POST** `/auth/login`  
  Body: `{ "email": string }`  
  Returns a one-time `loginLink` for that user.

- **GET** `/auth/verify?token=xxx`  
  Magic-link callback. Validates token, sets HTTP-only `auth` cookie (JWT), returns `{ user, message }`. Redirect or open in browser to “log in”.

- **GET** `/auth/me`  
  Requires auth cookie. Returns current `{ user }`.

- **POST** `/auth/logout`  
  Clears auth cookie.

### Audit (authenticated)

- **POST** `/audit/run`  
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
│   └── schema.prisma      # DB schema
├── public/                # Static files
├── scripts/
│   └── audit.ts           # CLI audit (no auth)
├── src/
│   ├── index.ts           # Express app entry
│   ├── db.ts              # Prisma client (pg adapter)
│   ├── middleware/
│   │   └── auth.ts        # JWT auth, requireAuth, signToken
│   ├── routes/
│   │   ├── auth.ts        # signup, login, verify, me, logout
│   │   └── audit.ts       # POST /audit/run
│   └── services/
│       └── lighthouse.ts  # runLighthouseAudit(url)
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## Lighthouse service

`src/services/lighthouse.ts` exports `runLighthouseAudit(url: string): Promise<AuditResult>`:

- Launches headless Chrome (via `chromePath` or defaults).
- Runs Lighthouse (JSON output).
- Returns `{ performance, seo, bestPractices, accessibility, raw }` (scores 0–100; `raw` is the full Lighthouse report object).

Used by both the API route and the CLI script.
