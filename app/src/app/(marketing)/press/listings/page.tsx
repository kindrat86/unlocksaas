import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  OrganizationJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { BASE_URL } from "@/lib/seo/entity";
import {
  listingsByCategory,
  resolveLiveProfileUrl,
  type DirectoryListing,
} from "@/lib/seo/directory-listings";

/**
 * /press/listings — public status board for the aggregator / review-directory
 * footprint.
 *
 * Why this surface exists
 * -----------------------
 * Three jobs in one page:
 *
 *   1. **Off-page authority hub.** The page itself is editorial: it lists
 *      every directory we target with the rationale for inclusion. AI
 *      crawlers (ClaudeBot, PerplexityBot, OAI-SearchBot) cite hub pages
 *      like this when they paraphrase "where is UnlockSaaS listed?" – which
 *      is exactly the disambiguation query an LLM runs before answering a
 *      "what is X?" question.
 *
 *   2. **Operator status board.** Each row resolves at request time: env
 *      var set → row links to the live profile; env var unset → row says
 *      "Submission pending" with the submission URL. Maryan opens this page
 *      and sees the exact next step without leaving the canonical site.
 *
 *   3. **Live mirror of Organization.sameAs.** Every env var on this page
 *      is one of the slots Organization JSON-LD reads. The set of "live"
 *      rows below is, by construction, the same set Knowledge Graph sees
 *      in schema. No drift possible.
 *
 * Brunson Hard-Rule (no fabricated claims)
 * ----------------------------------------
 * If an env var is unset, the row reads "Submission pending" – never
 * "Awaiting approval" or "Coming soon" or any phrasing that implies
 * progress not yet earned. Once the operator sets the env var on Vercel
 * and redeploys, the row flips to a live link AND the Organization.sameAs
 * picks up the URL.
 *
 * Schema: ProfilePage-style render – Organization + BreadcrumbList anchored
 * via the canonical @id graph in lib/seo/entity.ts.
 *
 * The page is statically renderable: all inputs are env (build-time on
 * Vercel) + a frozen registry. No per-request data, no database calls.
 */
export const metadata: Metadata = {
  title: "Where Unlock SaaS Is Listed",
  description:
    "Public status board of every review aggregator, launch directory, and discovery surface Unlock SaaS targets. Live links where approved, submission URLs where pending.",
  alternates: markdownAlternate("/press/listings", "/press/listings.md"),
  openGraph: {
    type: "website",
    title: "Where Unlock SaaS Is Listed",
    description:
      "Aggregator and review-directory listings status board for Unlock SaaS – Product Hunt, BetaList, G2, Capterra, AlternativeTo, SaaSHub, Indie Hackers.",
    url: "/press/listings",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary",
    title: "Where Unlock SaaS Is Listed",
    description:
      "Aggregator and review-directory listings status board for Unlock SaaS.",
  },
  robots: { index: true, follow: true },
};

const TRAIL = [
  { name: "Unlock SaaS", url: `${BASE_URL}/` },
  { name: "Press", url: `${BASE_URL}/press` },
  { name: "Listings", url: `${BASE_URL}/press/listings` },
] as const;

/**
 * One row in the listings table. Server-rendered – no client state. The
 * env-var resolution runs at request time on Vercel, so toggling a slot
 * on the dashboard and redeploying flips the row without a code change.
 */
function ListingRow({ listing }: { listing: DirectoryListing }) {
  const liveUrl = resolveLiveProfileUrl(listing);

  return (
    <li
      id={listing.id}
      className="rounded-md border bg-card p-4 text-sm leading-relaxed"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-foreground">
            {listing.name}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              {listing.hostname}
            </span>
          </p>
          <p className="text-xs text-muted-foreground">{listing.note}</p>
        </div>
        <div className="text-xs">
          {liveUrl ? (
            <a
              href={liveUrl}
              rel="noopener me"
              target="_blank"
              className="font-medium underline underline-offset-4 hover:text-foreground"
            >
              View live listing
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span
                aria-hidden
                className="inline-block h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
              />
              Submission pending
            </span>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          Submit:{" "}
          <a
            href={listing.submissionUrl}
            rel="noopener nofollow"
            target="_blank"
            className="underline underline-offset-4 hover:text-foreground"
          >
            {new URL(listing.submissionUrl).hostname}
          </a>
        </span>
        <span aria-hidden>·</span>
        <span>
          Env var:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
            {listing.profileUrlEnvVar}
          </code>
        </span>
      </div>
    </li>
  );
}

export default function PressListingsPage() {
  const sections = listingsByCategory();

  // Counts shown in the lede – computed at render time so the page is
  // self-narrating. "5 of 7 live" is a more meaningful at-a-glance status
  // than "7 directories targeted".
  const allRows = sections.flatMap((s) => s.rows);
  const liveCount = allRows.filter((r) => resolveLiveProfileUrl(r)).length;
  const totalCount = allRows.length;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <OrganizationJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />

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
          <Link
            href="/press"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Press
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Listings</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Where Unlock SaaS is listed
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Aggregator and directory listings, status board.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Every review aggregator, launch directory, and discovery surface
            Unlock SaaS targets. Rows with a live link have an approved
            listing on that directory. Rows marked &ldquo;Submission
            pending&rdquo; have not yet been submitted, or are awaiting
            approval. This page is the canonical status board; the same
            URLs are picked up automatically by the Organization JSON-LD
            schema graph the moment the operator activates each row.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong className="font-medium text-foreground">
              {liveCount} of {totalCount}
            </strong>{" "}
            directories currently live.
          </p>
        </header>

        <Separator className="my-8" />

        {sections.map((section) => (
          <section
            key={section.category}
            aria-labelledby={`section-${section.category}`}
            className="mb-10 space-y-4"
          >
            <header className="space-y-2">
              <h2
                id={`section-${section.category}`}
                className="text-2xl font-bold"
              >
                {section.label}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.note}
              </p>
            </header>
            <ul className="space-y-3 list-none p-0">
              {section.rows.map((row) => (
                <ListingRow key={row.id} listing={row} />
              ))}
            </ul>
          </section>
        ))}

        <Separator className="my-8" />

        <section
          aria-labelledby="how-this-works"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="how-this-works" className="text-2xl font-bold">
            How this page works
          </h2>
          <p>
            Each row is a slot. When the operator pastes the approved listing
            URL into the corresponding Vercel environment variable and
            redeploys, two things happen at once: this row flips to a live
            link, and the Organization{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 text-[12px]">
              sameAs
            </code>{" "}
            block on every page of unlocksaas.com picks up the URL. There is
            no code edit, no audit, no manual schema update. The press kit at{" "}
            <Link
              href="/press"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /press
            </Link>{" "}
            holds the descriptions and brand facts journalists copy when
            covering Unlock SaaS; this page is the directory-submission
            equivalent.
          </p>
          <p className="text-sm text-muted-foreground">
            The honest default is empty. No directory is &ldquo;coming
            soon&rdquo; on this page – a row is either live or it is not. No
            review counts, no badge claims, no aggregate ratings appear on
            this page until they are independently verifiable on the linked
            directory.
          </p>
        </section>
      </article>
    </div>
  );
}
