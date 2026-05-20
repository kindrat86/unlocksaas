/**
 * Brunson glossary catalog – fifth pSEO block after alternatives, funnel
 * teardowns, pricing teardowns, comparisons, and categories.
 *
 * See strategy/google-strategy.md §A.5 for the policy on programmatic SEO.
 *
 * Intent class targeted
 * ---------------------
 * Pure definition / explainer long tail. The four existing pSEO blocks
 * serve head-to-head and pattern queries; the glossary serves the
 * upstream "what is X" / "how do I use X" / "X vs Y meaning" queries
 * that LLMs and Google AI Overviews aggressively cite. Every entry below
 * is a real Brunson concept the strategy/ folder teaches and the
 * Playbook applies.
 *
 * Single source of truth
 * ----------------------
 * The short definition for every entry is read at module load from
 * `entity.DEFINED_TERMS`. The DefinedTermSet schema.org block on `/`
 * (json-ld.tsx) ALREADY publishes those strings – this surface adds the
 * web-readable home plus a richer body (long definition, why it matters
 * for the dream customer, how to apply, common confusions, related
 * terms, related shipped surfaces, FAQ). Drift between the schema graph
 * and the rendered page is impossible by construction: a glossary entry
 * without a matching DEFINED_TERMS row throws at module load.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every definition is in the founder's voice. No copy-pasted
 *     Wikipedia phrasing, no fabricated citations.
 *   - "How to apply" bullets describe what a post-launch pre-revenue
 *     founder actually does, on the page they shipped. Generic
 *     marketing-textbook advice is not allowed here.
 *   - `appearsIn` cross-links resolve only to surfaces that exist in
 *     this repo at module load. A dead link is a build-time fail.
 *   - lastVerified ISO is the audit date – the day the founder last
 *     re-read the entry against the strategy/ folder and the live
 *     Playbook product.
 *
 * Discovery wiring
 * ----------------
 *   - sitemap.ts adds /glossary + every slug.
 *   - llms.txt declares /glossary as a Surface B (GEO/AEO) anchor.
 *   - Each detail page has /glossary/<slug>/md (markdown mirror) and
 *     /glossary/<slug>/opengraph-image (per-slug OG card).
 *   - The hub `/glossary` carries CollectionPage + DefinedTermSet +
 *     Dataset JSON-LD; each detail page carries DefinedTerm + Article +
 *     FAQPage + BreadcrumbList JSON-LD.
 *
 * Scaling path
 * ------------
 * Add a row to entity.DEFINED_TERMS for the short definition; add the
 * matching entry below for the long-form body. Sitemap, llms.txt, and
 * the schema graph pick it up on next build.
 */

import { DEFINED_TERMS } from "@/lib/seo/entity";
import { ALTERNATIVE_SLUGS } from "@/lib/alternatives";
import { TEARDOWN_SLUGS } from "@/lib/funnel-teardowns";
import { PRICING_TEARDOWN_SLUGS } from "@/lib/pricing-teardowns";
import { COMPARISON_SLUGS } from "@/lib/comparisons";
import { CATEGORY_SLUGS } from "@/lib/categories";
import {
  validateQuotations,
  type QuotationSchemaInput,
} from "@/lib/seo/quotation";

/** Where the term shows up in the shipped product surface. */
export type GlossaryAppearance =
  | { kind: "funnel-teardown"; slug: string; label: string }
  | { kind: "pricing-teardown"; slug: string; label: string }
  | { kind: "compare"; slug: string; label: string }
  | { kind: "alternatives-to"; slug: string; label: string }
  | { kind: "category"; slug: string; label: string }
  | { kind: "page"; href: string; label: string };

/** A common confusion: a sibling concept this term is often mistaken for. */
export interface GlossaryConfusion {
  /** The term it's confused with. */
  term: string;
  /** The distinguishing difference, in one sentence. */
  difference: string;
}

/** A FAQ pair on the glossary detail page. */
export interface GlossaryFaq {
  q: string;
  a: string;
}

/**
 * A glossary entry. The short definition is NOT stored here – it is
 * read from entity.DEFINED_TERMS at module load and attached to each
 * row, so the DefinedTermSet schema on `/` and the glossary detail page
 * share one source of truth.
 */
export interface GlossaryRow {
  /** URL slug. Kebab-case. */
  slug: string;
  /** Display name. MUST match a `term` value in entity.DEFINED_TERMS. */
  term: string;
  /**
   * Topical bucket for hub grouping. Drawn from the layers of the
   * Brunson framework Unlock SaaS teaches.
   */
  category:
    | "Hook"
    | "Story"
    | "Offer"
    | "Diagnostic"
    | "Audience"
    | "Editorial";
  /**
   * 2-to-3 sentence elaboration of the short definition. Standalone –
   * an LLM should be able to quote this paragraph as the canonical
   * "long definition" without further context.
   */
  longDefinition: string;
  /**
   * Why a post-launch pre-revenue non-engineer founder should care.
   * One paragraph. Names the specific moment in their workflow when
   * this concept becomes load-bearing.
   */
  whyItMatters: string;
  /**
   * 3-to-5 plain-English action bullets a founder can apply to their
   * own live product page TODAY. Not theory.
   */
  howToApply: readonly string[];
  /**
   * One concrete worked example. The example must describe a real
   * surface (the dream-customer named in workbook 08, the diagnostic,
   * a Playbook step, or a shipped pSEO entry) – not a hypothetical.
   */
  example: string;
  /** Terms this is most often confused with, plus the distinguishing line. */
  commonConfusions?: readonly GlossaryConfusion[];
  /** Slugs of related glossary terms (resolves inside this manifest). */
  relatedTerms?: readonly string[];
  /**
   * Shipped surfaces where this term is named on the visible page.
   * Each entry MUST resolve to a real route at module load – see
   * validateAppearances below. No phantom cross-links.
   */
  appearsIn?: readonly GlossaryAppearance[];
  /** FAQ pairs for FAQPage JSON-LD + on-page accordion. */
  faqs: readonly GlossaryFaq[];
  /**
   * Verbatim external quotations this entry cites. Emitted on the
   * /glossary/[slug] page as `Article.citation` – a chain of
   * schema.org Quotation nodes attached to the parent Article. Each
   * entry is an E-E-A-T signal AND a knowledge-graph backlink to the
   * creator + source.
   *
   * Brunson Hard-Rule: `text` MUST be character-verbatim from the
   * named source. No paraphrases. Module load (validate() below)
   * runs validateQuotations() and fails the build on any entry that
   * does not clear the honesty gate.
   *
   * Empty / omitted is the honest default. Populate per entry only
   * when verbatim text from a named source has been curated. See
   * `@/lib/seo/quotation` for the contract.
   */
  quotations?: readonly QuotationSchemaInput[];
  /** Audit date – last time the entry was re-read against strategy/ + product. */
  lastVerified: string;
}

/**
 * Short-definition lookup, materialized once at module load from the
 * canonical DEFINED_TERMS array. Throws if a glossary row names a term
 * that isn't published in DefinedTermSet – the schema graph and the
 * web surface must always agree.
 */
const SHORT_BY_TERM: ReadonlyMap<string, string> = new Map(
  DEFINED_TERMS.map((t) => [t.term, t.definition]),
);

function lookupShort(term: string): string {
  const short = SHORT_BY_TERM.get(term);
  if (!short) {
    throw new Error(
      `glossary.ts: term "${term}" is not in entity.DEFINED_TERMS. ` +
        `Add it to DEFINED_TERMS first (the DefinedTermSet schema on / ` +
        `is the canonical short-definition source).`,
    );
  }
  return short;
}

/**
 * Raw rows. Authored without short definitions; those are attached at
 * module load via lookupShort so drift between schema and page is
 * impossible.
 */
const RAW_ROWS: readonly GlossaryRow[] = [
  // ---- Hook layer ----------------------------------------------------------
  {
    slug: "hook",
    term: "Hook",
    category: "Hook",
    longDefinition:
      "A hook is the page's opening promise plus its polarity move. The promise names the result; the polarity move names who the page is not for. Both have to fire in the first three seconds because that is the window before a cold visitor decides whether to keep reading.",
    whyItMatters:
      "Post-launch pre-revenue founders almost always have a hook problem before they have a feature problem. The page above the fold describes the product instead of catching the right reader. Fixing the hook is usually a one-afternoon edit that doubles time-on-page; rebuilding features takes weeks and rarely moves the line.",
    howToApply: [
      "Replace the feature-list headline with the result the dream customer wants.",
      "Add a polarity line in the sub-headline so the wrong reader leaves on purpose.",
      "Cut every adjective that does not change who the page is for.",
      "Test the headline by reading only the first three seconds out loud – if it sounds like every other tool in the category, it is not a hook.",
    ],
    example:
      "Unlock SaaS's hook is \"Your first paying customer in 60 days, or you do not pay.\" The result is named in the first clause; the polarity (\"if you have not shipped, this is not for you\") fires immediately under it. Together they screen for the canonical audience in three seconds.",
    commonConfusions: [
      {
        term: "Headline",
        difference:
          "A headline is the words. A hook is the promise plus polarity move – a headline can carry it, but a hook also includes the sub-headline, the polarity disqualifier, and any opening visual that fires inside the first three seconds.",
      },
      {
        term: "Lead magnet",
        difference:
          "A lead magnet is the bait offered in exchange for an email. A hook is the page-level promise that decides whether the reader stops to consider the lead magnet at all.",
      },
    ],
    relatedTerms: ["story", "offer", "big-domino", "weak-belief"],
    appearsIn: [
      {
        kind: "funnel-teardown",
        slug: "tally",
        label: "Tally – Hook teardown",
      },
      {
        kind: "funnel-teardown",
        slug: "plausible",
        label: "Plausible – Hook teardown",
      },
      { kind: "page", href: "/diagnostic", label: "Free Launch Diagnostic" },
    ],
    faqs: [
      {
        q: "What is the difference between a hook and a headline?",
        a: "The headline is the literal words at the top of the page. The hook is the full opening promise plus the polarity move that fires alongside it – sub-headline, disqualifier, and any opening visual included. A page can have a passable headline and still have no hook.",
      },
      {
        q: "How long is the hook?",
        a: "Three seconds of reading time. That is roughly the headline plus the sub-headline plus the polarity line directly underneath. If the reader has to scroll, the hook has already failed.",
      },
      {
        q: "Can a hook be a question?",
        a: "Yes, but only if the question screens for the right reader. \"Why is your Stripe line flat?\" is a hook for a post-launch pre-revenue founder. \"Want more customers?\" is not – it screens for nobody.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "big-domino",
    term: "Big Domino",
    category: "Hook",
    longDefinition:
      "The Big Domino is the single claim a page has to prove. If the reader accepts that one claim, every smaller objection becomes irrelevant; if they reject it, no amount of feature copy or social proof recovers the page. Russell Brunson's framework for high-ticket pages is built around it: name the one belief, then spend the rest of the page proving it.",
    whyItMatters:
      "Most flat indie SaaS pages try to prove ten things at once. The page is loud about every secondary feature and silent about the one belief that actually decides the sale. Naming the Big Domino in one sentence is what lets a founder cut half the page without losing a single buyer.",
    howToApply: [
      "Write the Big Domino as one sentence: \"If you believe X, you will buy.\"",
      "Audit every paragraph on the page. If a paragraph does not move the reader toward X, cut it.",
      "Put the Big Domino above the fold, in the founder's voice – not in marketing-speak.",
      "Test the Big Domino on three real conversations with the dream customer. If it does not name a belief they already half-hold, rewrite it.",
    ],
    example:
      "Unlock SaaS's Big Domino is: \"The work between shipped and first paying customer is the work nobody taught you – and the Playbook does it.\" Accept that, and the $49/mo price, the 60-day guarantee, and the seven-step structure all stop being objections.",
    relatedTerms: ["hook", "story", "stack-slide", "perfect-webinar"],
    appearsIn: [
      { kind: "page", href: "/playbook-sales", label: "Playbook sales page" },
      {
        kind: "funnel-teardown",
        slug: "lemonsqueezy",
        label: "Lemon Squeezy – Big Domino teardown",
      },
    ],
    faqs: [
      {
        q: "How is the Big Domino different from a value proposition?",
        a: "A value prop describes what the product does. The Big Domino is the prior belief the reader has to accept before any value prop matters. \"60-day refund\" is a value prop; \"the work nobody taught you is what makes the difference\" is the Big Domino it leans on.",
      },
      {
        q: "Can a page have more than one Big Domino?",
        a: "No. The whole point is to pick the one belief that, once accepted, makes every other objection collapse. Two Big Dominoes is two pages – split them into two surfaces or a Soap Opera Sequence between them.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "reluctant-hero",
    term: "Reluctant Hero",
    category: "Hook",
    longDefinition:
      "The Reluctant Hero is one of Russell Brunson's four attractive-character archetypes. The founder solved their own problem first, kept solving it for friends who kept asking, and is publishing the playbook reluctantly because the demand will not go away. Reluctance is the credibility lever: a founder selling a system they invented for themselves reads as honest in a way a founder who pitches \"I'm here to change the industry\" never does.",
    whyItMatters:
      "Indie SaaS founders sit on Reluctant Hero capital and do not spend it. The about page reads like a corporate bio when it should read like a confession: \"I built this for me, then for three friends, then the friends kept asking.\" That single sentence is worth more than three case studies the founder does not yet have.",
    howToApply: [
      "Rewrite the about page in the first person, starting with the moment you decided to solve the problem for yourself.",
      "Name the moment you realised other people had the same problem – the original three friends, the first Discord ping, the cold DM that made it click.",
      "Drop the \"we\" pronoun if you are a solo founder. Solo Reluctant Hero pages convert; \"we believe\" pages do not.",
      "Carry the reluctance through the sales page: the offer exists because the audience kept asking, not because the founder wanted a SaaS exit.",
    ],
    example:
      "Maryan's bio on Unlock SaaS opens with: \"Built the playbook he uses for his own launch. Marketer by trade, not engineer.\" The page sells the same playbook the founder is shipping his own product through. Reluctant Hero is load-bearing here – the buyer is not paying for theory, they are paying for the system the founder is mid-using.",
    relatedTerms: ["story", "hook"],
    appearsIn: [
      { kind: "page", href: "/about", label: "About – founder bio" },
      { kind: "page", href: "/stories", label: "Five Stories" },
    ],
    faqs: [
      {
        q: "Is the Reluctant Hero the same as a founder story?",
        a: "Founder story is the content; Reluctant Hero is one specific archetype the founder story can be told through. Brunson names four archetypes (Reluctant Hero, Leader, Adventurer, Reporter). Most indie SaaS founders fit Reluctant Hero best because they shipped to solve their own problem.",
      },
      {
        q: "What if I built the product on contract for a customer, not for myself?",
        a: "Then your Reluctant Hero story starts with the customer, not with you: \"A friend asked me to build this for their team; their team kept using it; their team's friends started asking.\" The reluctance is still real – you did not set out to build a SaaS.",
      },
    ],
    lastVerified: "2026-05-18",
  },

  // ---- Story layer ---------------------------------------------------------
  {
    slug: "story",
    term: "Story",
    category: "Story",
    longDefinition:
      "Story is everything that lives between the hook and the close. It is not a literary device; it is the belief stack. Each section of the page is a small recognition the reader has to accept (\"yes, this is my situation\", \"yes, that is what I tried\", \"yes, that is where it failed\") before the offer can land. Skip the belief stack and the offer looks expensive; build it and the offer looks cheap.",
    whyItMatters:
      "The flat indie SaaS page almost always has a usable hook and a real offer but nothing in the middle. The reader scrolls past a wall of features looking for a reason to believe and does not find one. Building the belief stack is what turns a page that gets shares but no buyers into a page that gets fewer shares and a flat Stripe line that tilts up.",
    howToApply: [
      "Write five sentences that describe your dream customer's situation today, in their words.",
      "Write three sentences that describe what they have already tried and why it stalled.",
      "Write one sentence that names the false belief everything they tried was built on.",
      "Replace the middle of your sales page with those nine sentences before reintroducing the offer.",
    ],
    example:
      "On /playbook-sales the middle section names the three things a post-launch founder has already tried (more features, more traffic, AI co-founder advice) and the false belief each one rests on. The offer at the bottom only works because that belief stack is built first.",
    relatedTerms: [
      "hook",
      "offer",
      "soap-opera-sequence",
      "seinfeld-email",
      "reluctant-hero",
    ],
    appearsIn: [
      { kind: "page", href: "/playbook-sales", label: "Playbook sales page" },
      { kind: "page", href: "/stories", label: "Five Stories" },
      {
        kind: "funnel-teardown",
        slug: "beehiiv",
        label: "Beehiiv – Story teardown",
      },
    ],
    faqs: [
      {
        q: "Does the story have to be a personal story?",
        a: "No. The story is the belief stack, not the founder's autobiography. A page can build belief through case studies, dimensional comparisons, screenshots, or a teardown of the reader's current page – anything that moves them through the sequence of small recognitions that ends in \"this is for me.\"",
      },
      {
        q: "How long should the story section be?",
        a: "As long as it takes to walk the reader from where they are to where the offer makes obvious sense. For a $49/mo SaaS to a warm-traffic reader that is usually five to seven scrolls. For cold traffic it can be twice that and still convert.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "soap-opera-sequence",
    term: "Soap Opera Sequence",
    category: "Story",
    longDefinition:
      "The Soap Opera Sequence (SOS) is Russell Brunson's five-email indoctrination pattern. A new subscriber receives one email a day for five days, structured around a backstory cliffhanger that resolves into the offer on day five. Each email leaves a deliberate open loop so the next one feels earned, not pushed.",
    whyItMatters:
      "Indie SaaS founders ship a signup form and then send nothing for two weeks. The subscriber forgets the product before the founder writes the first follow-up. A working SOS is the difference between a list that converts at 1% and a list that converts at 8% on the same traffic.",
    howToApply: [
      "Day 1: arrive with the founder's backstory and one specific open loop.",
      "Day 2: name the moment everything changed (the recognition).",
      "Day 3: name the public enemy – the false belief the audience holds.",
      "Day 4: name the epiphany – the new belief that flipped the founder's outcome.",
      "Day 5: open the offer, gated on accepting the new belief.",
    ],
    example:
      "Unlock SaaS sends a five-email SOS the day a founder requests the free diagnostic. Day 5 opens the $1 Starter offer. Subscribers who do not open day 1 are dropped from the sequence – the SOS only runs to readers actively reading.",
    commonConfusions: [
      {
        term: "Seinfeld Email",
        difference:
          "The SOS is a fixed five-email indoctrination sequence sent in the first week. Seinfeld Emails are daily emails sent forever after that – slice-of-life stories that pivot into a soft pitch.",
      },
    ],
    relatedTerms: ["seinfeld-email", "story", "offer", "reluctant-hero"],
    appearsIn: [
      { kind: "page", href: "/faq", label: "Email marketing FAQ" },
      {
        kind: "funnel-teardown",
        slug: "beehiiv",
        label: "Beehiiv funnel teardown",
      },
    ],
    faqs: [
      {
        q: "Does the SOS have to be exactly five emails?",
        a: "Five is the canonical Brunson shape because each day maps to one belief shift (backstory, recognition, enemy, epiphany, offer). Four works if you compress recognition and enemy; six only works if your audience is unusually patient. Three is too few – the offer lands before belief is built.",
      },
      {
        q: "When do I send the SOS?",
        a: "Trigger it on a single high-intent action: free trial signup, lead magnet download, diagnostic completion, or waitlist join. Do not trigger on newsletter signup alone – that traffic is not warm enough to read five days of story.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "seinfeld-email",
    term: "Seinfeld Email",
    category: "Story",
    longDefinition:
      "Russell Brunson's daily-email pattern: a short slice-of-life story in the founder's voice that pivots into a soft pitch in the last few lines. \"Seinfeld\" because the story is about nothing in particular – a coffee shop conversation, a walk, a bug in the product – and the pitch lands because the story already paid for the reader's attention.",
    whyItMatters:
      "Most indie SaaS founders cannot sustain a daily email schedule because they treat each email like a feature announcement. Seinfeld Emails are sustainable: the founder writes from what already happened that day, and the daily cadence is what compounds the relationship. Daily emails outperform weekly newsletters on conversion-per-subscriber by margins indie founders find embarrassing once they run the math.",
    howToApply: [
      "Write the email about something specific that actually happened today.",
      "Land the story in 150 to 300 words.",
      "Pivot to the offer in the last two to three lines, not the first.",
      "Send daily for at least 30 days before you judge the channel.",
    ],
    example:
      "Unlock SaaS runs a Seinfeld stream after the Soap Opera Sequence finishes. Day 6 onward, the founder sends one daily email about a real moment from building the product or talking to a customer. The pitch in the last two lines points at the diagnostic, the $1 Starter, or the Playbook depending on the week.",
    commonConfusions: [
      {
        term: "Soap Opera Sequence",
        difference:
          "SOS is the fixed five-email indoctrination on week one. Seinfeld Emails run after that, daily, indefinitely. Different cadence, different purpose.",
      },
    ],
    relatedTerms: ["soap-opera-sequence", "story", "reluctant-hero"],
    appearsIn: [{ kind: "page", href: "/faq", label: "FAQ – email cadence" }],
    faqs: [
      {
        q: "How is a Seinfeld Email different from a regular newsletter?",
        a: "A newsletter announces things. A Seinfeld Email tells one specific slice-of-life story and ends with one soft pitch. The newsletter mode trains readers to skip; the Seinfeld mode trains them to open because the next story is always new.",
      },
      {
        q: "Will daily emails make people unsubscribe?",
        a: "Yes, and that is the point. The wrong readers leave; the right readers compound. A list of 800 daily readers who recognise your voice converts higher than a list of 8,000 weekly readers who half-remember signing up.",
      },
    ],
    lastVerified: "2026-05-18",
  },

  // ---- Offer layer ---------------------------------------------------------
  {
    slug: "offer",
    term: "Offer",
    category: "Offer",
    longDefinition:
      "The offer is what the page asks for and what it gives in return, structured so the perceived value is unambiguously higher than the price. A good offer is not the product; it is the result the product is the delivery mechanism for, plus the proof that the result will arrive, plus the reversal of the buyer's downside.",
    whyItMatters:
      "Most indie SaaS pages sell features and call it an offer. The reader sees \"$49/mo for tool X\" and asks themselves whether they want tool X – which is the wrong question. A real offer makes the buyer compare the price to the result and the guarantee to their downside; framed that way, the same product converts two-to-five times higher on identical traffic.",
    howToApply: [
      "Replace \"buy our product\" with \"get this specific result.\"",
      "Add a guarantee or reversal that names the buyer's real downside.",
      "Itemise what is included so the perceived value sits above the price.",
      "Test the offer on three real conversations with the dream customer before shipping it to the page.",
    ],
    example:
      "Unlock SaaS's offer is not \"$49/mo for a SaaS tool.\" It is \"first paying customer in 60 days or you are refunded, with a $98 hard cap on what you can ever lose.\" The product is the delivery mechanism; the offer is the result plus the reversal.",
    relatedTerms: ["stack-slide", "value-ladder", "hook", "story"],
    appearsIn: [
      { kind: "page", href: "/playbook-sales", label: "Playbook sales page" },
      { kind: "page", href: "/starter", label: "$1 Starter" },
      {
        kind: "funnel-teardown",
        slug: "lemonsqueezy",
        label: "Lemon Squeezy – Offer teardown",
      },
    ],
    faqs: [
      {
        q: "Is the offer the same as the price?",
        a: "No. Price is one component of an offer; the rest are the result the buyer gets, the guarantee that reverses their downside, and the itemised value stack that justifies the price. A page with only a price and no reversal is selling a product, not an offer.",
      },
      {
        q: "Does every page need an offer?",
        a: "Every page asking for money or for a meaningful commitment (extended trial, demo, application). Free content pages do not need an offer in this sense – the offer is the page itself.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "value-ladder",
    term: "Value Ladder",
    category: "Offer",
    longDefinition:
      "An ordered sequence of offers the same customer can move through over time, where each rung delivers strictly more value than the last at a price proportional to the delivery. The ladder is the founder's product roadmap viewed from the buyer's side: what they buy first, what they buy next, what they buy when they trust you.",
    whyItMatters:
      "Indie SaaS founders default to one product at one price for everyone. The result is a binary funnel – buyers or non-buyers – with no path between them. A two-rung value ladder ($1 entry, $49/mo core) doubles the addressable market because it gives the cold reader a real first step that does not require trusting the founder yet.",
    howToApply: [
      "Name one entry rung that costs almost nothing and proves intent.",
      "Name one core rung that delivers the headline result.",
      "Decide whether a third rung exists; do not build it until the core rung has three completed customer cycles.",
      "Make each rung legible on the page – a buyer should know which rung they are on and what the next one buys them.",
    ],
    example:
      "Unlock SaaS's value ladder is two rungs today: $1 Starter (unlocks Playbook Steps 1 and 2) and $49/mo Core (the full seven-step Playbook). Rung 3 (Repeatable Revenue) is a published specification at /repeatable; build is gated on three Core customer cycles completing – the ladder does not grow until the rung below proves out.",
    relatedTerms: ["offer", "stack-slide", "hook", "verified-builder"],
    appearsIn: [
      { kind: "page", href: "/starter", label: "$1 Starter ($1 rung)" },
      { kind: "page", href: "/playbook-sales", label: "Playbook ($49 rung)" },
      { kind: "page", href: "/repeatable", label: "Repeatable Revenue (Rung 3 spec)" },
    ],
    faqs: [
      {
        q: "Do I need a free rung at the bottom?",
        a: "Sometimes. A free rung makes sense when the next rung needs real trust (high-ticket coaching, enterprise SaaS). For a $49/mo indie product, a $1 rung outperforms a free rung – paying $1 is the smallest real intent signal a customer can give, and Stripe verifies it.",
      },
      {
        q: "How many rungs is too many?",
        a: "Three is the ceiling for an indie SaaS until the core rung has at least 20 completed customer cycles. Past that, a fourth rung makes sense if and only if the audience asks for it unprompted. Adding rungs the audience did not ask for is how indie products turn into bloated platforms.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "stack-slide",
    term: "Stack Slide",
    category: "Offer",
    longDefinition:
      "The offer-reveal pattern Russell Brunson made famous on the Perfect Webinar. Each deliverable in the offer is itemised on its own line and anchored to a standalone price; the total of the anchors is shown explicitly; then the real price is revealed as a discount to that total. The point is not deception – the point is to make the buyer evaluate the whole offer instead of arguing with the price tag.",
    whyItMatters:
      "Pages that list features without anchoring them to standalone values lose the buyer to a single number: the price. Pages that stack the offer correctly lose the price comparison entirely – the buyer is comparing the total stack to their real downside, not the monthly fee to a competitor's monthly fee.",
    howToApply: [
      "List every deliverable on its own line.",
      "Anchor each line to the realistic standalone value of that deliverable.",
      "Show the total of the anchors before revealing your price.",
      "Reveal the price as a discount to the anchored total, with the reasoning in one sentence.",
    ],
    example:
      "Unlock SaaS's stack on /playbook-sales itemises the seven Playbook steps, the diagnostic, the founder support line, and the Verified Builders directory entry, each anchored to a standalone price the indie SaaS market actually charges for those things. The $49/mo number lands as a discount to that total, not as a feature-page sticker price.",
    relatedTerms: ["offer", "value-ladder", "perfect-webinar", "big-domino"],
    appearsIn: [
      { kind: "page", href: "/playbook-sales", label: "Playbook sales page" },
      {
        kind: "pricing-teardown",
        slug: "lemonsqueezy",
        label: "Lemon Squeezy – pricing stack",
      },
    ],
    faqs: [
      {
        q: "Is the Stack Slide manipulative?",
        a: "It is manipulative only if the anchored prices are fabricated. If each line item really would cost what you anchor it to from a comparable provider, the stack is a service to the buyer – they would have to assemble the same value themselves and pay each piece separately. Brunson Hard-Rule: never anchor to a price the market does not actually charge.",
      },
      {
        q: "Does the Stack work for a subscription product?",
        a: "Yes, but the anchors should be monthly equivalents, not lifetime prices. Anchor each deliverable to its honest monthly equivalent from a competing provider, sum those, then reveal your monthly fee as a discount to the sum. The reader is buying a month, so they evaluate the stack monthly.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "perfect-webinar",
    term: "Perfect Webinar",
    category: "Offer",
    longDefinition:
      "Russell Brunson's framework for selling a high-ticket offer to cold traffic in a single one-to-many presentation. The structure is fixed: name the Big Domino, walk through three secrets that prove it (vehicle, internal beliefs, external beliefs), stack the offer, and close. Indie SaaS founders rarely run literal webinars, but the Perfect Webinar shape is the canonical structure their sales page should follow.",
    whyItMatters:
      "Most indie SaaS sales pages are organised by feature category. The Perfect Webinar reorganises them by belief sequence – exactly what a cold reader actually moves through on the way to buying. Founders who restructure their flat sales page into a Perfect Webinar shape routinely see conversion lift on traffic they were already getting.",
    howToApply: [
      "Open the page with the Big Domino sentence.",
      "Run three sections, each one secret: vehicle (why this category), internal beliefs (why you can do it), external beliefs (why nothing outside is in the way).",
      "Land in the Stack Slide.",
      "Close with the price reveal and the guarantee.",
    ],
    example:
      "/playbook-sales follows the Perfect Webinar shape on a sales page rather than a webinar. Big Domino at the top, three secret sections in the middle (why a Playbook beats a course, why a non-engineer founder can run it, why traffic is not the blocker), stack near the bottom, refund-in-code close at the end.",
    relatedTerms: ["big-domino", "stack-slide", "offer", "story"],
    appearsIn: [
      { kind: "page", href: "/playbook-sales", label: "Playbook sales page" },
    ],
    faqs: [
      {
        q: "Do I have to run a literal webinar?",
        a: "No. The Perfect Webinar is a structural template – the shape of beliefs a cold reader has to move through. The same shape works on a sales page, in a VSL, in a five-email Soap Opera Sequence, and in a 90-minute live webinar. Pick the format the dream customer actually consumes.",
      },
      {
        q: "How long is a Perfect Webinar?",
        a: "Live: 60 to 90 minutes. On a sales page: as long as it takes to walk the three secrets and stack the offer – typically 10 to 20 scrolls for a $49/mo product, longer for high-ticket.",
      },
    ],
    lastVerified: "2026-05-18",
  },

  // ---- Diagnostic layer ----------------------------------------------------
  {
    slug: "wrong-person",
    term: "Wrong Person",
    category: "Diagnostic",
    longDefinition:
      "One of three diagnostic labels Unlock SaaS returns when a founder pastes their live product URL. \"Wrong Person\" fires when the offer on the page is fine but the page is aimed at no one in particular – generic copy, generic visuals, generic feature list. The page would convert for somebody, but it does not screen for anybody, so it converts for none.",
    whyItMatters:
      "Most flat indie SaaS pages get this diagnosis. Founders think they have a feature problem and double down on the product roadmap; the diagnostic shows they have an audience-naming problem and a one-afternoon fix.",
    howToApply: [
      "Name one specific person, in one specific role, at one specific company.",
      "Rewrite the hook to address that person directly.",
      "Add a polarity line that names who the page is not for.",
      "Re-run the diagnostic. If you still get Wrong Person, you named a persona, not a person.",
    ],
    example:
      "A diagnostic result of Wrong Person for a feedback-collection SaaS led to renaming the page from \"Customer Feedback Made Easy\" to \"For solo SaaS founders who need three real interviews this week.\" Same product, named audience, conversion lifted on traffic the founder already had.",
    relatedTerms: ["weak-offer", "weak-belief", "hook", "dream-100"],
    appearsIn: [
      { kind: "page", href: "/diagnostic", label: "Free Launch Diagnostic" },
      { kind: "page", href: "/stories", label: "Story: the Mirror in Ten Founders" },
    ],
    faqs: [
      {
        q: "How is Wrong Person different from a bad target market?",
        a: "Target market is a category (\"indie SaaS founders\"). Wrong Person fires when the page targets a category instead of a person. The fix is not to pick a different category; it is to name a specific human inside the category you already chose.",
      },
      {
        q: "Can a B2B SaaS land Wrong Person?",
        a: "Yes – it is the most common B2B SaaS diagnosis. A page that says \"for teams\" without naming a role, a team size, a tech stack, or a specific workflow is Wrong Person by default.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "weak-offer",
    term: "Weak Offer",
    category: "Diagnostic",
    longDefinition:
      "Diagnostic label fired when the person on the page is fine but the offer is a feature list instead of a result. The reader knows it is for them; they just cannot tell what they are buying. Weak Offer is the second-most-common label and almost always coexists with a missing guarantee or a missing stack.",
    whyItMatters:
      "Weak Offer is the diagnosis founders push back on hardest because the page has all the right features. The diagnostic is not saying the product is wrong; it is saying the page is asking the reader to translate features into a result, and most readers do not.",
    howToApply: [
      "Rewrite the headline as a result, not a feature.",
      "Add a one-sentence guarantee that names the buyer's real downside.",
      "Build a Stack Slide that anchors each deliverable to a standalone price.",
      "Re-run the diagnostic.",
    ],
    example:
      "A diagnostic on a Linear-clone-for-solo-founders surfaced Weak Offer. The features section was strong; the hook said \"Project management for solo founders.\" Rewriting to \"Ship one feature a week on a calendar your future self can audit\" plus a 30-day money-back guarantee turned the diagnosis green.",
    relatedTerms: ["wrong-person", "weak-belief", "offer", "stack-slide"],
    appearsIn: [
      { kind: "page", href: "/diagnostic", label: "Free Launch Diagnostic" },
    ],
    faqs: [
      {
        q: "If my pricing is competitive, can I still have a Weak Offer?",
        a: "Yes. Weak Offer is about how the offer is framed, not how cheap it is. A well-priced product with a feature-list page reads as Weak Offer; an averagely-priced product with a stacked offer and a guarantee reads as a strong offer at the same number.",
      },
      {
        q: "Does a guarantee always fix Weak Offer?",
        a: "A guarantee plus a result-named headline plus a stack fixes it. A guarantee alone, bolted onto an unchanged feature page, is a footnote – readers see it and ignore it because the rest of the page did not earn the read.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "weak-belief",
    term: "Weak Belief",
    category: "Diagnostic",
    longDefinition:
      "Diagnostic label fired when the person and the offer are fine but the page does not make the reader believe the offer will work for them specifically. The reader recognises themselves; they understand the offer; they just do not believe it. Weak Belief is the rarest of the three labels and the hardest to fix – it is the diagnosis that requires social proof, screenshots, or a Reluctant Hero story the founder may not yet have.",
    whyItMatters:
      "Founders with Weak Belief are usually closer to converting than they think. The page is doing 80 percent of the work; the reader is reading to the bottom and bouncing. The fix is targeted – one piece of real proof in the right scroll position – not a rewrite.",
    howToApply: [
      "Add one piece of real proof in the third scroll position: a screenshot of a real customer's Stripe dashboard, a quote from a real conversation, a screen recording of the result happening live.",
      "Cut every weasel word (\"can\", \"may\", \"often\") and replace with concrete commitments.",
      "Add a Reluctant Hero story to the about page and link to it from the sales page.",
      "Re-run the diagnostic.",
    ],
    example:
      "A diagnostic on a niche analytics tool surfaced Weak Belief. The fix was adding one annotated screenshot of a real user's dashboard above the pricing fold, plus a two-sentence Reluctant Hero on the about page. No copy was rewritten elsewhere; conversion lifted.",
    relatedTerms: ["wrong-person", "weak-offer", "reluctant-hero", "story"],
    appearsIn: [
      { kind: "page", href: "/diagnostic", label: "Free Launch Diagnostic" },
    ],
    faqs: [
      {
        q: "I do not have customer screenshots yet – what proof can I use?",
        a: "Pre-revenue proof is real proof: a screen recording of the product doing the result on your own data; an honest line about where the product is in its lifecycle; a Reluctant Hero story; one named beta user with permission. Fabricated testimonials are not proof and they fail audits.",
      },
      {
        q: "Is Weak Belief the same as not having case studies?",
        a: "Case studies are one form of belief proof, but not the only one. A screen recording, an annotated screenshot, a transparent build-in-public log, or a single named beta-user quote all count. The diagnostic measures whether belief lands, not whether case studies exist.",
      },
    ],
    lastVerified: "2026-05-18",
  },

  // ---- Audience layer ------------------------------------------------------
  {
    slug: "dream-100",
    term: "Dream 100",
    category: "Audience",
    longDefinition:
      "The named list of the 100 specific humans, publications, communities, or platforms where the dream customer already congregates. Russell Brunson's framework from Traffic Secrets – the entry point for every outbound channel. The Dream 100 is named, not segmented: real Twitter handles, real subreddit URLs, real podcast names, real newsletter editors.",
    whyItMatters:
      "Indie SaaS founders spend months \"finding their audience\" when the audience has already gathered in 100 places they could name in an afternoon. The Dream 100 forces the founder to write the list down, which is what turns abstract \"audience research\" into concrete outreach the next morning.",
    howToApply: [
      "Spend one afternoon writing 100 specific lines. No categories – only handles, URLs, names.",
      "Annotate each line with the smallest possible first move (reply to a tweet, comment on a podcast episode, email the editor with one specific question).",
      "Pick five lines per week. Do the move. Track responses.",
      "Replace lines that go nowhere; keep lines that respond, even tepidly.",
    ],
    example:
      "Maryan's Dream 100 for Unlock SaaS includes the indie SaaS Discords the dream customer reads, three podcasts whose hosts shipped with AI tools, four newsletters about post-launch struggle, and named founders who publicly admit flat Stripe lines. The list is not aspirational – every line is one outbound away.",
    relatedTerms: ["reluctant-hero", "hook", "story"],
    appearsIn: [
      { kind: "page", href: "/about", label: "About – Dream 100 mention" },
    ],
    faqs: [
      {
        q: "Does the Dream 100 have to be exactly 100?",
        a: "No, but it has to be specific. Fifty named entries beats a thousand vague categories. Brunson uses 100 because below 30 a founder picks only the easy targets and above 200 the list stops being actionable. Pick a number where every line is real and the next move on it is one click away.",
      },
      {
        q: "Is the Dream 100 paid or organic?",
        a: "Mostly organic for indie SaaS – direct replies, comments, DMs, applications to be a podcast guest. Paid plays on top of the same list (sponsoring the same newsletters, running ads against the same subreddits) but the organic move precedes the paid move, every time.",
      },
    ],
    lastVerified: "2026-05-18",
  },

  // ---- Editorial layer ----------------------------------------------------
  {
    slug: "verified-builder",
    term: "Verified Builder",
    category: "Editorial",
    longDefinition:
      "A founder whose first paying customer was confirmed via the founder's connected Stripe account – not self-reported, not screenshot-reported, not testimonial-reported. The Verified Builders directory on Unlock SaaS only grows when Stripe webhook confirms the cycle. Verified status is the canonical social-proof unit on the site.",
    whyItMatters:
      "Most testimonial walls on indie SaaS pages fail audits because they are unverifiable. Verified Builder status is the opposite: it is enforced in code, signed by Stripe, and the directory entry exists only because a real charge cleared. That makes it the rare social-proof signal that survives both buyer scrutiny and Google's quality-rater guidelines.",
    howToApply: [
      "If you are running your own SaaS, define what \"verified customer\" means in your domain and enforce it in code.",
      "Refuse to publish social proof that your system cannot verify – broken claims hurt more than empty walls.",
      "Tie any social-proof directory to the same verification event.",
      "If you cannot verify yet, ship the honest empty state and let the system grow it.",
    ],
    example:
      "/builders renders only the founders whose Stripe webhook has confirmed at least one paying customer in their connected account. Until that fires, they are not in the directory – no self-reporting path exists.",
    relatedTerms: ["brunson-hard-rule", "value-ladder", "offer"],
    appearsIn: [
      { kind: "page", href: "/builders", label: "Verified Builders directory" },
      { kind: "page", href: "/editorial-policy", label: "Editorial policy" },
    ],
    faqs: [
      {
        q: "Why not let founders self-report their first customer?",
        a: "Because self-reported social proof fails quality audits and erodes buyer trust. The cost of running a tighter verification gate is a smaller directory; the benefit is that every line in the directory is uncontestable. Brunson Hard-Rule.",
      },
      {
        q: "What counts as a verified paying customer?",
        a: "A real Stripe charge in the founder's connected account, from a customer who is not the founder themselves, that does not refund within the seven-day audit window. No exceptions. The webhook flow is documented in /editorial-policy.",
      },
    ],
    lastVerified: "2026-05-18",
  },
  {
    slug: "brunson-hard-rule",
    term: "Brunson Hard-Rule",
    category: "Editorial",
    longDefinition:
      "The editorial standard Unlock SaaS publishes by. Every public claim is independently verifiable, dated where the underlying fact can change, and unfabricated. No aggregateRating before verified reviewers exist; no testimonial counts before testimonials exist; no sameAs entries before the founder owns the account; no Wikidata Q-ID before a real entry is published. The rule names what we will not do, not what we will.",
    whyItMatters:
      "Pre-revenue founders are tempted to manufacture social proof to look credible. The Brunson Hard-Rule says no, and the discipline compounds: every fact on the site is one a buyer can verify, which is what makes the few facts we DO publish disproportionately credible. It also makes the site survive AI Overview de-duplication, Google's quality-rater audit, and any future scraper-driven review the site receives.",
    howToApply: [
      "Audit every social-proof claim on your page. If you cannot prove it from a public source, take it down.",
      "Add a Last Verified date to every claim that can change (pricing, headcount, integrations).",
      "Publish an editorial policy that documents how you source, sign, and correct claims.",
      "When in doubt, ship the honest empty state and let the system grow into the slot.",
    ],
    example:
      "On Unlock SaaS, the Playbook SoftwareApplication JSON-LD intentionally omits aggregateRating because no verified reviewer has shipped a public review yet. The schema graph has a hole where reviews would go, and the omission is the audit signal: the day a real review lands, the slot fills.",
    relatedTerms: ["verified-builder", "story"],
    appearsIn: [
      { kind: "page", href: "/editorial-policy", label: "Editorial policy" },
      { kind: "page", href: "/about", label: "About – editorial position" },
      { kind: "page", href: "/press", label: "Press / media kit" },
    ],
    faqs: [
      {
        q: "Is the Brunson Hard-Rule a Russell Brunson rule?",
        a: "No. The name is a tip-of-the-hat – Brunson's frameworks are central to the product – but the editorial rule is Unlock SaaS's own. It is the inverse of the most common funnel-marketing mistake: fabricating proof to look further along than you are.",
      },
      {
        q: "Does this slow growth?",
        a: "Yes, deliberately. The site grows social proof at the speed real social proof arrives. The trade is a slower-looking page in exchange for a page that survives every audit Google, an LLM, or a savvy buyer can run against it. For a sub-$100 indie product, the trade is worth it; for higher-ticket products, it is unmissable.",
      },
    ],
    lastVerified: "2026-05-18",
  },
];

/**
 * Public manifest with short definitions attached at module load.
 * Importers see one read-only array with both layers of definition.
 */
export type GlossaryEntry = GlossaryRow & {
  /** Short definition read from entity.DEFINED_TERMS at module load. */
  shortDefinition: string;
};

export const GLOSSARY: ReadonlyArray<GlossaryEntry> = Object.freeze(
  RAW_ROWS.map((row) => ({
    ...row,
    shortDefinition: lookupShort(row.term),
  })),
);

// ---------------------------------------------------------------------------
// Validation – fail at module load if any cross-link is dead
// ---------------------------------------------------------------------------

const ALTERNATIVE_SET = new Set<string>(ALTERNATIVE_SLUGS);
const TEARDOWN_SET = new Set<string>(TEARDOWN_SLUGS);
const PRICING_SET = new Set<string>(PRICING_TEARDOWN_SLUGS);
const COMPARISON_SET = new Set<string>(COMPARISON_SLUGS);
const CATEGORY_SET = new Set<string>(CATEGORY_SLUGS);
const GLOSSARY_SLUG_SET = new Set<string>(GLOSSARY.map((g) => g.slug));

function validate() {
  // Every slug must be unique.
  const seen = new Set<string>();
  for (const g of GLOSSARY) {
    if (seen.has(g.slug)) {
      throw new Error(`glossary.ts: duplicate slug "${g.slug}"`);
    }
    seen.add(g.slug);
  }

  // Every appearsIn cross-link must resolve.
  for (const g of GLOSSARY) {
    for (const a of g.appearsIn ?? []) {
      if (a.kind === "page") continue; // free-form internal link, validated by Next router at build time
      const target = a.slug;
      const valid =
        (a.kind === "alternatives-to" && ALTERNATIVE_SET.has(target)) ||
        (a.kind === "funnel-teardown" && TEARDOWN_SET.has(target)) ||
        (a.kind === "pricing-teardown" && PRICING_SET.has(target)) ||
        (a.kind === "compare" && COMPARISON_SET.has(target)) ||
        (a.kind === "category" && CATEGORY_SET.has(target));
      if (!valid) {
        throw new Error(
          `glossary.ts: entry "${g.slug}" references non-existent ${a.kind}/${target}`,
        );
      }
    }
    // Related terms must resolve.
    for (const rel of g.relatedTerms ?? []) {
      if (!GLOSSARY_SLUG_SET.has(rel)) {
        throw new Error(
          `glossary.ts: entry "${g.slug}" relatedTerms references unknown slug "${rel}"`,
        );
      }
    }
    // Quotations honesty gate. Brunson Hard-Rule: a Quotation block
    // is an E-E-A-T signal precisely because Google can de-duplicate
    // its `text` against the cited source. A malformed Quotation
    // would publish a citation graph that does not parse cleanly –
    // worse than emitting no citation at all. validateQuotations
    // throws on the first violation; empty quotations array is a
    // no-op.
    if (g.quotations && g.quotations.length > 0) {
      validateQuotations(g.quotations, `glossary.ts:${g.slug}.quotations`);
    }
  }
}

validate();

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/** Slug list – consumed by sitemap, generateStaticParams, and llms.txt. */
export const GLOSSARY_SLUGS: readonly string[] = GLOSSARY.map((g) => g.slug);

/** Lookup by slug. Returns undefined for unknown slugs. */
export function getGlossaryBySlug(slug: string): GlossaryEntry | undefined {
  return GLOSSARY.find((g) => g.slug === slug);
}

/** Slug → entry map for hot paths. */
const BY_SLUG: ReadonlyMap<string, GlossaryEntry> = new Map(
  GLOSSARY.map((g) => [g.slug, g]),
);

export function hasGlossaryTerm(slug: string): boolean {
  return BY_SLUG.has(slug);
}

/** Group the glossary by category, in the canonical Brunson layer order. */
const CATEGORY_ORDER: readonly GlossaryEntry["category"][] = [
  "Hook",
  "Story",
  "Offer",
  "Diagnostic",
  "Audience",
  "Editorial",
] as const;

export function groupGlossaryByCategory(): ReadonlyArray<{
  category: GlossaryEntry["category"];
  entries: readonly GlossaryEntry[];
}> {
  return CATEGORY_ORDER.map((category) => ({
    category,
    entries: GLOSSARY.filter((g) => g.category === category),
  })).filter((group) => group.entries.length > 0);
}

/**
 * Resolve a related-term slug to its display name + canonical URL fragment.
 * Used by the detail page to render a typed sibling list.
 */
export function resolveRelated(slug: string): {
  slug: string;
  term: string;
  shortDefinition: string;
} | undefined {
  const e = BY_SLUG.get(slug);
  if (!e) return undefined;
  return { slug: e.slug, term: e.term, shortDefinition: e.shortDefinition };
}

/** Latest lastVerified across the manifest – feeds Dataset.dateModified. */
export const GLOSSARY_LATEST_VERIFIED: string = GLOSSARY.reduce(
  (latest, g) => (g.lastVerified > latest ? g.lastVerified : latest),
  GLOSSARY[0]?.lastVerified ?? "2026-05-18",
);

// ---------------------------------------------------------------------------
// Backwards-compatibility exports from PR #32
// ---------------------------------------------------------------------------
//
// The thin slug-helper API shipped via PR #32 is consumed by main's MCP
// server (api/[transport]/route.ts) and the hub page (page.tsx). When
// this richer manifest landed via PR #33, those consumers stayed pinned
// to the original symbols. The functions below preserve them on top of
// the new manifest so neither side breaks.
//
// Drift safety: each function derives from this manifest's data; the
// runtime assertion at the bottom verifies that for every GLOSSARY row,
// glossaryTermSlug(row.term) === row.slug. If the manifest ever ships
// a hand-edited slug that disagrees with the deterministic kebab-case
// derivation, the assertion throws at module load.

/**
 * Deterministic kebab-case slug for a glossary term. Idempotent under
 * repeated application. Same algorithm PR #32 shipped, kept here so
 * callers that import this function (MCP server, hub page) see the
 * unchanged signature.
 *
 * Examples:
 *   "Hook"                 → "hook"
 *   "Big Domino"           → "big-domino"
 *   "Brunson Hard-Rule"    → "brunson-hard-rule"
 *   "Soap Opera Sequence"  → "soap-opera-sequence"
 */
export function glossaryTermSlug(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Typed-narrow lookup. Returns the canonical DEFINED_TERMS entry for a
 * slug, or `undefined` if the slug is unknown. Used by the MCP server
 * tool `get_glossary_term` and other thin consumers that only need
 * `{ term, definition }` and not the full GlossaryEntry.
 *
 * Brunson Hard-Rule: when the slug is unknown, return `undefined`.
 */
export function getDefinedTermBySlug(slug: string):
  | { term: string; definition: string }
  | undefined {
  const entry = BY_SLUG.get(slug);
  if (!entry) return undefined;
  return { term: entry.term, definition: entry.shortDefinition };
}

/**
 * Enumerated slug list, derived from this manifest. Same value as
 * GLOSSARY_SLUGS — kept under the PR-#32 name for the MCP catalog
 * tool `list_glossary_terms` and the hub page's generator loop.
 */
export const GLOSSARY_TERM_SLUGS: ReadonlyArray<string> = GLOSSARY_SLUGS;

/**
 * Absolute hash fragment for a term anchor on the hub page.
 * `glossaryTermAnchor("Big Domino")` → `"/glossary#big-domino"`. The
 * hub page renders one `<Card id="..."` per term; this helper is the
 * canonical reverse — handy for JSON-LD and MCP responses that name
 * the anchor without re-deriving it.
 */
export function glossaryTermAnchor(term: string): string {
  return `/glossary#${glossaryTermSlug(term)}`;
}

// Runtime drift check: every manifest slug MUST equal the deterministic
// kebab-case slug derived from its term. If a future edit hand-rolls a
// slug that disagrees with `glossaryTermSlug(term)`, the MCP tool
// `get_glossary_term` and the hub anchor would point at different
// fragments. Throwing here makes that drift impossible to ship.
for (const row of GLOSSARY) {
  const derived = glossaryTermSlug(row.term);
  if (derived !== row.slug) {
    throw new Error(
      `glossary.ts: row "${row.slug}" (term "${row.term}") drifts from ` +
        `glossaryTermSlug("${row.term}") = "${derived}". The MCP server, ` +
        `hub anchors, and detail-page slugs must agree.`,
    );
  }
}
