# Deploying on Cloudflare

The site runs as a single Cloudflare Worker, built from Next.js by
[OpenNext](https://opennext.js.org/cloudflare). It was on Vercel before; this
document is what replaced `vercel.json`.

## What runs where

| Piece | Where it lives |
|---|---|
| Every page and API route | one Worker, `the-brand-friend` |
| Static assets (`/_next/static`, `public/`) | Workers static assets, `.open-next/assets` |
| ISR page payloads | R2 bucket `the-brand-friend-opennext-cache` |
| `revalidate` scheduling, `revalidatePath`, edge purge | three Durable Objects |
| Blog crons (02:00 and 04:00 UTC) | Cron Triggers → `worker.ts` |
| Database, auth, file storage | Supabase, unchanged |

The moving parts are four files:

- **`wrangler.jsonc`** — Worker name, bindings, cron schedules.
- **`open-next.config.ts`** — which Cloudflare service backs each half of Next's cache.
- **`worker.ts`** — the entrypoint. Wraps OpenNext's generated handler and adds
  `scheduled`, because the generated one is HTTP-only.
- **`next.config.mjs`** — calls `initOpenNextCloudflareForDev()` so `next dev`
  sees the same bindings.

## First-time setup

### 1. Create the cache bucket

```bash
npx wrangler login
npx wrangler r2 bucket create the-brand-friend-opennext-cache
```

The Worker will not deploy without it — the binding is declared in
`wrangler.jsonc` and Cloudflare resolves bindings at deploy time.

### 2. Connect the repo to Workers Builds

Cloudflare dashboard → **Workers & Pages** → **Create** → **Workers** →
**Connect to Git** → `najamgul/TheBrandFriend`.

| Setting | Value |
|---|---|
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |
| Root directory | `/` |

Every push to the production branch then builds and deploys, and other branches
get preview URLs — the same shape as the Vercel setup it replaces.

> Builds must run on Linux. OpenNext does not support Windows builds, so
> `npm run deploy` from a Windows machine is not a supported path even though it
> currently works. Let Workers Builds do it.

### 3. Set the variables

Two separate places, and the distinction matters:

**Build variables** (dashboard → the Worker → **Settings** → **Build** →
*Variables and Secrets*). Needed because `next build` prerenders pages that
query Supabase, and inlines `NEXT_PUBLIC_*` into the client bundle:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`

**Runtime secrets** (dashboard → the Worker → **Settings** → *Variables and
Secrets*), or `npx wrangler secret put NAME`:

| Secret | Used by |
|---|---|
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | everything that reads content |
| `CRON_SECRET` | the cron routes' bearer check |
| `RECAPTCHA_SECRET_KEY` | `/api/lead` |
| `GOOGLE_SA_CLIENT_EMAIL`, `GOOGLE_SA_PRIVATE_KEY`, `GMAIL_SENDER_EMAIL` | Gmail send |
| `TEAM_EMAIL` | where lead notifications go |
| `REPLICATE_API_TOKEN` | blog generation |
| `INDEXNOW_KEY` | IndexNow ping; must match `public/<key>.txt` |
| `GOOGLE_INDEXING_CLIENT_EMAIL`, `GOOGLE_INDEXING_PRIVATE_KEY` | Google Indexing API (falls back to the `GOOGLE_SA_*` pair) |
| `PEXELS_API_KEY` | cover images; optional |
| `REPLICATE_DRAFT_MODEL`, `REPLICATE_POLISH_MODEL`, `REPLICATE_JUDGE_MODEL`, `REPLICATE_DRAFT_THINKING` | optional model overrides |

`GOOGLE_SA_PRIVATE_KEY` can be pasted with real newlines or with the `\n`
two-character escapes Vercel used — `lib/google-jwt.js` accepts both.

No `.env` file is bundled into the Worker, so a variable that is not set here
does not exist at runtime, however it is set locally.

### 4. Point the domain at the Worker

Do this last, once the `workers.dev` URL looks right. Add `thebrandfriend.com`
as a zone in Cloudflare, then uncomment the `routes` block at the bottom of
`wrangler.jsonc` and deploy. Keep the apex → `www` redirect: `lib/site.js`
treats `www` as canonical, and IndexNow and the Google Indexing API both reject
URLs that do not match the verified property.

## Local development

```bash
npm run dev        # Next dev server, with Cloudflare bindings via Miniflare
npm run preview    # build, then serve the real Worker in workerd — closer to production
npm run cf-typegen # regenerate cloudflare-env.d.ts after changing bindings
```

`npm run dev` reads `.env.local` as it always has. `npm run preview` reads
`.dev.vars`, which holds `NEXTJS_ENV=development` so the Worker loads
`.env.local` too — secrets stay in one place.

To fire a cron by hand against a running `preview`:

```bash
curl "http://127.0.0.1:8788/cdn-cgi/local/scheduled?cron=0+4+*+*+*"
```

## Things that will bite

**The self-reference binding must match the Worker name.** `WORKER_SELF_REFERENCE`
in `wrangler.jsonc` points at `the-brand-friend`. Rename the Worker and the
cache overrides start failing at runtime, not at deploy.

**Cache binding names are fixed.** `NEXT_INC_CACHE_R2_BUCKET`,
`NEXT_CACHE_DO_QUEUE`, `NEXT_TAG_CACHE_DO_SHARDED`, `NEXT_CACHE_DO_PURGE` are
read by name inside OpenNext. Renaming one disables that piece of the cache
silently — pages just go stale.

**Cron schedules live in two files.** `wrangler.jsonc` declares them;
`worker.ts` maps them to routes. A schedule with no entry in `CRON_ROUTES` runs
and does nothing.

**Bundle size.** The paid plan allows 10 MiB compressed, the free plan 3 MiB.
The Worker is currently ~1.6 MiB. This is why `googleapis` was removed — it
unpacks to 195 MB and cannot be tree-shaken; `lib/google-jwt.js` replaces it
with a signed JWT and two `fetch` calls.

**On Windows, `preview` leaves processes behind.** Stopping the dev server
does not always take `workerd` with it, and the surviving process holds
`.open-next/assets` open, so the next build dies with `EBUSY` on rmdir. Kill the
tree before rebuilding:

```powershell
Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -like "*wrangler*dev*" -or $_.Name -eq "workerd.exe" } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

**Edge runtime is not supported.** `export const runtime = 'edge'` will not
build. `'nodejs'` is fine and is what the API routes use.

## Rolling back

Cloudflare keeps every deployment. Dashboard → the Worker → **Deployments** →
pick an earlier one → **Rollback**. Nothing needs rebuilding.
