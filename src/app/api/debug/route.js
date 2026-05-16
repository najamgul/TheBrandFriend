import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug — Quick check if Supabase env vars are set + test connection
 * DELETE THIS AFTER DEBUGGING
 */
export async function GET() {
  const results = {};

  // Check env vars
  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_KEY || '';

  results.supabaseUrl = url ? url.replace(/(https:\/\/[a-z]{4})[a-z]+/, '$1****') + '.supabase.co' : 'NOT SET';
  results.serviceKeySet = key ? `SET (${key.length} chars)` : 'NOT SET';

  // Try to connect
  if (url && key) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key, { auth: { persistSession: false } });

      // Count leads
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true });

      results.leadCount = error ? `Error: ${error.message}` : count;

      // Try a test insert + delete
      const { data: testRow, error: insertErr } = await supabase
        .from('leads')
        .insert({
          name: '🔧 Website Debug Test',
          email: 'debug@thebrandfriend.com',
          service: 'DEBUG',
          brief: 'Website debug test',
          source: 'debug',
          status: 'new',
        })
        .select('id')
        .single();

      if (insertErr) {
        results.insertTest = { success: false, error: insertErr.message, code: insertErr.code };
      } else {
        results.insertTest = { success: true };
        await supabase.from('leads').delete().eq('id', testRow.id);
        results.insertTest.cleaned = true;
      }
    } catch (err) {
      results.connectionError = err.message;
    }
  }

  return NextResponse.json(results);
}
