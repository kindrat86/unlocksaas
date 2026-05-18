/**
 * Press topics hub — `/press/topics`.
 *
 * Index of all reverse-press-kit story angles. Each entry is a self-
 * contained pSEO surface designed to rank for a specific journalist-
 * intent query class (see `intendedQueries` in /lib/press-topics.ts).
 *
 * Why a hub (instead of putting topics in the existing /press page)
 * ----------------------------------------------------------------
 * /press is the canonical media kit — brand facts, founder bio, the
 * 50/100/200-word descriptions a writer copies verbatim. /press/topics
 * is its sibling: the same kit, but pre-assembled per story angle.
 * Different query class, different page, both linked from /press.
 *
 * CollectionPage JSON-LD wraps the list so the hub itself shows up in
 * Google Dataset Search / News-style aggregations when journalists
 * search by topic phrase.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { PRESS_TOPICS } from "@/lib/press-topics";
import {
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { pageAlternates } from "@/lib/seo/markdown-alternates";

const BASE = "https://unlocksaas.com";

export const metadata: Metadata = {
  title: "Press Topics — Pre-assembled Story Packages",
  description:
    "Five pre-built story packages for journalists, podcasters, and newsletter writers covering indie SaaS and AI-generated products. Thesis, data points, pull-quotes, counter-arguments, and related entities — copy-paste ready.",
  alternates: pageAlternates("/press/topics"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Press Topics — Pre-assembled Story Packages",
    description:
      "Five pre-built story packages for media coverage of indie SaaS and AI-generated products.",
    url: `${BASE}/press/topics`,
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press Topics — Pre-assembled Story Packages",
    description:
      "Five pre-built story packages for media coverage of indie SaaS and AI-generated products.",
  },
};

export const dynamic = "force-static";

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${BASE}/press/topics#collection`,
  name: "Unlock SaaS — Press Topics",
  description:
    "Pre-assembled story packages for media coverage. Each topic carries a thesis, data points, pull-quotes, counter-arguments, and related entities.",
  url: `${BASE}/press/topics`,
  isPartOf: { "@id": `${BASE}/#website` },
  publisher: { "@id": `${BASE}/#organization` },
  inLanguage: "en-US",
  hasPart: PRESS_TOPICS.map((t) => ({
    "@type": "Article",
    "@id": `${BASE}/press/topics/${t.slug}#article`,
    headline: t.headline,
    description: t.thesis,
    url: `${BASE}/press/topics/${t.slug}`,
    datePublished: t.lastVerified,
    author: { "@id": `${BASE}/#founder` },
    publisher: { "@id": `${BASE}/#organization` },
  })),
};

export default function PressTopicsHubPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Home", url: `${BASE}/` },
          { name: "Press", url: `${BASE}/press` },
          { name: "Topics", url: `${BASE}/press/topics` },
        ]}
      />

      <article className="max-w-3xl mx-auto">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            For journalists, podcasters, newsletter writers
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Press topics — pre-assembled story packages.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed mb-3">
            {PRESS_TOPICS.length} story angles covering indie SaaS, AI-
            generated products, and the post-launch pre-revenue cohort.
            Each topic carries a thesis, the data points that ground it,
            the founder&rsquo;s on-the-record quotes, the honest
            counter-arguments a fair piece must address, and the related
            entities a fair piece should also cite.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Everything is copy-paste ready. Attribution is{" "}
            <Link
              href="/press"
              className="underline underline-offset-4 hover:text-foreground"
            >
              the standard press-kit line
            </Link>
            : Maryan at Unlock SaaS, with a link back to the specific
            topic page you used.
          </p>
        </header>

        <ul className="space-y-5 mb-12">
          {PRESS_TOPICS.map((t) => (
            <li
              key={t.slug}
              className="rounded-xl border bg-card p-5 sm:p-6 space-y-3 shadow-sm"
            >
              <p className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                /press/topics/{t.slug} · verified {t.lastVerified}
              </p>
              <h2 className="text-xl font-semibold leading-snug">
                <Link
                  href={`/press/topics/${t.slug}`}
                  className="hover:underline underline-offset-4"
                >
                  {t.headline}
                </Link>
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t.thesis}
              </p>
              <p className="text-xs text-muted-foreground">
                Built for queries:{" "}
                <span className="italic">
                  {t.intendedQueries.slice(0, 3).join(" · ")}
                </span>
              </p>
              <Link
                href={`/press/topics/${t.slug}`}
                className="text-sm underline underline-offset-4 hover:text-foreground inline-block"
              >
                Read the story package →
              </Link>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground text-center mt-12">
          Need a different angle? Email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline underline-offset-4 hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>
          . The founder reads every message personally.
        </p>
      </article>
    </div>
  );
}
