-- Adds photographer attribution for blog cover images.
--
-- The Pexels API guidelines require a visible photographer credit and a link
-- back to Pexels, so the credit is stored alongside the URL rather than
-- derived later — an image whose credit has been lost cannot legally be used.
--
-- Shape: { photographer, photographerUrl, photoUrl, source }
--
-- Safe to run on an existing database, and a no-op if already applied.
alter table blog_posts
  add column if not exists cover_image_credit jsonb;
