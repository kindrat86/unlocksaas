import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import {
  CURRENT_EDITION_YEAR,
  EDITIONS,
  EDITION_YEARS_DESC,
  MIN_REPORT_N,
  STATE_OF_SAAS_INDEX_URL,
  STATE_OF_SAAS_LICENSE_SPDX,
  editionUrl,
  getEdition,
} from "@/lib/state-of-saas";

/**
 * /state-of-saas — index of every annual edition of the State of
 * Post-Launch Pre-Revenue SaaS report.
 *
 * Surface C (linkable asset) + Surface B (AEO/GEO citation anchor).
 * Lists every shipped edition with a one-line tagline + the editorial
 * state (enrollment_open vs published vs closed). New editions added
 * to the EDITIONS array in lib/state-of-saas.ts auto-render here.
 *
 * Why this exists as its own page
 * -------------------------------
 * Long-tail searches and AI overviews for "state of indie SaaS",
 * "annual SaaS founder report", "SaaS funnel diagnostic dataset" land
 * here. Without an index, every link goes to the current edition and a
 * reader looking for last year's numbers (in 2028, the 2026 edition) has
 * no canonical archive to discover. The index is the table of contents
 * for the whole series – the same role /press/topics plays for press
 * topics and /alternatives-to plays for alternatives.
 *
 * Brunson Hard-Rule reconciliation
 * --------------------------------
 *   - Editions appear here when they exist in the EDITIONS array — the
 *     array is the single source of truth, append-only.
 *   - The editorial state is shown verbatim (enrollment_open /
 *     published / closed). No "coming soon" placeholders, no fabricated
 *     "0 published" framing that pretends the series is older than it is.
 *   - The page is honest about being the launch edition: when EDITIONS
 *     has length 1 and that edition is enrollment_open, the body copy
 *     reads "Edition 1 cohort enrolling now" – not "see our annual reports".
 */

export const metadata: Metadata = {
  title: `State of Post-Launch Pre-Revenue SaaS – Annual Reports`,
  description: `Annual flagship report from ${ORGANIZATION.name}. What founders who already shipped (but have not yet earned their first paying customer) are actually getting wrong, drawn from real diagnostic submissions. Free, CC-BY-4.0.`,
  alternates: { canonical: "/state-of-saas" },
  openGraph: {
    type: "website",
    title: "State of Post-Launch Pre-Revenue SaaS – Annual Reports",
    description: `Annual flagship report from ${ORGANIZATION.name}. Wrong Person vs Weak Offer vs Weak Belief distribution across the cohort of founders who paste a real URL into the free diagnostic.`,
    url: "/state-of-saas",
    siteName: ORGANIZATION.name,
  },
  twitter: {
    card: "summary_large_image",
    title: "State of Post-Launch Pre-Revenue SaaS – Annual Reports",
    description: `Free annual report on indie SaaS founder failure modes. CC-BY-4.0.`,
  },
  robots: { index: true, follow: true },
};

// ISR — page is the same for everyone, but the EDITIONS registry is a
// module constant so the only thing that can change is when a future
// edition is added. Hourly rebuild is generous; daily would also be safe.

const TRAIL = [
  { name: ORGANIZATION.name, url: `${BASE_URL}/` },
  { name: "State of Post-Launch Pre-Revenue SaaS", url: STATE_OF_SAAS_INDEX_URL },
] as const;

/**
 * Human-friendly editorial-state label. Mirrors the values used in the
 * ACTIVATION_LOG in lib/seo/freshness.ts — same vocabulary so a reader
 * who crawled the freshness log lands on familiar terms.
 */
function stateLabel(state: "enrollment_open" | "published" | "closed"): string {
  if (state === "enrollment_open") return "Enrollment open";
  if (state === "published") return "Published";
  return "Closed";
}

export default function StateOfSaasIndexPage() {
  const currentEdition = getEdition(CURRENT_EDITION_YEAR);
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
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
            {ORGANIZATION.name}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>State of Post-Launch Pre-Revenue SaaS</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Annual report · {STATE_OF_SAAS_LICENSE_SPDX} · {EDITIONS.length}{" "}
            {EDITIONS.length === 1 ? "edition" : "editions"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            State of Post-Launch Pre-Revenue SaaS
          </h1>
          <p
            className="text-base text-muted-foreground leading-relaxed"
            data-speakable
          >
            One report per calendar year on the cohort no other indie SaaS
            publisher writes about: founders who already shipped (often with
            Lovable, Claude, Replit, v0, Cursor, or Bolt.new) but have not
            yet earned their first paying customer. The headline finding of
            every edition is the diagnostic-label distribution – Wrong Person
            vs Weak Offer vs Weak Belief – across the real URLs founders paste
            into the free diagnostic during that year.
          </p>
        </header>

        <Separator className="my-8" />

        <section
          className="mb-10 space-y-3 leading-relaxed"
          aria-labelledby="why-now"
        >
          <h2 id="why-now" className="text-2xl font-bold">
            Why this report matters in {CURRENT_EDITION_YEAR}
          </h2>
          <p className="text-muted-foreground">
            The tech-employment correction (publicly tracked at{" "}
            <a
              href="https://layoffs.fyi"
              rel="noopener noreferrer"
              target="_blank"
              className="underline underline-offset-4"
            >
              layoffs.fyi
            </a>
            ) keeps pushing salaried SaaS operators out of full-time roles,
            and AI tooling keeps lowering the cost of shipping a first
            product to roughly a weekend of evenings. The predictable
            outcome is more people sitting on a deployed URL with no
            paying customers – the exact cohort this report describes.
            The {CURRENT_EDITION_YEAR} edition spells out the macro
            framing in full.
          </p>
          <p className="text-sm">
            <Link
              href={`/state-of-saas/${CURRENT_EDITION_YEAR}#macro-context`}
              className="font-semibold underline underline-offset-4"
            >
              Read the {CURRENT_EDITION_YEAR} macro context →
            </Link>
          </p>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">Editions</h2>
          <p className="text-muted-foreground">
            Each edition covers one calendar year. The numbers publish when
            the year&rsquo;s cohort reaches at least {MIN_REPORT_N}{" "}
            submissions – the editorial floor below which percentage shares
            would obscure more than they reveal. Below threshold, the
            edition page is still public; it documents the methodology and
            shows the current enrollment.
          </p>
          <ul className="space-y-3">
            {EDITION_YEARS_DESC.map((year) => {
              const edition = getEdition(year);
              if (!edition) return null;
              return (
                <li
                  key={year}
                  className="border border-border rounded-lg p-5"
                >
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <Link
                      href={`/state-of-saas/${year}`}
                      className="text-lg font-semibold underline underline-offset-4"
                    >
                      {edition.displayTitle}
                    </Link>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground shrink-0">
                      {stateLabel(edition.state)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {edition.tagline}
                  </p>
                  <div className="mt-3 text-xs text-muted-foreground">
                    Window: {edition.windowStart} → {edition.windowEnd}{" "}
                    · Last verified: {edition.lastVerified}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4 leading-relaxed">
          <h2 className="text-2xl font-bold">How the cohort is collected</h2>
          <p className="text-muted-foreground">
            The cohort is every founder who pastes a real product URL into
            the{" "}
            <Link
              href="/diagnostic"
              className="text-foreground underline underline-offset-4"
            >
              free Launch Diagnostic
            </Link>
            . The diagnostic returns one of three labels – Wrong Person,
            Weak Offer, Weak Belief – per Russell Brunson&rsquo;s Four Core
            Stories framework. The report&rsquo;s headline finding is the
            distribution of those labels across the year&rsquo;s submissions.
            No email is required to participate in the cohort; emails that
            are submitted are NOT read by the aggregator that builds this
            report. Only the label, the bucket tag, and the submission
            timestamp are aggregated.
          </p>
          <p className="text-muted-foreground">
            See the{" "}
            <Link
              href="/editorial-policy"
              className="text-foreground underline underline-offset-4"
            >
              editorial policy
            </Link>{" "}
            for the corrections workflow and the financial-disclosures
            list. The methodology section on each edition&rsquo;s page
            details the exact columns the aggregator reads and the columns
            it deliberately ignores.
          </p>
        </section>

        {currentEdition ? (
          <>
            <Separator className="my-8" />
            <section className="mb-10 space-y-4 leading-relaxed">
              <h2 className="text-2xl font-bold">Contribute to the current cohort</h2>
              <p className="text-muted-foreground">
                The {currentEdition.year} cohort is{" "}
                {currentEdition.state === "enrollment_open"
                  ? "still enrolling"
                  : currentEdition.state === "published"
                    ? "published, but new submissions still flow through and inform the year-end revision"
                    : "closed"}
                . Founders who paste a real URL into the diagnostic become
                part of the next edition&rsquo;s findings automatically. No
                separate signup, no waitlist – the cohort IS the diagnostic.
              </p>
              <p className="text-sm">
                <Link
                  href="/diagnostic"
                  className="font-semibold underline underline-offset-4"
                >
                  Run the free diagnostic →
                </Link>
              </p>
            </section>
          </>
        ) : null}

        <Separator className="my-8" />

        <section className="mb-10 space-y-3 leading-relaxed">
          <h2 className="text-2xl font-bold">License and re-use</h2>
          <p className="text-sm text-muted-foreground">
            Every edition is released under {STATE_OF_SAAS_LICENSE_SPDX} –
            free to quote, free to remix, free to chart. The only obligation
            is attribution: name {ORGANIZATION.name} ({FOUNDER.name}) and
            link the canonical edition URL. Per-edition citation strings
            (plain-text, BibTeX, APA, MLA, Chicago) live on the edition
            page itself.
          </p>
        </section>
      </article>
    </div>
  );
}
