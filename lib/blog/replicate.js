/**
 * Replicate client — every model call in the blog pipeline goes through here.
 *
 * One token, three official models. Official models are addressed as
 * `owner/name` with no version hash, so there is nothing to re-pin when
 * Replicate ships a new build.
 *
 * Input field names are NOT the underlying provider's parameter names —
 * Replicate wraps each model in its own schema, and they disagree with each
 * other (Gemini takes `system_instruction` + `max_output_tokens`, Claude takes
 * `system_prompt` + `max_tokens`). The ADAPTERS table below is the mapping,
 * verified against the live schemas via scripts/replicate-schema.js.
 */

const API_BASE = 'https://api.replicate.com/v1';

export const MODELS = {
  draft: process.env.REPLICATE_DRAFT_MODEL || 'google/gemini-2.5-flash',
  polish: process.env.REPLICATE_POLISH_MODEL || 'anthropic/claude-4.5-sonnet',
  judge: process.env.REPLICATE_JUDGE_MODEL || 'anthropic/claude-4.5-haiku',
};

/**
 * Per-family input builders. Keyed by the `owner/` prefix so swapping
 * anthropic/claude-4.5-sonnet for anthropic/claude-opus-4.6 needs no code change.
 */
const ADAPTERS = {
  'google/': ({ prompt, system, maxTokens }) => ({
    prompt,
    ...(system ? { system_instruction: system } : {}),
    // 1..65535 on the live schema.
    max_output_tokens: Math.min(maxTokens ?? 32768, 65535),
    temperature: 0.8,
    // Claude does the quality pass, so the draft skips reasoning to stay
    // inside the serverless time budget. Raise if drafts come back thin.
    thinking_budget: Number(process.env.REPLICATE_DRAFT_THINKING ?? 0),
  }),

  'anthropic/': ({ prompt, system, maxTokens }) => ({
    prompt,
    ...(system ? { system_prompt: system } : {}),
    // Sonnet's schema enforces 1024..64000; Haiku caps at 8192. Clamping here
    // rather than at the call site keeps the judge from 422-ing on a bad default.
    max_tokens: Math.max(1024, Math.min(maxTokens ?? 8192, 64000)),
  }),
};

function buildInput(model, args) {
  const key = Object.keys(ADAPTERS).find(prefix => model.startsWith(prefix));
  if (!key) {
    throw new Error(
      `No Replicate input adapter for "${model}". Add one to ADAPTERS in lib/blog/replicate.js ` +
        `(run scripts/replicate-schema.js to see its field names).`
    );
  }
  return ADAPTERS[key](args);
}

function authHeaders() {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('Missing REPLICATE_API_TOKEN environment variable.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

/** Every model here streams; `output` arrives as string chunks to concatenate. */
function collectOutput(output) {
  if (Array.isArray(output)) return output.join('');
  if (typeof output === 'string') return output;
  return '';
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Poll a prediction to a terminal state. Only used when a generation
 * overruns the synchronous window.
 */
async function pollPrediction(url, { timeoutMs = 240000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let delay = 1000;

  while (Date.now() < deadline) {
    await sleep(delay);
    delay = Math.min(delay * 1.5, 5000);

    const res = await fetch(url, { headers: authHeaders() });
    if (!res.ok) {
      throw new Error(`Replicate poll failed: HTTP ${res.status}`);
    }

    const prediction = await res.json();
    if (prediction.status === 'succeeded') return prediction;
    if (prediction.status === 'failed') {
      throw new Error(`Replicate prediction failed: ${prediction.error || 'unknown error'}`);
    }
    if (prediction.status === 'canceled') {
      throw new Error('Replicate prediction was canceled.');
    }
  }

  throw new Error(`Replicate prediction timed out after ${timeoutMs}ms.`);
}

/**
 * Run one model and return its text output.
 *
 * Uses `Prefer: wait` so short generations come back in a single round trip,
 * and falls back to polling when they do not.
 */
export async function runModel({ model, prompt, system, maxTokens, waitSeconds = 60 }) {
  const res = await fetch(`${API_BASE}/models/${model}/predictions`, {
    method: 'POST',
    headers: { ...authHeaders(), Prefer: `wait=${waitSeconds}` },
    body: JSON.stringify({ input: buildInput(model, { prompt, system, maxTokens }) }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Replicate HTTP ${res.status} for ${model}: ${body.slice(0, 400)}`);
  }

  let prediction = await res.json();

  if (prediction.status !== 'succeeded') {
    if (prediction.status === 'failed') {
      throw new Error(
        `Replicate prediction failed for ${model}: ${prediction.error || 'unknown error'}`
      );
    }
    const pollUrl = prediction?.urls?.get;
    if (!pollUrl) {
      throw new Error(`Replicate returned status "${prediction.status}" with no poll URL.`);
    }
    prediction = await pollPrediction(pollUrl);
  }

  const text = collectOutput(prediction.output).trim();
  if (!text) throw new Error(`Replicate returned empty output for ${model}.`);
  return text;
}

/* ------------------------------------------------------------------ */
/* JSON handling                                                       */
/* ------------------------------------------------------------------ */

/**
 * Repair the two ways a model reliably breaks JSON when a long markdown
 * document is embedded in a string field:
 *
 *   1. raw control characters — literal newlines and tabs inside the string,
 *      instead of \n and \t. This is the common one; a 2,500-word article
 *      has hundreds of line breaks and the model only has to slip once.
 *   2. invalid escape sequences — a lone backslash, or \x style escapes that
 *      JSON does not define.
 *
 * Walks the text tracking string state and fixes both in place. Content
 * outside strings is untouched, so valid JSON passes through unchanged.
 */
export function sanitizeJSONText(text) {
  const VALID_ESCAPES = new Set(['"', '\\', '/', 'b', 'f', 'n', 'r', 't', 'u']);
  let out = '';
  let inString = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];

    if (!inString) {
      if (ch === '"') inString = true;
      out += ch;
      continue;
    }

    if (ch === '\\') {
      const next = text[i + 1];
      if (next !== undefined && VALID_ESCAPES.has(next)) {
        out += ch + next;
        i += 1;
      } else {
        // Lone or invalid backslash — escape it so it survives as a literal.
        out += '\\\\';
      }
      continue;
    }

    if (ch === '"') {
      // An unescaped quote inside a string looks identical to the closing
      // quote. Disambiguate by what follows: after a real closing quote JSON
      // only permits , } ] : or end of input.
      const rest = text.slice(i + 1);
      const nextMeaningful = rest.match(/^\s*(.)/);
      if (!nextMeaningful || /[,}\]:]/.test(nextMeaningful[1])) {
        inString = false;
        out += ch;
      } else {
        out += '\\"';
      }
      continue;
    }

    const code = ch.charCodeAt(0);
    if (code < 0x20) {
      out +=
        ch === '\n' ? '\\n'
        : ch === '\r' ? '\\r'
        : ch === '\t' ? '\\t'
        : `\\u${code.toString(16).padStart(4, '0')}`;
      continue;
    }

    out += ch;
  }

  return out;
}

/* ------------------------------------------------------------------ */
/* Sectioned output                                                    */
/* ------------------------------------------------------------------ */

export const META_MARKER = '---METADATA---';
export const BODY_MARKER = '---ARTICLE---';
export const END_MARKER = '---END---';

/**
 * Split a sectioned response into small JSON metadata and a raw markdown body.
 *
 * Asking a model to embed a 2,500-word markdown document inside a JSON string
 * is the single largest source of failure in this pipeline — in live runs it
 * produced raw control characters, invalid escape sequences, and unescaped
 * double quotes on three consecutive attempts. The article is thousands of
 * characters of prose containing newlines, quotes, pipes and backslashes, and
 * the model only has to slip once for the whole response to be unparseable.
 *
 * Keeping the body outside JSON removes that class of bug rather than
 * repairing it. The remaining JSON is small and structured, which models
 * emit reliably.
 */
export function extractSectioned(raw) {
  const metaStart = raw.indexOf(META_MARKER);
  const bodyStart = raw.indexOf(BODY_MARKER);

  if (metaStart === -1 || bodyStart === -1 || bodyStart < metaStart) {
    throw new Error(
      `Response is missing the ${META_MARKER} / ${BODY_MARKER} markers. ` +
        `First 200 chars: ${raw.slice(0, 200)}`
    );
  }

  const metaText = raw.slice(metaStart + META_MARKER.length, bodyStart).trim();

  const endIndex = raw.indexOf(END_MARKER, bodyStart);
  const body = raw
    .slice(bodyStart + BODY_MARKER.length, endIndex === -1 ? undefined : endIndex)
    .trim();

  if (!body) throw new Error('Sectioned response contained an empty article body.');

  return { meta: extractJSON(metaText), body };
}

/**
 * Replicate's wrappers expose no structured-output mode, so JSON is
 * prompt-enforced and must be extracted defensively.
 */
export function extractJSON(raw) {
  let text = raw.trim();

  // Strip a fenced block if the model wrapped its answer in one.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced) text = fenced[1].trim();

  // Otherwise take the outermost braces, ignoring any preamble/outro prose.
  if (!text.startsWith('{')) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end <= start) {
      throw new Error(`No JSON object found. First 200 chars: ${raw.slice(0, 200)}`);
    }
    text = text.slice(start, end + 1);
  }

  try {
    return JSON.parse(text);
  } catch (firstError) {
    // Almost always a raw newline inside the markdown field. Repair and retry
    // before spending another model call on it.
    try {
      return JSON.parse(sanitizeJSONText(text));
    } catch {
      throw firstError;
    }
  }
}

/**
 * Minimal structural validation against the JSON Schemas in prompts.js.
 * Deliberately not a full JSON Schema implementation — it checks required
 * keys, types, and enums, which is what actually goes wrong here. Keeping
 * it hand-rolled avoids adding a validator dependency.
 */
export function validateAgainstSchema(value, schema, pathLabel = 'root') {
  const errors = [];

  const typeOf = v => (Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v);

  const check = (val, spec, path) => {
    if (!spec) return;

    if (spec.type && typeOf(val) !== spec.type) {
      if (!(spec.type === 'integer' && Number.isInteger(val))) {
        errors.push(`${path}: expected ${spec.type}, got ${typeOf(val)}`);
        return;
      }
    }

    if (spec.enum && !spec.enum.includes(val)) {
      errors.push(`${path}: "${val}" is not one of [${spec.enum.join(', ')}]`);
    }

    if (spec.type === 'object' && spec.properties) {
      for (const key of spec.required || []) {
        if (val[key] === undefined || val[key] === null) {
          errors.push(`${path}.${key}: missing`);
        }
      }
      for (const [key, sub] of Object.entries(spec.properties)) {
        if (val[key] !== undefined && val[key] !== null) check(val[key], sub, `${path}.${key}`);
      }
    }

    if (spec.type === 'array' && spec.items && Array.isArray(val)) {
      val.forEach((item, i) => check(item, spec.items, `${path}[${i}]`));
    }
  };

  check(value, schema, pathLabel);
  return errors;
}

/**
 * Run a model that returns metadata + a raw markdown body, and merge the two
 * into one object under `bodyKey`. Same one-repair-attempt policy as runJSON.
 */
export async function runSectioned({
  model,
  prompt,
  system,
  maxTokens,
  schema,
  stage,
  deadline,
  bodyKey = 'contentMarkdown',
}) {
  let lastError = null;
  let lastOutput = '';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    if (attempt > 1 && deadline && Date.now() > deadline) {
      throw new Error(
        `${stage} returned a malformed response and there is no time budget left to retry. ${lastError}`
      );
    }

    const activePrompt =
      attempt === 1
        ? prompt
        : repairPrompt({ originalPrompt: prompt, badOutput: lastOutput, problem: lastError });

    lastOutput = await runModel({ model, prompt: activePrompt, system, maxTokens });

    let meta;
    let body;
    try {
      ({ meta, body } = extractSectioned(lastOutput));
    } catch (err) {
      lastError = err.message;
      console.warn(`[blog] ${stage} attempt ${attempt}: ${lastError}`);
      continue;
    }

    const merged = { ...meta, [bodyKey]: body };

    if (schema) {
      const errors = validateAgainstSchema(merged, schema, stage);
      if (errors.length) {
        lastError = `Response did not match the required shape: ${errors.slice(0, 6).join('; ')}`;
        console.warn(`[blog] ${stage} attempt ${attempt}: ${lastError}`);
        continue;
      }
    }

    if (attempt > 1) console.log(`[blog] ${stage}: repaired on attempt ${attempt}`);
    return merged;
  }

  throw new Error(`${stage} failed after 2 attempts. ${lastError}`);
}

function repairPrompt({ originalPrompt, badOutput, problem }) {
  return `${originalPrompt}

---
YOUR PREVIOUS RESPONSE WAS REJECTED.

Problem: ${problem}

Previous response (truncated):
${badOutput.slice(0, 2000)}

Return ONLY the corrected JSON object. No prose before it, no prose after it, no markdown code fences. Start your response with { and end it with }.`;
}

/**
 * Run a model and get validated JSON back.
 *
 * One repair attempt on a parse or validation failure: the model is shown its
 * own broken output and the specific error. Beyond that the caller decides
 * what to do (the pipeline returns the topic to the queue).
 */
export async function runJSON({ model, prompt, system, maxTokens, schema, stage, deadline }) {
  let lastError = null;
  let lastOutput = '';

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    // A repair attempt costs roughly as much wall-clock as the first one.
    // Under a hard deadline (Vercel's function ceiling) it is better to fail
    // now and hand the topic back than to be killed mid-write.
    if (attempt > 1 && deadline && Date.now() > deadline) {
      throw new Error(
        `${stage} produced invalid JSON and there is no time budget left for a repair attempt. ${lastError}`
      );
    }

    const activePrompt =
      attempt === 1
        ? prompt
        : repairPrompt({
            originalPrompt: prompt,
            badOutput: lastOutput,
            problem: lastError,
          });

    lastOutput = await runModel({ model, prompt: activePrompt, system, maxTokens });

    let parsed;
    try {
      parsed = extractJSON(lastOutput);
    } catch (err) {
      lastError = `Response was not valid JSON — ${err.message}`;
      console.warn(`[blog] ${stage} attempt ${attempt}: ${lastError}`);
      continue;
    }

    if (schema) {
      const errors = validateAgainstSchema(parsed, schema, stage);
      if (errors.length) {
        lastError = `JSON did not match the required shape: ${errors.slice(0, 6).join('; ')}`;
        console.warn(`[blog] ${stage} attempt ${attempt}: ${lastError}`);
        continue;
      }
    }

    if (attempt > 1) console.log(`[blog] ${stage}: repaired on attempt ${attempt}`);
    return parsed;
  }

  throw new Error(`${stage} failed after 2 attempts. ${lastError}`);
}
