-- ============================================================
-- TheBrandFriend — Automated Blog Pipeline schema
-- Run this once in the Supabase SQL editor.
-- ============================================================

-- ------------------------------------------------------------
-- 1. blog_topics — the keyword/topic queue.
--    Rows are seeded manually (or by /api/blog/generate from
--    lib/blog/topics.js) and consumed by the generate cron.
-- ------------------------------------------------------------
create table if not exists blog_topics (
  id              uuid primary key default gen_random_uuid(),
  topic           text not null,
  primary_keyword text not null,
  intent          text not null default 'informational'
                    check (intent in ('informational','commercial','transactional','comparison')),
  cluster         text,
  status          text not null default 'queued'
                    check (status in ('queued','generating','done','failed','skipped')),
  failure_reason  text,
  retry_count     int  not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Prevents the same keyword being queued twice (case-insensitive).
create unique index if not exists blog_topics_keyword_uniq
  on blog_topics (lower(primary_keyword));

create index if not exists blog_topics_status_idx
  on blog_topics (status, created_at);

-- ------------------------------------------------------------
-- 2. blog_posts — generated articles.
--    status 'approved' = passed the gate, sitting in the content
--    bank. status 'published' = live on the site.
-- ------------------------------------------------------------
create table if not exists blog_posts (
  id                uuid primary key default gen_random_uuid(),
  topic_id          uuid references blog_topics(id) on delete set null,

  slug              text not null unique,
  seo_title         text not null,
  meta_description  text not null,
  tldr              text,
  content_markdown  text not null,
  faq               jsonb not null default '[]'::jsonb,

  category          text,
  tags              text[] not null default '{}',
  primary_keyword   text,
  topic_cluster     text,
  author            text not null default 'TheBrandFriend Team',

  cover_image       text,
  cover_image_alt   text,

  internal_links    jsonb not null default '[]'::jsonb,
  external_links    jsonb not null default '[]'::jsonb,

  word_count        int  not null default 0,
  quality_score     numeric(3,1),
  quality_notes     text,

  status            text not null default 'approved'
                      check (status in ('approved','published','unpublished','failed')),
  published_at      timestamptz,

  -- { "indexnow": "sent|failed|pending", "google": "...", "at": "..." }
  indexing          jsonb not null default '{}'::jsonb,

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists blog_posts_status_idx
  on blog_posts (status, published_at desc nulls last);

create index if not exists blog_posts_published_idx
  on blog_posts (published_at desc)
  where status = 'published';

create index if not exists blog_posts_keyword_idx
  on blog_posts (lower(primary_keyword));

-- ------------------------------------------------------------
-- 3. blog_runs — one row per cron invocation. Your audit trail
--    when an article silently fails to appear.
-- ------------------------------------------------------------
create table if not exists blog_runs (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('generate','publish')),
  ok          boolean not null default true,
  summary     text,
  detail      jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists blog_runs_created_idx
  on blog_runs (kind, created_at desc);

-- ------------------------------------------------------------
-- 4. updated_at triggers
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_topics_updated_at on blog_topics;
create trigger blog_topics_updated_at
  before update on blog_topics
  for each row execute function set_updated_at();

drop trigger if exists blog_posts_updated_at on blog_posts;
create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- 5. Row Level Security
--    The site and the pipeline both use the service-role key,
--    which bypasses RLS. We still enable it so that if an anon
--    key ever leaks, published posts are the only thing exposed.
-- ------------------------------------------------------------
alter table blog_topics enable row level security;
alter table blog_posts  enable row level security;
alter table blog_runs   enable row level security;

drop policy if exists "public reads published posts" on blog_posts;
create policy "public reads published posts"
  on blog_posts for select
  using (status = 'published');
