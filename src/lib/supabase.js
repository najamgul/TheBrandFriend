import { createClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client for TheBrandFriend.
 * Uses the SERVICE_ROLE key — never expose this on the client.
 * Singleton via globalThis to prevent creating new clients on every request.
 */
export function getSupabase() {
  if (globalThis.__tbf_supabase) {
    return globalThis.__tbf_supabase;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.'
    );
  }

  globalThis.__tbf_supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  return globalThis.__tbf_supabase;
}
