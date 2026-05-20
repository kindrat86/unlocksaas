import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  BreadcrumbListJsonLd,
  PublicDatasetJsonLd,
} from "@/components/seo/json-ld";
import { StateOfSaasReportJsonLd } from "@/components/seo/state-of-saas-jsonld";
import {
  BASE_URL,
  FOUNDER,
  ORGANIZATION,
} from "@/lib/seo/entity";
import {
  CURRENT_EDITION_YEAR,
  EDITIONS,
  MIN_REPORT_N,
  STATE_OF_SAAS_INDEX_URL,
  STATE_OF_SAAS_LICENSE_SPDX,
  STATE_OF_SAAS_LICENSE_URL,
  editionApa,
  editionAttribution,
  editionBibtex,
  editionChicago,
  editionCitation,
  editionDatasetIdentifier,
  editionKeywords,
  editionMla,
  editionStaticParams,
  editionUrl,
  getEdition,
} from "@/lib/state-of-saas";
import { loadEditionFindings } from "@/lib/state-of-saas-data";

/**
 * /state-of-saas/[year] — per-edition page of the State of Post-Launch
 * Pre-Revenue SaaS annual report.
 *
 * Surface C (linkable asset) + Surface B (AEO/GEO citation anchor) +
 * Surface A (canonical pSEO target for year-anchored queries like "state
 * of indie SaaS 2026", "post-launch pre-revenue saas annual report 2026").
 *
 * Render branches
 * ---------------
 * The page has two shapes depending on cohort size:
 *
 *   1. status === "published" (cohort >= MIN_REPORT_N)
 *      - Headline numbers: label-distribution table with percentages.
 *      - PublicDatasetJsonLd block emits a Dataset node for the
 *        anonymized counts, so Google Dataset Search and HF dataset
 *        crawlers see the report as a dataset publication.
 *      - Article.description reads as a published research abstract.
 *
 *   2. status === "below_threshold" (cohort < MIN_REPORT_N)
 *      - Honest zero-state: "Edition Y: enrollment open. Cohort has X
 *        of MIN_REPORT_N submissions."
 *      - PublicDatasetJsonLd is NOT emitted — there is no dataset to
 *        cross-list while the cohort is still enrolling.
 *      - Article.description frames the page as cohort-in-progress.
 *
 * Both shapes ship the same Report JSON-LD (canonical citation surface),
 * the same citation block (so a re-user can cite even the enrollment-open
 * shell when announcing the report to their audience), and the same
 * methodology copy. The only thing that differs is whether the
 * percentages are visible.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Every number on the page is read live from the aggregator's
 *     return shape; nothing is hardcoded.
 *   - Below-threshold: the headline numbers literally do not exist in
 *     the rendered HTML. The honest zero-state line is the truthful
 *     replacement.
 *   - generateStaticParams enumerates known editions; unknown years 404
 *     via notFound() rather than rendering a fabricated page.
 */

// ISR — the cohort changes a few times a day at most. Hourly rebuild
// catches new submissions without churning the build queue.
export const revalidate = 3600;

// Lock known years only — generateStaticParams returns one entry per
// edition. Unknown years 404 via the notFound() in the page body.
export const dynamicParams = false;

export function generateStaticParams() {
  return editionStaticParams();
}

interface PageParams {
  readonly year: string;
}

/**
 * Per-year title + description metadata. The description differs by
 * edition state — published editions get the abstract framing, enrollment-
 * open editions get the cohort-progress framing. Brunson Hard-Rule:
 * never claim a published number in metadata while the page body shows
 * the enrollment shell.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { year: yearStr } = await params;
  const year = Number.parseInt(yearStr, 10);
  const edition = getEdition(year);
  if (!edition) {
    return { title: "Not found" };
  }
  const findings = await loadEditionFindings(year);
  const url = editionUrl(year);
  const isPublished = findings.status === "published";
  const description = isPublished
    ? `Annual report from ${ORGANIZATION.name} on what post-launch pre-revenue SaaS founders are actually getting wrong. Wrong Person, Weak Offer, and Weak Belief diagnosis distribution across ${findings.totalSubmissions} real founder URLs submitted to the free diagnostic during ${year}.`
    : `Annual report from ${ORGANIZATION.name} on what post-launch pre-revenue SaaS founders are actually getting wrong. The ${year} edition publishes when the cohort reaches ${MIN_REPORT_N} submissions; current count is ${findings.totalSubmissions}.`;
  return {
    title: `${edition.displayTitle}`,
    description,
    alternates: { canonical: `/state-of-saas/${year}` },
    keywords: editionKeywords(edition) as readonly string[] as string[],
    openGraph: {
      type: "article",
      title: edition.displayTitle,
      description,
      url: `/state-of-saas/${year}`,
      siteName: ORGANIZATION.name,
      publishedTime: edition.windowStart,
      modifiedTime: edition.lastVerified,
      authors: [FOUNDER.name],
    },
    twitter: {
      card: "summary_large_image",
      title: edition.displayTitle,
      description: isPublished
        ? `What ${findings.totalSubmissions} post-launch pre-revenue SaaS founders are actually getting wrong. Free, CC-BY-4.0.`
        : `${year} cohort enrolling. Free, CC-BY-4.0 on publication.`,
    },
    robots: { index: true, follow: true },
  };
}

const trailFor = (year: number) =>
  [
    { name: ORGANIZATION.name, url: `${BASE_URL}/` },
    {
      name: "State of Post-Launch Pre-Revenue SaaS",
      url: STATE_OF_SAAS_INDEX_URL,
    },
    { name: String(year), url: editionUrl(year) },
  ] as const;

export default async function StateOfSaasEditionPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { year: yearStr } = await params;
  const year = Number.parseInt(yearStr, 10);
  const edition = getEdition(year);
  if (!edition) {
    notFound();
  }

  const findings = await loadEditionFindings(year);
  const isPublished = findings.status === "published";

  const url = editionUrl(year);
  const trail = trailFor(year);
  const citation = editionCitation(edition);
  const keywords = editionKeywords(edition);
  const attribution = editionAttribution(edition);
  const ogImageUrl = `${url}/opengraph-image`;

  const reportDescription = isPublished
    ? `Annual report from ${ORGANIZATION.name} on what post-launch pre-revenue SaaS founders are actually getting wrong. Wrong Person vs Weak Offer vs Weak Belief diagnosis distribution across ${findings.totalSubmissions} real founder URLs submitted to the free Launch Diagnostic during ${year}. The cohort is non-engineer founders shipping with Lovable, Claude, Replit, v0, Cursor, and Bolt.new who have not yet earned their first paying customer.`
    : `Annual report from ${ORGANIZATION.name}. The ${year} edition publishes once the cohort reaches ${MIN_REPORT_N} submissions to the free Launch Diagnostic; current count is ${findings.totalSubmissions}. Methodology, citation framework, and license are documented here now so re-users can pre-cite the edition.`;

  // Dataset JSON-LD is emitted ONLY when findings are published. An
  // empty or below-threshold Dataset node would look like a fabricated
  // listing to Google Dataset Search and demote both this page and the
  // canonical /dataset.
  const datasetIdentifier = editionDatasetIdentifier(year);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={trail} />
      <StateOfSaasReportJsonLd
        edition={edition}
        url={url}
        citation={citation}
        description={reportDescription}
        keywords={keywords}
        imageUrl={ogImageUrl}
        datePublished={edition.windowStart}
        dateModified={edition.lastVerified}
        cohortSize={findings.totalSubmissions}
        publishedFindings={isPublished}
      />
      {isPublished ? (
        <PublicDatasetJsonLd
          name={`${edition.displayTitle} – Anonymized Findings`}
          slug={`state-of-saas-${year}`}
          version={`${year}.0`}
          description={`Anonymized diagnostic-label distribution across ${findings.totalSubmissions} post-launch pre-revenue SaaS founders who pasted a real product URL into the free Launch Diagnostic during ${year}. Counts only; no email, IP, user-agent, or product URL flows out of the aggregator.`}
          lastVerified={edition.lastVerified}
          generatedAt={new Date().toISOString()}
          landingUrl={url}
          jsonUrl={url}
          csvUrl={url}
          markdownUrl={url}
          licenseUrl={STATE_OF_SAAS_LICENSE_URL}
          citation={citation}
          keywords={keywords}
          variableMeasured={[
            "Wrong Person diagnosis count",
            "Weak Offer diagnosis count",
            "Weak Belief diagnosis count",
            "Total submissions in calendar-year window",
          ]}
          totalRows={findings.totalSubmissions}
          primaryIdentifier={datasetIdentifier}
          alternateNames={[
            `state-of-saas-${year}`,
            `unlocksaas/state-of-saas-${year}`,
          ]}
          measurementTechnique={`Anonymized aggregate of the diagnostic_leads table over the ${edition.windowStart} → ${edition.windowEnd} calendar-year window. The aggregator reads only the label, bucket, and created_at columns; email, IP, user agent, product URL, headline, and explanation are never read. Below-threshold editions render an honest zero-state instead of percentages; the threshold is ${MIN_REPORT_N} submissions.`}
        />
      ) : null}

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {ORGANIZATION.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <Link
            href="/state-of-saas"
            className="underline underline-offset-4 hover:text-foreground"
          >
            State of Post-Launch Pre-Revenue SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>{year}</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Annual report · {STATE_OF_SAAS_LICENSE_SPDX} · {year} edition
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {edition.displayTitle}
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed"
            data-speakable
          >
            {edition.tagline}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            By{" "}
            <Link
              href="/about"
              className="text-foreground underline underline-offset-4"
            >
              {FOUNDER.name}
            </Link>
            , {FOUNDER.jobTitle}, {ORGANIZATION.name} · Window:{" "}
            {edition.windowStart} → {edition.windowEnd} · Last verified:{" "}
            {edition.lastVerified}
          </div>
        </header>

        <Separator className="my-8" />

        <section
          className="mb-10 space-y-4 leading-relaxed"
          aria-labelledby="quick-take"
        >
          <h2 id="quick-take" className="text-2xl font-bold">
            Headline finding
          </h2>
          {isPublished ? (
            <>
              <p data-speakable>
                Of the {findings.totalSubmissions} post-launch pre-revenue
                SaaS founders who submitted a real product URL during {year}
                , the leading diagnosis was{" "}
                <strong>{findings.labelDistribution[0]?.label}</strong> at{" "}
                <strong>{findings.labelDistribution[0]?.percent}%</strong>.
              </p>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40">
                    <tr>
                      <th className="text-left px-4 py-2 font-medium">
                        Diagnosis
                      </th>
                      <th className="text-right px-4 py-2 font-medium">
                        Count
                      </th>
                      <th className="text-right px-4 py-2 font-medium">
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {findings.labelDistribution.map((row) => (
                      <tr key={row.label} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{row.label}</td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {row.count}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          {row.percent}%
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t-2 border-border bg-muted/20">
                      <td className="px-4 py-3 font-semibold">Total</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {findings.totalSubmissions}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                        rounded
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                Shares are rounded to the nearest integer percent; the row
                total may differ from 100 by one due to rounding. Most-recent
                submission in this cohort:{" "}
                {findings.mostRecentSubmissionAt.slice(0, 10)}.
              </p>
            </>
          ) : (
            <>
              <p data-speakable>
                <strong>Edition {year}: enrollment open.</strong> The cohort
                has {findings.totalSubmissions} of {findings.threshold}{" "}
                submissions needed for the percentage findings to publish.
              </p>
              <p className="text-muted-foreground">
                Below this threshold, a 95% confidence interval on the label
                distribution would be wider than any single label&rsquo;s
                expected share – the percentages would obscure more than
                they reveal. The page publishes once the cohort crosses{" "}
                {findings.threshold} submissions, and the canonical citation
                + license framework below is live now so re-users can
                pre-cite the edition.
              </p>
              <div className="border border-border rounded-lg p-4 bg-muted/20">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Cohort progress
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {findings.totalSubmissions}{" "}
                  <span className="text-muted-foreground font-normal">
                    / {findings.threshold}
                  </span>
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (findings.totalSubmissions / findings.threshold) *
                            100,
                        ),
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-3 text-sm">
                  <Link
                    href="/diagnostic"
                    className="underline underline-offset-4 font-medium"
                  >
                    Run the diagnostic to add a submission →
                  </Link>
                </div>
              </div>
            </>
          )}
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Methodology</h2>
          <p>
            The cohort for the {year} edition is every founder who pasted a
            real product URL into the{" "}
            <Link
              href="/diagnostic"
              className="underline underline-offset-4"
            >
              free Launch Diagnostic
            </Link>{" "}
            during the {edition.windowStart} → {edition.windowEnd} calendar-
            year window. The diagnostic returns one of three labels –{" "}
            <Link
              href="/glossary/wrong-person"
              className="underline underline-offset-4"
            >
              Wrong Person
            </Link>
            ,{" "}
            <Link
              href="/glossary/weak-offer"
              className="underline underline-offset-4"
            >
              Weak Offer
            </Link>
            , or{" "}
            <Link
              href="/glossary/weak-belief"
              className="underline underline-offset-4"
            >
              Weak Belief
            </Link>{" "}
            – following Russell Brunson&rsquo;s Four Core Stories framework.
            The headline finding of the edition is the percentage share of
            each label across the year&rsquo;s submissions.
          </p>
          <p>
            Engine-failure rows (label = &ldquo;error&rdquo;) are excluded
            from the cohort. They represent infrastructure failures, not
            founder diagnoses, and including them would distort the share
            calculation by counting failure modes that have nothing to do
            with the founder&rsquo;s page.
          </p>

          <h3 className="text-lg font-bold mt-6">What the aggregator reads</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside marker:text-muted-foreground/50">
            <li>
              <code className="text-sm">label</code> – the diagnostic
              classification.
            </li>
            <li>
              <code className="text-sm">bucket</code> – the free-text
              bucket tag (may be null; not used in the {year} headline).
            </li>
            <li>
              <code className="text-sm">created_at</code> – ISO timestamp,
              used only to bucket the row into the correct calendar-year
              edition.
            </li>
          </ul>

          <h3 className="text-lg font-bold mt-6">
            What the aggregator deliberately does NOT read
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside marker:text-muted-foreground/50">
            <li>
              <code className="text-sm">email</code>,{" "}
              <code className="text-sm">ip</code>,{" "}
              <code className="text-sm">user_agent</code> – never read,
              never aggregated, never published.
            </li>
            <li>
              <code className="text-sm">product_url</code>,{" "}
              <code className="text-sm">headline</code>,{" "}
              <code className="text-sm">explanation</code>,{" "}
              <code className="text-sm">evidence</code> – not read.
              Re-identifying a founder by URL + diagnosis would defeat the
              privacy posture, and the headline narrative does not need
              row-level prose.
            </li>
            <li>
              <code className="text-sm">analysis_detail</code>,{" "}
              <code className="text-sm">recent_revenue</code>,{" "}
              <code className="text-sm">biggest_attempt</code>,{" "}
              <code className="text-sm">time_since_launch</code> – not
              read. Future editions may aggregate these as anonymized
              distributions, with a separate sample-size gate per column.
            </li>
          </ul>

          <p>
            The published numbers are de-identified by construction – no
            row-level data ever leaves the aggregator function. See the{" "}
            <Link
              href="/editorial-policy"
              className="underline underline-offset-4"
            >
              editorial policy
            </Link>{" "}
            for the corrections workflow and the{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4"
            >
              privacy notice
            </Link>{" "}
            for how the underlying diagnostic submissions are stored.
          </p>

          <p className="text-xs text-muted-foreground">
            Editorial floor: percentages publish only once the cohort
            reaches {MIN_REPORT_N} submissions. Below threshold the page
            renders an honest enrollment-open shell with the current count
            – never fabricated percentages, never a hidden &ldquo;shipped
            report&rdquo; with bad math.
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">License and attribution</h2>
          <p>
            Released under the{" "}
            <a
              href={STATE_OF_SAAS_LICENSE_URL}
              rel="license noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              Creative Commons Attribution 4.0 International license (
              {STATE_OF_SAAS_LICENSE_SPDX})
            </a>
            . Free to quote, free to remix, free to chart – the only
            obligation is attribution.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Required attribution.</strong>{" "}
            Paste this string in a footnote, methods note, or page footer:
          </p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {attribution}
          </pre>
        </section>

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Citation</h2>
          <p className="text-sm text-muted-foreground">Plain text:</p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {citation}
          </pre>

          <p className="text-sm text-muted-foreground">BibTeX:</p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto">
            {editionBibtex(edition)}
          </pre>

          <p className="text-sm text-muted-foreground">APA 7:</p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {editionApa(edition)}
          </pre>

          <p className="text-sm text-muted-foreground">MLA 9:</p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {editionMla(edition)}
          </pre>

          <p className="text-sm text-muted-foreground">
            Chicago (author-date):
          </p>
          <pre className="bg-muted/40 border border-border rounded-lg p-4 text-xs overflow-x-auto whitespace-pre-wrap">
            {editionChicago(edition)}
          </pre>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Related</h2>
          <ul className="text-sm space-y-2 list-disc list-inside marker:text-muted-foreground/50">
            <li>
              <Link
                href="/dataset"
                className="underline underline-offset-4"
              >
                Indie SaaS Teardowns Dataset
              </Link>
              {" "}– the editorial corpus this report&rsquo;s methodology
              builds on.
            </li>
            <li>
              <Link
                href="/glossary/wrong-person"
                className="underline underline-offset-4"
              >
                Wrong Person
              </Link>
              ,{" "}
              <Link
                href="/glossary/weak-offer"
                className="underline underline-offset-4"
              >
                Weak Offer
              </Link>
              ,{" "}
              <Link
                href="/glossary/weak-belief"
                className="underline underline-offset-4"
              >
                Weak Belief
              </Link>
              {" "}– working definitions of the three diagnoses.
            </li>
            <li>
              <Link
                href="/press"
                className="underline underline-offset-4"
              >
                Press kit
              </Link>
              {" "}and{" "}
              <Link
                href="/press/topics"
                className="underline underline-offset-4"
              >
                press topics
              </Link>
              {" "}– pre-assembled story packages for writers covering
              indie SaaS founder trends.
            </li>
            {EDITIONS.length > 1 ? (
              <li>
                <Link
                  href="/state-of-saas"
                  className="underline underline-offset-4"
                >
                  All editions of the State of Post-Launch Pre-Revenue
                  SaaS report
                </Link>
              </li>
            ) : (
              <li>
                <Link
                  href="/state-of-saas"
                  className="underline underline-offset-4"
                >
                  About the State of Post-Launch Pre-Revenue SaaS report
                  series
                </Link>
              </li>
            )}
          </ul>
        </section>

        {year === CURRENT_EDITION_YEAR ? (
          <section className="mb-4 border border-border rounded-lg p-5 bg-muted/10">
            <p className="text-sm">
              <strong>Contribute to this edition.</strong> The cohort is
              every founder who pastes a real product URL into the
              diagnostic during {year}. No signup, no waitlist.{" "}
              <Link
                href="/diagnostic"
                className="underline underline-offset-4 font-medium"
              >
                Run the diagnostic →
              </Link>
            </p>
          </section>
        ) : null}
      </article>
    </div>
  );
}
