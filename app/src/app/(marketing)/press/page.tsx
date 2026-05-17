import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  PersonJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";

/**
 * Press / Media Kit.
 *
 * Why this page exists:
 *   This is the off-page lever that doesn't require us to publish anywhere
 *   else. A journalist, blogger, or podcaster who finds Unlock SaaS via any
 *   surface — Twitter DM, Indie Hackers comment, AI assistant — needs one URL
 *   that hands them every fact they would have asked us for in email: what
 *   the product is, who built it, what the price is, what the guarantee is,
 *   what we will and will not say, brand voice, and contact.
 *
 *   The cheaper we make that fetch, the more often coverage lands without a
 *   back-and-forth — and every public mention that resolves Unlock SaaS to a
 *   single canonical entity feeds Surface B (AEO/GEO) of the Google strategy.
 *
 * Voice: same Reluctant Hero register as /about and the founder VSL. No
 * inflated metrics. No fabricated coverage. No reviews. Brunson Hard-Rule
 * (honest claims): every claim on this page is verifiable by a third party
 * against strategy/state.json, the live Stripe price IDs, or a public DM with
 * the founder.
 *
 * Activation gate for the "Coverage" section: empty until earned mentions
 * exist (mirrors lib/media-mentions.ts MEDIA_MENTIONS = []). The structural
 * absence is the proof that nothing here is fabricated.
 *
 * Schema: PersonJsonLd + BreadcrumbListJsonLd. The /press URL is the
 * canonical place a journalist would link to when crediting the source — the
 * BreadcrumbList helps Google render breadcrumb sitelinks on the SERP for
 * "Unlock SaaS press kit" / "Unlock SaaS media" branded queries.
 */
export const metadata: Metadata = {
  title: "Press & Media Kit — Unlock SaaS",
  description:
    "Everything a journalist, blogger, or podcaster needs to write about Unlock SaaS in one URL: founder bio, brand fact sheet, story angles, embed-ready copy, and contact.",
  alternates: { canonical: "/press" },
  openGraph: {
    type: "website",
    title: "Press & Media Kit — Unlock SaaS",
    description:
      "Founder bio, brand fact sheet, story angles, embed-ready copy, and direct contact for coverage of Unlock SaaS.",
    url: "/press",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press & Media Kit — Unlock SaaS",
    description:
      "Founder bio, brand fact sheet, story angles, embed-ready copy, and contact.",
  },
  robots: { index: true, follow: true },
};

// Pure static surface. Rebuild whenever a brand fact changes; no per-request
// data, no auth gating, no cookies read.
export const dynamic = "force-static";

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Press", url: "https://unlocksaas.com/press" },
] as const;

// Brand fact sheet — single source of truth on this page. Every value here is
// reconciled with strategy/state.json. If any of these drift, fix this list
// FIRST, then update strategy and lib/media-mentions.ts as needed.
const FACT_SHEET: ReadonlyArray<{ label: string; value: string }> = [
  { label: "Legal name", value: "Unlock SaaS" },
  { label: "Domain", value: "unlocksaas.com" },
  { label: "Founder", value: "Maryan (solo)" },
  { label: "Founder background", value: "Marketer. Non-engineer." },
  { label: "Headquarters", value: "Remote. Solo operator." },
  { label: "Founded", value: "2026" },
  { label: "Category", value: "Indie SaaS go-to-market tool" },
  {
    label: "What it is",
    value:
      "A seven-step machine that turns an already-shipped SaaS into a verified paying customer in 60 days, or the founder does not pay.",
  },
  {
    label: "Who it's for",
    value:
      "Post-launch, pre-revenue, non-engineer founders who shipped a real product with AI tools (Lovable, Claude, Cursor) and are staring at a flat Stripe line.",
  },
  { label: "Starter price", value: "$1 one-time (not a trial)" },
  { label: "Core price", value: "$49/month" },
  {
    label: "Guarantee",
    value:
      "First paying customer in 60 days or $98 refunded, contingent on completing the in-product milestones the engine tracks.",
  },
  {
    label: "Verification method",
    value:
      "Stripe webhook on the founder's connected account. Not self-reported.",
  },
  { label: "Stack", value: "Next.js, Supabase, Stripe, Anthropic Claude, Resend, Vercel." },
];

// Story angles — concrete frames a writer can pick up. Each one is honest:
// the underlying claim is already true (or true at launch), not aspirational.
const STORY_ANGLES: ReadonlyArray<{ headline: string; pitch: string }> = [
  {
    headline:
      "The bottleneck moved: AI solved building, selling is the new wall.",
    pitch:
      "Lovable and Claude let non-engineers ship real SaaS in weeks. The flat-Stripe-line cohort that comes next is the largest, least-documented founder population of 2026. Unlock SaaS is the first product built explicitly for them.",
  },
  {
    headline:
      "A founder who refuses to be paid until you have your first customer.",
    pitch:
      "The guarantee is wired into the product, not a PDF. Sixty days, verified by Stripe webhook on the user's own account — no qualifying email chain, no clawback fight. If the engine does not produce a paying customer and the founder completed the in-product milestones, $98 goes back automatically.",
  },
  {
    headline:
      "The tool that mirrors your avoidance back at you.",
    pitch:
      "Most go-to-market tools assume the founder will do the work. Unlock SaaS assumes they will not — and pushes back with the founder's own answers from earlier steps. The result is a marketing tool that refuses to let you read about marketing.",
  },
  {
    headline:
      "Brunson's frameworks, applied to indie SaaS for the first time.",
    pitch:
      "DotCom Secrets, Expert Secrets, and Traffic Secrets were written for info products. Unlock SaaS is a working argument that the same Hook–Story–Offer, Value Ladder, and Attractive Character mechanics apply to a $49/mo Stripe subscription. Ten locked workbooks, public methodology.",
  },
  {
    headline:
      "Refund-as-product: a Stripe-verified guarantee on a self-serve tool.",
    pitch:
      "Most $49/mo tools cannot guarantee a result because the founder does not control whether the user does the work. Unlock SaaS solves it by moving the work inside the product — outreach, offer writing, and Dream 100 picking all happen in the engine, so the milestones are observable and the refund logic is deterministic.",
  },
];

// Embed-ready copy. The shortest version of the story, at four lengths.
// Journalists copy these verbatim more often than they paraphrase, so they
// must be exact, honest, and self-contained.
const EMBED_COPY: ReadonlyArray<{ label: string; copy: string }> = [
  {
    label: "One-line description (≤140 chars)",
    copy: "Unlock SaaS is a machine that turns an already-shipped SaaS into a paying customer in 60 days — or the founder doesn't pay.",
  },
  {
    label: "One-paragraph description",
    copy: "Unlock SaaS is a seven-step machine for post-launch, pre-revenue, non-engineer founders who shipped a real product with AI tools and are watching a flat Stripe line. It refuses to let them skip the work that actually gets them paid: name one real person, write one real promise, send one real message. If it does not produce a Stripe-verified paying customer in 60 days, the founder gets $98 back.",
  },
  {
    label: "Founder one-liner",
    copy: "Maryan is a marketer and non-engineer who shipped a dozen AI products that nobody paid for, then built Unlock SaaS to fix the work that was missing.",
  },
  {
    label: "Boilerplate (about Unlock SaaS)",
    copy: "Unlock SaaS is an indie SaaS go-to-market tool founded in 2026 by Maryan, a non-engineer marketer. The product is a Stripe-verified, refund-on-failure engine designed for the new cohort of founders who can now ship a SaaS in weeks with AI but cannot get their first paying customer. unlocksaas.com.",
  },
];

// What we will and won't claim. Publishing the "decline list" is itself a
// trust signal — and saves the writer from filing a claim we'll then have to
// publicly correct. Brunson Hard-Rule alignment is explicit.
const DECLINE_LIST: ReadonlyArray<string> = [
  "We do not claim a customer count, user count, or revenue figure. There is no number to print until the first verified-customer cycles publish on /builders.",
  "We do not claim media coverage that has not happened. The /press \"As seen in\" section stays empty until earned mentions exist.",
  "We do not claim testimonials, ratings, or reviews. The Product schema deliberately omits aggregateRating.",
  "We do not claim a team. Maryan is the only operator. Please don't pluralize \"we\" in coverage.",
  "We do not claim AI-generated revenue, AI-generated leads, or any \"X% lift\" without a published, dated, Stripe-verified case study to point at.",
];

// Brand-voice notes — the kind of thing a writer needs to capture the tone in
// a quote. These are descriptive, not prescriptive: the writer remains free
// to frame however they choose; this just removes ambiguity.
const VOICE_NOTES: ReadonlyArray<string> = [
  "Reluctant Hero archetype. The founder is not the guru on the mountain; he is the founder who got stuck, named it, and built the tool he wishes someone had handed him on day one of his flat line.",
  "First person, lowercase, plain English. Sentences end on the verb. No exclamation points outside of direct quotes.",
  "Concrete over abstract: \"Stripe refresh,\" \"flat line,\" \"twelve users, two paying.\" Never \"engagement,\" \"top-of-funnel,\" or \"customer acquisition cost.\"",
  "Honest about failure mode. The product is a refund-on-failure machine; writing should reflect that the failure case is named, priced, and paid out.",
];

export default function PressPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <PersonJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Unlock SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Press</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Press &amp; media kit
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Everything you need to write about Unlock SaaS, in one URL.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            If you&rsquo;re a journalist, blogger, podcaster, or YouTuber
            covering indie SaaS, AI-built products, or the post-launch
            pre-revenue founder problem &mdash; this page is the fact sheet.
            Quote anything on it verbatim. Email{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>{" "}
            for anything you cannot find here.
          </p>
        </header>

        <Separator className="my-8" />

        {/* FACT SHEET ------------------------------------------------------ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Brand fact sheet</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-x-6 gap-y-3 text-sm">
            {FACT_SHEET.map((row) => (
              <div
                key={row.label}
                className="contents border-b border-border/50"
              >
                <dt className="font-semibold text-foreground">{row.label}</dt>
                <dd className="text-muted-foreground leading-relaxed sm:pl-0">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <Separator className="my-8" />

        {/* FOUNDER BIO ---------------------------------------------------- */}
        <section className="mb-12 space-y-4 text-base leading-relaxed text-muted-foreground">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            About the founder
          </h2>
          <p>
            Maryan is a marketer and non-engineer who built a dozen AI products
            with Lovable and Claude, watched every one of them flatline in
            Stripe, then sat with ten other founders and heard his own story
            back. He built Unlock SaaS to do, on himself first, the work that
            had broken every prior launch: name one person, write one promise,
            send one real message.
          </p>
          <p>
            He runs the company alone. He answers email at{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
            . There is no PR firm, no agency, no marketing team.
          </p>
          <p>
            Long-form founder origin:{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /about
            </Link>
            . Founder voice in five short stories:{" "}
            <Link
              href="/parables"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /parables
            </Link>
            .
          </p>
        </section>

        <Separator className="my-8" />

        {/* STORY ANGLES --------------------------------------------------- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Story angles</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Five frames a writer can pick up directly. Each one corresponds to
            a working decision that has shipped, not a roadmap claim.
          </p>
          <ol className="space-y-6 list-decimal list-inside">
            {STORY_ANGLES.map((angle) => (
              <li key={angle.headline} className="pl-2">
                <h3 className="inline font-semibold text-foreground">
                  {angle.headline}
                </h3>
                <p className="mt-2 ml-6 text-sm text-muted-foreground leading-relaxed">
                  {angle.pitch}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <Separator className="my-8" />

        {/* EMBED-READY COPY ----------------------------------------------- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">Embed-ready copy</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Quote these verbatim. They&rsquo;re written to land cleanly inside
            a roundup, a newsletter, or a CMS without further editing.
          </p>
          <ul className="space-y-6">
            {EMBED_COPY.map((entry) => (
              <li
                key={entry.label}
                className="rounded-md border border-border/60 bg-card/40 p-5"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {entry.label}
                </p>
                <p className="text-base leading-relaxed">{entry.copy}</p>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        {/* VOICE NOTES ---------------------------------------------------- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">How to write about us</h2>
          <ul className="space-y-3 list-disc list-inside text-sm text-muted-foreground leading-relaxed">
            {VOICE_NOTES.map((note) => (
              <li key={note} className="pl-2">
                {note}
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        {/* DECLINE LIST --------------------------------------------------- */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-5">
            What we will not claim
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Honest negative space. If you see one of these claims attached to
            Unlock SaaS anywhere, it did not come from us &mdash; please
            don&rsquo;t print it.
          </p>
          <ul className="space-y-3 list-disc list-inside text-sm text-muted-foreground leading-relaxed">
            {DECLINE_LIST.map((line) => (
              <li key={line} className="pl-2">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        {/* BRAND ASSETS --------------------------------------------------- */}
        <section className="mb-12 space-y-4 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Brand assets
          </h2>
          <p>
            Wordmark, founder photo, and screenshots of the live product are
            available on direct request to{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
            . Reply turnaround is the same day.
          </p>
          <p>
            Pending an on-origin asset folder, the canonical brand name in
            print is <strong>Unlock SaaS</strong> (two words, capital U,
            capital S, capital S). Not &ldquo;UnlockSaaS&rdquo;, not
            &ldquo;unlocksaas&rdquo;, not &ldquo;Unlock-SaaS&rdquo;. The
            domain (unlocksaas.com) is the only place the name appears
            collapsed.
          </p>
          <p>
            The social-share preview rendered by the homepage and most
            marketing routes is the canonical visual identity until a
            standalone press logo ships &mdash; see{" "}
            <a
              href="https://unlocksaas.com/opengraph-image"
              className="underline underline-offset-4 hover:text-foreground"
            >
              opengraph-image
            </a>
            .
          </p>
        </section>

        <Separator className="my-8" />

        {/* COVERAGE (activation-gated) ------------------------------------ */}
        <section className="mb-12 space-y-3 text-sm text-muted-foreground leading-relaxed">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            As seen in
          </h2>
          <p>
            Nothing yet. This section will populate from{" "}
            <code className="text-xs">lib/media-mentions.ts</code> once earned
            coverage exists. The empty state is intentional &mdash; the same
            Brunson Hard-Rule that keeps fabricated review counts out of the
            Product schema keeps invented logos out of this row.
          </p>
        </section>

        <Separator className="my-8" />

        {/* CONTACT -------------------------------------------------------- */}
        <section className="mb-12 space-y-3 text-base leading-relaxed">
          <h2 className="text-2xl font-bold mb-2">Press contact</h2>
          <p>
            <strong>Maryan</strong>, Founder &mdash;{" "}
            <a
              href="mailto:maryan@unlocksaas.com"
              className="underline underline-offset-4 hover:text-foreground"
            >
              maryan@unlocksaas.com
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            One inbox, one human, same-day replies. If you have a deadline,
            put it in the subject line and I will prioritize accordingly. If
            you want a 15-minute on-record call, name three times in the next
            48 hours and I will pick one.
          </p>
        </section>

        <div className="mt-12 text-xs text-muted-foreground">
          <p>
            More from us:{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              About
            </Link>{" "}
            ·{" "}
            <Link
              href="/parables"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Five Parables
            </Link>{" "}
            ·{" "}
            <Link
              href="/machine-sales"
              className="underline underline-offset-4 hover:text-foreground"
            >
              The Machine
            </Link>{" "}
            ·{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Contact
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
