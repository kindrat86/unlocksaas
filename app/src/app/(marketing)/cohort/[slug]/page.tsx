/**
 * /cohort/[YYYY-qN] - per-quarter Verified Builders cohort page.
 *
 * Renders one quarterly class of the Playbook:
 *   - Members are read from the `builder_badges` view (Stripe-verified,
 *     public, RLS-filtered), bounded by the quarter window
 *     (first_customer_at >= windowStartIso AND < windowEndIso).
 *   - Cached via `'use cache'` with tag `cohort-<slug>` so the Stripe
 *     verified-conversion webhook can invalidate the cohort the moment
 *     a new builder lands inside the window (revalidateTag in the
 *     webhook follows the same pattern as `builder_badges`).
 *   - Pre-launch empty state mirrors /builders: polarity, no fabrication,
 *     status-aware copy (upcoming vs current vs past empty).
 *
 * JSON-LD shape:
 *   - Article (the cohort's history record)
 *   - Event (the calendar window itself, schema.org/Event)
 *   - CollectionPage + ItemList of Person (when non-empty)
 *   - BreadcrumbList
 *
 * Brunson Hard-Rule reconciliation:
 *   - All numbers come from `builder_badges`. No invented members.
 *   - Empty quarters say so. Upcoming quarters name the open date.
 *   - Builder names come from `builder_name` (or "Verified Builder" when
 *     null), mirroring the /builders directory exactly.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cacheLife, cacheTag } from "next/cache";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  COHORT_SLUGS,
  formatWindow,
  getCohortBySlug,
  statusFor,
  type CohortQuarter,
} from "@/lib/cohorts";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { articleImageFor } from "@/lib/seo/article-image";
import { formatVerifiedDate } from "@/lib/seo/dates";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

export function generateStaticParams() {
  return COHORT_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const c = getCohortBySlug(params.slug);
  if (!c) return {};

  const canonical = `/cohort/${c.slug}`;
  return {
    title: c.metaTitle,
    description: c.metaDescription,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: c.metaTitle,
      description: c.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: c.metaTitle,
      description: c.metaDescription,
    },
  };
}

interface CohortBuilderRow {
  builder_slug: string;
  builder_name: string | null;
  product_name: string | null;
  product_url: string | null;
  first_customer_at: string;
}

/**
 * Cached read of `builder_badges` bounded by the quarter window. Service-
 * role Supabase reads (no cookies, no per-user filtering) are safe inside
 * `'use cache'`. Tagged so the Stripe verified-conversion webhook can
 * invalidate per-cohort the moment a row lands in this window. The 1h
 * revalidate window is the safety net if the webhook misses; the cache
 * key includes the two window-bound arguments so each cohort is its own
 * cache entry.
 */
async function loadCohortBuilders(
  windowStartIso: string,
  windowEndIso: string,
  cohortSlug: string,
): Promise<CohortBuilderRow[]> {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag("builder_badges", `cohort-${cohortSlug}`);
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("builder_badges")
    .select(
      "builder_slug, builder_name, product_name, product_url, first_customer_at",
    )
    .gte("first_customer_at", windowStartIso)
    .lt("first_customer_at", windowEndIso)
    .order("first_customer_at", { ascending: true });
  if (error || !data) return [];
  return data as CohortBuilderRow[];
}

function initials(name: string | null): string {
  if (!name) return "VB";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return "VB";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function formatDate(iso: string): string {
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Static JSON-LD blocks that do not depend on member count: Article,
 * Event, BreadcrumbList. Safe to render in the prerendered shell.
 */
function buildStaticJsonLd(c: CohortQuarter, canonicalUrl: string): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Verified Builders ${c.displayName} cohort`,
    image: articleImageFor(canonicalUrl),
    description: c.metaDescription,
    abstract: c.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: c.lastVerified,
    dateModified: c.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `Verified Builders ${c.displayName}`,
      `${c.displayName} cohort`,
      `${c.displayName} class`,
      `indie SaaS ${c.year}`,
      "UnlockSaaS Playbook",
    ].join(", "),
    inLanguage: "en-US",
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
  };

  // Event: the cohort window itself is a real scheduled span. Helps
  // retrievers resolve "when did the 2026 Q2 class run" with one query.
  const event = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `Verified Builders ${c.displayName} cohort`,
    description: c.tldr,
    startDate: c.windowStartIso,
    endDate: c.windowEndIso,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url: canonicalUrl,
    },
    organizer: { "@id": ID.organization },
    inLanguage: "en-US",
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cohorts",
        item: `${BASE_URL}/cohort`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${c.displayName} cohort`,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(article),
    JSON.stringify(event),
    JSON.stringify(breadcrumbs),
  ];
}

/**
 * CollectionPage + ItemList of Person, only when members exist. Mirrors
 * the /builders empty-state schema rule: no fabricated counts. Rendered
 * inside the dynamic directory section after the member load resolves.
 */
function buildCollectionJsonLd(
  c: CohortQuarter,
  canonicalUrl: string,
  members: CohortBuilderRow[],
): string | null {
  if (members.length === 0) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${c.displayName} Verified Builders`,
    url: canonicalUrl,
    isPartOf: { "@id": ID.website },
    inLanguage: "en-US",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: members.length,
      itemListElement: members.map((m, i) => {
        const person: Record<string, unknown> = {
          "@type": "Person",
          name: m.builder_name ?? "Verified Builder",
          url: `${BASE_URL}/builder/${m.builder_slug}`,
        };
        if (m.product_name || m.product_url) {
          const works: Record<string, unknown> = {
            "@type": "SoftwareApplication",
            name: m.product_name ?? undefined,
          };
          if (m.product_url) works.url = m.product_url;
          person.worksFor = works;
        }
        return {
          "@type": "ListItem",
          position: i + 1,
          item: person,
        };
      }),
    },
  });
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

function EmptyState({
  cohort,
  status,
}: {
  cohort: CohortQuarter;
  status: "upcoming" | "current" | "past";
}) {
  const openDate = formatDate(cohort.windowStartIso);
  if (status === "upcoming") {
    return (
      <section
        aria-label="Cohort window has not opened yet"
        className="space-y-6"
      >
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Opens
            </p>
            <h2 className="text-2xl font-bold leading-tight">
              {cohort.displayName} opens on {openDate}.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              The cohort window starts the first day of the quarter. There is
              no application, no invitation, no waitlist. The page populates
              automatically the moment a Stripe-verified customer cycle fires
              for a Playbook builder inside the window. The path opens today
              with the free diagnostic.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }
  if (status === "current") {
    return (
      <section aria-label="Cohort is open, directory is empty" className="space-y-6">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Live count
            </p>
            <h2 className="text-2xl font-bold leading-tight">
              0 Verified Builders in {cohort.displayName} today.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              The cohort window is open. The directory updates automatically
              the moment a connected Stripe account on the Playbook sees its
              first paying customer inside the window. Nothing here is
              hand-curated. Nothing here is bought. When the first webhook
              fires, this card disappears and the first row lands.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }
  // status === "past"
  return (
    <section aria-label="Cohort window has closed" className="space-y-6">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Closed
          </p>
          <h2 className="text-2xl font-bold leading-tight">
            0 Verified Builders landed in {cohort.displayName}.
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            The {cohort.displayName} window closed with no Stripe-verified
            customer cycles inside it. We refuse to fabricate the count.
            This row stays as the canonical history record for the quarter;
            the next open cohort is on the index.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

/**
 * Dynamic directory section: status-aware (calls `connection()` so the
 * request-time `new Date()` inside `statusFor` is legal) and member-list
 * (via the cached `loadCohortBuilders`). Wrapped in <Suspense> at the
 * page boundary so the static shell prerenders independently.
 */
async function CohortDirectorySection({
  cohort,
  canonicalUrl,
}: {
  cohort: CohortQuarter;
  canonicalUrl: string;
}) {
  // Cache Components: request-time clock reads inside `statusFor` need a
  // dynamic-render boundary. `connection()` defers this subtree to
  // request time without unfreezing the static shell.
  await connection();

  const status = statusFor(cohort);
  const members = await loadCohortBuilders(
    cohort.windowStartIso,
    cohort.windowEndIso,
    cohort.slug,
  );
  const memberCount = members.length;
  const collectionJson = buildCollectionJsonLd(cohort, canonicalUrl, members);

  return (
    <>
      {collectionJson ? <JsonLdBlock json={collectionJson} /> : null}

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="members"
      >
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 id="members" className="text-2xl font-bold leading-tight">
            {memberCount === 0
              ? "Members"
              : memberCount === 1
                ? "1 Verified Builder in this cohort"
                : `${memberCount} Verified Builders in this cohort`}
          </h2>
          {memberCount > 0 ? (
            <span className="text-xs text-muted-foreground">
              Earliest first
            </span>
          ) : null}
        </div>

        {memberCount === 0 ? (
          <EmptyState cohort={cohort} status={status} />
        ) : (
          <ul
            role="list"
            className="grid gap-4 sm:grid-cols-2"
            aria-label={`${cohort.displayName} Verified Builders`}
          >
            {members.map((m) => (
              <li key={m.builder_slug}>
                <Link
                  href={`/builder/${m.builder_slug}`}
                  className="block h-full rounded-2xl border bg-card p-6 transition-colors hover:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <article className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-sm font-semibold uppercase"
                      >
                        {initials(m.builder_name)}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                        <CheckCircle2
                          className="h-3 w-3 text-foreground"
                          aria-hidden="true"
                        />
                        <span>Verified Builder</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold leading-tight">
                      {m.builder_name ?? "Verified Builder"}
                    </h3>

                    {m.product_name ? (
                      <p className="text-sm text-muted-foreground">
                        {m.product_name}
                      </p>
                    ) : null}

                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      First customer verified{" "}
                      <span className="text-foreground">
                        {formatDate(m.first_customer_at)}
                      </span>
                    </p>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

/** Skeleton for the directory section while it streams in. */
function DirectorySkeleton({ cohort }: { cohort: CohortQuarter }) {
  return (
    <section
      className="max-w-3xl mx-auto px-6 py-8"
      aria-labelledby="members-loading"
    >
      <h2
        id="members-loading"
        className="text-2xl font-bold leading-tight mb-4"
      >
        Members
      </h2>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Loading the {cohort.displayName} directory.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}

export default async function CohortDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const c = getCohortBySlug(params.slug);
  if (!c) notFound();

  const canonicalUrl = `${BASE_URL}/cohort/${c.slug}`;
  const staticJsonLd = buildStaticJsonLd(c, canonicalUrl);

  return (
    <article className="min-h-screen">
      {staticJsonLd.map((json, i) => (
        <JsonLdBlock key={i} json={json} />
      ))}

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/cohort" className="hover:underline">
              Cohorts
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {c.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Verified Builders cohort
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          The {c.displayName} cohort
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable
        >
          {c.tldr}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Window <span className="text-foreground">{formatWindow(c)}</span>
          {" · "}
          Verified{" "}
          <time dateTime={c.lastVerified}>
            {formatVerifiedDate(c.lastVerified)}
          </time>
          {" · "}
          <Link
            href="/editorial-policy"
            className="underline hover:text-foreground"
          >
            editorial policy
          </Link>
        </p>
      </header>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="theme">
        <h2 id="theme" className="text-xl font-semibold mb-3 leading-tight">
          Theme of the class
        </h2>
        <p className="text-base leading-relaxed">{c.theme}</p>
      </section>

      <Suspense fallback={<DirectorySkeleton cohort={c} />}>
        <CohortDirectorySection cohort={c} canonicalUrl={canonicalUrl} />
      </Suspense>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="path"
      >
        <h2 id="path" className="text-xl font-semibold mb-3 leading-tight">
          How a row lands in this cohort
        </h2>
        <ol className="space-y-3 text-base text-muted-foreground leading-relaxed">
          <li>
            <span className="text-foreground font-medium">1.</span> Take the
            free 90-second Launch Diagnostic. No card.
          </li>
          <li>
            <span className="text-foreground font-medium">2.</span> If the
            diagnosis fits, start the Playbook ($1 Starter, then $49/mo Core).
          </li>
          <li>
            <span className="text-foreground font-medium">3.</span> Connect
            Stripe in Step 7 of the Playbook.
          </li>
          <li>
            <span className="text-foreground font-medium">4.</span> Ship the
            work. When a real customer pays you between{" "}
            <span className="text-foreground">{formatWindow(c)}</span>, the
            badge fires automatically and the row lands here.
          </li>
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Want your row in this class?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The path opens with the free diagnostic. The diagnostic does
              not score your idea - it labels what is structurally flat on
              your live page against the Brunson Hook / Story / Offer
              pattern. From there, the Playbook is the cycle.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/cohort">Other cohorts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
