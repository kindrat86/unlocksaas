/**
 * Machine-readable markdown surface for AI crawlers and agents.
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
 */

import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
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
  "Pricing: $1 one-time Starter (unlocks Machine Steps 1 and 2); $49/month Core (the full seven-step Machine). No annual upsell. No coaching tier.";
const GUARANTEE_LINE =
  "Guarantee: First verified paying customer in 60 days from the Machine start date, or full refund (capped exposure $98). Enforced in code, read from the founder's connected Stripe account.";
const AUDIENCE_LINE =
  "Audience: Post-launch, pre-revenue, non-engineer founders shipping consumer or B2B SaaS with AI tools (Lovable, Claude, Replit, v0, Cursor, Bolt, Bubble).";

// --- Build the surface registry ------------------------------------------

const TODAY = "2026-05-17";

/**
 * Homepage / Funnel Hub markdown body.
 */
const FUNNEL_HUB_BODY = `# Unlock SaaS

> A machine that turns your already-shipped SaaS into a verified paying customer in 60 days, or you do not pay.

## TL;DR

Unlock SaaS is a seven-step machine for post-launch pre-revenue non-engineer founders. It picks one real dream customer, writes one real one-line offer, sends one real outreach message — and verifies the resulting paying customer inside Stripe. If no customer is verified in 60 days, the founder is refunded automatically in code.

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
2. **$1 Starter** — entry rung. Stripe charge proves intent and unlocks Machine Steps 1 and 2. ${BASE_URL}/starter
3. **The Machine ($49/mo)** — full seven-step system with 60-day guarantee. ${BASE_URL}/machine-sales

## Founder

${FOUNDER.name} — ${FOUNDER.description} Contact: ${FOUNDER.email}.
`;

const FOUNDING_BODY = `# Founding Cohort — Unlock SaaS

> The first 50 founders to run the Machine, at the launch price, with the Founder-Cohort guarantee.

## TL;DR

The Founding Cohort is a time-boxed window where the first 50 indie SaaS founders run the Machine at the launch price ($1 Starter + $49/mo Core). Members get the same 60-day refund-or-do-not-pay guarantee plus a permanent place in the Verified Builders directory if they cross the cycle. The window closes when 50 founders enroll or when the public launch ships, whichever comes first.

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
5. **Send one real message** — the Machine generates the outreach inside the tool and tracks the send.
6. **Track the response** — replies, calls, and the Stripe webhook all flow into the same dashboard.
7. **Verify the cycle** — Stripe confirms the paying customer. If not, the refund fires automatically at day 60.

## What is NOT included

- No coaching calls. The Machine pushes back; the founder does the work.
- No course or training video library. The product is software, not content.
- No promised traffic, audience, or virality. The Machine assumes you start at zero.

## Pricing and refund mechanics

The full mechanics live at ${BASE_URL}/machine-sales and ${BASE_URL}/faq. Founding-Cohort founders get the same terms: $1 Starter, $49/mo Core, $98 capped exposure, refund-in-code at day 60 if the in-product milestones were completed and Stripe shows no new customer.

## How to join

Apply at ${BASE_URL}/founding. The form is short; the bar is real product shipped and willingness to do the work. Maryan personally reviews every application.
`;

const ABOUT_BODY = `# About Unlock SaaS

> Built by a non-engineer founder for non-engineer founders shipping with AI tools.

## TL;DR

Unlock SaaS was built by Maryan, a marketer (not an engineer) who shipped a dozen AI-assisted SaaS products, watched them flatline in Stripe, and built the Machine to solve the work no one teaches indie founders: turning a live product into the first verified paying customer.

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
- Pricing and guarantee facts on this page mirror ${BASE_URL}/machine-sales and ${BASE_URL}/faq verbatim. If they ever disagree, the canonical HTML page wins and this mirror is a bug.
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
3. **Walk through the door.** The diagnosis hands you the specific next step that fixes the labeled problem. For most founders, that step is the $1 Starter or a re-read of the Parable that matches their diagnosis.

## What the diagnostic does not do

- It does not write your offer for you. (The Machine does that, after diagnosis.)
- It does not promise the diagnosis will be flattering. The most common diagnosis on a post-launch flat Stripe line is "Wrong Person."
- It does not store your URL or email beyond the diagnosis flow.

## After the diagnosis

If the diagnostic surfaces Wrong Person, the next door is usually the Free Launch Diagnostic's recommendation: the $1 Starter — which is the Machine's Steps 1 and 2 (pin one real customer, write one real offer). ${BASE_URL}/starter

If the diagnostic surfaces Weak Offer, the next door is the same Starter, with emphasis on Step 2.

If the diagnostic surfaces Weak Belief, the next door is the long-form $49 Machine page, which walks through the belief stack the founder needs to build. ${BASE_URL}/machine-sales

## Pricing

Free. No card. No upsell on the diagnosis screen itself — the next door is presented as a recommendation, not a paywall.

${GUARANTEE_LINE}
`;

const MACHINE_SALES_BODY = `# The Machine — Unlock SaaS

> A seven-step machine that turns an already-shipped SaaS into a verified paying customer in 60 days, or you do not pay.

## TL;DR

The Machine is the $49/month full system. Seven steps, executed inside the tool, that take a flat-Stripe-line product to a verified paying customer. 60-day money-back guarantee tied to the connected Stripe account: complete the in-product milestones, do at least 20 logged outreach actions, and if Stripe shows no new customer at day 60, $98 returns automatically in code.

${PRICING_LINE}

${GUARANTEE_LINE}

${AUDIENCE_LINE}

## The seven steps

1. **Pin one real customer.** Name one specific human at one specific company in one specific role. The Machine pushes back on persona-language until the answer is a person.
2. **Write one real offer.** One sentence, naming the person and the result. The engine surfaces vague verbs ("help," "support," "enable") and forces specificity.
3. **Build one real proof.** The smallest artifact that proves the offer is real. A loom video, a screenshot, a one-page doc — whichever is the lowest-effort thing that proves the result is possible.
4. **Send one real message.** The Machine generates the outreach copy inside the tool and tracks the send. No copy-pasting out to a separate CRM tab.
5. **Track the response.** The same dashboard surfaces replies, calls, and the Stripe webhook — so the founder watches the same thing that determines the guarantee.
6. **Iterate or escalate.** If 20 logged actions produce no Stripe ping, the engine has a deterministic playbook for offer revision or audience revision — based on which signal arrived (silence vs. praise without payment).
7. **Verify the cycle.** Stripe webhook confirms the first paying customer. The Verified Builders directory updates the moment the cycle closes.

## What the Machine is not

- Not a course. Not a cohort. Not a coaching call.
- Not a no-code builder, codebase generator, or product replacement.
- Not a traffic/audience tool — it assumes you start at zero traffic.
- Not a feature factory.

## FAQ (verbatim from ${BASE_URL}/faq)

${FAQ_ENTRIES.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
`;

const STARTER_BODY = `# $1 Starter — Unlock SaaS

> One real Stripe charge proves intent and unlocks Machine Steps 1 and 2.

## TL;DR

The Starter is a $1 one-time Stripe charge. It is the entry rung. Buying it does three things: (1) proves to you and the Machine that you are willing to act on a real product page, (2) unlocks the two highest-leverage steps of the seven-step Machine — pin one real customer, write one real offer — and (3) keeps the deliverables yours regardless of whether you upgrade to Core.

## What you get for $1

- **Step 1 of the Machine** — guided session that ends with one named dream customer (specific human, specific role, specific company), not a persona.
- **Step 2 of the Machine** — guided session that ends with one one-sentence offer naming the customer and the result.
- **Both deliverables are yours.** Cancel after $1 and you keep the dream-customer pin and the offer line. They are written, exportable, and re-usable.

## Why $1 (not free)

A free version teaches the brain that the work is free. A $1 charge teaches the brain that the work is real. The price is deliberately small enough that the decision is "yes, I'll try the work" and large enough that the act is a real act, not a click.

## What is NOT included at $1

- The other five steps of the Machine (proof, outreach generation, tracking, iteration, verification).
- The 60-day refund-or-do-not-pay guarantee. That belongs to Core, which is the contract that holds the result accountable.
- Direct email support from the founder. That belongs to the Founding Cohort.

## How $1 becomes $49/mo

You don't auto-upgrade. After Steps 1 and 2, the in-product surface shows what Core would add and the price. If you upgrade, the $1 is credited toward the first month. If you do not, the deliverables stay yours.

${GUARANTEE_LINE}
`;

const PARABLES_BODY = `# Five Parables for the Flat Stripe Line

> Long-form, free-to-read essays on the work non-engineer founders skip. No email required, no payment, no upsell.

## TL;DR

Five essays on the work that produces the first paying customer, written for the founder staring at a flat Stripe line. Each parable is a single-sitting read (8 to 15 minutes), names the specific failure pattern, and ends with the door that opens past it. Free. No email gate. No course.

## The five parables

1. **The Blank Offer Page** — what happens when the product is shipped but the page is still a feature list, and why no amount of traffic will fix it.
2. **The Stripe Refresh** — the involuntary habit, the shape of the silence, and why refreshing the dashboard is the wrong loop to be running on day 14.
3. **The SEO Escape Hatch** — why the founder who knows SEO reaches for SEO when the actual problem is the offer, and what the diagnostic catches that the keyword tool cannot.
4. **The Mirror in Ten Founders** — the case studies the founder reads to feel less alone, and why they are not the case studies the founder needs.
5. **The Door That Opened** — the moment the first paying customer arrives, what the founder did the week before, and why that work is the work the Machine encodes.

## Why these are free

They are the bridge content. A cold reader hits one of these parables on a long-tail Google search, reads the one that mirrors their situation, and recognizes the shape of their own flat Stripe line in the prose. That recognition is the only sales asset the page needs — if it lands, the reader walks toward the diagnostic. If it doesn't, they leave, and that is the right outcome.

## How to read them

Pick the parable whose title sounds most like your last 14 days. Read it. If the recognition lands, walk to ${BASE_URL}/diagnostic. If it doesn't, read another one. The parables are not a sequence; they are mirrors.

Read on ${BASE_URL}/parables.
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

The Funnel Teardown surface is a pSEO library that breaks down twelve well-known indie SaaS funnels through Russell Brunson's Hook-Story-Offer framework — the same framework the Unlock SaaS Machine runs against the founder's own page. Each teardown names the public pattern, what's working, what to adapt, and what to specifically NOT copy if you're pre-revenue. Every entry is dated; every claim is observable on the target's live surface.

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

Indie SaaS founders funnel-hack the products they admire — that's the search behavior. The honest response is to teach the framework rather than slag the target, and to point the lesson back at the reader's own page. Each teardown ends with the same implicit invitation: run this same lens against your own product. The Unlock SaaS Machine is the tool that does it.
`;

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

> Ten indie SaaS pricing models broken down by tier structure, anchor mechanics, upgrade triggers, and payment mechanics. The same four levers the Machine applies when critiquing your own pricing page.

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

If you want this same Hook-Story-Offer lens applied to *your* product page (not ${t.displayName}'s), the Unlock SaaS Machine does exactly that at ${BASE_URL}/machine-sales. The free diagnostic at ${BASE_URL}/diagnostic is the first door.
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

If you want this same pricing lens applied to *your* page (not ${t.displayName}'s), the Unlock SaaS Machine does exactly that at ${BASE_URL}/machine-sales. The free diagnostic at ${BASE_URL}/diagnostic is the first door — pricing-page dysfunction usually shows up as the Weak Offer label.
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

If you are building a SaaS that needs to win this kind of comparison, the Unlock SaaS Machine runs the same lens against your own offer at ${BASE_URL}/machine-sales. The free diagnostic at ${BASE_URL}/diagnostic is the first door.
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
      "A seven-step machine that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder does not pay.",
    body: FUNNEL_HUB_BODY,
  },
  {
    path: "/founding",
    mdPath: "/founding.md",
    title: "Founding Cohort — Unlock SaaS",
    summary:
      "The first 50 founders to run the Machine at launch pricing with the Founder-Cohort guarantee.",
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
    path: "/diagnostic",
    mdPath: "/diagnostic.md",
    title: "Free Launch Diagnostic — Unlock SaaS",
    summary:
      "Paste your live product URL. In 90 seconds, get one of three diagnoses: Wrong Person, Weak Offer, Weak Belief.",
    body: DIAGNOSTIC_BODY,
  },
  {
    path: "/machine-sales",
    mdPath: "/machine-sales.md",
    title: "The Machine — Unlock SaaS",
    summary:
      "The $49/month full seven-step machine, with a 60-day refund-in-code guarantee.",
    body: MACHINE_SALES_BODY,
  },
  {
    path: "/starter",
    mdPath: "/starter.md",
    title: "$1 Starter — Unlock SaaS",
    summary:
      "One real Stripe charge proves intent and unlocks Machine Steps 1 and 2.",
    body: STARTER_BODY,
  },
  {
    path: "/parables",
    mdPath: "/parables.md",
    title: "Five Parables for the Flat Stripe Line",
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

/**
 * Build the concatenated /llms-full.txt body. One canonical entity block at
 * the top, then every surface in order, then every alternative comparison.
 *
 * Hoisted at module load — the inputs are static and the rendered string is
 * the same every request. Pattern: server-hoist-static-io.
 */
function buildLlmsFullBody(): string {
  const header = `# Unlock SaaS — Full Machine-Readable Corpus

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
    citationFooter(BASE_URL),
  ].join("\n");
}

/**
 * Concatenated llms-full.txt body. Pre-rendered at module load.
 */
export const LLMS_FULL_BODY: string = buildLlmsFullBody();
