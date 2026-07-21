import { Suspense } from "react";
import dynamic from "next/dynamic";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { FunnelHubViewedTracker } from "@/components/analytics/funnel-hub-viewed-tracker";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { getIdentityLabels, readIdentityFromCookies } from "@/lib/ab";
import {
  getHeroVariant,
  readSourceFromCookies,
} from "@/lib/acquisition-source";
import { TopTagline } from "@/components/blocks/top-tagline";
import { Hero } from "@/components/blocks/hero";
import { BigDomino } from "@/components/blocks/big-domino";
import { SecretFormula } from "@/components/blocks/secret-formula";
import { ValueLadder } from "@/components/blocks/value-ladder";
import { TldrBlock } from "@/components/tldr-block";
import { SocialProofBar } from "@/components/blocks/social-proof-bar";
import { BeforeAfter } from "@/components/blocks/before-after";
import { HonestTestimonials } from "@/components/blocks/honest-testimonials";
import { VslBlock } from "@/components/blocks/vsl-block";
import { MediaBar } from "@/components/blocks/media-bar";
import { AvatarWall } from "@/components/blocks/avatar-wall";
import { StackSlide } from "@/components/blocks/stack-slide";
import { GuaranteeHero } from "@/components/blocks/guarantee-hero";
import { FoundingBuilder } from "@/components/blocks/founding-builder";
import { FinalCta } from "@/components/blocks/final-cta";
import { SignatureFooter } from "@/components/blocks/signature-footer";

// Dynamic imports for below-fold sections — these components are at the
// bottom of the funnel hub (below all persuasion sections) and don't need
// to block the initial RSC payload. They are streamed in lazily after the
// above-fold content renders. Page weight optimization 2026-07-21: saves
// ~8KB from the initial RSC flight payload.
const LazyStickyCta = dynamic(() =>
  import("@/components/blocks/sticky-cta").then((m) => ({ default: m.StickyCta }))
);
const LazyExitIntentPopup = dynamic(() =>
  import("@/components/exit-intent-popup").then((m) => ({ default: m.ExitIntentPopup }))
);
// Default Hero variant copy deck — used as fallback when the source cookie
// Suspense boundary hasn't resolved yet. Imported from the same source the
// server-side readSourceFromCookies resolves to, so the initial render
// matches the post-Suspense render for identical traffic.
import { HERO_VARIANTS } from "@/lib/acquisition-source";
const DEFAULT_HERO_VARIANT = HERO_VARIANTS["default"];
import { HOMEPAGE_FAQS } from "@/lib/faqs";
import {
  FounderVslAudioJsonLd,
  SoftwareApplicationJsonLd,
} from "@/components/seo/json-ld";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { loadPublicBadgeCount } from "@/lib/builder-badge";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";

/**
 * UnlockSaaS Funnel Hub — Perfect Webinar arc.
 *
 * Section order follows Brunson Expert Secrets §2 (emotion before logic) +
 * DotCom Secrets §2 Hook/Story/Offer + Funnel Hacker's Cookbook v1
 * (strategy/funnel-hackers-cookbook.md). Reordered 2026-05-17 so the page
 * runs EMOTIONAL → SCARCITY → LOGIC, with the free diagnostic as the primary
 * conversion target on every CTA surface.
 *
 *   0. Top Tagline       — one-line emotional promise + founding-rate cue
 *                          ABOVE the hero (Brunson "one line at the top").
 *   1. Hook              — promise + polarity move in <3 seconds. Primary
 *                          CTA is the free diagnostic; 5 emails demoted to
 *                          subscribe link.
 *   2. Big Domino        — the one claim the page must prove.
 *   3. Proof Bar         — structural credibility (refund-by-code + scar).
 *   4. Media Bar         — earned mentions, auto-renders at ≥3.
 *
 *   --- EMOTIONAL ARC (story / mirror) ---
 *
 *   5. Mirror Moment     — Honest testimonials. Visitor recognizes their
 *                          own pain in real founders' own words.
 *   6. Founder VSL       — origin story in the founder's voice.
 *   7. Manifesto         — A/B identity label (Verified / Paid Builders).
 *   8. Timeline          — receipts that the story is real.
 *   9. Before / After    — the transformation made concrete.
 *
 *   --- SCARCITY (the bridge from emotion to logic) ---
 *
 *  10. Founding Builder  — honest scarcity moved EARLIER so the visitor
 *                          sees the urgency before the longer logical
 *                          section. Three real levers, no fake countdown.
 *
 *   --- LOGIC (the proof and the offer) ---
 *
 *  11. Comparison        — anti-secrets (what they tried that did not work).
 *  12. Stack Slide       — the offer reveal + anchored price ($4,900 → $49).
 *  13. Guarantee Hero    — the polarity move with refund conditions.
 *  14. Avatar Wall       — Verified Builder proof (renders at ≥9).
 *  15. FAQ               — objection handling from dollar-objections.
 *  16. Newsletter tail   — small subscribe block for the visitor who is
 *                          still not ready to paste a URL.
 *  17. Final CTA         — three doors one more time (close before close).
 *  18. Explore resources — collapsed link hub AFTER the close (2026-07-14
 *                          audit: 20+ exit links must not interrupt the arc).
 *  19. Signature footer  — Maryan signature (Cookbook Swipe 4).
 *  20. Sticky CTA        — always-visible offer bar below the hero.
 *  21. Exit-intent popup — last-chance diagnostic + newsletter offer.
 */
async function getVerifiedBadgeCount(): Promise<number> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("verified-builder-count");
  if (!hasSupabaseAdminConfig()) return 0;

  return loadPublicBadgeCount(createAdminClient());
}

// ---------------------------------------------------------------------------
// Static cached sections — fully deterministic JSX, no cookies/headers/auth.
// Each gets 'use cache' + cacheLife('days') so they are prerendered into the
// static shell and bypass Vercel function invocations on repeated visits.
// cacheLife('days'): revalidate=1day, expire=1week — appropriate for
// marketing copy that changes at most a few times per week.
// ---------------------------------------------------------------------------

/**
 * Explore Resources — internal linking hub section (2026-07-06 audit).
 *
 * SEO purpose: distributes PageRank from the homepage (strongest page) to
 * 20+ high-value pSEO hubs. Before this section, those hubs were reachable
 * only via footer links and sitemap. Now they are one click from home.
 *
 * Funnel demotion (2026-07-14 conversion audit): the homepage was carrying
 * 70 anchors / 42 unique exit destinations — a website, not a funnel. This
 * section is the biggest offender (20+ exits mid-persuasion-arc), so it now
 * (a) renders BELOW the Final CTA, after the close, and (b) collapses into
 * a closed-by-default <details> block. The links stay in the DOM (Google
 * renders <details> content and passes PageRank); the visitor scrolling the
 * persuasion arc never sees 20 open doors before the offer.
 *
 * Categories mirror the visitor journey:
 *   - Learn: glossary, benchmarks, teardowns, case studies
 *   - Compare: alternatives, head-to-head, pricing teardowns
 *   - Tools: free calculators (editorial backlink bait)
 *   - Guides: how-to, mistakes, launch checklists
 */
async function ExploreResources() {
  "use cache";
  cacheLife("days");

  const categories = [
    {
      title: "Learn the framework",
      links: [
        { href: "/glossary", label: "SaaS Marketing Glossary", desc: "Every term defined" },
        { href: "/benchmarks", label: "SaaS Benchmarks", desc: "Real metrics from real SaaS" },
        { href: "/funnel-teardown", label: "Funnel Teardowns", desc: "How indie SaaS funnels work" },
        { href: "/case-studies", label: "First-Customer Stories", desc: "How founders got to $1" },
      ],
    },
    {
      title: "Compare tools",
      links: [
        { href: "/alternatives-to", label: "SaaS Alternatives", desc: "Honest tool comparisons" },
        { href: "/compare", label: "Head-to-Head", desc: "A vs B breakdowns" },
        { href: "/pricing-teardown", label: "Pricing Teardowns", desc: "How SaaS prices itself" },
        { href: "/vs", label: "Versus", desc: "Direct competitor analysis" },
      ],
    },
    {
      title: "Free tools",
      links: [
        { href: "/tools", label: "SaaS Calculators", desc: "5 free calculators, no email" },
        { href: "/tools/ltv-calculator", label: "LTV Calculator", desc: "Lifetime value" },
        { href: "/tools/churn-cost-calculator", label: "Churn Cost", desc: "What churn really costs" },
        { href: "/tools/revenue-projector", label: "Revenue Projector", desc: "12-month forecast" },
      ],
    },
    {
      title: "Guides & playbooks",
      links: [
        { href: "/how-to", label: "How-To Guides", desc: "Step-by-step founder playbooks" },
        { href: "/mistakes", label: "Common Mistakes", desc: "What kills indie SaaS" },
        { href: "/launch-checklist", label: "Launch Checklists", desc: "Pre-launch, launch, post-launch" },
        { href: "/answers", label: "Founder Q&A", desc: "Real questions, real answers" },
      ],
    },
    {
      title: "Distribution & traffic",
      links: [
        { href: "/who", label: "Who We Serve", desc: "The dream customer avatar" },
        { href: "/dream-100", label: "Dream 100", desc: "27 people to reach in 2026" },
        { href: "/community-atlas", label: "Community Atlas", desc: "18 communities where they hang out" },
        { href: "/hso", label: "HSO Matrix", desc: "8 ready-to-deploy content units" },
        { href: "/ad-library", label: "Ad Creative Library", desc: "9 paid distribution concepts" },
      ],
    },
  ];

  return (
    <section className="py-10 sm:py-14 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Closed by default: one quiet summary line instead of 20 open exit
          doors. The full link grid stays in the server-rendered DOM. */}
      <details className="group rounded-lg border border-border bg-card">
        <summary className="cursor-pointer list-none px-5 py-4 text-center [&::-webkit-details-marker]:hidden">
          <span className="text-sm font-semibold text-foreground">
            Explore 200+ free resources
          </span>
          <span className="block text-xs text-muted-foreground mt-1">
            Teardowns, benchmarks, and guides — no email gate, no paywall.
            <span aria-hidden="true" className="ml-1 inline-block transition-transform group-open:rotate-180">
              ↓
            </span>
          </span>
        </summary>
        <div className="px-5 pb-6 pt-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.title}>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {cat.title}
              </h3>
              <ul className="space-y-2">
                {cat.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group/link block rounded-lg border border-border bg-card p-3 card-hover hover:border-primary/40 hover:bg-accent/50 hover:shadow-md"
                    >
                      <span className="block text-sm font-medium text-foreground group-hover/link:text-primary transition-colors">
                        {link.label}
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {link.desc}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}

async function ManifestoSection({ manifestoTitle }: { manifestoTitle: string }) {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="text-center mb-7 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          The Movement
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          {manifestoTitle}
        </h2>
      </div>
      <TldrBlock>
        We stopped pretending the product was the problem. The missing piece
        was naming one real person and making one real promise before we were
        ready to sell it.
      </TldrBlock>
      <p className="text-sm text-muted-foreground leading-relaxed mb-5">
        Post-launch founders who built real products with AI tools, watched them flatline in Stripe, and refused to call it a product problem. We measure progress in Stripe charges, not in encouragement. The work nobody taught us to do -- name one real person, make one real promise, sell it before it felt ready -- is what this movement runs on.
      </p>
      <blockquote className="text-muted-foreground space-y-4 leading-relaxed">
        <p>
          We are non-engineer founders who shipped real things with AI tools
          we did not write.
        </p>
        <p>
          We were told the answer was more building, then more traffic, then
          a better course. We tried all three. The line stayed flat.
        </p>
        <p>
          We stopped pretending the problem was the product. The problem was
          the work nobody taught us to do:{" "}
          <strong className="text-foreground font-semibold">
            name one real person, make one real promise, sell it before it
            felt ready.
          </strong>
        </p>
        <p>
          We do not collect praise.{" "}
          <strong className="text-foreground font-semibold">
            We collect customers.
          </strong>{" "}
          No encouragement count. No traction-porn. Only Stripe charges.
        </p>
        <p>
          <strong className="text-foreground font-semibold">
            This is not a self-improvement group. This is a shipping movement.
          </strong>
        </p>
      </blockquote>
    </section>
  );
}

async function TimelineSection() {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="text-center mb-10 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Receipts
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          How a flat Stripe line became this page.
        </h2>
      </div>
      <TldrBlock>
        Five shipped products, three years of learning traffic tactics, one year
        of sitting with founders, and one code-locked system that removes
        avoidance.
      </TldrBlock>
      <ol className="space-y-5 sm:space-y-4">
        {[
          {
            date: "2025, summer",
            line:
              "First AI product shipped with Lovable. Stripe stayed at zero. Told myself it was the product.",
          },
          {
            date: "2025, autumn",
            line:
              "Three more products shipped. Two paying users across all four. Started a deep dive into SEO so I would not have to look at the line.",
          },
          {
            date: "2026, winter",
            line:
              "Sat down to write the offer for the fifth product. Found nothing. No promise. No specific person.",
          },
          {
            date: "2026, spring",
            line:
              "Ran ten founder conversations. Heard my own story back, every time. Stopped fixing products. Started fixing the order.",
          },
          {
            date: "2026, May",
            line:
              "Locked the Brunson workbook chain end-to-end. Shipped this funnel.",
          },
        ].map((row) => (
          <li
            key={row.date}
            className="flex flex-col sm:flex-row gap-1 sm:gap-4"
          >
            <div className="shrink-0 sm:w-32 text-xs uppercase tracking-widest text-muted-foreground sm:pt-1">
              {row.date}
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed">
              {row.line}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

async function ComparisonSection() {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto">
      <div className="text-center mb-10 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          What you have been trying
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          None of these remove the one thing that keeps the line flat.
        </h2>
      </div>
      <TldrBlock>
        Courses teach. Consultants understand. Tools assume you did the work
        already. The Playbook removes the avoidance option – outreach happens
        inside the software, not on your willpower.
      </TldrBlock>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-foreground">
            <tr>
              <th className="text-left p-3 font-semibold">Approach</th>
              <th className="text-left p-3 font-semibold">Cost</th>
              <th className="text-left p-3 font-semibold">Guarantee</th>
              <th className="text-left p-3 font-semibold">
                Removes avoidance?
              </th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-t border-border">
              <td className="p-3">Doing nothing</td>
              <td className="p-3">Free</td>
              <td className="p-3">None</td>
              <td className="p-3">No — avoidance is the default state</td>
            </tr>
            <tr className="border-t border-border">
              <td className="p-3">Course / cohort</td>
              <td className="p-3">$497–$2,000</td>
              <td className="p-3">Refund-policy theatre</td>
              <td className="p-3">No — teaching, not doing</td>
            </tr>
            <tr className="border-t border-border">
              <td className="p-3">Hire a consultant</td>
              <td className="p-3">$3,000+</td>
              <td className="p-3">Hourly</td>
              <td className="p-3">No — outsourced understanding</td>
            </tr>
            <tr className="border-t border-border">
              <td className="p-3">Generic funnel/AI tool</td>
              <td className="p-3">$29–$99/mo</td>
              <td className="p-3">Trial only</td>
              <td className="p-3">No — assumes you already did the work</td>
            </tr>
            <tr className="border-t border-border bg-primary/5">
              <td className="p-3 font-semibold text-foreground">
                The Playbook
              </td>
              <td className="p-3 font-semibold text-foreground">$49/mo</td>
              <td className="p-3 font-semibold text-foreground">
                Stripe-verified, code-enforced
              </td>
              <td className="p-3 font-semibold text-foreground">
                Yes — outreach happens inside the tool
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground italic text-center mt-4">
        The comparison is honest. Every other approach has a place. None of
        them remove the avoidance, which is the actual disease.
      </p>
    </section>
  );
}

async function FaqSection() {
  "use cache";
  cacheLife("days");
  return (
    <section className="py-14 sm:py-20 px-4 sm:px-6 max-w-2xl mx-auto">
      <div className="text-center mb-8 reveal">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Honest objections
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold leading-tight text-balance">
          What founders push back on — answered straight.
        </h2>
        <TldrBlock>
          Real doubts from real founders. Every objection below came from
          Indie Hackers or Hacker News threads written by someone exactly like
          you.
        </TldrBlock>
        <p className="text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
          Mined from public Indie Hackers and Hacker News threads written by
          founders matching the indie-founder profile. Full sources:{" "}
          <code className="text-xs">strategy/dollar-objections.md</code>.
        </p>
      </div>
      <div className="space-y-6">
        {HOMEPAGE_FAQS.map((item) => (
          <div key={item.q} className="group rounded-lg border border-border bg-card p-5 card-hover hover:border-primary/30 hover:shadow-md">
            <p className="font-semibold">{item.q}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">
              {item.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

async function NewsletterTailSection() {
  "use cache";
  cacheLife("days");
  return (
    <section
      id="newsletter-tail"
      className="py-12 sm:py-16 px-4 sm:px-6 max-w-md mx-auto text-center scroll-mt-24"
    >
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
        Not ready to paste a URL?
      </p>
      <h2 className="text-lg sm:text-xl font-bold mb-3 leading-tight text-balance">
        Get the 5-email arc instead.
      </h2>
      <TldrBlock>
        Five letters in five days from one founder who lived your year and
        built the way out. No sales pitch. Just answers to the questions every
        flat-line founder asks.
      </TldrBlock>
      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
        One short letter a day for five days. Written like one founder to
        another, not a marketing sequence. By Friday you will know whether
        the Playbook is the right answer for you.
      </p>
      <div className="text-left">
        <NewsletterSignup
          variant="stacked"
          source="midpage_tail"
          ctaLabel="Subscribe to the newsletter"
        />
      </div>
      <p className="text-xs text-muted-foreground italic mt-5">
        Or{" "}
        <Link
          href="/diagnostic"
          className="underline underline-offset-4 hover:text-foreground transition-colors"
        >
          skip the letters and run the free diagnostic
        </Link>
        .
      </p>
    </section>
  );
}

// ---------------------------------------------------------------------------
// STREAMED SECTION WRAPPERS
// Each of these wraps a group of sections that can render independently.
// They are extracted so the Suspense boundaries in FunnelHubBody stream
// each group as its data resolves, instead of blocking on all async.
// ---------------------------------------------------------------------------

/**
 * HeroSection — the above-fold LCP content. Renders immediately with a
 * default Hero variant; the source-aware variant streams in via Suspense.
 * The TopTagline is 100% static JSX (no cookies, no async) so it ships
 * in the initial RSC payload without even a Suspense wrapper.
 */
async function HeroSection() {
  // Read source cookie for source-aware Hero copy.
  // If this suspend takes too long, the Suspense fallback renders the
  // default Hero (static fallback with default variant).
  const sourceVariant = getHeroVariant(await readSourceFromCookies());
  return <Hero variant={sourceVariant} />;
}

/**
 * CookieVariantSection — identity cookie (A/B labels) + Supabase badge count.
 * Separated from HeroSection because neither blocks the LCP.
 */
async function CookieVariantSection() {
  const variant = await readIdentityFromCookies();
  const labels = getIdentityLabels(variant);

  // Stripe-verified Verified Builder count. Timeout-guarded: Supabase
  // cold-starts can exceed 10s. Fall back to 0 on timeout so the page
  // renders immediately.
  let verifiedBadgeCount = 0;
  try {
    verifiedBadgeCount = await Promise.race([
      getVerifiedBadgeCount(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 5000))
    ]) as number;
  } catch {
    verifiedBadgeCount = 0;
  }

  return (
    <>
      <SocialProofBar verifiedCount={verifiedBadgeCount} />
      {/* Manifesto section — rendered here because the title is
          A/B variant-specific. The cached body handles the keying. */}
      <Separator className="max-w-4xl mx-auto" />
      <ManifestoSection manifestoTitle={labels.manifestoTitle} />
    </>
  );
}

/**
 * EmotionalArc — sections 5-9 (emotional persuasion + founder story).
 * No async dependencies — all static/cached JSX. Renders inline so
 * it ships in the same RSC chunk as the hero, just after the first
 * Suspense boundary.
 */
function EmotionalArc() {
  return (
    <>
      <Separator className="max-w-4xl mx-auto" />
      <VslBlock />
      <Separator className="max-w-4xl mx-auto" />
      <TimelineSection />
      <Separator className="max-w-4xl mx-auto" />
      <BeforeAfter />
    </>
  );
}

/**
 * ScarcityBridge — the scarcity-to-logic transition.
 */
function ScarcityBridge() {
  return (
    <>
      <Separator className="max-w-4xl mx-auto" />
      <FoundingBuilder tone="full" />
    </>
  );
}

/**
 * LogicalArc — sections 11-15 (proof, offer, FAQs, newsletter tail).
 */
function LogicalArc() {
  return (
    <>
      <Separator className="max-w-4xl mx-auto" />
      <StackSlide />
      <Separator className="max-w-4xl mx-auto" />
      <ValueLadder />
      <Separator className="max-w-4xl mx-auto" />
      <GuaranteeHero />
      <Separator className="max-w-4xl mx-auto" />
      <FaqSection />
      <Separator className="max-w-4xl mx-auto" />
      <NewsletterTailSection />
    </>
  );
}

// ===========================================================================
// EXPORTED PAGE COMPONENT
// ===========================================================================

export default function FunnelHub() {
  return (
    <>
      {/* Nested Suspense for PostHog pageview (must have its own) */}
      <Suspense fallback={null}>
        <FunnelHubViewTrackerWrapper />
      </Suspense>

      {/* ===== INLINE (no Suspense = ships immediately) ===== */}
      {/* TopTagline — 100% static JSX, zero async deps, zero cookies.
          Ships in the initial HTML response, before any Suspense fallback. */}
      <TopTagline />

      <div className="min-h-screen flex flex-col">
        {/* ===== SUSPENSE 1: Hero + JSON-LD + beacon =====
            Hero reads the source cookie async. While it suspends, the
            fallback renders the default Hero variant (static, no cookie).
            This guarantees the LCP element renders within the first RSC
            chunk — no cookie delay blocks the hero. */}
        <Suspense fallback={<Hero variant={DEFAULT_HERO_VARIANT} />}>
          <SoftwareApplicationJsonLd />
          <BreadcrumbListJsonLd
            trail={[
              { name: "Unlock SaaS", url: "https://unlocksaas.com" },
            ]}
          />
          <FounderVslAudioJsonLd />
          <AbExposureBeacon />
          <FunnelHubViewedTracker />
          <HeroSection />
        </Suspense>

        {/* ===== INLINE (second LCP chunk) ===== */}
        <BigDomino />
        <Separator className="max-w-4xl mx-auto" />
        <SecretFormula />

        {/* ===== SUSPENSE 2: Social proof bar + A/B variant section =====
            Reads identity cookie + Supabase badge count. While suspended,
            the proof bar renders with fallback count 0. */}
        <Suspense fallback={<SocialProofBar verifiedCount={0} />}>
          <CookieVariantSection />
        </Suspense>

        {/* ===== INLINE: Media bar + Mirror moment ===== */}
        <MediaBar />
        <Separator className="max-w-4xl mx-auto" />
        <HonestTestimonials />
        <Suspense fallback={null}>
          <AvatarWall />
        </Suspense>

        {/* ===== INLINE: Emotional Arc ===== */}
        <EmotionalArc />

        {/* ===== INLINE: Scarcity Bridge ===== */}
        <ScarcityBridge />

        {/* ===== INLINE: Anti-secrets comparison ===== */}
        <ComparisonSection />

        {/* ===== INLINE: Logical Arc ===== */}
        <LogicalArc />

        {/* ===== INLINE: Final CTA ===== */}
        <Separator className="max-w-4xl mx-auto" />
        <FinalCta />

        {/* ===== INLINE: Explore Resources (cached, static) ===== */}
        <ExploreResources />

        {/* ===== INLINE: Signature Footer ===== */}
        <SignatureFooter />

        {/* ===== DYNAMIC IMPORTS: Below-fold non-critical components =====
            These use next/dynamic with ssr:true (default) so they never
            block the initial RSC payload. The sticky CTA and exit-intent
            popup are the last elements before </body>. */}
        <LazyStickyCta />
        <LazyExitIntentPopup />
      </div>
    </>
  );
}

/**
 * Small wrapper that isolates the FunnelHubViewedTracker inside its own
 * Suspense boundary so it doesn't block anything.
 */
async function FunnelHubViewTrackerWrapper() {
  return <FunnelHubViewedTracker />;
}
