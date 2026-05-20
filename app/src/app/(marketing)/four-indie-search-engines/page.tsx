import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import {
  FOUR_INDIE_EYEBROW,
  FOUR_INDIE_LAST_REVIEWED_AT,
  FOUR_INDIE_LEDE,
  FOUR_INDIE_MARGINALIA_PR_URL,
  FOUR_INDIE_MERGE_SHA,
  FOUR_INDIE_PATH,
  FOUR_INDIE_PR_URL,
  FOUR_INDIE_PUBLISHED_AT,
  FOUR_INDIE_SECTIONS,
  FOUR_INDIE_SUBHEAD,
  FOUR_INDIE_TITLE,
  FOUR_INDIE_URL,
  FOUR_INDIE_WORD_COUNT,
} from "@/lib/four-indie-search-engines";

/**
 * /four-indie-search-engines – companion essay for the indie-search
 * allow-list ship of 21-05-2026.
 *
 * Why this page exists
 * --------------------
 * Brunson "turn the technical artifact into the marketing" play. The
 * robots.txt allow-list shipped in PR #57 (merge `506325e`) is plumbing;
 * the leverage is THIS public companion piece that explains the
 * counter-intuitive decision in the founder's voice. By any share-axis
 * sheet, four engines under 1% each are a waste of an afternoon. By
 * buyer-density math they are exactly the right afternoon, because the
 * people who deliberately choose Mojeek / Brave / Marginalia / Kagi are
 * the UnlockSaaS ICP at the highest density of any search surface.
 *
 * Surface choices, all mirrored from /dont-buy-unlock-saas
 *   - One-off marketing route under (marketing) – shareable editorial
 *     shape, not a pSEO slug surface.
 *   - Article + BreadcrumbList JSON-LD so AI Overviews / Perplexity /
 *     Claude / GPT-search resolve as authored, dated, speakable prose.
 *   - Per-route OG card – this page is built for X / LinkedIn / Bluesky
 *     / Indie Hackers / Show HN share, same launch pack as /dont-buy.
 *   - data-speakable opt-ins on lede + each section body so voice
 *     engines read the prose, never the nav or footer.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every artifact reference (PR #57, merge SHA, Marginalia PR #553)
 *     resolves to a live public URL. No fabricated proof.
 *   - "Combined market share maybe three percent on a generous day"
 *     hedges the upper bound; the lower bound is acknowledged in the
 *     lede ("rounding error") so the prose carries the uncertainty
 *     instead of overclaiming.
 *   - Honest gaps are named verbatim (Kagi Small Web ineligibility,
 *     Mojeek no-API, Brave manual-form follow-up). Same posture as
 *     strategy/indie-search-submission-playbook.md.
 *
 * Performance
 *   - FOUR_INDIE_SECTIONS / FOUR_INDIE_LEDE / FOUR_INDIE_WORD_COUNT
 *     hoisted to module scope in src/lib/four-indie-search-engines.ts
 *     (rendering-hoist-jsx + server-hoist-static-io). No per-request
 *     data, no runtime APIs. force-static is the rendering shape.
 */

const PAGE_DESCRIPTION =
  "On 21-05-2026 I shipped UnlockSaaS to four search engines with under 1 percent market share each. By share-axis math that was a waste of an afternoon. By buyer-density math it was the smartest distribution move of the quarter. Signed by the founder.";

export const metadata: Metadata = {
  title: `${FOUR_INDIE_TITLE} — Unlock SaaS`,
  description: PAGE_DESCRIPTION,
  alternates: markdownAlternate(FOUR_INDIE_PATH, `${FOUR_INDIE_PATH}.md`),
  openGraph: {
    type: "article",
    title: FOUR_INDIE_TITLE,
    description: PAGE_DESCRIPTION,
    url: FOUR_INDIE_PATH,
    publishedTime: FOUR_INDIE_PUBLISHED_AT,
    modifiedTime: FOUR_INDIE_LAST_REVIEWED_AT,
    authors: ["Maryan"],
  },
  twitter: {
    // summary_large_image: this page is built for X / Bluesky / LinkedIn
    // share — small-card thumbnail would crop the counter-intuitive
    // headline to ~144px and lose the scroll-stop. Same call as the
    // /dont-buy-unlock-saas OG twin.
    card: "summary_large_image",
    title: FOUR_INDIE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: FOUR_INDIE_TITLE, url: FOUR_INDIE_URL },
] as const;

export default function FourIndieSearchEnginesPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />
      {/*
        Article schema: authored, dated, speakable. Same shape the rest
        of the long-form editorial fleet (/stories, /dont-buy-unlock-saas)
        carries. SPEAKABLE_SPEC default targets `[data-speakable]` opt-ins
        below, so voice engines read the lede + each section body and
        skip the nav / breadcrumb / footer.

        wordCount declared honestly from the prose hoisted in
        src/lib/four-indie-search-engines.ts so the schema's claim about
        editorial depth cannot drift from the rendered text.
      */}
      <ArticleJsonLd
        headline={FOUR_INDIE_TITLE}
        description={PAGE_DESCRIPTION}
        url={FOUR_INDIE_URL}
        datePublished={FOUR_INDIE_PUBLISHED_AT}
        dateModified={FOUR_INDIE_LAST_REVIEWED_AT}
        wordCount={FOUR_INDIE_WORD_COUNT}
        articleSection="Distribution"
        keywords={[
          "indie search engines",
          "Brave Search",
          "Mojeek",
          "Marginalia",
          "Kagi",
          "buyer density",
          "indie SaaS distribution",
          "post-launch pre-revenue founder",
          "Brunson Dream 100",
          "founder marketing",
        ]}
        about={[
          { name: "Unlock SaaS", sameAs: "https://unlocksaas.com/" },
          { name: "Brave Search", sameAs: "https://search.brave.com/" },
          { name: "Mojeek", sameAs: "https://www.mojeek.com/" },
          {
            name: "Marginalia Search",
            sameAs: "https://about.marginalia-search.com/",
          },
          { name: "Kagi", sameAs: "https://kagi.com/" },
        ]}
      />

      <article className="max-w-2xl mx-auto">
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
          <span>{FOUR_INDIE_EYEBROW}</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {FOUR_INDIE_EYEBROW}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {FOUR_INDIE_TITLE}.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed italic mb-4">
            {FOUR_INDIE_SUBHEAD}
          </p>
          <p
            data-speakable="lede"
            className="text-base leading-relaxed"
          >
            {FOUR_INDIE_LEDE}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Published{" "}
            <time dateTime={FOUR_INDIE_PUBLISHED_AT}>
              {FOUR_INDIE_PUBLISHED_AT}
            </time>
            . Last reviewed{" "}
            <time dateTime={FOUR_INDIE_LAST_REVIEWED_AT}>
              {FOUR_INDIE_LAST_REVIEWED_AT}
            </time>
            .
          </p>
        </header>

        <Separator className="my-10" />

        {/*
          One <section> per H2 of the essay. Each section opts into the
          speakable spec via data-speakable so voice engines read the
          body prose, never the heading-only chrome or the breadcrumb.
        */}
        {FOUR_INDIE_SECTIONS.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="mb-12 scroll-mt-16"
          >
            <h2
              id={`${section.id}-title`}
              className="text-xl font-bold mb-4"
            >
              {section.heading}
            </h2>
            {section.paragraphs.map((paragraph, idx) => (
              <p
                key={idx}
                data-speakable="section-body"
                className="text-base leading-relaxed mb-4 whitespace-pre-line"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <Separator className="my-10" />

        {/* Fence-sitter ramp to the diagnostic — same shape as /dont-buy */}
        <section className="mb-12" aria-labelledby="diagnostic-cta">
          <h2 id="diagnostic-cta" className="text-xl font-bold mb-4">
            Take the free Launch Diagnostic
          </h2>
          <p className="text-base leading-relaxed mb-4">
            About ninety seconds. Paste your live product URL. The
            diagnostic returns one of three honest diagnoses: Wrong
            Person, Weak Offer, Weak Belief. No email required, no
            mailing list, no upsell sequence.
          </p>
          <p className="text-base leading-relaxed">
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 font-semibold hover:text-foreground"
            >
              Take the free diagnostic →
            </Link>
          </p>
        </section>

        <Separator className="my-10" />

        {/* Proof links — the two public artifacts this essay anchors on. */}
        <section className="mb-12" aria-labelledby="proof-links">
          <h2 id="proof-links" className="text-xl font-bold mb-4">
            Source artifacts
          </h2>
          <ul className="list-disc list-outside ml-5 space-y-2 text-sm leading-relaxed">
            <li>
              The robots.txt allow-list PR on the unlocksaas repo:{" "}
              <a
                href={FOUR_INDIE_PR_URL}
                rel="noopener"
                className="underline underline-offset-4 hover:text-foreground"
              >
                PR #57
              </a>{" "}
              (merge commit{" "}
              <code className="text-xs">{FOUR_INDIE_MERGE_SHA}</code>).
            </li>
            <li>
              The Marginalia upstream submission:{" "}
              <a
                href={FOUR_INDIE_MARGINALIA_PR_URL}
                rel="noopener"
                className="underline underline-offset-4 hover:text-foreground"
              >
                MarginaliaSearch/submit-site-to-marginalia-search PR #553
              </a>
              .
            </li>
            <li>
              The operator-side audit script:{" "}
              <code className="text-xs">
                scripts/verify-indie-search-presence.py
              </code>{" "}
              in the unlocksaas repo.
            </li>
            <li>
              Honest landscape playbook:{" "}
              <code className="text-xs">
                strategy/indie-search-submission-playbook.md
              </code>
              .
            </li>
          </ul>
        </section>

        <Separator className="my-10" />

        {/* Signature — same shape as /dont-buy + /stories. */}
        <footer className="text-sm text-muted-foreground space-y-3">
          <p>
            Signed{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Maryan
            </Link>
            , founder, Unlock SaaS.
          </p>
          <p>
            See also:{" "}
            <Link
              href="/dont-buy-unlock-saas"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Don&apos;t buy Unlock SaaS
            </Link>{" "}
            &middot;{" "}
            <Link
              href="/stories"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Stories
            </Link>{" "}
            &middot;{" "}
            <Link
              href="/editorial-policy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Editorial Policy
            </Link>{" "}
            &middot;{" "}
            <Link
              href="/faq"
              className="underline underline-offset-4 hover:text-foreground"
            >
              FAQ
            </Link>
            .
          </p>
        </footer>
      </article>
    </div>
  );
}
