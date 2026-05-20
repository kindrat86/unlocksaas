/**
 * Playbook-readable markdown surface for AI crawlers and agents.
 *
 * Why this module exists
 * ----------------------
 * Surface B (AEO/GEO) of strategy/google-strategy.md mandates that every
 * pSEO and trust page has a clean, JS-free, agent-extractable mirror. HTML
 * is for humans; markdown is for retrieval. Without this surface, an LLM
 * parses our HTML, drops the bits it can't understand, and hallucinates the
 * rest. With it, the LLM sees exactly the prose we want quoted in the
 * answer and the citation lands on our canonical URL.
 *
 * Single source of truth
 * ----------------------
 * Every markdown body below is built from the same data the corresponding
 * HTML page renders (FAQ_ENTRIES, ALTERNATIVES, ENTITY, etc.) — drift
 * between schema, HTML, and markdown is the #1 reason Google demotes
 * structured data, and it's a one-way ticket out of AI Overviews. By
 * generating markdown from the same modules the HTML uses, we eliminate
 * the drift class entirely.
 *
 * Brunson Hard-Rule reconciliation (no fabricated claims):
 *   - Every fact in every markdown body is also visible in the public HTML.
 *   - No exclusive content in markdown that isn't on the visible page.
 *   - Pricing, guarantee, and audience facts mirror entity.ts verbatim.
 *
 * Consumers
 * ---------
 *   - app/llms-full.txt/route.ts                       (concatenated mirror)
 *   - app/<page>.md/route.ts                           (per-surface route handlers)
 *   - app/alternatives-to/[slug]/md/route.ts           (per-pSEO mirrors, batch 1)
 *   - app/funnel-teardown/[slug]/md/route.ts           (per-pSEO mirrors, batch 2)
 *   - app/(marketing)/benchmarks/[slug]/md/route.ts    (per-pSEO mirrors, batch 3)
 *   - app/(marketing)/answers/[slug]/md/route.ts       (per-pSEO mirrors, batch 3)
 *   - app/(marketing)/funnel-playbook/[slug]/md/route.ts (per-pSEO mirrors, batch 3)
 *   - app/(marketing)/why-isnt-my/[slug]/md/route.ts   (per-pSEO mirrors, batch 3)
 *   - app/(marketing)/for/[slug]/md/route.ts           (per-pSEO mirrors, batch 3)
 *
 * Content negotiation (added with batch 3): src/proxy.ts rewrites any
 * HTML request carrying `?format=md` or `Accept: text/markdown` to the
 * page's markdown mirror via `src/lib/seo/markdown-path.ts`. AI agents
 * that don't know the mirror URL shape can request the canonical HTML
 * URL with either signal and get the corresponding markdown back.
 */

import {
  BASE_URL,
  DEFINED_TERMS,
  FOUNDER,
  ORGANIZATION,
  ALTERNATE_NAMES,
} from "@/lib/seo/entity";
import { glossaryTermSlug } from "@/lib/glossary";
import { FAQ_ENTRIES } from "@/lib/faq-data";
import {
  ALTERNATIVES,
  type Alternative,
  CAPABILITY_ROWS,
  UNLOCK_SAAS_CAPABILITIES,
  getAlternativeBySlug,
} from "@/lib/alternatives";
import {
  TEARDOWNS,
  type FunnelTeardown,
  getTeardownBySlug,
} from "@/lib/funnel-teardowns";
import {
  PRICING_TEARDOWNS,
  type PricingTeardown,
  getPricingTeardownBySlug,
} from "@/lib/pricing-teardowns";
import {
  COMPARISONS,
  type Comparison,
  getComparisonBySlug,
} from "@/lib/comparisons";
import {
  CATEGORIES,
  type CategoryDef,
  getCategoryBySlug,
  getProductRosterForCategory,
  getComparisonsInCategory,
} from "@/lib/categories";
import { PLAYBOOK_STEPS } from "@/lib/playbook-steps";
import { DISQUALIFIERS, FIT_CRITERIA } from "@/lib/dont-buy";
import {
  FOUR_INDIE_MARKDOWN_BODY,
  FOUR_INDIE_TITLE,
} from "@/lib/four-indie-search-engines";
import {
  PRESS_TOPICS,
  type PressTopic,
  getPressTopicBySlug,
} from "@/lib/press-topics";
import {
  GLOSSARY,
  type GlossaryEntry,
  getGlossaryBySlug,
} from "@/lib/glossary";
import {
  BENCHMARK_ENTRIES,
  type BenchmarkEntry,
  getBenchmarkBySlug,
} from "@/lib/benchmarks";
import {
  ANSWER_ENTRIES,
  type AnswerEntry,
  getAnswerBySlug,
} from "@/lib/answers";
import {
  FUNNEL_PLAYBOOK_ENTRIES,
  type FunnelPlaybookEntry,
  getFunnelPlaybookBySlug,
} from "@/lib/funnel-playbooks";
import {
  WHY_ISNT_MY_ENTRIES,
  type WhyIsntMyEntry,
  getWhyIsntMyBySlug,
} from "@/lib/why-isnt-my";
import {
  NICHE_ENTRIES,
  type NicheEntry,
  getNicheBySlug,
} from "@/lib/niches";

/**
 * Canonical surface descriptor. `path` is the page's HTML URL relative to
 * BASE_URL (used in the markdown front-matter as the canonical pointer);
 * `mdPath` is where the markdown mirror lives.
 */
export interface MarkdownSurface {
  /** Canonical HTML URL, e.g. "/founding". */
  path: string;
  /** Markdown mirror URL, e.g. "/founding.md". */
  mdPath: string;
  /** Title for h1 / TL;DR consumers. */
  title: string;
  /** One-sentence summary. Used as TL;DR and in /llms.txt anchors. */
  summary: string;
  /** Full markdown body (without front-matter — added by render fn). */
  body: string;
}

// --- Boilerplate helpers ---------------------------------------------------

/**
 * Standard YAML-ish front-matter that every markdown mirror gets. Most
 * retrieval pipelines parse this; the rest treat it as opaque header text.
 * Either way it doesn't pollute the prose the LLM might quote.
 */
function frontMatter(args: {
  title: string;
  summary: string;
  canonical: string;
  updated: string;
}): string {
  return [
    "---",
    `title: ${JSON.stringify(args.title)}`,
    `summary: ${JSON.stringify(args.summary)}`,
    `canonical: ${args.canonical}`,
    `updated: ${args.updated}`,
    `publisher: ${JSON.stringify(ORGANIZATION.name)}`,
    `author: ${JSON.stringify(FOUNDER.name)}`,
    `license: All rights reserved. Quotation with attribution permitted.`,
    "---",
    "",
  ].join("\n");
}

/**
 * Tail block citing the canonical HTML URL — anchors retrieval-augmented
 * answers back at the source page rather than the .md mirror.
 */
function citationFooter(canonicalUrl: string): string {
  return [
    "",
    "---",
    "",
    `Canonical URL: ${canonicalUrl}`,
    `Publisher: ${ORGANIZATION.name} (${BASE_URL})`,
    `Contact: ${FOUNDER.email}`,
  ].join("\n");
}

// --- Site-wide constants exposed in every mirror -------------------------

const PRICING_LINE =
  "Pricing: $1 one-time Starter (unlocks Playbook Steps 1 and 2); $49/month Core (the full seven-step Playbook). No annual upsell. No coaching tier.";
const GUARANTEE_LINE =
  "Guarantee: First verified paying customer in 60 days from the Playbook start date, or full refund (capped exposure $98). Enforced in code, read from the founder's connected Stripe account.";
const AUDIENCE_LINE =
  "Audience: Post-launch, pre-revenue, non-engineer founders shipping consumer or B2B SaaS with AI tools (Lovable, Claude, Replit, v0, Cursor, Bolt, Bubble).";

// --- Build the surface registry ------------------------------------------

const TODAY = "2026-05-17";

/**
 * Homepage / Funnel Hub markdown body.
 */
const FUNNEL_HUB_BODY = `# Unlock SaaS

> A playbook that turns your already-shipped SaaS into a verified paying customer in 60 days, or you do not pay.

## TL;DR

Unlock SaaS is a seven-step playbook for post-launch pre-revenue non-engineer founders. It picks one real dream customer, writes one real one-line offer, sends one real outreach message — and verifies the resulting paying customer inside Stripe. If no customer is verified in 60 days, the founder is refunded automatically in code.

${PRICING_LINE}

${GUARANTEE_LINE}

${AUDIENCE_LINE}

## What Unlock SaaS is

A guided seven-step system that names one real person, writes one real promise, and sends one real message — and verifies every step inside Stripe. Built by Maryan, a non-engineer, for non-engineer founders who shipped a product with AI tools (Lovable, Claude, Replit, v0, Cursor) and now have a flat Stripe line.

The premise: the work that produces the first paying customer is the work nobody taught them, not more traffic or more features.

## What Unlock SaaS is not

- Not a course, cohort, or coaching program.
- Not a content/SEO/AI-traffic generator.
- Not a feature factory or a no-code builder.
- Not an audience-building tool — it operates on a product that is already shipped.

## Primary entry points

1. **Free Launch Diagnostic** — paste your live product URL, get one of three diagnoses (Wrong Person, Weak Offer, Weak Belief) in 90 seconds. ${BASE_URL}/diagnostic
2. **$1 Starter** — entry rung. Stripe charge proves intent and unlocks Playbook Steps 1 and 2. ${BASE_URL}/starter
3. **The Playbook ($49/mo)** — full seven-step system with 60-day guarantee. ${BASE_URL}/playbook-sales

## Founder

${FOUNDER.name} — ${FOUNDER.description} Contact: ${FOUNDER.email}.
`;

const FOUNDING_BODY = `# Founding Cohort — Unlock SaaS

> The first 50 founders to run the Playbook, at the launch price, with the Founder-Cohort guarantee.

## TL;DR

The Founding Cohort is a time-boxed window where the first 50 indie SaaS founders run the Playbook at the launch price ($1 Starter + $49/mo Core). Members get the same 60-day refund-or-do-not-pay guarantee plus a permanent place in the Verified Builders directory if they cross the cycle. The window closes when 50 founders enroll or when the public launch ships, whichever comes first.

## Who this is for

${AUDIENCE_LINE}

You are the canonical Founding Cohort founder if all four are true:
1. You shipped a real, live SaaS product (most members shipped with Lovable, Claude, Replit, v0, Cursor, Bolt, or Bubble).
2. Your Stripe revenue line is flat or near-flat.
3. You are willing to do one real outreach message per day for 60 days.
4. You believe the work between "shipped" and "first paying customer" is the work nobody taught you.

## The offer

${PRICING_LINE}

${GUARANTEE_LINE}

Founding-cohort-specific addenda:
- Direct line to the founder (Maryan) by email at ${FOUNDER.email} for the duration of the cohort.
- First-look at Rung-2 (Repeatable Revenue) when it ships, gated on cohort completion.
- Verified Builders directory entry the moment Stripe confirms the first paying customer cycle (no self-reporting).

## What you actually do, in seven steps

1. **Diagnose** — paste your live product URL. The diagnostic labels what is actually broken (Wrong Person / Weak Offer / Weak Belief).
2. **Pin one real customer** — name one specific person, in one specific role, at one specific company. No personas.
3. **Write one real offer** — one sentence, naming the person and the result.
4. **Build one real proof** — the smallest possible artifact that proves the offer is real.
5. **Send one real message** — the Playbook generates the outreach inside the tool and tracks the send.
6. **Track the response** — replies, calls, and the Stripe webhook all flow into the same dashboard.
7. **Verify the cycle** — Stripe confirms the paying customer. If not, the refund fires automatically at day 60.

## What is NOT included

- No coaching calls. The Playbook pushes back; the founder does the work.
- No course or training video library. The product is software, not content.
- No promised traffic, audience, or virality. The Playbook assumes you start at zero.

## Pricing and refund mechanics

The full mechanics live at ${BASE_URL}/playbook-sales and ${BASE_URL}/faq. Founding-Cohort founders get the same terms: $1 Starter, $49/mo Core, $98 capped exposure, refund-in-code at day 60 if the in-product milestones were completed and Stripe shows no new customer.

## How to join

Apply at ${BASE_URL}/founding. The form is short; the bar is real product shipped and willingness to do the work. Maryan personally reviews every application.
`;

const ABOUT_BODY = `# About Unlock SaaS

> Built by a non-engineer founder for non-engineer founders shipping with AI tools.

## TL;DR

Unlock SaaS was built by Maryan, a marketer (not an engineer) who shipped a dozen AI-assisted SaaS products, watched them flatline in Stripe, and built the Playbook to solve the work no one teaches indie founders: turning a live product into the first verified paying customer.

## The founder

${FOUNDER.name}. ${FOUNDER.description}

Topical expertise (verifiable against shipped strategy documents and workbooks):
- Russell Brunson sales funnel design (DotCom Secrets, Expert Secrets, Traffic Secrets)
- Value ladder construction for SaaS products
- Soap Opera Sequence and Seinfeld daily email marketing
- Reluctant Hero attractive character archetype
- Post-launch pre-revenue SaaS founder activation
- First paying customer acquisition for indie SaaS
- Stripe-verified founder validation
- Non-engineer founder workflows with AI tools (Lovable, v0, Bolt, Claude Code)
- Dream 100 outreach strategy
- Money-back guarantee mechanics for digital products

Contact: ${FOUNDER.email}. Direct, no gatekeeping.

## The company

- Name: ${ORGANIZATION.name}
- Founded: ${ORGANIZATION.foundingDate}
- Slogan: ${ORGANIZATION.slogan}
- Area served: Worldwide
- Web: ${BASE_URL}

${ORGANIZATION.description}

## Editorial position

We publish only claims that pass three tests:
1. Can the reader verify it without contacting us? (Stripe receipt, public DNS record, live page.)
2. Is the claim still true today? (Verifications are dated.)
3. Would the claim survive the Brunson Hard-Rule on no fabricated facts?

We do not publish testimonials, reviews, customer counts, or aggregate ratings until they correspond to a verified paying-customer cycle in Stripe.

## Editorial conflicts and disclosures

- Maryan owns and operates Unlock SaaS. There is no investor, no parent company, no affiliate-revenue model on the canonical surfaces.
- Comparison pages (${BASE_URL}/alternatives-to) name real competitors and respect their value propositions. We do not slag competitors; we clarify category differences. Every comparison entry has a "lastVerified" date.
- Pricing and guarantee facts on this page mirror ${BASE_URL}/playbook-sales and ${BASE_URL}/faq verbatim. If they ever disagree, the canonical HTML page wins and this mirror is a bug.
`;

const DIAGNOSTIC_BODY = `# Free Launch Diagnostic — Unlock SaaS

> Paste your live product URL. In about 90 seconds, the diagnostic labels what is actually wrong with one of three diagnoses: Wrong Person, Weak Offer, or Weak Belief — and hands you the door that fixes it.

## TL;DR

A free, three-step diagnostic for post-launch pre-revenue SaaS founders. Input: your live product URL and email. Output: one of three diagnoses labeling what is actually broken on the page, plus the specific next step. Total time: about 90 seconds. No payment. No card.

## How it works

1. **Paste your URL.** Paste the live URL of the product you already shipped and your email address.
2. **Get the labeled diagnosis.** Within about 90 seconds the diagnostic returns one of three labels:
   - **Wrong Person** — the offer is fine, but the page is aimed at no one in particular.
   - **Weak Offer** — the person is fine, but the page promises a feature list instead of a result.
   - **Weak Belief** — the person and offer are fine, but the page does not make the reader believe it will work for them.
3. **Walk through the door.** The diagnosis hands you the specific next step that fixes the labeled problem. For most founders, that step is the $1 Starter or a re-read of the Story that matches their diagnosis.

## What the diagnostic does not do

- It does not write your offer for you. (The Playbook does that, after diagnosis.)
- It does not promise the diagnosis will be flattering. The most common diagnosis on a post-launch flat Stripe line is "Wrong Person."
- It does not store your URL or email beyond the diagnosis flow.

## After the diagnosis

If the diagnostic surfaces Wrong Person, the next door is usually the Free Launch Diagnostic's recommendation: the $1 Starter — which is the Playbook's Steps 1 and 2 (pin one real customer, write one real offer). ${BASE_URL}/starter

If the diagnostic surfaces Weak Offer, the next door is the same Starter, with emphasis on Step 2.

If the diagnostic surfaces Weak Belief, the next door is the long-form $49 Playbook page, which walks through the belief stack the founder needs to build. ${BASE_URL}/playbook-sales

## Pricing

Free. No card. No upsell on the diagnosis screen itself — the next door is presented as a recommendation, not a paywall.

${GUARANTEE_LINE}
`;

const PLAYBOOK_SALES_BODY = `# The Playbook — Unlock SaaS

> A seven-step playbook that turns an already-shipped SaaS into a verified paying customer in 60 days, or you do not pay.

## TL;DR

The Playbook is the $49/month full system. Seven steps, executed inside the tool, that take a flat-Stripe-line product to a verified paying customer. 60-day money-back guarantee tied to the connected Stripe account: complete the in-product milestones, do at least 20 logged outreach actions, and if Stripe shows no new customer at day 60, $98 returns automatically in code.

${PRICING_LINE}

${GUARANTEE_LINE}

${AUDIENCE_LINE}

## The seven steps

${PLAYBOOK_STEPS.map(
  (s, i) => `${i + 1}. **${s.name}.** ${s.text}`,
).join("\n")}

## What the Playbook is not

- Not a course. Not a cohort. Not a coaching call.
- Not a no-code builder, codebase generator, or product replacement.
- Not a traffic/audience tool — it assumes you start at zero traffic.
- Not a feature factory.

## FAQ (verbatim from ${BASE_URL}/faq)

${FAQ_ENTRIES.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
`;

const STARTER_BODY = `# $1 Starter — Unlock SaaS

> One real Stripe charge proves intent and unlocks Playbook Steps 1 and 2.

## TL;DR

The Starter is a $1 one-time Stripe charge. It is the entry rung. Buying it does three things: (1) proves to you and the Playbook that you are willing to act on a real product page, (2) unlocks the two highest-leverage steps of the seven-step Playbook — pin one real customer, write one real offer — and (3) keeps the deliverables yours regardless of whether you upgrade to Core.

## What you get for $1

- **Step 1 of the Playbook** — guided session that ends with one named dream customer (specific human, specific role, specific company), not a persona.
- **Step 2 of the Playbook** — guided session that ends with one one-sentence offer naming the customer and the result.
- **Both deliverables are yours.** Cancel after $1 and you keep the dream-customer pin and the offer line. They are written, exportable, and re-usable.

## Why $1 (not free)

A free version teaches the brain that the work is free. A $1 charge teaches the brain that the work is real. The price is deliberately small enough that the decision is "yes, I'll try the work" and large enough that the act is a real act, not a click.

## What is NOT included at $1

- The other five steps of the Playbook (proof, outreach generation, tracking, iteration, verification).
- The 60-day refund-or-do-not-pay guarantee. That belongs to Core, which is the contract that holds the result accountable.
- Direct email support from the founder. That belongs to the Founding Cohort.

## How $1 becomes $49/mo

You don't auto-upgrade. After Steps 1 and 2, the in-product surface shows what Core would add and the price. If you upgrade, the $1 is credited toward the first month. If you do not, the deliverables stay yours.

${GUARANTEE_LINE}
`;

const PARABLES_BODY = `# Five Stories for the Flat Stripe Line

> Long-form, free-to-read essays on the work non-engineer founders skip. No email required, no payment, no upsell.

## TL;DR

Five essays on the work that produces the first paying customer, written for the founder staring at a flat Stripe line. Each story is a single-sitting read (8 to 15 minutes), names the specific failure pattern, and ends with the door that opens past it. Free. No email gate. No course.

## The five stories

1. **The Blank Offer Page** — what happens when the product is shipped but the page is still a feature list, and why no amount of traffic will fix it.
2. **The Stripe Refresh** — the involuntary habit, the shape of the silence, and why refreshing the dashboard is the wrong loop to be running on day 14.
3. **The SEO Escape Hatch** — why the founder who knows SEO reaches for SEO when the actual problem is the offer, and what the diagnostic catches that the keyword tool cannot.
4. **The Mirror in Ten Founders** — the case studies the founder reads to feel less alone, and why they are not the case studies the founder needs.
5. **The Door That Opened** — the moment the first paying customer arrives, what the founder did the week before, and why that work is the work the Playbook encodes.

## Why these are free

They are the bridge content. A cold reader hits one of these stories on a long-tail Google search, reads the one that mirrors their situation, and recognizes the shape of their own flat Stripe line in the prose. That recognition is the only sales asset the page needs — if it lands, the reader walks toward the diagnostic. If it doesn't, they leave, and that is the right outcome.

## How to read them

Pick the story whose title sounds most like your last 14 days. Read it. If the recognition lands, walk to ${BASE_URL}/diagnostic. If it doesn't, read another one. The stories are not a sequence; they are mirrors.

## Questions these stories answer

Mirrors the FAQPage JSON-LD on the HTML page. Every answer below is sourced verbatim from the on-page narrative + blockquote; no claim here that isn't also in the rendered story above it.

### Why can't I write my SaaS offer page after shipping the product?

Because the answer doesn't exist yet. You can know the features, the architecture, and the pricing block and still freeze on the sentence that promises one specific person what they'll walk away with, by when, and what they're paying for. The order was wrong — you built the product before you earned the right to write that sentence. If you can't write your offer in one sentence, to one real person, you have not earned the right to build the product. ([Story 1](${BASE_URL}/stories#story-1))

### Why doesn't refreshing Stripe produce revenue for a pre-revenue SaaS?

Because the refresh is the cheapest substitute for the uncomfortable work that would actually move the line — talking to someone who has not yet decided to pay. Forty to sixty refreshes a day generate zero dollars, because "working on the business" and "doing the work" are not the same thing. The daily activity of working on it is the most expensive way to avoid the actual work. ([Story 2](${BASE_URL}/stories#story-2))

### Why doesn't SEO produce customers for a pre-revenue indie SaaS?

Because SEO lets you be visibly productive in front of a problem that needs to be solved by an uncomfortable conversation, not a keyword. Topic clusters, schema markup, and a programmatic page generator can all produce the appearance of someone working hard while producing zero new paying customers for an already-shipped product. Productive work is the best-camouflaged form of avoidance — nobody, including you, can call you out for it. ([Story 3](${BASE_URL}/stories#story-3))

### How do I see my own blind spots as a non-engineer SaaS founder?

By hearing your own pattern in someone else's mouth. Ten conversations with other post-launch pre-revenue non-engineer founders will show you the same flat line, the same drift into tactics, the same conviction that the next feature is the missing piece, the same blank look when asked to describe one specific person their product is for. You won't see your own pattern until you hear it in someone else's story. The way out is naming one person, writing one promise, and selling it before it feels ready. ([Story 4](${BASE_URL}/stories#story-4))

### Why is selling the bottleneck for non-engineer SaaS founders, not building?

Because tools like Lovable and Claude opened the door to shipping real software for non-engineers in weeks — the building is now magic. The hard part is what comes after: naming one specific person, writing one real promise, selling it before it feels ready. That is the work nobody built a tool for, because engineers were always too busy building to notice that selling was unsolved. The bottleneck has moved. Building is solved. Selling has not been, and now it sits exposed. ([Story 5](${BASE_URL}/stories#story-5))

Read on ${BASE_URL}/stories.
`;

const PRESS_BODY = `# Press and Media Kit – Unlock SaaS

> Brand facts, founder bio, descriptions in three lengths, and contact for journalists, podcasters, and newsletter writers covering Unlock SaaS.

## TL;DR

Public press kit. Every claim is independently verifiable on the live site, in Stripe, in DNS, or in the strategy folder. No embargoes, no exclusivity asks, no review-before-publication. Copy any block verbatim for editorial use.

## Fast facts

- **Name**: ${ORGANIZATION.name}
- **Alternate spellings**: ${ALTERNATE_NAMES.join(", ")}
- **Founder**: ${FOUNDER.name} (${FOUNDER.jobTitle})
- **Founded**: ${ORGANIZATION.foundingDate}
- **Area served**: ${ORGANIZATION.areaServed}
- **Slogan**: ${ORGANIZATION.slogan}
- **Press contact**: ${FOUNDER.email}
- **Web**: ${BASE_URL}

## Descriptions

### 50 words (tweet, capsule, sidebar)

Unlock SaaS is a guided seven-step playbook that turns an already-shipped product into a verified paying customer in 60 days, or the founder does not pay. Built by a non-engineer marketer for non-engineer founders shipping with AI tools.

### 100 words (podcast intro, newsletter blurb)

Unlock SaaS is a guided seven-step playbook for post-launch pre-revenue founders. It names one real customer, writes one real promise, sends one real message, and verifies every step inside Stripe. Built by Maryan, a marketer (not an engineer), for non-engineer founders who shipped with Lovable, Claude, Cursor, v0, or Bolt and are now staring at a flat Stripe line. Sixty-day money-back guarantee tied to the first verified Stripe payment – refund automatic if no paying customer arrives.

### 200 words (feature lede, profile opener)

Unlock SaaS is a guided seven-step playbook for post-launch pre-revenue founders who shipped a product with AI tools and have no paying customers. It refuses to let the founder skip the work that actually gets them paid: pin one real person, write one real promise, send one real message, and verify every step inside Stripe. The free Launch Diagnostic labels what is broken on the live page with one of three diagnoses – Wrong Person, Weak Offer, or Weak Belief – and hands the founder the specific next step. The $1 Starter unlocks Playbook Steps 1 and 2. The full $49-per-month Playbook covers the entire seven-step system. If no verified paying customer arrives in sixty days, the subscription is refunded automatically – the guarantee is wired into the product, not into a PDF. Built by Maryan, a marketer (not an engineer), who shipped a dozen AI-assisted products, watched them flatline in Stripe, and built the playbook he wished someone had handed him.

## Founder bio

${FOUNDER.name} – ${FOUNDER.description}

Long-form bio in the founder's own voice: ${BASE_URL}/about

## Topical expertise (interview prep)

Subjects the founder can speak to without notes:
- Post-launch pre-revenue SaaS founder activation – the work non-engineer founders skip.
- Russell Brunson sales funnel design (DotCom, Expert, Traffic Secrets) applied to micro-SaaS.
- Honest competitor comparison editorial standards (the "Brunson Hard-Rule" for fabrication-free marketing claims).
- Stripe-verified founder validation – why self-reported customer counts are worth nothing.
- Money-back guarantee mechanics for digital products – guarantees wired into the product, not the PDF.
- Non-engineer founder workflows with AI tools (Lovable, v0, Bolt.new, Cursor, Claude Code, Replit).
- Soap Opera Sequence and Seinfeld daily email marketing for indie SaaS.
- Dream 100 outreach strategy adapted for one-founder distribution.
- Programmatic SEO for indie SaaS that respects the Brunson Hard-Rule.

## Brand assets and link targets

- Logo / favicon (PNG): ${BASE_URL}/icon
- Default Open Graph card: ${BASE_URL}/opengraph-image
- Canonical funnel hub: ${BASE_URL}/
- Founder bio (long form): ${BASE_URL}/about
- Free Launch Diagnostic: ${BASE_URL}/diagnostic
- Long-form stories: ${BASE_URL}/stories

## Editorial policy and coverage rules

No embargoes, no exclusivity asks, no "please send me the piece before publication." If you can verify the claim, you can publish it.

We do not publish customer testimonials, screenshots, or aggregate ratings until they correspond to a verified paying customer cycle in Stripe. Comparison pages name real competitors and respect their value propositions. Every entry has a lastVerified date in the footer.

## Recent coverage

Nowhere yet. The founder is pre-launch. When real coverage lands it appears on the funnel hub's media bar and is also listed on this page in reverse-chronological order. No fake logos, no "as seen in" placeholders – the empty state is the honest state.

## Reach the founder

Email ${FOUNDER.email}. One inbox, one human, real replies. Time zone: EU. Typical response window: within one business day.
`;

// Editorial policy markdown mirror — same source-of-truth principle as
// /press: every claim is something the operator already does in practice,
// not aspirational standards we have not shipped. Wired into the surface
// registry below so /editorial-policy.md serves alongside the HTML page.
const EDITORIAL_POLICY_BODY = `# Editorial Policy — Unlock SaaS

> How Unlock SaaS sources, dates, signs, and corrects every public claim.

## TL;DR

One person writes this site, by name. Every comparison, teardown, and parable is sourced from a live read of the named entity on the dated lastVerified shown on the page. No affiliate links. No paid placements. No sponsored content. Corrections are logged in reverse-chronological order at the bottom of this page. Empty log is honest, not an absence of policy.

## Who writes this site

One person: ${FOUNDER.name}, founder of ${ORGANIZATION.name}. No anonymous editorial board, no contractor pool, no ghost-written posts. Every parable, every funnel teardown, every pricing teardown, every comparison, every category roundup is the work of the named human in the footer. If a future contributor publishes here, they will be bylined on the piece, named on this page, and added to the Person schema graph.

## How claims get sourced

- **Funnel teardowns, pricing teardowns, and comparisons** are written from a live read of the competitor's public page on the dated \`lastVerified\` shown at the bottom of every detail page. No second-hand summaries, no LLM-paraphrased reviews, no quoted competitor copy.
- **FAQ entries** are verbatim objections sourced from real Indie Hackers and Hacker News threads. Thread links are retained in the project repository for audit and not surfaced publicly to avoid driving traffic to individual users who did not consent to being quoted.
- **Parables and stories** are the founder's own experience. Third-party products or people referenced are on the public record.
- **Statistics and dollar figures** appear only when they are about Unlock SaaS itself and verifiable inside our own Stripe account. No third-party statistics from a report we did not read end-to-end.

## Datelines

Every article carries a hard \`datePublished\` in schema and a human-readable footer date. The published date does not move forward silently. Material changes are logged in the corrections section and the \`dateModified\` field updates separately. Programmatic SEO surfaces carry a separate \`lastVerified\` ISO date declaring when the live competitor surface was last read.

## Disclosures

- **Affiliate links**: none. No comparison, teardown, or parable contains a paid affiliate link to any competitor named.
- **Paid placements**: none. No competitor has paid to be included in or excluded from any teardown, comparison, or category roundup.
- **Sponsored content**: none. If this ever changes, sponsored pieces will be labeled in the first line of the article and excluded from the schema.org/Article graph.
- **Ownership and funding**: ${ORGANIZATION.name} is fully owned and self-funded by ${FOUNDER.name}. No outside investors. No grants. Revenue comes from product sales (currently \$1 Starter and \$49/month Playbook).
- **Customer relationships**: the operator has not been compensated by any competitor named on this site. Future customer overlaps will be disclosed on the relevant page.

## Corrections workflow

1. Email ${FOUNDER.email} with the URL, the claim, and the correction.
2. The operator confirms or rejects within 7 days.
3. Confirmed corrections are logged below and the page is updated.
4. Rejected corrections receive a reply explaining why.

## Corrections log

Reverse-chronological. Empty does not mean nothing has ever been wrong; it means nothing has been reported and confirmed yet.

_No corrections logged yet._

## Sign

Signed ${FOUNDER.name}, founder, ${ORGANIZATION.name}. Editorial policy published 2026-05-17. Last reviewed 2026-05-17.
`;

// Polarity / anti-marketing page mirror. The disqualifier list and the
// canonical fit profile both come from src/lib/dont-buy.ts – same registry
// the HTML page renders, so the two surfaces are identical by construction.
// Brunson Hard-Rule reconciliation: every disqualifier names a real
// product constraint a wrong-fit buyer would hit in week one (see
// src/lib/dont-buy.ts header for the audit). The "what to do instead"
// pointers, when present, route honestly – sometimes off-site.
const DONT_BUY_BODY = `# Don't buy Unlock SaaS

> Eight honest disqualifiers and one canonical fit profile, said out loud before checkout.

## TL;DR

Most landing pages tell you who they are for. This one tells you who they are not for, in plain language, before checkout. If any disqualifier below matches, the Playbook is the wrong tool for you and a 60-day refund is the long way of finding that out.

## Eight reasons to walk away

${DISQUALIFIERS.map(
  (d, i) =>
    `### ${String(i + 1).padStart(2, "0")}. ${d.title}\n\n${d.body}${
      d.insteadDo
        ? `\n\nBetter next step: [${d.insteadDo.label}](${
            d.insteadDo.href.startsWith("/")
              ? `${BASE_URL}${d.insteadDo.href}`
              : d.insteadDo.href
          }).`
        : ""
    }`,
).join("\n\n")}

## Who the Playbook is for

You are the canonical Unlock SaaS buyer if all four of these are true at the same time.

${FIT_CRITERIA.map((line) => `- ${line}`).join("\n")}

## On the fence?

The free Launch Diagnostic costs nothing, takes about ninety seconds, and labels which of three things is actually broken on your live product page: Wrong Person, Weak Offer, or Weak Belief. Take it at ${BASE_URL}/diagnostic. Whether or not the Playbook is for you, the diagnostic is the cheapest answer to the question "what should I work on first?"

## Sign

Signed ${FOUNDER.name}, founder, ${ORGANIZATION.name}. Published 2026-05-18. Last reviewed 2026-05-18.
`;

const FAQ_BODY = `# Frequently Asked Questions — Unlock SaaS

> Verbatim objections and replies, sourced from real Indie Hackers and Hacker News threads.

## TL;DR

Eight FAQs covering the most-asked objections from post-launch pre-revenue founders: time, tactics, signal, price, identity, DIY, workflow, and pricing risk. Each answer is the same answer the founder would get over email; this page exists so it scales.

${FAQ_ENTRIES.map(
  (f) => `## ${f.category} — ${f.q}\n\n${f.a}`,
).join("\n\n")}

## How to ask a question that isn't here

Email ${FOUNDER.email}. Real human, same time zone as Stripe, answers in plain English.
`;

const GLOSSARY_BODY = `# Glossary — Unlock SaaS

> Working definitions of the ${DEFINED_TERMS.length} Brunson sales-funnel terms Unlock SaaS teaches.

## TL;DR

These are the concepts the seven-step Playbook applies to a flat Stripe line: Hook, Story, Offer, Big Domino, Value Ladder, Stack Slide, Perfect Webinar, Soap Opera Sequence, Seinfeld Email, Reluctant Hero, Dream 100, Wrong Person, Weak Offer, Weak Belief, Verified Builder, and the Brunson Hard-Rule. Every definition below is the working version actually used inside the diagnostic, the funnel teardowns, and the email sequences — not the textbook version. Same vocabulary appears on /faq, /stories, /funnel-teardown, /pricing-teardown, and /diagnostic.

## Terms

${DEFINED_TERMS.map(
  (t) =>
    `### ${t.term}\n\n${t.definition}\n\nAnchor: ${BASE_URL}/glossary#${glossaryTermSlug(t.term)}`,
).join("\n\n")}

## Where these terms live on the rest of the site

- ${BASE_URL}/faq — objections answered using the same vocabulary.
- ${BASE_URL}/stories — the same concepts in long-form essays, no email required.
- ${BASE_URL}/funnel-teardown — every teardown applies the Hook / Story / Offer lens.
- ${BASE_URL}/pricing-teardown — every pricing analysis uses the Stack and Value Ladder lenses.
- ${BASE_URL}/diagnostic — labels your page Wrong Person, Weak Offer, or Weak Belief.

## How this glossary is maintained

Every entry in this file is the verbatim text from \`DEFINED_TERMS\` in src/lib/seo/entity.ts. The glossary HTML page (${BASE_URL}/glossary) renders the same data structure. Drift between this markdown and the HTML is a maintenance bug, not a stylistic choice. Brunson Hard-Rule: no paraphrasing on the canonical reference surface.
`;

const ALTERNATIVES_HUB_BODY = `# Alternatives to Unlock SaaS — Honest Comparisons

> Named-competitor comparison pages. No slagging, no fabricated prices, no fake quotes.

## TL;DR

This is the hub for honest comparisons between Unlock SaaS and the products real searchers mention in the same breath. The thesis is unusual: most of the products people search for as "alternatives to Unlock SaaS" are actually different categories, not alternatives. The comparison pages name the category difference plainly.

## How these comparisons are written

Every comparison entry follows the same template, sourced from src/lib/alternatives.ts:
- **Category** — what the competitor actually sells (codebase vs. course vs. case studies vs. AI app builder).
- **One-line** — the category difference in one sentence.
- **What it is** — three to four facts that respect the competitor's real value proposition.
- **What it is not** — three to four factual omissions, not slag.
- **Who it is for / who it is not for** — honest audience boundaries.
- **Honest verdict** — two to three sentences naming when the competitor IS the right choice.
- **FAQs** — three to five questions the searcher actually types into Google.
- **Capability matrix** — side-by-side on seven dimensions (tells you what to do, pushes back on vague answers, sends outreach inside tool, verifies via Stripe, refunds in code, stops you from skipping, costs less than $98 to find out).

Every entry carries a \`lastVerified\` date. If a competitor changes their pricing or positioning and our entry is stale, the date is the audit trail.

## Current comparisons

${ALTERNATIVES.map(
  (a) =>
    `### ${a.displayName} (${a.category})\n\n${a.oneLine}\n\nFull comparison: ${BASE_URL}/alternatives-to/${a.slug}`,
).join("\n\n")}

## How Unlock SaaS scores against itself

By construction, Unlock SaaS scores yes on all seven capability rows:
${CAPABILITY_ROWS.map(
  (r) => `- ${r.label}: ${UNLOCK_SAAS_CAPABILITIES[r.key] ? "Yes" : "No"}`,
).join("\n")}

This is not a marketing claim. It is the design constraint that the product had to satisfy to ship.
`;

const FUNNEL_TEARDOWN_HUB_BODY = `# Funnel Teardowns — Indie SaaS Through the Brunson Lens

> Twelve indie SaaS funnels analyzed through Hook / Story / Offer. No invented metrics, no slag, no quoted copy — just pattern-level lessons a non-engineer founder can adapt to their own page.

## TL;DR

The Funnel Teardown surface is a pSEO library that breaks down twelve well-known indie SaaS funnels through Russell Brunson's Hook-Story-Offer framework — the same framework the Unlock SaaS Playbook runs against the founder's own page. Each teardown names the public pattern, what's working, what to adapt, and what to specifically NOT copy if you're pre-revenue. Every entry is dated; every claim is observable on the target's live surface.

## How to read these teardowns

Every entry follows the same structure:
- **Hook pattern** — how attention is caught (positioning, headline structure, opening promise).
- **Story pattern** — how belief is created (founder narrative, social proof, product-as-demo).
- **Offer pattern** — how the close is structured (price ladder, free tier, money-back, trial).
- **What's working** — five to seven deliberate strategic moves.
- **What to adapt** — three to five lessons safe to steal regardless of category.
- **What to avoid** — two to four moves a pre-revenue indie founder should NOT copy.
- **Brunson lens** — hook / story / offer / value-ladder tier in one paragraph.
- **FAQs** — four to six queries a researcher actually types.

Every entry has a \`lastVerified\` date. If a target changes their funnel and our analysis is stale, the date is the audit trail.

## Current teardowns

${TEARDOWNS.map(
  (t) =>
    `### ${t.displayName} (${t.category})\n\n${t.oneLine}\n\nFull teardown: ${BASE_URL}/funnel-teardown/${t.slug}`,
).join("\n\n")}

## Why this surface exists

Indie SaaS founders funnel-hack the products they admire — that's the search behavior. The honest response is to teach the framework rather than slag the target, and to point the lesson back at the reader's own page. Each teardown ends with the same implicit invitation: run this same lens against your own product. The Unlock SaaS Playbook is the tool that does it.
`;

const CATEGORY_HUB_BODY = `# Categories — Best SaaS Tools by Category, Analyzed for Indie Founders

> Curated category roundups across every SaaS tool we have analyzed, organized by the category you are searching in.

## TL;DR

The Category surface is a pSEO library that aggregates every funnel teardown, pricing teardown, and head-to-head comparison on Unlock SaaS into canonical category buckets. Each category page lists every product analyzed in that category with deep links into the underlying teardowns and comparisons. Pure data reuse — new analyses added to any manifest appear on the matching category page automatically.

## Available categories

${CATEGORIES.map(
  (c) => `### ${c.displayName}\n\n${c.oneLine}\n\nBrowse: ${BASE_URL}/category/${c.slug}`,
).join("\n\n")}

## Why this surface exists

Buyers searching "best [X] for indie SaaS" want a curated comparison landing page, not 27 individual comparisons to choose between. The category page IS the answer to that query — it lists every product analyzed in the category with links into the deep analytical content. Same data as the per-product surfaces; different access pattern.
`;

// Note: PR #33 originally defined GLOSSARY_HUB_BODY here. PR #32 had
// already shipped GLOSSARY_BODY (above) for the same /glossary path; the
// merge keeps PR #32's canonical hub body and PR #33 contributes the
// per-slug rendering machinery (buildGlossaryMarkdown +
// renderGlossaryMarkdown below) instead. One body constant, one SURFACES
// entry — no drift between /glossary.md and the hub HTML.

const COMPARE_HUB_BODY = `# Compare — Honest Head-to-Head Comparisons of Indie SaaS Tools

> Symmetric dimension-by-dimension breakdowns of the tools indie SaaS founders are mid-evaluation on. Both sides get a fair read.

## TL;DR

The Compare surface is a pSEO library of head-to-head ${"[A] vs [B]"} pages targeted at the highest-intent SaaS-research search class. Every comparison gets symmetric framing: who each side is best for, why you would pick either, dimension-by-dimension verdicts, an honest take, and a recommendation specifically for the indie SaaS founder.

## How to read these comparisons

Every entry follows the same structure:
- **Best for** — the canonical buyer for each side.
- **Pick X if** — three to five reasons to pick each side, side-by-side.
- **Dimension-by-dimension** — six to nine comparison axes, each with a verdict (A, B, tie, or different shapes).
- **Honest take** — two to three paragraph synthesis.
- **Indie founder pick** — the right call for a post-launch pre-revenue SaaS founder specifically.
- **FAQs** — four to six queries a mid-evaluation reader actually types.

Every entry has a \`lastVerified\` ISO date. Products evolve; the date is the audit trail.

## Current comparisons

${COMPARISONS.map(
  (c) =>
    `### ${c.a.name} vs ${c.b.name} (${c.category})\n\n${c.oneLine}\n\nFull comparison: ${BASE_URL}/compare/${c.slug}`,
).join("\n\n")}

## Why this surface exists

"[A] vs [B]" is the single highest-intent SaaS-research search class — every reader is mid-evaluation. The honest response is symmetric: name what each side does well, name who each side is for, name the dimensions where one genuinely beats the other, and name the indie-founder pick separately because the general buyer and the indie buyer often diverge. Several products in these comparisons also have funnel and pricing teardowns on ${BASE_URL}/funnel-teardown and ${BASE_URL}/pricing-teardown; cross-links go both ways.
`;

const PRICING_TEARDOWN_HUB_BODY = `# Pricing Teardowns — Indie SaaS Pricing Models Through the Brunson Stack Lens

> Ten indie SaaS pricing models broken down by tier structure, anchor mechanics, upgrade triggers, and payment mechanics. The same four levers the Playbook applies when critiquing your own pricing page.

## TL;DR

The Pricing Teardown surface is a pSEO library that decomposes ten well-known indie SaaS pricing pages through the Brunson Stack and Value Ladder lens. Each teardown names the model, the tier ladder, the anchor tier, the upgrade trigger, and what payment mechanics do to commitment. Approximate prices with dated lastVerified; no fabricated copy or invented metrics.

## How to read these teardowns

Every entry follows the same structure:
- **Pricing structure** — model name, tier ladder with approximate price points, payment frequency, free-or-trial behavior.
- **Anchor analysis** — which tier is doing the psychological anchoring, and why.
- **Upgrade trigger** — the specific behavior or scale event that converts a free or lower-tier user to the next rung.
- **What's working** — five to seven deliberate pricing moves that read as intentional.
- **What to adapt** — three to five lessons safe to steal regardless of category.
- **What to avoid** — two to four moves a pre-revenue indie founder should NOT copy.
- **Brunson lens** — stack, value ladder, decoy-or-anchor, and payment mechanics, in one paragraph each.
- **FAQs** — four to six queries a pricing-researcher actually types.

Every entry has a \`lastVerified\` ISO date. Pricing pages change; the date is the audit trail.

## Current pricing teardowns

${PRICING_TEARDOWNS.map(
  (t) =>
    `### ${t.displayName} (${t.category})\n\n${t.oneLine}\n\nFull teardown: ${BASE_URL}/pricing-teardown/${t.slug}`,
).join("\n\n")}

## Why this surface exists

The pricing page is where most pre-revenue indie SaaS founders lose buyers without realizing it. The teardowns name what successful indie SaaS do deliberately, so the reader can apply the same levers to their own page. Five of the ten companies (Tally, Lemon Squeezy, Beehiiv, Cal.com, Resend) also have a funnel teardown on ${BASE_URL}/funnel-teardown — both surfaces cross-link for the company-aware reader.
`;

/**
 * Per-funnel-teardown markdown body. Reads from the TEARDOWNS catalog so
 * the markdown and the HTML page render the same facts from the same
 * source — drift between schema, HTML, and markdown is the #1 reason
 * Google demotes structured data, and by generating from the same module
 * the HTML uses we eliminate the drift class entirely.
 */
function buildTeardownMarkdown(t: FunnelTeardown): string {
  const faqs = t.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  return `# ${t.displayName} Funnel Teardown

> ${t.oneLine}

## TL;DR

${t.tldr}

## What ${t.displayName} sells

${t.productSnapshot.whatTheySell}

**Who it's for:** ${t.productSnapshot.whoFor}

**Pricing (as observed ${t.lastVerified}):** ${t.productSnapshot.pricingNote}

## Hook layer — how attention is caught

**Pattern:** ${t.hook.pattern}

${t.hook.analysis}

## Story layer — how belief is created

**Pattern:** ${t.story.pattern}

${t.story.analysis}

## Offer layer — how the close is structured

**Pattern:** ${t.offer.pattern}

${t.offer.analysis}

## What's working (deliberate, not accidental)

${t.whatsWorking.map((x) => `- ${x}`).join("\n")}

## What to adapt to your own indie SaaS

${t.whatToAdapt.map((x) => `- ${x}`).join("\n")}

## What to specifically NOT copy if you're pre-revenue

${t.whatToAvoid.map((x) => `- ${x}`).join("\n")}

## Brunson lens — Hook / Story / Offer

- **Hook:** ${t.brunsonLens.hook}
- **Story:** ${t.brunsonLens.story}
- **Offer:** ${t.brunsonLens.offer}
- **Value Ladder tier:** ${t.brunsonLens.valueLadderTier}

## FAQ

${faqs}

---

If you want this same Hook-Story-Offer lens applied to *your* product page (not ${t.displayName}'s), the Unlock SaaS Playbook does exactly that at ${BASE_URL}/playbook-sales. The free diagnostic at ${BASE_URL}/diagnostic is the first door.
`;
}

/**
 * Per-pricing-teardown markdown body. Same render contract as
 * buildTeardownMarkdown — generated from the PricingTeardown entry the HTML
 * page renders so drift is impossible by construction.
 */
function buildPricingTeardownMarkdown(t: PricingTeardown): string {
  const faqs = t.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");
  const tiers = t.pricingStructure.tiers
    .map(
      (tier) =>
        `### ${tier.name} — ${tier.pricePoint}\n\n${tier.includes}\n\n**For:** ${tier.audience}`,
    )
    .join("\n\n");

  return `# ${t.displayName} Pricing Teardown

> ${t.oneLine}

## TL;DR

${t.tldr}

## What ${t.displayName} sells

${t.productSnapshot.whatTheySell}

**Who it's for:** ${t.productSnapshot.whoFor}

## Pricing structure (as observed ${t.lastVerified})

**Model:** ${t.pricingStructure.model}

**Payment frequency:** ${t.pricingStructure.paymentFrequency}

**Free or trial behavior:** ${t.pricingStructure.freeTrialBehavior}

### Tiers

${tiers}

## Anchor analysis

**Pattern:** ${t.anchorAnalysis.pattern}

${t.anchorAnalysis.analysis}

## Upgrade trigger

**Pattern:** ${t.upgradeTrigger.pattern}

${t.upgradeTrigger.analysis}

## What's working

${t.whatsWorking.map((x) => `- ${x}`).join("\n")}

## What to adapt to your own indie SaaS

${t.whatToAdapt.map((x) => `- ${x}`).join("\n")}

## What to specifically NOT copy if you're pre-revenue

${t.whatToAvoid.map((x) => `- ${x}`).join("\n")}

## Brunson lens — Stack, Value Ladder, Anchor, Mechanics

- **Stack:** ${t.brunsonLens.stack}
- **Value Ladder:** ${t.brunsonLens.valueLadder}
- **Decoy or anchor:** ${t.brunsonLens.decoyOrAnchor}
- **Payment mechanics:** ${t.brunsonLens.paymentMechanics}

## FAQ

${faqs}

---

If you want this same pricing lens applied to *your* page (not ${t.displayName}'s), the Unlock SaaS Playbook does exactly that at ${BASE_URL}/playbook-sales. The free diagnostic at ${BASE_URL}/diagnostic is the first door — pricing-page dysfunction usually shows up as the Weak Offer label.
`;
}

/**
 * Per-category markdown body. Aggregates products and comparisons in a
 * canonical category bucket. Pure data reuse — every product line is
 * derived from the underlying teardown manifests.
 */
function buildCategoryMarkdown(cat: CategoryDef): string {
  const products = getProductRosterForCategory(cat.slug);
  const comparisons = getComparisonsInCategory(cat.slug);

  const productLines = products
    .map((p) => {
      const links: string[] = [];
      if (p.funnelSlug)
        links.push(`Funnel teardown: ${BASE_URL}/funnel-teardown/${p.funnelSlug}`);
      if (p.pricingSlug)
        links.push(`Pricing teardown: ${BASE_URL}/pricing-teardown/${p.pricingSlug}`);
      return `### ${p.name}\n\n${p.oneLine}\n\n${links.join(" — ")}`;
    })
    .join("\n\n");

  const comparisonLines = comparisons
    .map(
      (c) =>
        `### ${c.a.name} vs ${c.b.name}\n\n${c.oneLine}\n\nFull comparison: ${BASE_URL}/compare/${c.slug}`,
    )
    .join("\n\n");

  return `# ${cat.displayName} for Indie SaaS

> ${cat.oneLine}

## TL;DR

${cat.intent}

## Products analyzed in this category

${products.length === 0 ? "_No products analyzed yet._" : productLines}

## Head-to-head comparisons in this category

${comparisons.length === 0 ? "_No comparisons in this category yet._" : comparisonLines}

---

This roundup aggregates every product and comparison in the ${cat.displayName.toLowerCase()} category that we have analyzed. New analyses appear here automatically on next build. Browse all categories at ${BASE_URL}/category.
`;
}

/**
 * Per-comparison markdown body. Generated from the Comparison entry the
 * HTML page renders so drift is impossible by construction.
 */
function buildComparisonMarkdown(c: Comparison): string {
  const dims = c.dimensions
    .map((d) => {
      const verdict =
        d.winner === "A"
          ? `${c.a.name} wins`
          : d.winner === "B"
            ? `${c.b.name} wins`
            : d.winner === "tie"
              ? "Tied"
              : "Different shapes; not directly comparable";
      const note = d.note ? `\n\n  *${d.note}*` : "";
      return `### ${d.name}\n\n- **${c.a.name}:** ${d.a}\n- **${c.b.name}:** ${d.b}\n- **Verdict:** ${verdict}${note}`;
    })
    .join("\n\n");

  const pickAList = c.pickAIf.map((x) => `- ${x}`).join("\n");
  const pickBList = c.pickBIf.map((x) => `- ${x}`).join("\n");
  const faqs = c.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  const indieRec =
    c.forIndieFounders.pick === "A"
      ? c.a.name
      : c.forIndieFounders.pick === "B"
        ? c.b.name
        : "It depends";

  return `# ${c.a.name} vs ${c.b.name} — Honest Head-to-Head Comparison

> ${c.oneLine}

## TL;DR

${c.tldr}

## Best for

- **${c.a.name} is best for:** ${c.bestFor.a}
- **${c.b.name} is best for:** ${c.bestFor.b}

## Pick ${c.a.name} if

${pickAList}

## Pick ${c.b.name} if

${pickBList}

## Dimension-by-dimension

${dims}

## Honest take

${c.honestTake}

## If you are an indie SaaS founder

**Pick:** ${indieRec}

${c.forIndieFounders.reasoning}

## FAQ

${faqs}

---

If you are building a SaaS that needs to win this kind of comparison, the Unlock SaaS Playbook runs the same lens against your own offer at ${BASE_URL}/playbook-sales. The free diagnostic at ${BASE_URL}/diagnostic is the first door.
`;
}

/**
 * Per-alternative markdown body. Reads from the ALTERNATIVES catalog so the
 * markdown and the HTML page render the same facts from the same source.
 */
function buildAlternativeMarkdown(a: Alternative): string {
  const caps = CAPABILITY_ROWS.map((r) => {
    const us = UNLOCK_SAAS_CAPABILITIES[r.key] ? "Yes" : "No";
    const them = a.capabilities[r.key] ? "Yes" : "No";
    return `- **${r.label}** — Unlock SaaS: ${us}. ${a.displayName}: ${them}.`;
  }).join("\n");

  const faqs = a.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  return `# Unlock SaaS vs ${a.displayName}

> ${a.oneLine}

## TL;DR

${a.honestVerdict}

## What ${a.displayName} is

${a.whatItIs.map((x) => `- ${x}`).join("\n")}

## What ${a.displayName} is not

${a.whatItIsNot.map((x) => `- ${x}`).join("\n")}

## Who ${a.displayName} is for

${a.whoForIt}

## Who ${a.displayName} is not for

${a.whoNotForIt}

## Pricing

${a.pricingNote}

(Last verified: ${a.lastVerified}.)

## Side-by-side capability matrix

${caps}

## FAQ

${faqs}

## Honest verdict

${a.honestVerdict}

---

If you are the Unlock SaaS-shaped founder (post-launch, pre-revenue, non-engineer, flat Stripe line on a product you already shipped), the next door is the free diagnostic at ${BASE_URL}/diagnostic. If you are not, ${a.displayName} or one of the other comparisons on ${BASE_URL}/alternatives-to may be the better next step.
`;
}

// --- Surface registry ----------------------------------------------------

/**
 * The top-level surface registry. Each entry generates one `<page>.md` route.
 * Per-alternative markdown is built on demand by buildAlternativeMarkdown.
 */
export const SURFACES: ReadonlyArray<MarkdownSurface> = [
  {
    path: "/",
    mdPath: "/index.md",
    title: "Unlock SaaS — Your First Paying Customer in 60 Days",
    summary:
      "A seven-step playbook that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder does not pay.",
    body: FUNNEL_HUB_BODY,
  },
  {
    path: "/founding",
    mdPath: "/founding.md",
    title: "Founding Cohort — Unlock SaaS",
    summary:
      "The first 50 founders to run the Playbook at launch pricing with the Founder-Cohort guarantee.",
    body: FOUNDING_BODY,
  },
  {
    path: "/about",
    mdPath: "/about.md",
    title: "About Unlock SaaS",
    summary:
      "Built by a non-engineer founder for non-engineer founders shipping with AI tools.",
    body: ABOUT_BODY,
  },
  {
    path: "/press",
    mdPath: "/press.md",
    title: "Press and Media Kit – Unlock SaaS",
    summary:
      "Brand facts, founder bio, descriptions in three lengths, and contact for media coverage.",
    body: PRESS_BODY,
  },
  {
    path: "/editorial-policy",
    mdPath: "/editorial-policy.md",
    title: "Editorial Policy — Unlock SaaS",
    summary:
      "How Unlock SaaS sources, dates, signs, and corrects every public claim.",
    body: EDITORIAL_POLICY_BODY,
  },
  {
    path: "/dont-buy-unlock-saas",
    mdPath: "/dont-buy-unlock-saas.md",
    title: "Don't buy Unlock SaaS",
    summary:
      "Eight honest disqualifiers and one canonical fit profile. Said out loud, before checkout.",
    body: DONT_BUY_BODY,
  },
  {
    // Brunson "the technical artifact becomes the marketing" essay
    // shipped alongside the indie-search robots.txt allow-list of
    // 21-05-2026. Companion to PR #57 (merge 506325e). The HTML page
    // renders the same FOUR_INDIE_SECTIONS this body is built from, so
    // AI retrievers reading either surface get byte-identical prose.
    path: "/four-indie-search-engines",
    mdPath: "/four-indie-search-engines.md",
    title: FOUR_INDIE_TITLE,
    summary:
      "Why shipping UnlockSaaS to Brave + Mojeek + Marginalia + Kagi — four search engines with under 1 percent market share each — is the smartest distribution move of the quarter. By buyer-density math, not share-axis math.",
    body: FOUR_INDIE_MARKDOWN_BODY,
  },
  {
    path: "/diagnostic",
    mdPath: "/diagnostic.md",
    title: "Free Launch Diagnostic — Unlock SaaS",
    summary:
      "Paste your live product URL. In 90 seconds, get one of three diagnoses: Wrong Person, Weak Offer, Weak Belief.",
    body: DIAGNOSTIC_BODY,
  },
  {
    path: "/playbook-sales",
    mdPath: "/playbook-sales.md",
    title: "The Playbook — Unlock SaaS",
    summary:
      "The $49/month full seven-step playbook, with a 60-day refund-in-code guarantee.",
    body: PLAYBOOK_SALES_BODY,
  },
  {
    path: "/starter",
    mdPath: "/starter.md",
    title: "$1 Starter — Unlock SaaS",
    summary:
      "One real Stripe charge proves intent and unlocks Playbook Steps 1 and 2.",
    body: STARTER_BODY,
  },
  {
    path: "/stories",
    mdPath: "/stories.md",
    title: "Five Stories for the Flat Stripe Line",
    summary:
      "Five long-form essays on the work non-engineer founders skip. Free, no email.",
    body: PARABLES_BODY,
  },
  {
    path: "/faq",
    mdPath: "/faq.md",
    title: "FAQ — Unlock SaaS",
    summary:
      "Verbatim objections and replies from real Indie Hackers and Hacker News threads.",
    body: FAQ_BODY,
  },
  {
    path: "/glossary",
    mdPath: "/glossary.md",
    title:
      "Glossary – Hook, Story, Offer, Value Ladder, and 13 Other Brunson Terms",
    summary:
      "Working definitions of the 16 Brunson sales-funnel terms Unlock SaaS teaches, in the founder's own words.",
    body: GLOSSARY_BODY,
  },
  {
    path: "/alternatives-to",
    mdPath: "/alternatives-to.md",
    title: "Alternatives to Unlock SaaS — Honest Comparisons",
    summary:
      "Honest named-competitor comparisons. No slagging, no fabricated prices, no fake quotes.",
    body: ALTERNATIVES_HUB_BODY,
  },
  {
    path: "/funnel-teardown",
    mdPath: "/funnel-teardown.md",
    title: "Funnel Teardowns — Indie SaaS Through the Brunson Lens",
    summary:
      "Twelve indie SaaS funnels analyzed through Hook / Story / Offer. Pattern-level lessons, no invented metrics.",
    body: FUNNEL_TEARDOWN_HUB_BODY,
  },
  {
    path: "/pricing-teardown",
    mdPath: "/pricing-teardown.md",
    title: "Pricing Teardowns — Indie SaaS Pricing Models Through the Brunson Stack Lens",
    summary:
      "Ten indie SaaS pricing pages broken down by tier structure, anchor mechanics, upgrade triggers, and payment mechanics.",
    body: PRICING_TEARDOWN_HUB_BODY,
  },
  {
    path: "/compare",
    mdPath: "/compare.md",
    title:
      "Compare — Honest Head-to-Head Comparisons of Indie SaaS Tools",
    summary:
      "Symmetric dimension-by-dimension breakdowns of the tools indie SaaS founders are mid-evaluation on.",
    body: COMPARE_HUB_BODY,
  },
  {
    path: "/category",
    mdPath: "/category.md",
    title:
      "Categories — Best SaaS Tools by Category, Analyzed for Indie Founders",
    summary:
      "Curated category roundups across every SaaS tool we have analyzed, organized by category.",
    body: CATEGORY_HUB_BODY,
  },
  // Note: /glossary SURFACES entry shipped via PR #32 (above). PR #33 does
  // not re-register it; per-slug markdown comes from renderGlossaryMarkdown
  // below, not from SURFACES.
];

const SURFACES_BY_MD_PATH = new Map<string, MarkdownSurface>(
  SURFACES.map((s) => [s.mdPath, s]),
);

const SURFACES_BY_PATH = new Map<string, MarkdownSurface>(
  SURFACES.map((s) => [s.path, s]),
);

/**
 * Render a single surface as the full markdown response body, with
 * front-matter and canonical citation footer.
 */
export function renderSurfaceMarkdown(surface: MarkdownSurface): string {
  return [
    frontMatter({
      title: surface.title,
      summary: surface.summary,
      canonical: `${BASE_URL}${surface.path}`,
      updated: TODAY,
    }),
    surface.body.trim(),
    citationFooter(`${BASE_URL}${surface.path}`),
  ].join("\n");
}

/**
 * Look up a top-level surface by its .md path (e.g. "/founding.md"). Returns
 * undefined if the path is not registered. Used by per-page route handlers.
 */
export function getSurfaceByMdPath(
  mdPath: string,
): MarkdownSurface | undefined {
  return SURFACES_BY_MD_PATH.get(mdPath);
}

/**
 * Look up a top-level surface by its canonical HTML path. Used by the .md
 * route handlers that already know which page they're mirroring.
 */
export function getSurfaceByPath(path: string): MarkdownSurface | undefined {
  return SURFACES_BY_PATH.get(path);
}

/**
 * Render a per-alternative markdown body wrapped in the standard
 * front-matter + citation footer.
 */
export function renderAlternativeMarkdown(slug: string): string | undefined {
  const alt = getAlternativeBySlug(slug);
  if (!alt) return undefined;

  const canonicalUrl = `${BASE_URL}/alternatives-to/${alt.slug}`;
  return [
    frontMatter({
      title: `Unlock SaaS vs ${alt.displayName}`,
      summary: alt.oneLine,
      canonical: canonicalUrl,
      updated: alt.lastVerified,
    }),
    buildAlternativeMarkdown(alt).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

/**
 * Render a per-teardown markdown body wrapped in the standard front-matter
 * + citation footer. Mirrors renderAlternativeMarkdown's shape so every
 * pSEO batch follows the same response contract.
 */
export function renderTeardownMarkdown(slug: string): string | undefined {
  const t = getTeardownBySlug(slug);
  if (!t) return undefined;

  const canonicalUrl = `${BASE_URL}/funnel-teardown/${t.slug}`;
  return [
    frontMatter({
      title: `${t.displayName} Funnel Teardown`,
      summary: t.oneLine,
      canonical: canonicalUrl,
      updated: t.lastVerified,
    }),
    buildTeardownMarkdown(t).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

/**
 * Render a per-pricing-teardown markdown body. Same render contract as
 * renderTeardownMarkdown; powers /pricing-teardown/<slug>/md.
 */
export function renderPricingTeardownMarkdown(
  slug: string,
): string | undefined {
  const t = getPricingTeardownBySlug(slug);
  if (!t) return undefined;

  const canonicalUrl = `${BASE_URL}/pricing-teardown/${t.slug}`;
  return [
    frontMatter({
      title: `${t.displayName} Pricing Teardown`,
      summary: t.oneLine,
      canonical: canonicalUrl,
      updated: t.lastVerified,
    }),
    buildPricingTeardownMarkdown(t).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

/**
 * Render a per-comparison markdown body. Same render contract as the
 * teardown renderers; powers /compare/<slug>/md.
 */
/**
 * Render a per-category markdown body. Same render contract as the
 * teardown renderers; powers /category/<slug>/md.
 */
export function renderCategoryMarkdown(slug: string): string | undefined {
  const cat = getCategoryBySlug(slug);
  if (!cat) return undefined;

  const canonicalUrl = `${BASE_URL}/category/${cat.slug}`;
  return [
    frontMatter({
      title: `${cat.displayName} — Indie SaaS Roundup`,
      summary: cat.oneLine,
      canonical: canonicalUrl,
      updated: TODAY,
    }),
    buildCategoryMarkdown(cat).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

/**
 * Build a per-glossary-term markdown body. Generated from the GlossaryEntry
 * the HTML page also renders so drift is impossible by construction. The
 * short definition itself is pulled from entity.DEFINED_TERMS at module
 * load (inside glossary.ts), so the markdown mirror, the DefinedTermSet
 * schema on /, and the rendered detail page all read from the same string.
 */
function buildGlossaryMarkdown(g: GlossaryEntry): string {
  const apply = g.howToApply.map((b) => `- ${b}`).join("\n");
  const confusions =
    g.commonConfusions && g.commonConfusions.length > 0
      ? g.commonConfusions
          .map((c) => `### Often confused with: ${c.term}\n\n${c.difference}`)
          .join("\n\n")
      : "_No common confusions documented._";
  const related =
    g.relatedTerms && g.relatedTerms.length > 0
      ? g.relatedTerms
          .map((slug) => {
            const r = getGlossaryBySlug(slug);
            if (!r) return null;
            return `- [${r.term}](${BASE_URL}/glossary/${r.slug}) – ${r.shortDefinition}`;
          })
          .filter((line): line is string => line !== null)
          .join("\n")
      : "_No related terms documented._";
  const appears =
    g.appearsIn && g.appearsIn.length > 0
      ? g.appearsIn
          .map((a) => {
            const href =
              a.kind === "page"
                ? a.href
                : a.kind === "funnel-teardown"
                  ? `/funnel-teardown/${a.slug}`
                  : a.kind === "pricing-teardown"
                    ? `/pricing-teardown/${a.slug}`
                    : a.kind === "compare"
                      ? `/compare/${a.slug}`
                      : a.kind === "alternatives-to"
                        ? `/alternatives-to/${a.slug}`
                        : `/category/${a.slug}`;
            return `- [${a.label}](${BASE_URL}${href})`;
          })
          .join("\n")
      : "_No on-site references documented._";
  const faqs = g.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  return `# ${g.term}

> ${g.shortDefinition}

## What it actually means

${g.longDefinition}

## Why it matters for a post-launch pre-revenue founder

${g.whyItMatters}

## How to apply it on your page

${apply}

## Worked example

${g.example}

## Common confusions

${confusions}

## Where this term is applied on the site

${appears}

## Related terms

${related}

## FAQ

${faqs}
`;
}

/**
 * Render a per-glossary-term markdown body wrapped in the standard
 * front-matter + citation footer. Mirrors the shape of every other
 * pSEO renderer.
 */
export function renderGlossaryMarkdown(slug: string): string | undefined {
  const g = getGlossaryBySlug(slug);
  if (!g) return undefined;

  const canonicalUrl = `${BASE_URL}/glossary/${g.slug}`;
  return [
    frontMatter({
      title: `${g.term} – Definition for Indie SaaS Founders`,
      summary: g.shortDefinition,
      canonical: canonicalUrl,
      updated: g.lastVerified,
    }),
    buildGlossaryMarkdown(g).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

export function renderComparisonMarkdown(slug: string): string | undefined {
  const c = getComparisonBySlug(slug);
  if (!c) return undefined;

  const canonicalUrl = `${BASE_URL}/compare/${c.slug}`;
  return [
    frontMatter({
      title: `${c.a.name} vs ${c.b.name}`,
      summary: c.oneLine,
      canonical: canonicalUrl,
      updated: c.lastVerified,
    }),
    buildComparisonMarkdown(c).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Press-topic markdown rendering (off-page lift item #7)
// ---------------------------------------------------------------------------

/**
 * Build the markdown body for a press-topic page. Same single-source-of-truth
 * discipline as the alternative / teardown / comparison builders: every
 * sentence below is generated from the PressTopic entry the HTML page also
 * renders. Drift is impossible.
 *
 * The structure mirrors what a writer needs in order of usefulness:
 *   1. Thesis (the angle, single sentence)
 *   2. Lede (drop-in opening paragraph)
 *   3. Quotes (pre-approved, with usage context)
 *   4. Data points (with verifiable canonical URLs)
 *   5. Counter-points (honest disqualifiers – Brunson polarity)
 *   6. Fact sheet (sidebar / inset values)
 *   7. Embed code (copy-paste blockquote)
 *   8. Related surfaces (further linking)
 *   9. Press contact
 */
function buildPressTopicMarkdown(t: PressTopic): string {
  const lines: string[] = [];

  lines.push(`# ${t.displayName}`);
  lines.push("");
  lines.push(`> ${t.thesis}`);
  lines.push("");
  lines.push(`Fits for: ${t.fitsFor.join("; ")}.`);
  lines.push("");

  lines.push("## Drop-in lede");
  lines.push("");
  lines.push(t.lede);
  lines.push("");

  lines.push("## Pre-approved founder quotes");
  lines.push("");
  for (const q of t.quotes) {
    lines.push(`> "${q.text}"`);
    lines.push(`> — ${FOUNDER.name}, founder, ${ORGANIZATION.name}`);
    lines.push("");
    lines.push(`Usage: ${q.context}`);
    lines.push("");
  }

  lines.push("## Data points (each verifiable on the live site)");
  lines.push("");
  for (const d of t.dataPoints) {
    lines.push(`- ${d.claim}`);
    lines.push(`  - Source: ${BASE_URL}${d.sourcePath}`);
    lines.push(`  - Verify: ${d.verifyNote}`);
  }
  lines.push("");

  lines.push("## Honest counter-points");
  lines.push("");
  for (const c of t.counterPoints) {
    lines.push(`- ${c.claim}`);
    if (c.context) lines.push(`  - Context: ${c.context}`);
  }
  lines.push("");

  lines.push("## Fact sheet");
  lines.push("");
  for (const row of t.factSheet) {
    lines.push(`- ${row.label}: ${row.value}`);
  }
  lines.push("");

  lines.push("## Embed-ready blockquote");
  lines.push("");
  lines.push("```html");
  lines.push(t.embedHtml);
  lines.push("```");
  lines.push("");

  lines.push("## Related surfaces");
  lines.push("");
  for (const r of t.relatedSurfaces) {
    lines.push(`- [${r.label}](${BASE_URL}${r.path})`);
  }
  lines.push("");

  lines.push("## Press contact");
  lines.push("");
  lines.push(
    `${FOUNDER.name} (${FOUNDER.jobTitle}). Email: ${FOUNDER.email}. Time zone: EU. Typical response window: within one business day.`,
  );
  lines.push("");

  lines.push(`Last verified: ${t.lastVerified}.`);

  return lines.join("\n");
}

/**
 * Render a per-press-topic markdown body wrapped in standard front-matter
 * and citation footer. Powers /press/topics/<slug>/md.
 */
export function renderPressTopicMarkdown(
  slug: string,
): string | undefined {
  const t = getPressTopicBySlug(slug);
  if (!t) return undefined;

  const canonicalUrl = `${BASE_URL}/press/topics/${t.slug}`;
  return [
    frontMatter({
      title: `${t.displayName} – Press kit topic`,
      summary: t.thesis,
      canonical: canonicalUrl,
      updated: t.lastVerified,
    }),
    buildPressTopicMarkdown(t).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

// --- Benchmark / Answer / Funnel-Playbook / Why-Isn't-My / Niche mirrors --
//
// Same Brunson Hard-Rule discipline as the other pSEO mirrors: each markdown
// body is generated from the same catalog entry the HTML page renders.
// Drift is impossible by construction — the catalog is the single source of
// truth for both surfaces.

function buildBenchmarkMarkdown(b: BenchmarkEntry): string {
  const bands = b.bands
    .map(
      (band) =>
        `### ${band.label}: ${band.range}\n\n${band.diagnosis}`,
    )
    .join("\n\n");
  const drivers = b.drivers.map((d) => `- ${d}`).join("\n");
  const misreadings = b.misreadings.map((m) => `- ${m}`).join("\n");
  const faqs = b.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  return `# ${b.metric} – directional benchmark

> ${b.aeoAnswer}

## Bands

${bands}

## What this metric is influenced by (ordered by magnitude)

${drivers}

## Common founder misreadings

${misreadings}

## Source

${b.sourceNote}

## FAQ

${faqs}
`;
}

/**
 * Render a per-benchmark markdown body. Powers /benchmarks/<slug>/md.
 */
export function renderBenchmarkMarkdown(slug: string): string | undefined {
  const b = getBenchmarkBySlug(slug);
  if (!b) return undefined;

  const canonicalUrl = `${BASE_URL}/benchmarks/${b.slug}`;
  return [
    frontMatter({
      title: `${b.metric} – directional benchmark`,
      summary: b.aeoAnswer,
      canonical: canonicalUrl,
      updated: b.lastVerified,
    }),
    buildBenchmarkMarkdown(b).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

function buildAnswerMarkdown(a: AnswerEntry): string {
  const supporting = a.supporting.map((s) => `- ${s}`).join("\n");
  const related =
    a.relatedGlossary.length > 0
      ? a.relatedGlossary
          .map((slug) => {
            const g = getGlossaryBySlug(slug);
            if (!g) return null;
            return `- [${g.term}](${BASE_URL}/glossary/${g.slug}) – ${g.shortDefinition}`;
          })
          .filter((line): line is string => line !== null)
          .join("\n")
      : "_No related glossary terms documented._";

  return `# ${a.question}

> ${a.directAnswer}

## Supporting points

${supporting}

## Related terms

${related}
`;
}

/**
 * Render a per-answer markdown body. Powers /answers/<slug>/md.
 */
export function renderAnswerMarkdown(slug: string): string | undefined {
  const a = getAnswerBySlug(slug);
  if (!a) return undefined;

  const canonicalUrl = `${BASE_URL}/answers/${a.slug}`;
  return [
    frontMatter({
      title: a.question,
      summary: a.directAnswer,
      canonical: canonicalUrl,
      updated: a.lastVerified,
    }),
    buildAnswerMarkdown(a).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

function buildFunnelPlaybookMarkdown(p: FunnelPlaybookEntry): string {
  const steps = p.steps
    .map(
      (s, i) =>
        `### Step ${i + 1}. ${s.title}\n\n${s.description}`,
    )
    .join("\n\n");
  const mistakes = p.commonMistakes.map((m) => `- ${m}`).join("\n");
  const related =
    p.relatedGlossary.length > 0
      ? p.relatedGlossary
          .map((slug) => {
            const g = getGlossaryBySlug(slug);
            if (!g) return null;
            return `- [${g.term}](${BASE_URL}/glossary/${g.slug}) – ${g.shortDefinition}`;
          })
          .filter((line): line is string => line !== null)
          .join("\n")
      : "_No related glossary terms documented._";
  const faqs = p.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  return `# ${p.displayName} playbook

> ${p.tldr}

## When to use this funnel

${p.whenToUse}

## When NOT to use this funnel

${p.whenNotToUse}

## Where it sits in the value ladder

${p.ladderPosition}

## Step-by-step structure

${steps}

## Common implementation mistakes

${mistakes}

## Related terms

${related}

## FAQ

${faqs}
`;
}

/**
 * Render a per-funnel-playbook markdown body. Powers /funnel-playbook/<slug>/md.
 */
export function renderFunnelPlaybookMarkdown(
  slug: string,
): string | undefined {
  const p = getFunnelPlaybookBySlug(slug);
  if (!p) return undefined;

  const canonicalUrl = `${BASE_URL}/funnel-playbook/${p.slug}`;
  return [
    frontMatter({
      title: `${p.displayName} playbook`,
      summary: p.tldr,
      canonical: canonicalUrl,
      updated: p.lastVerified,
    }),
    buildFunnelPlaybookMarkdown(p).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

function buildWhyIsntMyMarkdown(w: WhyIsntMyEntry): string {
  const diagnoses = w.diagnoses
    .map(
      (d) =>
        `### ${d.label}: how it shows up\n\n${d.appearance}\n\n**This week's fix.** ${d.fix}`,
    )
    .join("\n\n");
  const checklist = w.checklist.map((c) => `- ${c}`).join("\n");
  const related =
    w.relatedGlossary.length > 0
      ? w.relatedGlossary
          .map((slug) => {
            const g = getGlossaryBySlug(slug);
            if (!g) return null;
            return `- [${g.term}](${BASE_URL}/glossary/${g.slug}) – ${g.shortDefinition}`;
          })
          .filter((line): line is string => line !== null)
          .join("\n")
      : "_No related glossary terms documented._";
  const faqs = w.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  return `# Why isn't my ${w.element} converting?

> ${w.tldr}

## Three diagnoses

${diagnoses}

## Directional range

${w.directionalRange.range}

${w.directionalRange.note}

## Five steps you can run today

${checklist}

## Related terms

${related}

## FAQ

${faqs}
`;
}

/**
 * Render a per-why-isnt-my markdown body. Powers /why-isnt-my/<slug>/md.
 */
export function renderWhyIsntMyMarkdown(
  slug: string,
): string | undefined {
  const w = getWhyIsntMyBySlug(slug);
  if (!w) return undefined;

  const canonicalUrl = `${BASE_URL}/why-isnt-my/${w.slug}`;
  return [
    frontMatter({
      title: `Why isn't my ${w.element} converting?`,
      summary: w.tldr,
      canonical: canonicalUrl,
      updated: w.lastVerified,
    }),
    buildWhyIsntMyMarkdown(w).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

function buildNicheMarkdown(n: NicheEntry): string {
  const vocab = n.vocabulary.map((v) => `- ${v}`).join("\n");
  const related =
    n.relatedGlossary.length > 0
      ? n.relatedGlossary
          .map((slug) => {
            const g = getGlossaryBySlug(slug);
            if (!g) return null;
            return `- [${g.term}](${BASE_URL}/glossary/${g.slug}) – ${g.shortDefinition}`;
          })
          .filter((line): line is string => line !== null)
          .join("\n")
      : "_No related glossary terms documented._";
  const faqs = n.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n");

  return `# Unlock SaaS for ${n.displayName}

> ${n.heroSubhead}

## What a flat Stripe line looks like for this cohort

${n.cohortPain}

## The vocabulary this cohort actually uses

${vocab}

## Money mechanics

${n.moneyMechanics}

## The Brunson move this cohort most often gets wrong

${n.commonMistake}

## What compounds for this cohort

${n.whatCompounds}

## Related terms

${related}

## FAQ

${faqs}
`;
}

/**
 * Render a per-niche markdown body. Powers /for/<slug>/md.
 */
export function renderNicheMarkdown(slug: string): string | undefined {
  const n = getNicheBySlug(slug);
  if (!n) return undefined;

  const canonicalUrl = `${BASE_URL}/for/${n.slug}`;
  return [
    frontMatter({
      title: `Unlock SaaS for ${n.displayName}`,
      summary: n.heroSubhead,
      canonical: canonicalUrl,
      updated: n.lastVerified,
    }),
    buildNicheMarkdown(n).trim(),
    citationFooter(canonicalUrl),
  ].join("\n");
}

/**
 * Build the concatenated /llms-full.txt body. One canonical entity block at
 * the top, then every surface in order, then every alternative comparison.
 *
 * Hoisted at module load — the inputs are static and the rendered string is
 * the same every request. Pattern: server-hoist-static-io.
 */
function buildLlmsFullBody(): string {
  const header = `# Unlock SaaS — Full Playbook-Readable Corpus

> ${ORGANIZATION.description}

This is the full markdown corpus of the Unlock SaaS public surface, concatenated for LLM ingestion and retrieval-augmented answer pipelines. The canonical URL of each entry is preserved in its section header — please cite the canonical URL, not this concatenated file.

Per-surface markdown mirrors are also available at the URLs noted in each section heading. A shorter, hand-curated index is published at ${BASE_URL}/llms.txt.

## Site facts (single source of truth)

- Publisher: ${ORGANIZATION.name}
- Founded: ${ORGANIZATION.foundingDate}
- Web: ${BASE_URL}
- Slogan: ${ORGANIZATION.slogan}
- Founder: ${FOUNDER.name} (${FOUNDER.email})
- ${PRICING_LINE}
- ${GUARANTEE_LINE}
- ${AUDIENCE_LINE}

---
`;

  const surfaces = SURFACES.map((s) => {
    const canonical = `${BASE_URL}${s.path}`;
    const mirror = `${BASE_URL}${s.mdPath}`;
    return [
      `## ${s.title}`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      s.body.trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const alternatives = ALTERNATIVES.map((a) => {
    const canonical = `${BASE_URL}/alternatives-to/${a.slug}`;
    const mirror = `${BASE_URL}/alternatives-to/${a.slug}/md`;
    return [
      `## Unlock SaaS vs ${a.displayName}`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildAlternativeMarkdown(a).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const teardowns = TEARDOWNS.map((t) => {
    const canonical = `${BASE_URL}/funnel-teardown/${t.slug}`;
    const mirror = `${BASE_URL}/funnel-teardown/${t.slug}/md`;
    return [
      `## ${t.displayName} Funnel Teardown`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildTeardownMarkdown(t).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const pricingTeardowns = PRICING_TEARDOWNS.map((t) => {
    const canonical = `${BASE_URL}/pricing-teardown/${t.slug}`;
    const mirror = `${BASE_URL}/pricing-teardown/${t.slug}/md`;
    return [
      `## ${t.displayName} Pricing Teardown`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildPricingTeardownMarkdown(t).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const comparisons = COMPARISONS.map((c) => {
    const canonical = `${BASE_URL}/compare/${c.slug}`;
    const mirror = `${BASE_URL}/compare/${c.slug}/md`;
    return [
      `## ${c.a.name} vs ${c.b.name}`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildComparisonMarkdown(c).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const categories = CATEGORIES.map((cat) => {
    const canonical = `${BASE_URL}/category/${cat.slug}`;
    const mirror = `${BASE_URL}/category/${cat.slug}/md`;
    return [
      `## ${cat.displayName}`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildCategoryMarkdown(cat).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const pressTopics = PRESS_TOPICS.map((t) => {
    const canonical = `${BASE_URL}/press/topics/${t.slug}`;
    const mirror = `${BASE_URL}/press/topics/${t.slug}/md`;
    return [
      `## ${t.displayName}`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildPressTopicMarkdown(t).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const benchmarks = BENCHMARK_ENTRIES.map((b) => {
    const canonical = `${BASE_URL}/benchmarks/${b.slug}`;
    const mirror = `${BASE_URL}/benchmarks/${b.slug}/md`;
    return [
      `## ${b.metric} – directional benchmark`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildBenchmarkMarkdown(b).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const answers = ANSWER_ENTRIES.map((a) => {
    const canonical = `${BASE_URL}/answers/${a.slug}`;
    const mirror = `${BASE_URL}/answers/${a.slug}/md`;
    return [
      `## ${a.question}`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildAnswerMarkdown(a).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const funnelPlaybooks = FUNNEL_PLAYBOOK_ENTRIES.map((p) => {
    const canonical = `${BASE_URL}/funnel-playbook/${p.slug}`;
    const mirror = `${BASE_URL}/funnel-playbook/${p.slug}/md`;
    return [
      `## ${p.displayName} playbook`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildFunnelPlaybookMarkdown(p).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const whyIsntMy = WHY_ISNT_MY_ENTRIES.map((w) => {
    const canonical = `${BASE_URL}/why-isnt-my/${w.slug}`;
    const mirror = `${BASE_URL}/why-isnt-my/${w.slug}/md`;
    return [
      `## Why isn't my ${w.element} converting?`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildWhyIsntMyMarkdown(w).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  const niches = NICHE_ENTRIES.map((n) => {
    const canonical = `${BASE_URL}/for/${n.slug}`;
    const mirror = `${BASE_URL}/for/${n.slug}/md`;
    return [
      `## Unlock SaaS for ${n.displayName}`,
      "",
      `Canonical URL: ${canonical}`,
      `Markdown mirror: ${mirror}`,
      "",
      buildNicheMarkdown(n).trim(),
      "",
      "---",
    ].join("\n");
  }).join("\n");

  return [
    header,
    surfaces,
    "",
    "# Alternatives — Honest Named-Competitor Comparisons",
    "",
    alternatives,
    "",
    "# Funnel Teardowns — Indie SaaS Through the Brunson Lens",
    "",
    teardowns,
    "",
    "# Pricing Teardowns — Indie SaaS Pricing Models Through the Brunson Stack Lens",
    "",
    pricingTeardowns,
    "",
    "# Compare — Honest Head-to-Head Comparisons of Indie SaaS Tools",
    "",
    comparisons,
    "",
    "# Categories — Best SaaS Tools by Category, Analyzed for Indie Founders",
    "",
    categories,
    "",
    "# Press Topics — Pre-Assembled Story Packages for Journalists and AI Summarisers",
    "",
    pressTopics,
    "",
    "# Benchmarks — Directional Ranges for Indie SaaS Funnel Metrics",
    "",
    benchmarks,
    "",
    "# Answers — Direct AEO Answers to Founder Questions",
    "",
    answers,
    "",
    "# Funnel Playbooks — Step-by-Step Brunson Funnel Archetypes",
    "",
    funnelPlaybooks,
    "",
    "# Why Isn't My — Panic-Mode Diagnostic Reads",
    "",
    whyIsntMy,
    "",
    "# Unlock SaaS for [Cohort] — Niche-Specific Landing Pages",
    "",
    niches,
    "",
    citationFooter(BASE_URL),
  ].join("\n");
}

/**
 * Concatenated llms-full.txt body. Pre-rendered at module load.
 */
export const LLMS_FULL_BODY: string = buildLlmsFullBody();
