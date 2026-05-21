import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { DISQUALIFIERS, FIT_CRITERIA } from "@/lib/dont-buy";
import { buildSerpMetadata } from "@/lib/seo/serp-variants";

/**
 * /dont-buy-unlock-saas – the polarity / anti-marketing page.
 *
 * Why this page exists (off-page linkbait + wrong-fit-customer screen):
 *   1. Linkbait. Surprising, anti-marketing copy is one of the few link
 *      magnets a pre-revenue founder can produce without a press budget.
 *      Honest-founder accounts on X / LinkedIn / Bluesky share pages that
 *      disqualify their own audience. See strategy/google-strategy.md
 *      §B.3 "linkable surprise pages".
 *   2. Wrong-fit-customer screen. Cheaper to lose a wrong-fit buyer here
 *      than to refund them through the Stripe webhook at day 60. The
 *      DISQUALIFIERS list mirrors the real constraints a mismatched
 *      buyer would hit inside the Playbook in week one.
 *   3. Anchors the Verified-Builder positioning. "We say no on purpose"
 *      is half of what makes "we verify inside Stripe" credible.
 *
 * Voice: Reluctant Hero. The page is first-person where it matters, and
 * specific where it can be (the $98 cap, the 60-day window, the literal
 * Stripe-webhook mechanism). No mystery, no hedging. The page closes
 * with the canonical fit profile and the cheapest next step (the free
 * diagnostic) so a borderline reader is not stranded.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every disqualifier names a real product constraint (see
 *     src/lib/dont-buy.ts for the audit comments). No strawmen.
 *   - The fit criteria mirror AUDIENCE_LINE in the markdown registry and
 *     the canonical avatar in strategy/avatar.md. If those drift, this
 *     file is wrong.
 *   - One link points OFF the site (to ship-a-product alternatives).
 *     The Brunson move that earns links is the one that's willing to
 *     route someone away.
 *
 * Performance:
 *   - DISQUALIFIERS and FIT_CRITERIA are hoisted to module scope in
 *     src/lib/dont-buy.ts (rendering-hoist-jsx). No per-request data.
 *   - force-static so the page is prerendered. No runtime APIs are
 *     touched, no headers/cookies/searchParams – this is the standard
 *     marketing-page caching shape mirrored from /editorial-policy.
 */

const PAGE_URL = "https://unlocksaas.com/dont-buy-unlock-saas";
const PAGE_PUBLISHED_AT = "2026-05-18";
const PAGE_LAST_REVIEWED_AT = "2026-05-18";

// SERP-variant baseline. Used when no variant is registered in
// lib/seo/serp-variants for this path – also feeds the active variant
// since the baseline is the first entry there.
const SERP_FALLBACK = {
  title: "Don't buy Unlock SaaS",
  description:
    "Eight honest disqualifiers and one canonical fit profile. If any disqualifier matches, the Playbook is the wrong tool for you. Said out loud, before checkout.",
} as const;

// `buildSerpMetadata` resolves the active variant from the registry and
// returns title + description + openGraph.{title,description} +
// twitter.{title,description}. The structural fields below (og.type,
// og.url, og.publishedTime, og.authors, twitter.card) are layered on
// after so the variant rotation never disturbs the OG-card shape or
// the article-type signal.
export const metadata: Metadata = (() => {
  const serp = buildSerpMetadata("/dont-buy-unlock-saas", SERP_FALLBACK);
  return {
    ...serp,
    alternates: markdownAlternate(
      "/dont-buy-unlock-saas",
      "/dont-buy-unlock-saas.md",
    ),
    openGraph: {
      ...serp.openGraph,
      type: "article",
      url: "/dont-buy-unlock-saas",
      publishedTime: PAGE_PUBLISHED_AT,
      authors: ["Maryan"],
    },
    twitter: {
      ...serp.twitter,
      // summary_large_image because the polarity page now ships a per-route
      // OG card at /dont-buy-unlock-saas/opengraph-image (1200x630). The
      // small-card "summary" variant would crop the polarity headline to
      // a 144px thumbnail on Twitter/X, wasting the visual real estate the
      // off-page launch pack (strategy/launch-content/off-page-launch-pack.md
      // §B.1) depends on for scroll-stop CTR.
      card: "summary_large_image",
    },
    robots: { index: true, follow: true },
  };
})();


const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Don't buy Unlock SaaS", url: PAGE_URL },
] as const;

export default function DontBuyPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />
      {/*
        Article schema: this page is editorial prose, not a transactional
        funnel surface. Shipping Article JSON-LD here means AI Overviews,
        Perplexity, and Google rich-results pipelines resolve the page
        as an authored, dated, speakable editorial – the same treatment
        the funnel-teardown slugs get. Default SPEAKABLE_SPEC targets the
        `[data-speakable]` opt-ins below, so voice engines read the lede
        and the disqualifier bodies, never the nav or the breadcrumb.

        Brunson Hard-Rule reconciliation: wordCount is the conservative
        floor of the actual rendered prose (lede + 8 disqualifier bodies
        + fit list + on-the-fence) so the declared depth matches what
        the page actually publishes.
      */}
      <ArticleJsonLd
        headline="Don't buy Unlock SaaS"
        description="Eight honest disqualifiers and one canonical fit profile. Said out loud, before checkout."
        url={PAGE_URL}
        datePublished={PAGE_PUBLISHED_AT}
        dateModified={PAGE_LAST_REVIEWED_AT}
        wordCount={1000}
        articleSection="Editorial"
        keywords={[
          "anti-marketing",
          "disqualifier",
          "wrong-fit customer",
          "Brunson polarity",
          "non-engineer founder",
          "pre-revenue SaaS",
          "honest founder marketing",
        ]}
        about={[
          { name: "Unlock SaaS", sameAs: "https://unlocksaas.com/" },
          { name: "Post-launch pre-revenue founder" },
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
          <span>Don&apos;t buy Unlock SaaS</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Disqualifiers
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Don&apos;t buy Unlock SaaS if any of these are true.
          </h1>
          <p
            data-speakable="lede"
            className="text-base text-muted-foreground leading-relaxed"
          >
            Most landing pages tell you who they&rsquo;re for. This one
            tells you who they&rsquo;re not for, in plain language,
            before checkout. Eight disqualifiers, signed by the founder.
            If any of them match, the Playbook is the wrong tool for you
            and a 60-day refund is the long way of finding that out.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Published{" "}
            <time dateTime={PAGE_PUBLISHED_AT}>{PAGE_PUBLISHED_AT}</time>.
            Last reviewed{" "}
            <time dateTime={PAGE_LAST_REVIEWED_AT}>
              {PAGE_LAST_REVIEWED_AT}
            </time>
            .
          </p>
        </header>

        <Separator className="my-10" />

        {/* The disqualifier list */}
        <section className="mb-12" aria-labelledby="disqualifiers">
          <h2
            id="disqualifiers"
            className="text-xl font-bold mb-6"
          >
            Eight reasons to walk away
          </h2>
          <ol
            className="list-none ml-0 space-y-10"
            aria-label="Disqualifiers"
          >
            {DISQUALIFIERS.map((d, i) => (
              <li
                key={d.id}
                id={d.id}
                aria-labelledby={`${d.id}-title`}
                className="scroll-mt-16"
              >
                <h3
                  id={`${d.id}-title`}
                  className="text-lg font-semibold mb-3 leading-snug"
                >
                  <span
                    aria-hidden
                    className="text-muted-foreground font-mono text-sm mr-2"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {d.title}
                </h3>
                <p
                  data-speakable="disqualifier"
                  className="text-base leading-relaxed"
                >
                  {d.body}
                </p>
                {d.insteadDo ? (
                  <p className="text-sm text-muted-foreground mt-3">
                    Better next step:{" "}
                    {d.insteadDo.href.startsWith("/") ? (
                      <Link
                        href={d.insteadDo.href}
                        className="underline underline-offset-4 hover:text-foreground"
                      >
                        {d.insteadDo.label}
                      </Link>
                    ) : (
                      <a
                        href={d.insteadDo.href}
                        rel="nofollow noopener"
                        className="underline underline-offset-4 hover:text-foreground"
                      >
                        {d.insteadDo.label}
                      </a>
                    )}
                    .
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        <Separator className="my-10" />

        {/* The canonical fit – positive mirror of the disqualifier list */}
        <section className="mb-12" aria-labelledby="fit">
          <h2 id="fit" className="text-xl font-bold mb-4">
            Who the Playbook is for
          </h2>
          <p className="text-base leading-relaxed mb-4">
            You&rsquo;re the canonical Unlock SaaS buyer if all four of
            these are true at the same time.
          </p>
          <ul className="list-disc list-outside ml-5 space-y-3 text-base leading-relaxed">
            {FIT_CRITERIA.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>

        <Separator className="my-10" />

        {/* Fence-sitter ramp to the diagnostic */}
        <section className="mb-12" aria-labelledby="on-the-fence">
          <h2 id="on-the-fence" className="text-xl font-bold mb-4">
            On the fence?
          </h2>
          <p className="text-base leading-relaxed mb-4">
            The free Launch Diagnostic costs nothing, takes about ninety
            seconds, and tells you which of three things is actually
            broken on your live product page. Whether or not the
            Playbook is for you, the diagnostic is the cheapest answer
            to the question &ldquo;what should I work on first?&rdquo;
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

        {/* Signature */}
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
            </Link>{" "}
            &middot;{" "}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Contact
            </Link>
            .
          </p>
        </footer>
      </article>
    </div>
  );
}
