import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

/**
 * Root 404 surface for Unlock SaaS.
 *
 * Why this page exists:
 *   The default Next.js 404 is a generic "This page could not be found" with
 *   no signal pointing back to the diagnostic, the search, or any other entry
 *   point a confused visitor can use. That is a small but real crawl-budget
 *   leak — both for humans who bounce and for AI crawlers that follow a stale
 *   link, hit a wall, and downgrade their estimate of the site graph.
 *
 *   This page sends the visitor (or the bot) somewhere useful:
 *     1. The free diagnostic — the highest-value first step the funnel offers
 *        for a stranger who landed here by accident.
 *     2. Search — for the visitor who knows the term they were chasing.
 *     3. A short shortlist of stable entry points (glossary, FAQ, sitemap)
 *        so the crawler can re-anchor without re-crawling the homepage first.
 *
 * Voice: Reluctant Hero. Honest, short, no apology theater, no "Oops!" emoji,
 * no fabricated cleverness. Same tone as the rest of the site.
 *
 * Robots posture: noindex, nofollow. A 404 should never be indexed. Next.js
 * returns the correct 404 status code automatically when this component is
 * rendered from an unmatched route or from notFound() — that is structural,
 * not something the page has to set itself. The meta robots tag is the
 * belt-and-suspenders layer in case a crawler somehow surfaces the URL via
 * an external link.
 *
 * Pre-rendered: force-static so the 404 itself is served from the edge and
 * does not warm a function on every miss.
 */
export const metadata: Metadata = {
  title: "Page not found",
  description:
    "The page you tried to open is not here. Run the free diagnostic, search the site, or jump to one of the stable entry points below.",
  robots: { index: false, follow: false },
  // Do not advertise a canonical for a 404 — it has no canonical URL.
  // openGraph and twitter intentionally omitted so a misshared 404 link
  // does not get a glamorous social card.
};

// 404 is fully static — no per-request data, no cookies, no auth gating.
// Pre-rendered at build time and served from the CDN edge on every miss.
export const dynamic = "force-static";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <article className="max-w-2xl w-full">
        <p className="text-sm uppercase tracking-wider text-muted-foreground mb-3">
          404 – page not found
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
          That page is not here.
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8">
          Either the link is stale, the slug was renamed, or you typed
          something the site does not publish yet. Three useful ways to land
          somewhere real:
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href="/diagnostic"
            className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
          >
            Run the free diagnostic
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-5 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            Search the site
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to the funnel hub
          </Link>
        </div>

        <Separator className="mb-8" />

        <section aria-labelledby="entry-points">
          <h2
            id="entry-points"
            className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4"
          >
            Stable entry points
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <li>
              <Link
                href="/glossary"
                className="underline underline-offset-4 hover:text-primary"
              >
                Glossary
              </Link>
              <span className="text-muted-foreground">
                {" "}
                – 16 Brunson terms used across the site.
              </span>
            </li>
            <li>
              <Link
                href="/faq"
                className="underline underline-offset-4 hover:text-primary"
              >
                FAQ
              </Link>
              <span className="text-muted-foreground">
                {" "}
                – verbatim objections from real founder threads.
              </span>
            </li>
            <li>
              <Link
                href="/funnel-teardown"
                className="underline underline-offset-4 hover:text-primary"
              >
                Funnel teardowns
              </Link>
              <span className="text-muted-foreground">
                {" "}
                – indie SaaS funnels read through Brunson.
              </span>
            </li>
            <li>
              <Link
                href="/pricing-teardown"
                className="underline underline-offset-4 hover:text-primary"
              >
                Pricing teardowns
              </Link>
              <span className="text-muted-foreground">
                {" "}
                – pricing pages, stack slides, anchors.
              </span>
            </li>
            <li>
              <Link
                href="/answers"
                className="underline underline-offset-4 hover:text-primary"
              >
                Answers
              </Link>
              <span className="text-muted-foreground">
                {" "}
                – direct answers to common founder questions.
              </span>
            </li>
            <li>
              <Link
                href="/about"
                className="underline underline-offset-4 hover:text-primary"
              >
                About
              </Link>
              <span className="text-muted-foreground">
                {" "}
                – who runs the site, and how to reach them.
              </span>
            </li>
          </ul>
        </section>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground">
          Looking for the full URL list? See the{" "}
          <Link
            href="/sitemap.xml"
            className="underline underline-offset-4 hover:text-foreground"
          >
            sitemap
          </Link>
          . If you followed a link from somewhere and think this is a bug,
          email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          – the corrections workflow on the{" "}
          <Link
            href="/editorial-policy"
            className="underline underline-offset-4 hover:text-foreground"
          >
            editorial policy
          </Link>{" "}
          page covers stale links too.
        </p>
      </article>
    </main>
  );
}
