/**
 * Seed topics for the blog pipeline.
 *
 * These are the starting keyword set. The generate cron pulls the oldest
 * `queued` row out of the blog_topics table — this file only seeds that table
 * when it runs dry, so you can also insert topics straight into Supabase
 * (or from the CRM) and they'll be picked up the same way.
 *
 * Every topic maps to a service cluster so the article can link back to the
 * money page. Keep `primaryKeyword` unique — the DB enforces it case-insensitively.
 */

export const SEED_TOPICS = [
  // ---- Cluster: Website Development ----
  {
    topic: 'How much a business website actually costs in India in 2026 (full breakdown)',
    primaryKeyword: 'website development cost in india',
    intent: 'commercial',
    cluster: 'website-development',
  },
  {
    topic: 'Custom coded website vs WordPress vs Wix — which one should a growing business pick',
    primaryKeyword: 'custom website vs wordpress',
    intent: 'comparison',
    cluster: 'website-development',
  },
  {
    topic: 'Core Web Vitals for business owners: what the scores mean and what they cost you',
    primaryKeyword: 'core web vitals for business websites',
    intent: 'informational',
    cluster: 'website-development',
  },
  {
    topic: 'Landing page design that converts: the structure high-performing pages actually use',
    primaryKeyword: 'high converting landing page design',
    intent: 'informational',
    cluster: 'website-development',
  },

  // ---- Cluster: Brand Identity ----
  {
    topic: 'What a complete brand identity package should include (and what agencies quietly skip)',
    primaryKeyword: 'brand identity package inclusions',
    intent: 'commercial',
    cluster: 'brand-identity',
  },
  {
    topic: 'Rebranding a small business: when it is worth it and when it is a waste of money',
    primaryKeyword: 'when to rebrand a small business',
    intent: 'informational',
    cluster: 'brand-identity',
  },
  {
    topic: 'Logo design pricing in India: why quotes range from Rs 2,000 to Rs 2,00,000',
    primaryKeyword: 'logo design price in india',
    intent: 'commercial',
    cluster: 'brand-identity',
  },

  // ---- Cluster: Performance Marketing ----
  {
    topic: 'Meta Ads vs Google Ads for Indian D2C brands: where the first Rs 50,000 should go',
    primaryKeyword: 'meta ads vs google ads for d2c',
    intent: 'comparison',
    cluster: 'performance-marketing',
  },
  {
    topic: 'How to calculate a realistic CAC and ROAS target before you spend on ads',
    primaryKeyword: 'how to calculate cac and roas',
    intent: 'informational',
    cluster: 'performance-marketing',
  },
  {
    topic: 'Why your ads get clicks but no sales — a diagnostic checklist',
    primaryKeyword: 'ads getting clicks but no conversions',
    intent: 'informational',
    cluster: 'performance-marketing',
  },

  // ---- Cluster: Social Media Management ----
  {
    topic: 'What a social media management retainer should actually deliver each month',
    primaryKeyword: 'social media management retainer deliverables',
    intent: 'commercial',
    cluster: 'social-media-management',
  },
  {
    topic: 'In-house vs agency social media: the real cost comparison for a 10-person business',
    primaryKeyword: 'in house vs agency social media',
    intent: 'comparison',
    cluster: 'social-media-management',
  },

  // ---- Cluster: Product Reels ----
  {
    topic: 'Product video that sells: the shot list we use for e-commerce reels',
    primaryKeyword: 'product reel shot list',
    intent: 'informational',
    cluster: 'product-reels',
  },
  {
    topic: 'How much product video content a brand needs per month to stay visible',
    primaryKeyword: 'how much video content per month',
    intent: 'informational',
    cluster: 'product-reels',
  },

  // ---- Cluster: Software Solutions ----
  {
    topic: 'Off-the-shelf CRM vs custom CRM: the break-even math for growing teams',
    primaryKeyword: 'custom crm vs off the shelf crm',
    intent: 'comparison',
    cluster: 'software-solutions',
  },
  {
    topic: 'Business process automation: the five workflows worth automating first',
    primaryKeyword: 'business process automation for small business',
    intent: 'informational',
    cluster: 'software-solutions',
  },

  // ---- Cluster: Agency selection (top of funnel) ----
  {
    topic: 'How to choose a digital agency: the questions that expose a bad fit early',
    primaryKeyword: 'how to choose a digital agency',
    intent: 'commercial',
    cluster: 'agency',
  },
  {
    topic: 'Freelancer vs agency vs in-house team: an honest cost and risk comparison',
    primaryKeyword: 'freelancer vs agency vs in house',
    intent: 'comparison',
    cluster: 'agency',
  },
  {
    topic: 'Red flags in a digital marketing proposal (from someone who writes them)',
    primaryKeyword: 'digital marketing proposal red flags',
    intent: 'informational',
    cluster: 'agency',
  },
  {
    topic: 'What "we ship in 3 days" really means: how fast agency delivery works',
    primaryKeyword: 'fast website delivery agency',
    intent: 'commercial',
    cluster: 'agency',
  },
];

/** Categories the model is allowed to pick from. Keep in sync with the UI filter. */
export const BLOG_CATEGORIES = [
  'Web Development',
  'Brand Strategy',
  'Performance Marketing',
  'Social Media',
  'Video Content',
  'Software & Automation',
  'Agency Insights',
];

/** Internal link targets the model can use. Anchor text is the model's job. */
export const LINK_TARGETS = [
  { url: '/services/website-development/', label: 'Website Development service' },
  { url: '/services/software-solutions/', label: 'Software Solutions service' },
  { url: '/services/social-media-management/', label: 'Social Media Management service' },
  { url: '/services/performance-marketing/', label: 'Performance Marketing service' },
  { url: '/services/product-reels/', label: 'Product Reels & Video service' },
  { url: '/services/brand-identity/', label: 'Brand Identity Design service' },
  { url: '/portfolio/', label: 'Portfolio — real client work' },
  { url: '/process/', label: 'Our 3-step delivery process' },
  { url: '/designs/', label: 'Design Library — pick a website style' },
  { url: '/about/', label: 'About TheBrandFriend' },
  { url: '/contact/', label: 'Contact / free consultation' },
];
