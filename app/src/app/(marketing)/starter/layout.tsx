import type { Metadata } from "next";

/**
 * Per-page metadata wrapper for the $1 Starter sales page.
 *
 * Why a layout: starter/page.tsx is marked "use client" because the
 * checkout POST and the per-bucket DiagnosticHandoffBanner are interactive
 * and read the live URL via useSearchParams(). Next.js does not allow
 * `export const metadata` from client components, so the metadata lives
 * in this server-component layout. The layout is a pass-through wrapper
 * — it adds no DOM, only metadata.
 *
 * Surface A of the Google strategy. Solution-aware comparator audience:
 * cold readers who already know they need a "starter offer" and are
 * comparing against course/coach/DIY paths.
 */
export const metadata: Metadata = {
  title: "The $1 Starter — finish your dream customer and offer this week",
  description:
    "One dollar. One week. Steps 1 and 2 of The Machine: pin one real customer, write one real offer for them. The two pieces of work most founders quietly skip between launch and revenue.",
  alternates: { canonical: "/starter" },
  openGraph: {
    title: "The $1 Starter — Unlock SaaS",
    description:
      "One dollar. One week. Pin one real customer. Write one real offer. Steps 1 and 2 of The Machine.",
    url: "/starter",
    type: "website",
  },
};

export default function StarterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
