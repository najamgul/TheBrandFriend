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

## STATISTICS AND ATTRIBUTION (NON-NEGOTIABLE)
Inventing a plausible-sounding statistic is the fastest way to get this article rejected.
- Any third-party statistic MUST carry an inline markdown link to the source in the same sentence. Example: "Google reports that [pages taking over three seconds to load lose a large share of mobile visits](https://web.dev/vitals/)."
- If you cannot attribute a number to a source you are confident exists, do NOT state it as a number. Say it qualitatively instead ("most sites see a measurable drop") or cut the claim.
- Never stack several unattributed percentages in one paragraph. That reads as invented, because it usually is.
- Your OWN cost breakdowns are different and encouraged: those are TheBrandFriend's pricing, so present them as our ranges and show the arithmetic. Say what the range depends on.
- Do not present two statistics that contradict each other.

## EXTERNAL LINKS
Include 2-3 outbound markdown links to genuinely authoritative sources (Google developer docs, official platform documentation, government or industry-body pages). Never link to a competing agency. Only link to URLs you are confident exist — prefer a well-known stable page such as https://web.dev/vitals/ or https://developers.google.com/search/docs over a deep link you are guessing at. These links must appear inside the article body, not only in the metadata.

## CURRENCY AND CONTEXT
Use Indian Rupees (written as "Rs 45,000" or "Rs 1.2 lakh") for pricing. Reference the current year as 2026 where relevant.

## OUTPUT FORMAT (follow exactly)

Emit three sections, in this order, with these exact marker lines:

---METADATA---
{
  "seoTitle": "under 60 chars, primary keyword front-loaded",
  "metaDescription": "under 155 chars, primary keyword plus a reason to click",
  "slug": "lowercase-hyphenated-3-to-6-words",
  "tldr": "3-4 short lines with specific numbers, separated by \n",
  "category": "EXACTLY ONE OF: ${BLOG_CATEGORIES.join(' | ')}",
  "topicCluster": "the parent pillar topic",
  "tags": ["4-6", "lowercase", "tags"],
  "faq": [{"question": "...", "answer": "40-60 words, answers directly with no preamble"}],
  "imageAlt": "descriptive alt text containing the primary keyword",
  "imageQuery": "2-4 word stock photo search phrase, e.g. \"modern office laptop\" or \"team meeting whiteboard\" — describe a PHOTOGRAPHABLE SCENE, never an abstract topic like \"website cost\""
}
---ARTICLE---
The full article in markdown. Write it raw and unescaped, exactly as it should
appear on the page. Do NOT wrap it in quotes, JSON, or code fences. Newlines,
quotation marks, pipes and backslashes are all fine here — write naturally.
Start at the Key Takeaways blockquote. Do NOT include an H1; the page renders
the title separately.
---END---

Rules for the metadata block:
- It must be valid JSON and must NOT contain the article text.
- Keep every value short and on a single line.
- The "faq" array must have at least 5 entries. At least one answer must
  contain a specific number, and at least one question must be an "X vs Y"
  comparison.`;
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

## STATISTICS — THE MOST COMMON REASON THIS GETS REJECTED
Audit every number in the draft before you keep it.
- A third-party statistic may stay ONLY if it carries an inline markdown link to its source in the same sentence. If the draft states one without attribution, either add a link to a source you are confident exists, or rewrite it qualitatively ("most sites see a measurable drop"). When in doubt, cut it.
- Delete stacked unattributed percentages in an opening paragraph. That pattern reads as invented.
- If two statistics in the draft contradict each other, remove both.
- Our own pricing is different: keep those breakdowns, present them as TheBrandFriend's ranges, show the arithmetic, and say what the range depends on.
- The finished article must contain at least 2 outbound links to authoritative sources, inside the body text.

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

## FINAL CHECK BEFORE YOU ANSWER
An automated gate rejects the article outright on any of these. Verify each one:
1. Search your finished text for every banned phrase listed above. "seamlessly integrate", "cutting-edge" and "when it comes to" are the ones that slip through most often.
2. Count the sentences in every paragraph. Any paragraph over 4 sentences or roughly 90 words must be split. This is the second most common rejection.
3. Confirm at least 5 internal markdown links to site paths, and no anchor reading "click here", "read more", "learn more", "here" or "this article".
4. Confirm no line begins with a single "#". The page renders the title itself.
5. Confirm the metadata description is under 155 characters and the title under 60.

## OUTPUT FORMAT (follow exactly)

Emit three sections, in this order, with these exact marker lines:

---METADATA---
{
  "seoTitle": "under 60 chars",
  "metaDescription": "under 155 chars",
  "slug": "lowercase-hyphenated — keep the draft's slug unless it is wrong",
  "tldr": "3-4 short lines, separated by \n",
  "category": "EXACTLY ONE OF: ${BLOG_CATEGORIES.join(' | ')}",
  "topicCluster": "the parent pillar topic",
  "tags": ["4-6", "lowercase", "tags"],
  "faq": [{"question": "...", "answer": "40-60 words"}],
  "imageAlt": "descriptive alt text containing the primary keyword",
  "imageQuery": "2-4 word stock photo search phrase describing a photographable scene, not an abstract topic",
  "internalLinks": [{"anchor": "...", "url": "/services/..."}],
  "externalLinks": [{"anchor": "...", "url": "https://...", "authority": "source name"}]
}
---ARTICLE---
The complete rewritten article in markdown, raw and unescaped, exactly as it
should appear on the page. Do NOT wrap it in quotes, JSON, or code fences.
Newlines, quotation marks, pipes and backslashes are all fine — write
naturally. Do NOT include an H1.
---END---

The metadata block must be valid JSON, must NOT contain the article text, and
every value must stay on a single line.

DRAFT (JSON):
${JSON.stringify(draft, null, 2)}`;
}

/**
 * Stage 2b — surgical repair of mechanical gate failures.
 *
 * The structural gate rejects on precise, checkable faults: a banned phrase,
 * an over-long paragraph, a missing link. Discarding a 2,900-word article that
 * is otherwise good because of two fixable sentences wastes the whole run, so
 * this asks for the minimum edit instead. Deliberately narrow: it must not be
 * an invitation to rewrite.
 */
export function buildGateRepairPrompt({ article, failures }) {
  return `An editor rejected this article for specific mechanical faults. Fix exactly those faults and change nothing else.

FAULTS TO FIX:
${failures.map((f, i) => `${i + 1}. ${f}`).join('\n')}

## HOW TO FIX EACH KIND
- "Contains banned AI phrasing": find that exact phrase and rewrite the sentence around it in plain language. Do not simply delete the sentence.
- "Readability: N paragraphs over 90 words": split those paragraphs. Maximum 4 sentences each. Do not cut the content, redistribute it.
- "Insufficient internal links": add links from the site pages already referenced elsewhere in the article. Do not invent URLs.
- "Non-descriptive anchor text": replace the anchor with 2-5 descriptive keyword-bearing words.
- "Word count too low": expand the thinnest section with concrete detail. Do not pad.
- "Needs 5+ FAQs": add FAQs in the metadata block.
- "Body contains an H1": demote it to an H2.
- "Meta description too long" / "SEO title too long": shorten to the stated limit.

## RULES
- Preserve the voice, structure, headings, tables, blockquotes and every markdown link.
- Do not add new claims, statistics, or sections.
- Do not remove content to satisfy a length rule.
- These phrases must still not appear anywhere: ${BANNED_PHRASES.join('; ')}

## OUTPUT FORMAT (follow exactly)

---METADATA---
{ the metadata object, unchanged unless a fault above requires editing it }
---ARTICLE---
The corrected article in markdown, raw and unescaped. No H1.
---END---

CURRENT METADATA:
${JSON.stringify(
  {
    seoTitle: article.seoTitle,
    metaDescription: article.metaDescription,
    slug: article.slug,
    tldr: article.tldr,
    category: article.category,
    topicCluster: article.topicCluster,
    tags: article.tags,
    faq: article.faq,
    imageAlt: article.imageAlt,
    imageQuery: article.imageQuery,
    internalLinks: article.internalLinks,
    externalLinks: article.externalLinks,
  },
  null,
  2
)}

CURRENT ARTICLE:
${article.contentMarkdown}`;
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
    contentMarkdown: { type: 'string' },  // merged in from the ---ARTICLE--- section
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
    imageQuery: { type: 'string' },
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
