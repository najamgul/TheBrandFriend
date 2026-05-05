import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for TheBrandFriend.
 * Uses the SERVICE_ROLE key — never expose this on the client.
 */
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
