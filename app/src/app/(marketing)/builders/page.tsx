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
import { createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Verified Builders — UnlockSaaS",
  description:
    "Founders who shipped a product and got a paying customer. Verified by Stripe, not self-reported.",
  alternates: { canonical: "https://unlocksaas.com/builders" },
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

async function loadPublicBuilders(): Promise<BuilderRow[]> {
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

export default async function BuildersDirectoryPage() {
  const builders = await loadPublicBuilders();
  const count = builders.length;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
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
          <section
            aria-label="No verified builders yet"
            className="rounded-2xl border bg-card p-8 sm:p-12 space-y-4"
          >
            <p className="text-sm uppercase tracking-wider text-muted-foreground">
              The directory
            </p>
            <h2 className="text-2xl font-bold leading-tight">
              No public verified builders yet.
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              The first one will land here. The badge is what fires when a
              connected Stripe account sees its first paying customer through
              the Playbook. It is not a self-report. It is not a screenshot.
              It is a row in our database that says someone, somewhere,
              finished the work — and a verified charge says so.
            </p>
            <p className="text-base text-muted-foreground leading-relaxed">
              If you want to be the first row,{" "}
              <Link
                href="/diagnostic"
                className="underline underline-offset-4 hover:text-foreground"
              >
                start with the Free Diagnostic
              </Link>
              .
            </p>
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
              {builders.map((b) => (
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
                        <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
                          <CheckCircle2
                            className="h-3 w-3 text-foreground"
                            aria-hidden="true"
                          />
                          <span>Verified Builder</span>
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
              ))}
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
