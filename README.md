# TheBrandFriend

The agency site — Next.js App Router, deployed as a Cloudflare Worker, with an
automated blog pipeline behind it.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Environment variables come
from `.env.local`; `.env.example` lists what is needed.

To exercise the real Worker runtime rather than the Next dev server:

```bash
npm run preview
```

## Layout

| Path | What is there |
|---|---|
| `src/app` | routes — pages and API handlers |
| `src/components`, `src/data` | UI and static content |
| `lib` | Supabase, Gmail, Google auth, and the blog pipeline |
| `scripts` | CLI helpers — blog runs, design builds, schema inspection |
| `supabase` | schema and migrations |
| `worker.ts`, `wrangler.jsonc`, `open-next.config.ts` | Cloudflare deployment |

## Docs

- [Deploying on Cloudflare](docs/CLOUDFLARE.md) — bindings, secrets, crons, cutover
- [Automated blog pipeline](docs/BLOG_PIPELINE.md) — how two posts a week get written and published
