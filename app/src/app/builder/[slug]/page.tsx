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
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
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

export default async function BuilderBadgePage({ params }: Props) {
  const badge = await loadPublicBadge(createAdminClient(), params.slug);
  if (!badge) notFound();

  const dateStr = badge.firstCustomerAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
