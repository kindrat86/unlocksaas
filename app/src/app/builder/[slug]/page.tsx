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
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { loadPublicBadge, absoluteBadgeUrl } from "@/lib/builder-badge";
import { buildReviewJsonLd } from "@/lib/seo/builder-review";
import { CheckCircle2 } from "lucide-react";


interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Cached badge lookup tagged `builder:<slug>`. Service-role Supabase reads
 * (no cookies/headers) are safe inside `'use cache'`. Tag enables
 * `revalidateTag('builder:<slug>', 'max')` from a Server Action when
 * a verified-conversion row updates a single builder's record.
 */
async function getBadge(slug: string) {
  "use cache";
  cacheLife({ revalidate: 3600 });
  cacheTag(`builder:${slug}`);
  return loadPublicBadge(createAdminClient(), slug);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const badge = await getBadge(params.slug);
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
    alternates: {
      canonical: url,
      // oEmbed discovery anchor — Substack, Ghost, Notion, Medium, Discord,
      // Slack auto-render a pasted unlocksaas.com/builder/<slug> URL as a
      // rich card when they find this link. See src/app/builder/[slug]/oembed.json.
      // Type-cast: Next.js Metadata.alternates types `types` as Record<string,
      // string | URL>, which is exactly what the oembed alternate needs.
      types: {
        "application/json+oembed": `${url}/oembed.json`,
      },
    },
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

export default function BuilderBadgePage(props: Props) {
  return (
    <Suspense fallback={null}>
      <BuilderBadgeBody params={props.params} />
    </Suspense>
  );
}

async function BuilderBadgeBody({ params: paramsP }: { params: Props["params"] }) {
  const params = await paramsP;
  const badge = await getBadge(params.slug);
  if (!badge) notFound();

  const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Canonical Review JSON-LD. Lives on THIS page so that any third-party
  // site that links here with rel="me" gets a verifiable Review at the
  // destination. The same payload ships at /builder/<slug>/review.json
  // and inside /builder/<slug>/embed.html so the chain is consistent
  // wherever it appears.
  const reviewJsonLd = buildReviewJsonLd(badge);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Inline Review JSON-LD. Server-rendered so it's present on first
          paint for Googlebot, Bingbot, Diffbot, and LLM retrievers. */}
      <script
        type="application/ld+json"
        // Schema payload is built deterministically server-side from approved
        // profile fields; safe to set via dangerouslySetInnerHTML.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
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
                    // rel="me" reciprocates the founder-side rel="me" link
                    // that the embed kit ships. Two-way rel="me" is the
                    // IndieWeb identity-verification convention honored by
                    // Mastodon profile verification, IndieAuth, and several
                    // structured-data crawlers. noopener/noreferrer remain
                    // for tab-hijack protection.
                    rel="me external noopener noreferrer"
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
              href={`/builder/${badge.slug}/snippets`}
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
