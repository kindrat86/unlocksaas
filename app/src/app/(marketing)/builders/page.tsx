/**
 * Public Verified Builder Directory.
 *
 * The second-most-valuable owned-traffic asset on UnlockSaaS, after the
 * email list. Closes the Traffic Secrets Secret #5 ("Traffic You Own") audit
 * gap: documents and surfaces a second owned discovery channel beyond email.
 *
 * Source: strategy/owned-traffic.md Part 7.
 *
 * The directory:
 *   • lives at /builders
 *   • reads the `builder_badges` view (public, RLS-filtered to
 *     share_visibility = 'public' + non-null first_customer_at)
 *   • renders an honest empty state until the first verified builder lands
 *   • is the destination that every individual /builder/[slug] page is a
 *     member of — the index makes the proof discoverable, not just shareable
 *
 * What this page does NOT do (deliberately):
 *   • no fake counts — when zero rows exist we say so plainly
 *   • no opt-in form on the directory itself; the page belongs to the
 *     verified builders, not to UnlockSaaS. One unobtrusive footer line
 *     points back to /diagnostic.
 *   • no search, sort, filter, or pagination — deferred to >50 rows
 *     (strategy/owned-traffic.md §7).
 *
 * Voice rules:
 *   • Reluctant Hero — workbook 01 §6.
 *   • The page is about the builders, not about UnlockSaaS — workbook 05 §7
 *     manifesto ("we collect customers, not praise").
 */

import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { createAdminClient, hasSupabaseAdminConfig } from "@/lib/supabase/server";
import { cacheLife, cacheTag } from "next/cache";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import {
  BuildersCollectionJsonLd,
  type BuilderRowForSchema,
} from "@/components/seo/builders-collection";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { FOUNDING_COHORT_SERIAL_CAP, formatSerial } from "@/lib/builder-badge";


export const metadata: Metadata = {
  title: "Verified Builders — UnlockSaaS",
  description:
    "Founders who shipped a product and got a paying customer. Verified by Stripe, not self-reported.",
  // Normalized to path-relative; metadataBase in src/app/layout.tsx resolves
  // it to the absolute URL. Matches the convention every other surface uses.
  alternates: pageAlternates("/builders"),
  openGraph: {
    title: "Verified Builders — UnlockSaaS",
    description:
      "Founders who shipped a product and got a paying customer. Verified by Stripe, not self-reported.",
    url: "https://unlocksaas.com/builders",
    type: "website",
  },
};

interface BuilderRow {
  builder_slug: string;
  builder_name: string | null;
  product_name: string | null;
  product_url: string | null;
  first_customer_at: string;
}

/**
 * Cached read of the public builders view. Service-role Supabase reads (no
 * cookies, no per-user filtering) are safe inside `'use cache'`. Tagged so
 * the Stripe Connect verified-conversion webhook can invalidate the
 * directory via `revalidateTag("builder_badges", "max")` the moment a new
 * builder flips to public (Next 16 two-arg form with cacheLife profile).
 * The 1h revalidate window is the safety net if the webhook misses; cache
 * key is empty (no arguments) so all requests share one value.
 */
async function loadPublicBuilders(): Promise<BuilderRow[]> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("builder_badges");
  if (!hasSupabaseAdminConfig()) return [];

  const supabase = createAdminClient();
  // `builder_badges` view filters to share_visibility='public' + non-null
  // slug + non-null first_customer_at. Ordered most-recent first.
  const { data, error } = await supabase
    .from("builder_badges")
    .select(
      "builder_slug, builder_name, product_name, product_url, first_customer_at"
    )
    .order("first_customer_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data as BuilderRow[];
}

/**
 * Attach the founding-cohort serial (1-indexed, ASC-by-first_customer_at)
 * to each row. We already fetched the rows in DESC order above; the
 * earliest verified row in the page has the smallest serial, the latest
 * the largest. Computed inline (not via `loadVerifiedBuilders`) because
 * this page reads the snake_case Supabase shape directly – the lib
 * helper returns the camelCase `PublicBadge` shape and we don't want a
 * lossy round-trip.
 */
function attachSerials(rows: BuilderRow[]): Array<BuilderRow & { serial: number }> {
  const total = rows.length;
  return rows.map((row, i) => ({ ...row, serial: total - i }));
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

function initials(name: string | null): string {
  if (!name) return "VB";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return "VB";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

/**
 * Verified Builder directory breadcrumb trail. Two-deep (Home › The
 * Directory) so the BreadcrumbList schema matches the visible site
 * navigation. The crumb label uses the "The Directory" eyebrow rendered
 * in the page header – schema and DOM agree.
 */
const BUILDERS_BREADCRUMB = [
  { name: "Home", url: "https://unlocksaas.com/" },
  { name: "Verified Builders", url: "https://unlocksaas.com/builders" },
] as const;

/**
 * Map a `builder_badges` row (snake_case, Supabase-shaped) to the
 * camelCase shape `BuildersCollectionJsonLd` consumes. Keeps the schema
 * component Supabase-agnostic and turns this page into the single place
 * the row shape is translated.
 */
function rowToSchemaShape(row: BuilderRow): BuilderRowForSchema {
  return {
    slug: row.builder_slug,
    name: row.builder_name,
    productName: row.product_name,
    productUrl: row.product_url,
    firstCustomerAt: row.first_customer_at,
  };
}

export default async function BuildersDirectoryPage() {
  const builders = await loadPublicBuilders();
  const count = builders.length;
  const buildersForSchema = builders.map(rowToSchemaShape);
  const ranked = attachSerials(builders);
  // The "next seat" identity. When the directory is empty, the first
  // verified builder gets #001. When ranked.length === 5, the next seat
  // is #006. Displayed in the empty-state polarity card so a reader
  // knows exactly which serial they would inherit.
  const nextSerial = count + 1;
  const foundingSeatsRemaining = Math.max(
    0,
    FOUNDING_COHORT_SERIAL_CAP - count,
  );

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {/*
        E-E-A-T proof loop schema. Two JSON-LD blocks:
          1. CollectionPage + ItemList (when non-empty) anchors the
             Verified Builders directory as a typed entity collection
             linked back to ID.organization / ID.website. The single
             highest-leverage E-E-A-T "Experience" pillar signal a
             pre-revenue indie SaaS can claim honestly – present whether
             or not any rows have landed yet.
          2. BreadcrumbList mirrors the on-page navigation crumb trail
             so retrievers resolve the page's position in the site
             hierarchy without parsing visible HTML.
      */}
      <BuildersCollectionJsonLd
        url="https://unlocksaas.com/builders"
        builders={buildersForSchema}
      />
      <BreadcrumbListJsonLd trail={BUILDERS_BREADCRUMB} />
      <div className="max-w-3xl mx-auto">
        {/* ── Header ───────────────────────────────────────────────────── */}
        <header className="mb-12">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            The Directory
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Verified Builders
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
            Founders who shipped a product and got a paying customer.{" "}
            <span className="text-foreground">Verified by Stripe.</span>{" "}
            Not self-reported. Not a screenshot. A real charge on a connected
            Stripe account.
          </p>
        </header>

        {/* ── Body: empty state OR card grid ──────────────────────────── */}
        {count === 0 ? (
          // ────────────────────────────────────────────────────────────────
          // Brunson polarity empty state.
          //
          // The directory has zero rows. Two ways to render this:
          //  (a) "No verified builders yet." Flat. Apologetic. Honest but soft.
          //  (b) Turn the 0 into the proof. Lean into the absence – we refuse
          //      to fake it – and assign identity to the as-yet-unclaimed
          //      first seat. Brunson's polarity move: the empty page is the
          //      offer.
          //
          // Three cards, no hype:
          //   1. The live count, dated, with the "we refuse to fabricate"
          //      line that anchors the editorial position.
          //   2. The founding-cohort numbered seats (#001 – #010), so the
          //      first ten founders carry a permanent identity marker on
          //      their badge / Review JSON-LD / embed kit.
          //   3. The four-step path, so a reader does not have to guess
          //      what they would actually do to claim the next seat.
          //
          // Voice: Reluctant Hero. No "be a hero." No emoji. No yellow
          // attention bar. The proof is the language, not the visual gloss.
          // ────────────────────────────────────────────────────────────────
          <section
            aria-label="The directory is empty by design"
            className="space-y-6"
          >
            {/* Card 1 – live count + editorial position */}
            <div className="rounded-2xl border bg-card p-8 sm:p-10 space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Live count
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                0 verified builders today.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                We refuse to fabricate this number. The directory updates
                automatically the moment a connected Stripe account on the
                Playbook sees its first paying customer. Nothing here is
                hand-curated. Nothing here is bought. The cycle is wired and
                live – when the first webhook fires, this card disappears and
                the first row lands.
              </p>
            </div>

            {/* Card 2 – numbered seats (founding cohort identity) */}
            <div className="rounded-2xl border bg-card p-8 sm:p-10 space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Numbered seats
              </p>
              <h2 className="text-2xl font-bold leading-tight">
                {formatSerial(1)} through{" "}
                {formatSerial(FOUNDING_COHORT_SERIAL_CAP)} carry the founding
                cohort serial.
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                The first {FOUNDING_COHORT_SERIAL_CAP} founders through the
                cycle each get a permanent numbered identity on their public
                badge, on their cross-domain Review JSON-LD, and on every
                comparison page that names the Playbook as the proof. Seats
                after {formatSerial(FOUNDING_COHORT_SERIAL_CAP)} are
                unnumbered, still Verified. The number is earned, not given –
                Stripe picks who gets it.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed pt-2 border-t">
                <span className="text-foreground font-medium">
                  Next seat: {formatSerial(nextSerial)}
                </span>{" "}
                · {foundingSeatsRemaining} founding-cohort serials remaining.
              </p>
            </div>

            {/* Card 3 – the path */}
            <div className="rounded-2xl border bg-card p-8 sm:p-10 space-y-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                The path to {formatSerial(nextSerial)}
              </p>
              <h2 className="text-2xl font-bold leading-tight">
                Four steps. No invitation. No application.
              </h2>
              <ol className="space-y-3 text-base text-muted-foreground leading-relaxed">
                <li>
                  <span className="text-foreground font-medium">1.</span> Take
                  the Free Diagnostic. Sixty seconds. No card.
                </li>
                <li>
                  <span className="text-foreground font-medium">2.</span> If
                  the diagnosis fits, start the Playbook ($1 Starter, then
                  $49/mo Core).
                </li>
                <li>
                  <span className="text-foreground font-medium">3.</span>{" "}
                  Connect your Stripe in Step 7 of the Playbook.
                </li>
                <li>
                  <span className="text-foreground font-medium">4.</span> Ship
                  the work. When a real customer pays you, the badge fires
                  automatically. No screenshot. No self-report. No tweet for
                  proof.
                </li>
              </ol>
              <div className="pt-4">
                <Link
                  href="/diagnostic"
                  className="inline-flex items-center gap-2 rounded-md border border-foreground bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  Start the Free Diagnostic →
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">
              {count === 1
                ? "1 builder"
                : `${count} builders`}{" "}
              · most recent first
            </p>
            <ul
              role="list"
              className="grid gap-4 sm:grid-cols-2"
              aria-label="Verified Builder directory"
            >
              {ranked.map((b) => {
                const isFoundingCohort =
                  b.serial <= FOUNDING_COHORT_SERIAL_CAP;
                return (
                  <li key={b.builder_slug}>
                    <Link
                      href={`/builder/${b.builder_slug}`}
                      className="block h-full rounded-2xl border bg-card p-6 transition-colors hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <article className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-sm font-semibold uppercase"
                          >
                            {initials(b.builder_name)}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                              <CheckCircle2
                                className="h-3 w-3 text-foreground"
                                aria-hidden="true"
                              />
                              <span>
                                Verified Builder {formatSerial(b.serial)}
                              </span>
                            </div>
                            {isFoundingCohort ? (
                              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                                Founding cohort
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold leading-tight">
                          {b.builder_name ?? "Verified Builder"}
                        </h3>

                        {b.product_name ? (
                          <p className="text-sm text-muted-foreground">
                            {b.product_name}
                          </p>
                        ) : null}

                        <p className="text-xs text-muted-foreground pt-2 border-t">
                          First customer verified{" "}
                          <span className="text-foreground">
                            {formatDate(b.first_customer_at)}
                          </span>
                        </p>
                      </article>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* ── Footer: quiet attribution + one CTA ─────────────────────── */}
        <footer className="mt-16 border-t pt-8 space-y-4 text-sm text-muted-foreground">
          <p className="leading-relaxed">
            The directory is part of UnlockSaaS — the Playbook that helped these
            founders get to a paying customer in 60 days, verified by Stripe or
            refunded. If you shipped a product and have not made the line move
            yet, the door starts at the{" "}
            <Link
              href="/diagnostic"
              className="underline underline-offset-4 text-foreground hover:text-foreground"
            >
              Free Diagnostic
            </Link>
            .
          </p>
          <p className="leading-relaxed">
            See the directory by quarter:{" "}
            <Link
              href="/cohort"
              className="underline underline-offset-4 text-foreground hover:text-foreground"
            >
              Verified Builders cohorts
            </Link>
            . Each /cohort/&lt;YYYY-qN&gt; URL is the permanent class-of-the-quarter
            record for the founders who shipped a Stripe-verified customer inside the window.
          </p>
          <p className="text-xs leading-relaxed">
            Every row above is opt-in — verified builders flip{" "}
            <code className="text-foreground">share_visibility</code> to public
            on their dashboard. Refunds do not revoke a badge; the customer was
            real. If you want yours removed, flip it back to private inside the
            Playbook.
          </p>
        </footer>
      </div>
    </div>
  );
}
