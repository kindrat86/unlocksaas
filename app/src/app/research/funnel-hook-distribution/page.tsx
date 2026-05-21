import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { CitationBlock } from "@/components/seo/citation-block";
import { getCitationForResearch } from "@/lib/citations";
import {
  ALL_HOOK_SCORES,
  HOOK_DISTRIBUTION,
  HOOK_RUBRIC,
  lowestScoring,
  highestScoring,
  type HookAxis,
} from "@/lib/seo/funnel-hook-analysis";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  DATASET_LICENSE_SPDX,
  DATASET_LICENSE_URL,
  DATASET_URLS,
} from "@/lib/seo/dataset";
import { LAST_VERIFIED_DATE } from "@/lib/seo/freshness";

/**
 * /research/funnel-hook-distribution – original-research piece.
 *
 * Surface C (linkable asset) supporting AI-citation eligibility per
 * the 2026 GEO research base (Princeton / Georgia Tech KDD 2024:
 * adding original statistics improves AI visibility ~41%).
 *
 * Honest-framing discipline
 * -------------------------
 *   - We score OUR OWN pattern descriptions, not the target companies.
 *   - The rubric is published in full on this page; anyone can re-run.
 *   - The dataset row count is read live from the corpus at build time
 *     (no fabricated "thousands of funnels"); n is whatever TEARDOWNS
 *     happens to carry.
 *   - The "scoring under 4/10" framing is a descriptive claim about
 *     our pattern descriptions, not a judgment on the companies. The
 *     page says this explicitly under Methodology.
 *
 * Citation infrastructure
 * -----------------------
 * Registered in `src/lib/citations.ts` as
 * `research-funnel-hook-distribution-v1-0-0`. The /cite/<id>/<format>
 * route auto-emits the BibTeX, RIS, APA, MLA, Chicago, CSL-JSON
 * variants. CitationBlock renders the on-page surface.
 */

const PAGE_URL = `${BASE_URL}/research/funnel-hook-distribution`;
const JSON_EXPORT_URL = `${BASE_URL}/research/funnel-hook-distribution.json`;
const CORRECTIONS_LOG_URL = `${BASE_URL}/editorial-policy`;
const DATASET_LANDING_URL = DATASET_URLS.landing;

export const metadata: Metadata = {
  title: `Indie SaaS Funnel Hook Distribution – n=${HOOK_DISTRIBUTION.n} Teardowns Scored on a 5-Axis Rubric`,
  description: `Open structural analysis of the n=${HOOK_DISTRIBUTION.n} funnel-hook patterns we teardown'd. Five axes, scored 0-10 each. ${HOOK_DISTRIBUTION.belowFourCount} hooks score under 4. Full rubric and per-pattern scores published.`,
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: `Indie SaaS Funnel Hook Distribution – ${HOOK_DISTRIBUTION.n} Teardowns Scored`,
    description: `${HOOK_DISTRIBUTION.belowFourCount} of ${HOOK_DISTRIBUTION.n} hook patterns we teardown'd score under 4 on our 5-axis rubric. Mean ${HOOK_DISTRIBUTION.mean}/10, median ${HOOK_DISTRIBUTION.median}/10. Full methodology + per-pattern scores published.`,
    url: PAGE_URL,
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: `Indie SaaS Funnel Hook Distribution – n=${HOOK_DISTRIBUTION.n}`,
    description: `${HOOK_DISTRIBUTION.belowFourCount} of ${HOOK_DISTRIBUTION.n} hook patterns score under 4 on our 5-axis structural rubric. Methodology + raw scores open.`,
  },
};

const PUBLISHED_ISO = LAST_VERIFIED_DATE;
const VERSION = "1.0.0";

const AXIS_LABEL: Record<HookAxis, string> = Object.fromEntries(
  HOOK_RUBRIC.map((a) => [a.axis, a.label]),
) as Record<HookAxis, string>;

function buildDatasetJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Indie SaaS Funnel Hook Distribution v${VERSION}`,
    description:
      `Structural analysis of n=${HOOK_DISTRIBUTION.n} funnel-hook patterns from the public Indie SaaS Teardowns dataset, scored on a 5-axis rubric (target identity, outcome specificity, polarity, distinct mechanism, time/quantity grounding). Mean ${HOOK_DISTRIBUTION.mean}/10, median ${HOOK_DISTRIBUTION.median}/10. ${HOOK_DISTRIBUTION.belowFourCount} patterns score under 4. Full rubric, methodology, and per-pattern scores published.`,
    url: PAGE_URL,
    identifier: `unlocksaas/research/funnel-hook-distribution/v${VERSION}`,
    isAccessibleForFree: true,
    license: DATASET_LICENSE_URL,
    keywords: [
      "indie SaaS",
      "funnel teardown",
      "Brunson Hook-Story-Offer",
      "GEO research",
      "structural rubric",
      "marketing analysis",
      "open dataset",
    ],
    creator: {
      "@type": "Person",
      name: FOUNDER.name,
      url: `${BASE_URL}/founding`,
    },
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION.name,
      url: BASE_URL,
    },
    datePublished: PUBLISHED_ISO,
    dateModified: PUBLISHED_ISO,
    variableMeasured: HOOK_RUBRIC.map((a) => ({
      "@type": "PropertyValue",
      name: a.label,
      description: a.question,
    })),
    measurementTechnique:
      "Five-axis structural rubric applied to authored brunsonLens.hook pattern strings. Each axis scored 0/1/2 by deterministic keyword pattern matching against the lowercased pattern. Total range 0-10. Rubric, scoring code, and per-pattern outputs published openly under CC-BY-4.0.",
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: JSON_EXPORT_URL,
      },
    ],
    isBasedOn: {
      "@type": "Dataset",
      name: "Indie SaaS Teardowns Dataset",
      url: DATASET_LANDING_URL,
    },
    citation: `${BASE_URL}/cite/research-funnel-hook-distribution-v1-0-0`,
  });
}

function buildArticleJsonLd(): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: `Indie SaaS Funnel Hook Distribution – ${HOOK_DISTRIBUTION.n} Teardowns Scored on a 5-Axis Rubric`,
    url: PAGE_URL,
    datePublished: PUBLISHED_ISO,
    dateModified: PUBLISHED_ISO,
    author: {
      "@type": "Person",
      name: FOUNDER.name,
      url: `${BASE_URL}/founding`,
    },
    publisher: {
      "@type": "Organization",
      name: ORGANIZATION.name,
      url: BASE_URL,
    },
    mainEntityOfPage: PAGE_URL,
    license: DATASET_LICENSE_URL,
    citation: `${BASE_URL}/cite/research-funnel-hook-distribution-v1-0-0`,
    about: "Structural analysis of indie SaaS funnel hook patterns.",
  });
}

const histogramBars = HOOK_DISTRIBUTION.histogram.map((count, score) => ({
  score,
  count,
  pct: HOOK_DISTRIBUTION.n === 0 ? 0 : (count / HOOK_DISTRIBUTION.n) * 100,
}));

const bottomThree = lowestScoring(ALL_HOOK_SCORES, 3);
const topThree = highestScoring(ALL_HOOK_SCORES, 3);

export default function FunnelHookDistributionPage() {
  const citation = getCitationForResearch("funnel-hook-distribution");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildDatasetJsonLd() }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: buildArticleJsonLd() }}
      />

      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <p className="text-sm text-muted-foreground">
          <Link href="/research" className="underline-offset-4 hover:underline">
            Research
          </Link>{" "}
          <span aria-hidden="true">/</span> Funnel Hook Distribution v{VERSION}
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          First {HOOK_DISTRIBUTION.n} indie SaaS funnels we teardown'd:{" "}
          {HOOK_DISTRIBUTION.belowFourCount} hook patterns score under 4 on our
          5-axis rubric.
        </h1>

        {/* TL;DR – 60-80 words, answer-first per 2026 GEO guidance */}
        <section
          aria-label="TL;DR"
          className="mt-6 rounded-lg border border-border bg-muted/40 p-5"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            TL;DR
          </p>
          <p className="mt-2 text-base leading-relaxed">
            We applied a 5-axis structural rubric – target identity, outcome
            specificity, polarity, distinct mechanism, time/quantity grounding
            – to the {HOOK_DISTRIBUTION.n} hook patterns in our public
            teardown corpus. Mean score is {HOOK_DISTRIBUTION.mean}/10, median
            is {HOOK_DISTRIBUTION.median}/10, range {HOOK_DISTRIBUTION.min}–
            {HOOK_DISTRIBUTION.max}.{" "}
            {HOOK_DISTRIBUTION.belowFourCount} patterns exhibit fewer than 4 of
            the 10 structural points. The rubric, the scoring code, and every
            per-pattern score are published below under CC-BY-4.0.
          </p>
        </section>

        {/* Methodology */}
        <Separator className="my-10" />
        <section aria-labelledby="methodology-h2">
          <h2 id="methodology-h2" className="text-2xl font-bold">
            Methodology
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            The corpus is the public{" "}
            <Link
              href="/dataset"
              className="font-medium underline underline-offset-4"
            >
              Indie SaaS Teardowns Dataset
            </Link>{" "}
            – {HOOK_DISTRIBUTION.n} funnels we have manually teardown'd at the
            Hook-Story-Offer / Value Ladder level. Each teardown carries an
            authored <code>brunsonLens.hook</code> pattern description (e.g.{" "}
            <em>
              "Big enemy positioning (Brunson Common Enemy identity hook) plus
              a principle the reader already half-believes"
            </em>
            ).
          </p>
          <p className="mt-3 text-base leading-relaxed">
            We score each pattern description on five structural axes, 0/1/2
            per axis. Two distinct keyword hits on an axis score 2; one hit
            scores 1; zero hits score 0. Total range is 0 to 10. The keyword
            sets are published in full inside{" "}
            <code>app/src/lib/seo/funnel-hook-analysis.ts</code> in this
            repository, and the rubric anchors are listed below so any reader
            can replicate the scoring by hand against any pattern.
          </p>
          <div className="mt-5 rounded-md border border-amber-500/40 bg-amber-500/5 p-4 text-sm leading-relaxed">
            <p className="font-semibold">What this study does NOT measure.</p>
            <p className="mt-1">
              We do not measure marketing performance, conversion rate, or
              traffic. We do not claim that a low-scoring pattern produces
              fewer customers – many one-axis hooks (Tally's "free forever,
              unlimited") perform extremely well in practice. The rubric is a
              property of our own pattern descriptions, not a judgment of the
              target companies. The point is to surface which structural
              elements our analyses tend to call out, and which the teaching
              corpus is structurally lighter on.
            </p>
          </div>
        </section>

        {/* Rubric */}
        <Separator className="my-10" />
        <section aria-labelledby="rubric-h2">
          <h2 id="rubric-h2" className="text-2xl font-bold">
            The 5-axis rubric
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            Each axis is scored 0/1/2. The anchors below describe what each
            score level looks like in practice.
          </p>
          <ol className="mt-5 space-y-5">
            {HOOK_RUBRIC.map((axis) => (
              <li
                key={axis.axis}
                className="rounded-md border border-border bg-card p-4"
              >
                <h3 className="text-lg font-semibold">{axis.label}</h3>
                <p className="mt-1 text-sm italic text-muted-foreground">
                  {axis.question}
                </p>
                <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-red-700 dark:text-red-400">
                      0 points
                    </dt>
                    <dd>{axis.anchors.zero}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-amber-700 dark:text-amber-400">
                      1 point
                    </dt>
                    <dd>{axis.anchors.one}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-emerald-700 dark:text-emerald-400">
                      2 points
                    </dt>
                    <dd>{axis.anchors.two}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-muted-foreground">
                  Corpus mean for this axis: {HOOK_DISTRIBUTION.axisMeans[axis.axis]}/2.
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Distribution */}
        <Separator className="my-10" />
        <section aria-labelledby="distribution-h2">
          <h2 id="distribution-h2" className="text-2xl font-bold">
            Score distribution across the corpus
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            n = {HOOK_DISTRIBUTION.n}. Mean = {HOOK_DISTRIBUTION.mean}/10.
            Median = {HOOK_DISTRIBUTION.median}/10. Range ={" "}
            {HOOK_DISTRIBUTION.min}–{HOOK_DISTRIBUTION.max}.
          </p>
          <div
            role="figure"
            aria-label="Histogram of total scores from 0 to 10"
            className="mt-5 space-y-1"
          >
            {histogramBars.map((bar) => (
              <div key={bar.score} className="flex items-center gap-3 text-sm">
                <span className="w-8 text-right font-mono tabular-nums">
                  {bar.score}
                </span>
                <div
                  className="h-5 rounded-sm bg-foreground/80"
                  style={{ width: `${Math.max(bar.pct * 4, bar.count > 0 ? 8 : 0)}px` }}
                  aria-hidden="true"
                />
                <span className="font-mono tabular-nums text-muted-foreground">
                  n={bar.count}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            x-axis: total score 0-10. Bar length encodes count.
          </p>
        </section>

        {/* The 3 lowest */}
        <Separator className="my-10" />
        <section aria-labelledby="lowest-h2">
          <h2 id="lowest-h2" className="text-2xl font-bold">
            The {bottomThree.length} hook patterns scoring lowest on our rubric
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            These are the pattern descriptions in our corpus that exhibit the
            fewest of the five structural axes. Each is shown verbatim from
            our teardown, with the axis breakdown so a reader can see which
            elements are missing. A low score here is a property of our
            description; it is not a claim about the target company's
            performance.
          </p>
          <ol className="mt-6 space-y-6">
            {bottomThree.map((h) => (
              <li
                key={h.slug}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <Link
                    href={`/funnel-teardown/${h.slug}`}
                    className="text-lg font-semibold underline underline-offset-4"
                  >
                    {h.displayName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {h.category}
                  </span>
                  <span className="ml-auto font-mono tabular-nums text-sm">
                    {h.total}/10
                  </span>
                </div>
                <blockquote className="mt-3 border-l-2 border-border pl-4 text-sm italic">
                  {h.pattern}
                </blockquote>
                <dl className="mt-4 grid grid-cols-1 gap-1 text-xs sm:grid-cols-5">
                  {HOOK_RUBRIC.map((axis) => (
                    <div key={axis.axis}>
                      <dt className="font-semibold">{axis.short}</dt>
                      <dd
                        className={
                          h.byAxis[axis.axis] === 0
                            ? "text-red-700 dark:text-red-400"
                            : h.byAxis[axis.axis] === 1
                              ? "text-amber-700 dark:text-amber-400"
                              : "text-emerald-700 dark:text-emerald-400"
                        }
                      >
                        {h.byAxis[axis.axis]}/2
                      </dd>
                    </div>
                  ))}
                </dl>
                {h.missingAxes.length > 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Missing axes:{" "}
                    {h.missingAxes
                      .map((a) => AXIS_LABEL[a].toLowerCase())
                      .join(", ")}
                    .
                  </p>
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* The 3 highest – contrast */}
        <Separator className="my-10" />
        <section aria-labelledby="highest-h2">
          <h2 id="highest-h2" className="text-2xl font-bold">
            For contrast: the {topThree.length} highest-scoring patterns
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            Same rubric, top of the distribution. These patterns exhibit
            structural elements across more of the five axes.
          </p>
          <ol className="mt-6 space-y-6">
            {topThree.map((h) => (
              <li
                key={h.slug}
                className="rounded-md border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <Link
                    href={`/funnel-teardown/${h.slug}`}
                    className="text-lg font-semibold underline underline-offset-4"
                  >
                    {h.displayName}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {h.category}
                  </span>
                  <span className="ml-auto font-mono tabular-nums text-sm">
                    {h.total}/10
                  </span>
                </div>
                <blockquote className="mt-3 border-l-2 border-border pl-4 text-sm italic">
                  {h.pattern}
                </blockquote>
                <dl className="mt-4 grid grid-cols-1 gap-1 text-xs sm:grid-cols-5">
                  {HOOK_RUBRIC.map((axis) => (
                    <div key={axis.axis}>
                      <dt className="font-semibold">{axis.short}</dt>
                      <dd
                        className={
                          h.byAxis[axis.axis] === 0
                            ? "text-red-700 dark:text-red-400"
                            : h.byAxis[axis.axis] === 1
                              ? "text-amber-700 dark:text-amber-400"
                              : "text-emerald-700 dark:text-emerald-400"
                        }
                      >
                        {h.byAxis[axis.axis]}/2
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>
        </section>

        {/* Per-axis means */}
        <Separator className="my-10" />
        <section aria-labelledby="axis-means-h2">
          <h2 id="axis-means-h2" className="text-2xl font-bold">
            What our corpus over- and under-emphasizes
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            Per-axis means tell us which structural elements our pattern
            descriptions reliably surface, and which they tend to skip.
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {HOOK_RUBRIC.map((axis) => (
              <li
                key={axis.axis}
                className="flex items-baseline justify-between gap-3 border-b border-border/50 py-2"
              >
                <span className="font-medium">{axis.label}</span>
                <span className="font-mono tabular-nums">
                  {HOOK_DISTRIBUTION.axisMeans[axis.axis]}/2
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Downloads */}
        <Separator className="my-10" />
        <section aria-labelledby="downloads-h2">
          <h2 id="downloads-h2" className="text-2xl font-bold">
            Open downloads
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            Every per-pattern score, the rubric, and the histogram are
            published as machine-readable JSON. Licensed CC-BY-4.0 –
            attribution required.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                href="/research/funnel-hook-distribution.json"
                className="font-medium underline underline-offset-4"
              >
                funnel-hook-distribution.json
              </Link>{" "}
              <span className="text-muted-foreground">
                – full bundle (rubric, scores, distribution)
              </span>
            </li>
            <li>
              <Link
                href={`/cite/${citation.id}`}
                className="font-medium underline underline-offset-4"
              >
                /cite/{citation.id}
              </Link>{" "}
              <span className="text-muted-foreground">
                – formal citation permalink (BibTeX, RIS, APA, MLA, Chicago,
                CSL-JSON)
              </span>
            </li>
            <li>
              <Link
                href="/dataset"
                className="font-medium underline underline-offset-4"
              >
                /dataset
              </Link>{" "}
              <span className="text-muted-foreground">
                – the source teardown corpus this analysis is derived from
              </span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            License: {DATASET_LICENSE_SPDX} ·{" "}
            <Link
              href={DATASET_LICENSE_URL}
              className="underline underline-offset-2"
            >
              {DATASET_LICENSE_URL}
            </Link>
            . Published {PUBLISHED_ISO}. Version {VERSION}.
          </p>
        </section>

        {/* Citation block */}
        <Separator className="my-10" />
        <section aria-labelledby="cite-h2">
          <h2 id="cite-h2" className="text-2xl font-bold">
            Cite this analysis
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            Quoting a statistic? Use the citation permalink so the version of
            the rubric that produced your number stays pinned.
          </p>
          <div className="mt-4">
            <CitationBlock citation={citation} />
          </div>
        </section>

        {/* Corrections + CTA */}
        <Separator className="my-10" />
        <section aria-labelledby="corrections-h2">
          <h2 id="corrections-h2" className="text-2xl font-bold">
            Found something off?
          </h2>
          <p className="mt-3 text-base leading-relaxed">
            Every claim on this page is reproducible from{" "}
            <code>app/src/lib/seo/funnel-hook-analysis.ts</code> and the
            published corpus. If you re-run the rubric and find a different
            number, file a correction via the{" "}
            <Link
              href={CORRECTIONS_LOG_URL}
              className="font-medium underline underline-offset-4"
            >
              editorial policy
            </Link>
            .
          </p>
          <div className="mt-8 rounded-md border border-border bg-muted/40 p-5">
            <p className="text-sm font-semibold">
              Want a Hook-Story-Offer scorecard on your own funnel?
            </p>
            <p className="mt-1 text-sm leading-relaxed">
              Our free diagnostic runs the same five-axis lens against your
              landing page in under a minute.{" "}
              <Link
                href="/diagnostic"
                className="font-medium underline underline-offset-4"
              >
                Score your own funnel free →
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
