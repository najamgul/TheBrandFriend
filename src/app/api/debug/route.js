import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug — Tests inserting a lead exactly like the contact form does
 * DELETE THIS AFTER DEBUGGING
 */
export async function GET() {
  const results = {};

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase env vars not set' }, { status: 500 });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, key, { auth: { persistSession: false } });

    // Test 1: Insert WITHOUT recaptcha_score (like the debug endpoint did before)
    const { data: test1, error: err1 } = await supabase
      .from('leads')
      .insert({
        name: 'Test A - no recaptcha_score',
        email: 'testa@thebrandfriend.com',
        service: 'DEBUG',
        brief: 'Insert without recaptcha_score',
        source: 'debug',
        status: 'new',
      })
      .select('id')
      .single();

    results.withoutRecaptchaScore = err1
      ? { success: false, error: err1.message, code: err1.code }
      : { success: true };

    // Clean up test 1
    if (test1?.id) await supabase.from('leads').delete().eq('id', test1.id);

    // Test 2: Insert WITH recaptcha_score (exactly like the contact form does)
    const { data: test2, error: err2 } = await supabase
      .from('leads')
      .insert({
        name: 'Test B - with recaptcha_score',
        email: 'testb@thebrandfriend.com',
        service: 'DEBUG',
        design: null,
        brief: 'Insert with recaptcha_score field',
        phone: '9999999999',
        source: 'contact-form',
        status: 'new',
        recaptcha_score: 0.9,
      })
      .select('id')
      .single();

    results.withRecaptchaScore = err2
      ? { success: false, error: err2.message, code: err2.code }
      : { success: true };

    // Clean up test 2
    if (test2?.id) await supabase.from('leads').delete().eq('id', test2.id);

    return NextResponse.json(results);
  } catch (err) {
    return NextResponse.json({ ...results, fatalError: err.message }, { status: 500 });
  }
}
