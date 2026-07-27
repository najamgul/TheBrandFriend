# Automated blog pipeline

Two posts a week, written and published without you touching anything.

## Architecture

```
GitHub Actions (daily 02:30 UTC)          Vercel Cron (daily 04:00 UTC)
  scripts/blog-pipeline.mjs                 /api/blog/publish
        │                                         │
   draft   google/gemini-2.5-flash          claim oldest approved
        ↓                                         ↓
   polish  anthropic/claude-4.5-sonnet      revalidate /blog + sitemap
        ↓                                         ↓
   gate    lib/blog/quality-gate.js         IndexNow + Google Indexing
        ↓                                         ↓
   judge   anthropic/claude-4.5-haiku       status = published
        ↓
   blog_posts (status = approved)  ← the content bank
```

**Why generation runs in GitHub Actions and not Vercel.** A measured
end-to-end run takes ~186s (draft 59s, polish 124s, judge 3s). Vercel Hobby
caps functions at 60s and Pro at 300s — the latter leaves no headroom once a
JSON repair retry is involved (an early measured run hit 284s). Actions has a
20-minute budget here and costs nothing.

**Why publishing stays on Vercel.** It is a database update plus two HTTP
pings (~3-5s), and it needs Next's `revalidatePath` to rebuild cached pages.

**Why a content bank.** Generation keeps four approved articles in reserve;
publishing draws one down on Tuesdays and Fridays. A failed generation never
disturbs the publishing cadence.

## One-time setup

### 1. Database

Run [`supabase/blog-schema.sql`](../supabase/blog-schema.sql) in the Supabase
SQL editor. Creates `blog_topics`, `blog_posts`, `blog_runs`.

### 2. GitHub repository secrets

Settings → Secrets and variables → Actions:

| Secret | Required | Notes |
|---|---|---|
| `REPLICATE_API_TOKEN` | yes | https://replicate.com/account/api-tokens |
| `SUPABASE_URL` | yes | same value as Vercel |
| `SUPABASE_SERVICE_KEY` | yes | service role key |
| `UNSPLASH_ACCESS_KEY` | no | omit and posts render a branded placeholder card |

### 3. Vercel environment variables

| Variable | Notes |
|---|---|
| `CRON_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `INDEXNOW_KEY` | `1e5baeba0d3f31c4d3fba4cae460eb04` — must match `public/<key>.txt` |
| `GOOGLE_INDEXING_CLIENT_EMAIL` | falls back to `GOOGLE_SA_CLIENT_EMAIL` |
| `GOOGLE_INDEXING_PRIVATE_KEY` | falls back to `GOOGLE_SA_PRIVATE_KEY` |

The generation vars (`REPLICATE_*`) are **not** needed on Vercel unless you
intend to use the manual `/api/blog/generate` escape hatch.

### 4. Google Search Console

Add the service account as an **owner** of the property, and enable the
"Web Search Indexing API" on its Cloud project. Without this the Google ping
fails silently — it is logged to `blog_runs`, never thrown.

## Running it

```bash
# Generate one article now (reads .env.local)
node scripts/blog-pipeline.mjs generate --force

# Inspect a model's real input schema before swapping it
node scripts/replicate-schema.js

# Publish now, out of schedule
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://thebrandfriend.com/api/blog/publish?force=1
```

In GitHub: Actions → "Blog pipeline — generate" → Run workflow.

## Topics

The queue seeds itself from [`lib/blog/topics.js`](../lib/blog/topics.js) when
it runs dry (20 topics across six service clusters). To add your own, insert
into `blog_topics` directly:

```sql
insert into blog_topics (topic, primary_keyword, intent, cluster) values
  ('Your topic phrased as a title', 'target keyword', 'commercial', 'website-development');
```

`intent` is one of `informational`, `commercial`, `transactional`, `comparison`.
`primary_keyword` is unique case-insensitively — the same keyword cannot be
queued twice.

## The quality gate

Deterministic checks run first (free), then a model judge (cheap).

**Blocking:** under 1,500 words · any banned AI phrase · fewer than 4 internal
links · non-descriptive anchor text ("click here") · an H1 in the body ·
more than 3 paragraphs over 90 words · fewer than 5 FAQs · meta description
over 160 chars · title over 70 chars · malformed slug · judge score under 7 ·
judge flags fabrication or non-human prose.

**Warning only:** thin comparison table · no Key Takeaways block · fewer than
2 external authority links.

A rejected article returns its topic to the queue with the reason recorded.
After three failures the topic is marked `failed` and skipped.

**Keyword cannibalisation** is checked before generation: a topic whose
keyword overlaps an existing post by 80% or more is skipped outright. This is
the failure mode that quietly damages rankings on automated blogs.

## Monitoring

```sql
-- Recent runs
select created_at, kind, ok, summary from blog_runs order by created_at desc limit 20;

-- Content bank depth
select status, count(*) from blog_posts group by status;

-- Topics that gave up
select primary_keyword, retry_count, failure_reason
from blog_topics where status = 'failed';

-- Did indexing land?
select slug, published_at, indexing from blog_posts
where status = 'published' order by published_at desc limit 10;
```

## Changing models

Set `REPLICATE_DRAFT_MODEL`, `REPLICATE_POLISH_MODEL`, or
`REPLICATE_JUDGE_MODEL`. All are Replicate **official** models, addressed as
`owner/name` with no version hash.

Replicate wraps each model in its own input schema and the field names differ
between families — Gemini takes `system_instruction` and `max_output_tokens`,
Claude takes `system_prompt` and `max_tokens`. After switching to a new family,
run `node scripts/replicate-schema.js` and add an entry to `ADAPTERS` in
[`lib/blog/replicate.js`](../lib/blog/replicate.js). Switching within a family
(Sonnet → Opus) needs no code change.

Replicate exposes no structured-output mode, so JSON is prompt-enforced and
validated in `runJSON`, with one repair attempt that feeds the model its own
broken output plus the parse error.

## Tuning

| Knob | Where | Default |
|---|---|---|
| Posts per week | `PUBLISH_DAYS` in `src/app/api/blog/publish/route.js` | Tue + Fri |
| Content bank depth | `CONTENT_BANK_TARGET` in `lib/blog/store.js` | 4 |
| Minimum word count | `MIN_WORDS` in `lib/blog/quality-gate.js` | 1500 |
| Judge pass mark | `MIN_QUALITY_SCORE` | 7 |
| Draft reasoning budget | `REPLICATE_DRAFT_THINKING` env | 0 |
| Voice and rules | `buildPolishPrompt` in `lib/blog/prompts.js` | — |
