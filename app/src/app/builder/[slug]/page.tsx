/**
 * Public Verified Builder badge page.
 *
 * Anyone with the URL can see it. The `builder_badges` view filters out
 * private profiles + missing first-customer timestamp, so unauthenticated
 * reads can't leak anything beyond the badge fields the user opted in to.
 *
 * Per Hard Rule #10 (Verified Builders identity ships from day one) the
 * visual treatment leans into the manifesto language. The page links back
 * to UnlockSaaS — gently, in voice — but the badge is about the founder,
 * not about us. The proof is the message.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge, absoluteBadgeUrl } from "@/lib/builder-badge";
import { CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const badge = await loadPublicBadge(createAdminClient(), params.slug);
  if (!badge) {
    return {
      title: "Verified Builder",
      robots: { index: false },
    };
  }

  const product = badge.productName ?? "their product";
  const title = `${badge.builderName} — Verified Builder`;
  const description = `${badge.builderName} shipped ${product} and got a paying customer. Verified by Stripe on ${badge.firstCustomerAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`;
  const url = absoluteBadgeUrl(badge.slug);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      // opengraph-image.tsx auto-generates the OG image.
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BuilderBadgePage(props: Props) {
  const params = await props.params;
  const badge = await loadPublicBadge(createAdminClient(), params.slug);
  if (!badge) notFound();

  const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // ────────────────────────────────────────────────────────────────────
  // JSON-LD — the canonical entity graph anchor for this builder.
  //
  // Three nodes, one document:
  //   1. ProfilePage   — declares this URL as the Person's profile page.
  //   2. Person        — the Verified Builder, by public slug. Anchored
  //                      with an @id so the Review schema the founder
  //                      pastes on their own site (rendered from
  //                      /builder/<slug>/embed) can `author.@id` resolve
  //                      back to this node and Google can collapse them
  //                      into one knowledge-graph entity.
  //   3. PublishingPrinciples — the Organization that issued the
  //                      badge (UnlockSaaS), anchored to the canonical
  //                      Organization @id in src/lib/seo/entity.ts.
  //
  // Brunson Hard-Rule reconciliation:
  //   - No reviewRating, no aggregateRating, no fabricated review count.
  //     The badge is a verifiable cycle, not an opinion.
  //   - Person.name uses the public builder name only — never the email,
  //     the Stripe customer id, or any private field.
  //   - sameAs is set only when productUrl is on file. Empty array →
  //     omit the key entirely, never claim a link we cannot prove.
  // ────────────────────────────────────────────────────────────────────
  const builderProfileUrl = absoluteBadgeUrl(badge.slug);
  const personId = `${builderProfileUrl}#person`;
  const profilePageId = `${builderProfileUrl}#profile`;
  const personJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfilePage",
        "@id": profilePageId,
        "url": builderProfileUrl,
        "name": `${badge.builderName} — Verified Builder`,
        "dateCreated": badge.firstCustomerAt.toISOString().slice(0, 10),
        "mainEntity": { "@id": personId },
        "isPartOf": { "@id": "https://unlocksaas.com/#website" },
        "publisher": { "@id": "https://unlocksaas.com/#organization" },
      },
      {
        "@type": "Person",
        "@id": personId,
        "name": badge.builderName,
        "url": builderProfileUrl,
        "mainEntityOfPage": { "@id": profilePageId },
        ...(badge.productUrl ? { sameAs: [badge.productUrl] } : {}),
        // The verifiable badge. Brunson rule: this is a FACT, not a rating.
        // Modeled as `subjectOf` → CreativeWork because schema.org Person
        // does not have a "credential" property general enough to carry
        // a Stripe-verified cycle; CreativeWork+about is the standard
        // pattern for linking a profile to a documented event.
        "subjectOf": {
          "@type": "CreativeWork",
          "headline": `Verified Builder — first paying customer on ${dateStr}`,
          "datePublished": badge.firstCustomerAt
            .toISOString()
            .slice(0, 10),
          "about": {
            "@type": "Organization",
            "@id": "https://unlocksaas.com/#organization",
          },
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        // Server-rendered, no client-side allocation. Reused exactly as
        // serialized — Google's structured-data tester accepts pretty
        // JSON and compact JSON identically.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd),
        }}
      />
      <main className="flex-1 flex items-center justify-center p-6">
        <article className="w-full max-w-2xl space-y-8">
          {/* Badge */}
          <div className="rounded-2xl border bg-card p-8 sm:p-12 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-foreground" />
              <span className="uppercase tracking-wider text-xs font-medium">
                Verified Builder
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
              {badge.builderName} shipped a product and got paid for it.
            </h1>

            {badge.productName && (
              <p className="text-xl text-muted-foreground">
                {badge.productUrl ? (
                  <a
                    href={badge.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {badge.productName}
                  </a>
                ) : (
                  badge.productName
                )}
              </p>
            )}

            <div className="pt-2 border-t text-sm text-muted-foreground space-y-1">
              <p>
                Verified by Stripe on{" "}
                <span className="text-foreground font-medium">{dateStr}</span>.
              </p>
              <p>
                Not self-reported. Not a screenshot. A paying customer on a
                connected Stripe account.
              </p>
            </div>
          </div>

          {/* Manifesto excerpt — workbook 05 §7 */}
          <blockquote className="border-l-2 pl-4 text-sm text-muted-foreground italic">
            We are Verified Builders. We build real things. We get real
            customers. We let Stripe say so for us.
          </blockquote>

          {/* Quiet attribution — the page is about the builder, not us */}
          <div className="pt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Badge issued by</span>
            <Link href="/" className="underline-offset-4 hover:underline text-foreground">
              UnlockSaaS
            </Link>
            <span>·</span>
            <Link
              href="/diagnostic"
              className="underline-offset-4 hover:underline"
            >
              Take the Free Diagnostic
            </Link>
            <span>·</span>
            <Link
              href={`/builder/${badge.slug}/embed`}
              className="underline-offset-4 hover:underline"
              prefetch={false}
            >
              Embed this badge
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
