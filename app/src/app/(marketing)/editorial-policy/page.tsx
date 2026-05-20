import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  BreadcrumbListJsonLd,
  EditorialPolicyArticleJsonLd,
} from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import {
  CORRECTIONS,
  CORRECTIONS_LOG_SINCE,
} from "@/lib/seo/corrections-log";

/**
 * Editorial policy + disclosures + corrections page.
 *
 * Why this page exists (E-E-A-T Trust uplift, 2026-05-17):
 *   Google's Search Quality Rater Guidelines (§3.1 and §3.4) explicitly
 *   look for a "clearly stated editorial policy" and a "corrections
 *   policy" as positive trust signals — especially for sites that
 *   publish opinions, comparisons, or product analysis (which UnlockSaaS
 *   does, in every pSEO surface and every parable). Without this page,
 *   quality raters can ding the site on the "lack of transparency"
 *   axis; with it, the same surfaces read as accountable.
 *
 *   The Organization JSON-LD already advertises a `publishingPrinciples`
 *   URL — that pointer goes to /about today, which is the founder's bio
 *   plus an editorial position note. This page narrows the editorial
 *   position to its specific commitments (sourcing, datelines,
 *   corrections, disclosures), where /about narrates the founder's
 *   story. The two pages reinforce, not duplicate, each other.
 *
 * Voice: Reluctant Hero. Reads as a real working policy a non-engineer
 * solo founder actually follows — not a copy-pasted SEO checklist.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Every commitment below is something the operator already does in
 *     practice (sourcing from public threads, dated lastVerified on
 *     pSEO pages, signed bylines on stories, etc.). No aspirational
 *     standards we have not actually shipped.
 *   - The corrections log is empty by default. Empty is honest; we add
 *     a row when a correction lands, not before.
 *   - No fabricated "editorial board" or "review committee" — the
 *     editorial team is one person, named.
 */

const POLICY_URL = "https://unlocksaas.com/editorial-policy";
const POLICY_PUBLISHED_AT = "2026-05-17";
const POLICY_LAST_REVIEWED_AT = "2026-05-17";

export const metadata: Metadata = {
  title: "Editorial Policy — Unlock SaaS",
  description:
    "How Unlock SaaS sources, dates, signs, and corrects every public claim. Editorial standards, financial disclosures, and the running corrections log.",
  alternates: pageAlternates("/editorial-policy"),
  openGraph: {
    type: "article",
    title: "Editorial Policy — Unlock SaaS",
    description:
      "How Unlock SaaS sources, dates, signs, and corrects every public claim.",
    url: "/editorial-policy",
    publishedTime: POLICY_PUBLISHED_AT,
    authors: ["Maryan"],
  },
  twitter: {
    card: "summary",
    title: "Editorial Policy — Unlock SaaS",
    description:
      "How Unlock SaaS sources, dates, signs, and corrects every public claim.",
  },
  robots: { index: true, follow: true },
};


const TRAIL = [
  { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
  { name: "Editorial Policy", url: POLICY_URL },
] as const;

export default function EditorialPolicyPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={TRAIL} />
      {/* Article + correctionsPolicy + correction (when CORRECTIONS
          is populated). Hoisted at module load; per-render cost is
          zero. The corrections ItemList is omitted entirely while
          the registry is empty – the honest empty-state policy is
          encoded both in the rendered prose below and in the
          structured-data schema. */}
      <EditorialPolicyArticleJsonLd />

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
          <span>Editorial Policy</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Editorial Policy
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            How we source, date, sign, and correct every public claim.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Unlock SaaS publishes opinions and comparisons of real products.
            This page is the standard those publications hold themselves to,
            written by the person who writes them.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Published <time dateTime={POLICY_PUBLISHED_AT}>2026-05-17</time>.
            Last reviewed{" "}
            <time dateTime={POLICY_LAST_REVIEWED_AT}>2026-05-17</time>.
          </p>
        </header>

        <Separator className="my-10" />

        {/* 1 — Editorial team */}
        <section className="mb-12" aria-labelledby="editorial-team">
          <h2 id="editorial-team" className="text-xl font-bold mb-4">
            1. Who writes this site
          </h2>
          <p className="text-base leading-relaxed mb-3">
            One person. Maryan, the founder. There is no anonymous editorial
            board, no contractor pool, no ghost-written posts. Every parable,
            every funnel teardown, every pricing teardown, every comparison,
            every category roundup is the work of the named human in the
            footer.
          </p>
          <p className="text-base leading-relaxed">
            If a future contributor publishes here, they will be bylined on
            the piece, named here, and added to the Person schema graph. No
            unsigned editorial. Ever.
          </p>
        </section>

        {/* 2 — Sourcing */}
        <section className="mb-12" aria-labelledby="sourcing">
          <h2 id="sourcing" className="text-xl font-bold mb-4">
            2. How claims get sourced
          </h2>
          <ul className="list-disc list-outside ml-5 space-y-3 text-base leading-relaxed">
            <li>
              <strong>Funnel teardowns + pricing teardowns + comparisons</strong>{" "}
              are written from a live read of the competitor&rsquo;s public
              page on the dated{" "}
              <code className="text-sm">lastVerified</code> shown at the
              bottom of every detail page. No second-hand summaries, no
              ChatGPT-paraphrased reviews, no quoted copy.
            </li>
            <li>
              <strong>FAQ entries</strong> are verbatim objections sourced
              from real Indie Hackers and Hacker News threads. The thread
              links are not surfaced publicly to avoid driving traffic to
              individual users who did not consent to being quoted; they
              are retained in the project repository for audit.
            </li>
            <li>
              <strong>Parables and stories</strong> are the founder&rsquo;s
              own experience. When a parable references a third-party
              product or person, the reference is on the public record.
            </li>
            <li>
              <strong>Statistics and dollar figures</strong> only appear
              when they are about Unlock SaaS itself and verifiable inside
              our own Stripe account. No third-party statistics from a
              report we did not read end-to-end.
            </li>
          </ul>
        </section>

        {/* 3 — Datelines */}
        <section className="mb-12" aria-labelledby="datelines">
          <h2 id="datelines" className="text-xl font-bold mb-4">
            3. Datelines
          </h2>
          <p className="text-base leading-relaxed mb-3">
            Every published-once-and-left-alone article carries a hard
            published date (the article&rsquo;s{" "}
            <code className="text-sm">datePublished</code> in schema and
            the human-readable footer date). It does not silently move
            forward when the page is redeployed. If the article changes
            materially, the change is logged in the corrections section
            below and the <code className="text-sm">dateModified</code>{" "}
            field updates separately.
          </p>
          <p className="text-base leading-relaxed">
            Programmatic SEO surfaces (funnel teardowns, pricing teardowns,
            comparisons, category roundups) carry a separate{" "}
            <code className="text-sm">lastVerified</code> ISO date on the
            page itself, declaring when the live competitor surface was
            last read.
          </p>
        </section>

        {/* 4 — Disclosures */}
        <section className="mb-12" aria-labelledby="disclosures">
          <h2 id="disclosures" className="text-xl font-bold mb-4">
            4. Financial and editorial disclosures
          </h2>
          <ul className="list-disc list-outside ml-5 space-y-3 text-base leading-relaxed">
            <li>
              <strong>Affiliate links:</strong> none. No comparison page,
              teardown page, or parable contains a paid affiliate link to
              any competitor named. Linking out is free. If this ever
              changes, every page that contains an affiliate link will
              carry a per-link disclosure and this section will be updated.
            </li>
            <li>
              <strong>Paid placements:</strong> none. No competitor has
              paid to be included in or excluded from any teardown,
              comparison, or category roundup. The list of products
              analyzed is the operator&rsquo;s editorial judgement of what
              the canonical audience already evaluates.
            </li>
            <li>
              <strong>Sponsored content:</strong> none. The site has not
              published a single sponsored post. If that changes, every
              sponsored piece will be labeled in the first line of the
              article and excluded from the schema.org/Article graph.
            </li>
            <li>
              <strong>Ownership and funding:</strong> Unlock SaaS is fully
              owned and self-funded by the named founder. No outside
              investors. No grants. Revenue comes from product sales
              (currently $1 Starter and $49/mo Playbook).
            </li>
            <li>
              <strong>Customer relationships:</strong> the operator has
              not been compensated by any competitor named on this site.
              If a future customer of Unlock SaaS is also named in a
              teardown or comparison, that relationship will be disclosed
              on the relevant page.
            </li>
          </ul>
        </section>

        {/* 5 — Corrections workflow */}
        <section className="mb-12" aria-labelledby="corrections-workflow">
          <h2 id="corrections-workflow" className="text-xl font-bold mb-4">
            5. Corrections workflow
          </h2>
          <p className="text-base leading-relaxed mb-3">
            If a claim on this site is wrong:
          </p>
          <ol className="list-decimal list-outside ml-5 space-y-3 text-base leading-relaxed">
            <li>
              Email{" "}
              <a
                href="mailto:maryan@unlocksaas.com"
                className="underline underline-offset-4"
              >
                maryan@unlocksaas.com
              </a>{" "}
              with the URL, the claim, and the correction.
            </li>
            <li>
              The operator confirms or rejects the correction within 7
              days. Confirmations are not gated on the reporter being a
              representative of the affected entity; the standard is{" "}
              <em>is the claim wrong</em>, not <em>who is reporting it</em>.
            </li>
            <li>
              Confirmed corrections are logged below with date, URL, the
              old claim, the corrected claim, and the source. The page
              itself is updated and <code className="text-sm">dateModified</code>{" "}
              is bumped.
            </li>
            <li>
              Rejected corrections receive a reply explaining why and
              what evidence would change the answer. No silence.
            </li>
          </ol>
        </section>

        <Separator className="my-10" />

        {/* 6 — Corrections log
            Reads from the CORRECTIONS registry in lib/seo/corrections-log.ts.
            Empty by default; the honest empty-state copy renders below until
            a real correction lands. When the registry is populated, the same
            data feeds both this rendered surface AND the schema.org/Article
            correction ItemList emitted by EditorialPolicyArticleJsonLd above. */}
        <section className="mb-12" aria-labelledby="corrections-log">
          <h2 id="corrections-log" className="text-xl font-bold mb-4">
            6. Corrections log
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            Reverse-chronological. Every confirmed correction since the
            editorial policy was published on{" "}
            <time dateTime={CORRECTIONS_LOG_SINCE}>
              {CORRECTIONS_LOG_SINCE}
            </time>
            . Empty does not mean nothing has ever been wrong; it means
            nothing has been reported and confirmed yet.
          </p>
          {CORRECTIONS.length === 0 ? (
            <div className="border border-border rounded-md p-6 bg-muted/30">
              <p className="text-sm text-muted-foreground italic">
                No corrections confirmed since{" "}
                <time dateTime={CORRECTIONS_LOG_SINCE}>
                  {CORRECTIONS_LOG_SINCE}
                </time>
                . If you find a wrong claim, the workflow above is how it
                lands here.
              </p>
            </div>
          ) : (
            <ol className="space-y-4 list-none pl-0">
              {CORRECTIONS.map((c) => (
                <li
                  key={`${c.correctedAt}-${c.pageUrl}-${c.title}`}
                  className="border border-border rounded-md p-5 bg-muted/30"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-3">
                    <time
                      dateTime={c.correctedAt}
                      className="text-xs uppercase tracking-widest text-muted-foreground"
                    >
                      {c.correctedAt}
                    </time>
                    <h3 className="text-base font-semibold">{c.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed mb-2">
                    <span className="text-muted-foreground">Originally:</span>{" "}
                    {c.originalClaim}
                  </p>
                  <p className="text-sm leading-relaxed mb-3">
                    <span className="text-muted-foreground">Corrected:</span>{" "}
                    {c.corrected}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    On{" "}
                    <a
                      href={c.pageUrl}
                      className="underline underline-offset-4 hover:text-foreground"
                    >
                      {c.pageUrl.replace(/^https:\/\//, "")}
                    </a>
                    {c.sourceUrl ? (
                      <>
                        {" "}
                        · Source:{" "}
                        <a
                          href={c.sourceUrl}
                          className="underline underline-offset-4 hover:text-foreground"
                          rel="noopener"
                        >
                          {c.sourceUrl.replace(/^https?:\/\//, "")}
                        </a>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <Separator className="my-10" />

        {/* Footer signature */}
        <footer className="text-sm text-muted-foreground space-y-3">
          <p>
            Editorial policy &middot; signed{" "}
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
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              About the operator
            </Link>{" "}
            &middot;{" "}
            <Link
              href="/press"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Press
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
