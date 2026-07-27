import { BLOG_CATEGORIES, LINK_TARGETS } from './topics.js';

/** Phrases that mark a draft as generic AI filler. The gate rejects on these. */
export const BANNED_PHRASES = [
  "in today's digital age",
  "in today's fast-paced",
  "it's important to note",
  'without further ado',
  'in this comprehensive guide',
  "let's dive in",
  "let's explore",
  'are you looking for',
  'look no further',
  'as we all know',
  'at the end of the day',
  'it goes without saying',
  'navigating the landscape',
  'in the ever-evolving',
  'unlock the power',
  'game-changing',
  'cutting-edge',
  'seamlessly integrate',
  'take your business to the next level',
  'when it comes to',
];

function linkTargetBlock(existingPosts) {
  const services = LINK_TARGETS.map(t => `- ${t.url} — ${t.label}`).join('\n');
  const posts = existingPosts.length
    ? existingPosts
        .map(p => `- /blog/${p.slug}/ — ${p.seo_title} (${p.category || 'General'})`)
        .join('\n')
    : '- (no published posts yet — link only to the pages above)';
  return `SITE PAGES:\n${services}\n\nEXISTING BLOG POSTS:\n${posts}`;
}

/**
 * Stage 1 — Gemini writes the long-form draft.
 * Optimised for structure, coverage and keyword placement, not voice.
 */
export function buildDraftPrompt({ topic, primaryKeyword, intent, existingPosts }) {
  return `You are writing a long-form SEO article for TheBrandFriend, an India-based digital agency that does strategy, design, web development, and performance marketing for growing businesses.

TOPIC: ${topic}
PRIMARY KEYWORD: ${primaryKeyword}
SEARCH INTENT: ${intent}

## WHO IS READING
A founder or marketing lead at a small-to-mid-sized business, usually in India, who is deciding how to spend a real budget. They are sceptical of agencies. They want numbers, not adjectives.

## HARD RULES
- Minimum 1,600 words of body content. Aim for 2,000-2,400.
- Write in active voice. Address the reader as "you".
- Maximum 4 sentences per paragraph. Subheading every 200-300 words.
- NEVER use these phrases: ${BANNED_PHRASES.join('; ')}
- Never open a paragraph with "So," or "Well,".
- No em-dash-heavy prose. No exclamation marks.
- Do not invent client names, testimonials, case study results, or award claims.
- Do not claim a specific volume of past work ("we have built 200+ sites", "dozens of projects a year"). You have no source for such numbers.

## STRUCTURE (in this order)
1. A 2-3 sentence opening that leads with a specific number, cost, or concrete failure mode. No throat-clearing.
2. A "Key Takeaways" blockquote with 4-5 standalone facts, each containing a specific number. Format as a markdown blockquote.
3. Body sections using H2 -> H3 hierarchy. Never skip a level.
4. At least one markdown comparison table with 3+ data rows.
5. At least one original cost breakdown or calculation the reader cannot find on a generic listicle. Show the arithmetic.
6. One "> **Straight talk:**" blockquote with a contrarian or uncomfortable point.
7. A closing section that tells the reader exactly what to do next.

## KEYWORD PLACEMENT
- Primary keyword in the H1-equivalent title, in the first 100 words, in at least 2 H2s, and in the closing section.
- Keyword density 1-1.5%. Use natural variations and related terms, never repeat the exact phrase mechanically.
- Answer likely "People Also Ask" questions as H2 or H3 headings.

## INTERNAL LINKING (CRITICAL)
Include 5-8 internal links as inline markdown, placed mid-sentence, spread across the article.
- Anchor text: 2-5 words, descriptive, keyword-relevant.
- NEVER use "click here", "read more", "learn more", "this article", "here".
- Never use a full page title as anchor text.
- Bad:  "[Click here](/services/website-development/) for our web services."
- Good: "A properly scoped [custom website build](/services/website-development/) avoids most of this."

${linkTargetBlock(existingPosts)}

## EXTERNAL LINKS
Include 2-3 outbound markdown links to genuinely authoritative sources (Google developer docs, official platform documentation, government or industry-body pages). Never link to a competing agency. Only link to URLs you are confident exist.

## CURRENCY AND CONTEXT
Use Indian Rupees (written as "Rs 45,000" or "Rs 1.2 lakh") for pricing. Reference the current year as 2026 where relevant.

Return ONLY valid JSON matching this shape, with no markdown fences:
{
  "seoTitle": "under 60 chars, primary keyword front-loaded",
  "metaDescription": "under 155 chars, includes primary keyword and a reason to click",
  "slug": "lowercase-hyphenated-3-to-6-words",
  "tldr": "3-4 line summary with specific numbers, newline separated",
  "category": "EXACTLY ONE OF: ${BLOG_CATEGORIES.join(' | ')}",
  "topicCluster": "the parent pillar topic",
  "tags": ["4-6", "lowercase", "tags"],
  "contentMarkdown": "the full article in markdown, starting at the Key Takeaways blockquote — do NOT include an H1, the page renders the title separately",
  "faq": [{"question": "...", "answer": "40-60 words, first sentence answers directly with no preamble"}],
  "imageAlt": "descriptive alt text containing the primary keyword",
  "internalLinks": [{"anchor": "...", "url": "/services/..."}],
  "externalLinks": [{"anchor": "...", "url": "https://...", "authority": "source name"}]
}

The "faq" array must have at least 5 entries. At least one FAQ answer must contain a specific number, and at least one FAQ must be a "X vs Y" comparison question.

JSON VALIDITY — this is where these responses usually break:
- Escape every newline inside contentMarkdown as \\n. Do not emit literal line breaks inside a JSON string.
- Escape every double quote inside a string as \\".
- Backslashes must be doubled. Do not emit any other backslash escape sequence.
- Emit nothing before the opening { and nothing after the closing }.`;
}

/**
 * Stage 2 — Claude rewrites the draft in TheBrandFriend's voice and fixes
 * anything the draft got structurally wrong. This is the step that decides
 * whether the article reads like a person wrote it.
 */
export function buildPolishPrompt({ draft, topic, primaryKeyword }) {
  return `You are the editor at TheBrandFriend, an India-based digital agency. Below is a machine-written first draft. Rewrite it so it reads like it was written by a practitioner who has personally delivered this work for paying clients.

TOPIC: ${topic}
PRIMARY KEYWORD: ${primaryKeyword}

## WHAT TO CHANGE
- Rewrite the prose for voice: direct, specific, mildly opinionated, occasionally blunt. The house style is confident without being loud.
- Replace vague claims with concrete ones. If the draft says "significantly cheaper", give a number or a range and show where it comes from.
- Cut every sentence that does not add information. A shorter article that says more is the goal.
- Vary sentence length deliberately. Follow a long explanatory sentence with a short one.
- Add first-hand framing where it is honest: "In practice", "What we see most often", "The version of this that actually works".
- Do NOT fabricate specific client stories, names, revenue figures, or results.
- Do NOT make quantified claims about our own track record. Phrases like "from building dozens of websites annually", "across 200+ projects", "in our 10 years" are inventions — you have no source for them. Frame experience qualitatively ("what we see most often") or not at all.
- Do NOT present a made-up project as a worked example. If the draft has a "Real Project Example" or similar, rewrite it as a clearly generic scenario ("a typical 12-page brochure site") or cut it.
- Keep every internal and external markdown link from the draft. You may improve the anchor text, but do not drop links or invent new URLs.
- Keep the comparison table and the Key Takeaways blockquote. Improve their content if thin.

## HARD CONSTRAINTS
- These phrases must not appear anywhere: ${BANNED_PHRASES.join('; ')}
- Body content must stay at or above 1,600 words. Do not cut below that while trimming.
- Maximum 4 sentences per paragraph.
- No em-dash-heavy prose, no exclamation marks, no rhetorical questions as section openers.
- Do not add an H1. The page renders the title separately.
- Do not invent statistics. If the draft has a number you cannot justify, replace it with a range and say what it depends on.
- Keep all pricing in Indian Rupees.

## WHAT TO RETURN
Return the complete rewritten article, not a diff and not a summary of your edits.

Respond with ONLY a JSON object. No preamble, no explanation, no markdown code fences. Start with { and end with }.

Required keys:
- seoTitle (string, under 60 chars)
- metaDescription (string, under 155 chars)
- slug (string, lowercase-hyphenated — keep the draft's slug unless it is wrong)
- tldr (string, 3-4 lines separated by newlines)
- category (string, EXACTLY ONE OF: ${BLOG_CATEGORIES.join(' | ')})
- topicCluster (string)
- tags (array of 4-6 lowercase strings)
- contentMarkdown (string — the full rewritten article in markdown, no H1)
- faq (array of 5+ objects, each {"question": string, "answer": string})
- imageAlt (string)
- internalLinks (array of {"anchor": string, "url": string})
- externalLinks (array of {"anchor": string, "url": string, "authority": string})

Escape all newlines inside contentMarkdown as \\n so the JSON stays valid.

DRAFT (JSON):
${JSON.stringify(draft, null, 2)}`;
}

/** Shape the draft stage must return. Validated before the polish call. */
export const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    seoTitle: { type: 'string' },
    metaDescription: { type: 'string' },
    slug: { type: 'string' },
    contentMarkdown: { type: 'string' },
    faq: { type: 'array' },
  },
  required: ['seoTitle', 'metaDescription', 'slug', 'contentMarkdown', 'faq'],
};

/** JSON Schema for the polished article. Enforced via structured outputs. */
export const POLISHED_SCHEMA = {
  type: 'object',
  properties: {
    seoTitle: { type: 'string' },
    metaDescription: { type: 'string' },
    slug: { type: 'string' },
    tldr: { type: 'string' },
    category: { type: 'string', enum: BLOG_CATEGORIES },
    topicCluster: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    contentMarkdown: { type: 'string' },
    faq: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
        additionalProperties: false,
      },
    },
    imageAlt: { type: 'string' },
    internalLinks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { anchor: { type: 'string' }, url: { type: 'string' } },
        required: ['anchor', 'url'],
        additionalProperties: false,
      },
    },
    externalLinks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          anchor: { type: 'string' },
          url: { type: 'string' },
          authority: { type: 'string' },
        },
        required: ['anchor', 'url', 'authority'],
        additionalProperties: false,
      },
    },
  },
  required: [
    'seoTitle',
    'metaDescription',
    'slug',
    'tldr',
    'category',
    'topicCluster',
    'tags',
    'contentMarkdown',
    'faq',
    'imageAlt',
    'internalLinks',
    'externalLinks',
  ],
  additionalProperties: false,
};

/** Stage 3 — Claude scores the finished article. Fails closed. */
export function buildJudgePrompt({ article }) {
  return `Score this article for a digital agency's blog. The bar is: would an experienced marketer read it and think a competent human wrote it?

Be harsh. A 7 means genuinely useful and publishable. Most machine-written content is a 4-6.

TITLE: ${article.seoTitle}
PRIMARY KEYWORD: ${article.primaryKeyword || ''}

ARTICLE (complete — it ends where it ends, do not treat the ending as truncated):
${article.contentMarkdown}

Score honestly against these criteria:
- readsHuman: does it avoid generic AI cadence, filler transitions, and hollow generalities?
- hasSpecifics: real numbers, named tools/platforms, concrete costs or timelines — not just adjectives?
- hasOriginalValue: at least one calculation, breakdown, or angle a reader could not get from the first page of Google?
- hasComparisonTable: a markdown table with 3+ data rows?
- snippetReady: a Key Takeaways or equivalent block with standalone extractable facts?
- noFabrication: are all claims plausibly verifiable, with no invented client names, fake statistics, or made-up awards?

qualityScore is 1-10. Award 7+ only if readsHuman, hasSpecifics, and noFabrication are all true.

Respond with ONLY a JSON object. No preamble, no markdown code fences. Start with { and end with }.

{
  "readsHuman": true or false,
  "hasSpecifics": true or false,
  "hasOriginalValue": true or false,
  "hasComparisonTable": true or false,
  "snippetReady": true or false,
  "noFabrication": true or false,
  "qualityScore": integer 1-10,
  "reason": "one or two sentences explaining the score"
}`;
}

export const JUDGE_SCHEMA = {
  type: 'object',
  properties: {
    readsHuman: { type: 'boolean' },
    hasSpecifics: { type: 'boolean' },
    hasOriginalValue: { type: 'boolean' },
    hasComparisonTable: { type: 'boolean' },
    snippetReady: { type: 'boolean' },
    noFabrication: { type: 'boolean' },
    qualityScore: { type: 'integer' },
    reason: { type: 'string' },
  },
  required: [
    'readsHuman',
    'hasSpecifics',
    'hasOriginalValue',
    'hasComparisonTable',
    'snippetReady',
    'noFabrication',
    'qualityScore',
    'reason',
  ],
  additionalProperties: false,
};
