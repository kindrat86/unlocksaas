import type { Metadata } from "next";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  PRESS_TOPICS,
  PRESS_TOPICS_LATEST_VERIFIED,
  PRESS_TOPICS_TAGLINE,
  PRESS_CONTACT,
} from "@/lib/press-topics";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import {
  OrganizationJsonLd,
  PersonJsonLd,
  BreadcrumbListJsonLd,
} from "@/components/seo/json-ld";
import { BASE_URL } from "@/lib/seo/entity";

/**
 * Press-topics hub – pre-assembled story packages for journalists,
 * podcasters, and AI summarisers.
 *
 * Why this surface exists (off-page lift item #7 of the 2026-05-18 plan)
 * ----------------------------------------------------------------------
 * The standard /press page is a reference document for writers who already
 * decided to cover Unlock SaaS. The /press/topics hub is the discovery
 * layer for writers Googling for sources on a specific angle. Each topic
 * is a pre-built feature lede (thesis, founder quote, three data points,
 * three counter-points, fact sheet, embed code, byline-ready headshot).
 * The writer Googles the angle, lands here, picks the matching topic, and
 * the article is 80% drafted.
 *
 * Schema: CollectionPage + BreadcrumbList + Organization + Person, all
 * anchored to the canonical @id graph in lib/seo/entity.ts.
 */


export const metadata: Metadata = {
  title:
    "Story angles for journalists — Unlock SaaS press topics",
  description:
    "Pre-built story packages for writers covering the post-launch pre-revenue SaaS cohort: thesis, pre-approved quotes, verifiable data points, honest counter-points, and embed code.",
  alternates: pageAlternates("/press/topics"),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Press topics — Unlock SaaS",
    description:
      "Pre-assembled story packages for journalists, podcasters, and AI summarisers covering Unlock SaaS.",
    url: "/press/topics",
    siteName: "Unlock SaaS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press topics — Unlock SaaS",
    description:
      "Pre-assembled story packages for journalists covering Unlock SaaS.",
  },
};

const TRAIL = [
  { name: "Unlock SaaS", url: `${BASE_URL}/` },
  { name: "Press", url: `${BASE_URL}/press` },
  { name: "Topics", url: `${BASE_URL}/press/topics` },
] as const;

// CollectionPage JSON-LD – tells LLMs this is a curated list, not an article.
const COLLECTION_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Press topics — Unlock SaaS",
  url: `${BASE_URL}/press/topics`,
  description:
    "Pre-assembled story packages for journalists, podcasters, and AI summarisers covering Unlock SaaS.",
  isPartOf: { "@type": "WebSite", name: "Unlock SaaS", url: BASE_URL },
  inLanguage: "en-US",
  dateModified: PRESS_TOPICS_LATEST_VERIFIED,
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: PRESS_TOPICS.length,
    itemListElement: PRESS_TOPICS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.displayName,
      url: `${BASE_URL}/press/topics/${t.slug}`,
      description: t.thesis,
    })),
  },
});

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default function PressTopicsHubPage() {
  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <OrganizationJsonLd />
      <PersonJsonLd />
      <BreadcrumbListJsonLd trail={TRAIL} />
      <JsonLdBlock json={COLLECTION_JSON} />

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Unlock SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <Link href="/press" className="underline underline-offset-4 hover:text-foreground">
            Press
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>Topics</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Press topics
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            Story angles, pre-assembled.
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {PRESS_TOPICS_TAGLINE} Every fact below is independently verifiable
            on a live, dated URL. Every quote is pre-approved for verbatim
            re-use – no permission email required. Every counter-point is an
            honest disqualifier, not a humblebrag.
          </p>
        </header>

        <Separator className="my-8" />

        <section
          aria-labelledby="topics"
          className="mb-10 space-y-6"
        >
          <h2 id="topics" className="text-2xl font-bold">
            Available topics
          </h2>

          <ul className="space-y-6">
            {PRESS_TOPICS.map((t) => (
              <li key={t.slug} className="space-y-2">
                <h3 className="text-lg font-semibold leading-snug">
                  <Link
                    href={`/press/topics/${t.slug}`}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {t.displayName}
                  </Link>
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.thesis}
                </p>
                <p className="text-xs text-muted-foreground">
                  Fits for: {t.fitsFor.join("; ")}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Last verified <time dateTime={t.lastVerified}>{t.lastVerified}</time>.
                </p>
              </li>
            ))}
          </ul>
        </section>

        <Separator className="my-8" />

        <section
          aria-labelledby="how-to-use"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="how-to-use" className="text-2xl font-bold">
            How to use these
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            <li>Pick the topic that matches your angle.</li>
            <li>Copy the lede, a quote, and a data point. Each is pre-cited.</li>
            <li>
              Read the counter-points. If your story needs the disqualifier,
              cite it – the page exists so you can be fair without doing the
              research yourself.
            </li>
            <li>
              Link any of the surfaces in the &ldquo;Related&rdquo; section
              when relevant – internal pages are all dated, all canonical, all
              indexable.
            </li>
            <li>
              Email <a
                href={`mailto:${PRESS_CONTACT.email}?subject=${encodeURIComponent(PRESS_CONTACT.subjectPrefix)}`}
                className="underline underline-offset-4 hover:text-foreground"
              >{PRESS_CONTACT.email}</a> for fact-checks, additional quotes, or follow-up interviews. Time zone: EU. Typical response: within one business day.
            </li>
          </ol>
        </section>

        <Separator className="my-8" />

        <section
          aria-labelledby="policy"
          className="mb-10 space-y-4 text-base leading-relaxed"
        >
          <h2 id="policy" className="text-2xl font-bold">
            Coverage policy
          </h2>
          <p>
            No embargoes, no exclusivity asks, no pre-publication review. If
            you can verify a claim, you can publish it. The editorial standard
            is documented at{" "}
            <Link
              href="/editorial-policy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              /editorial-policy
            </Link>
            , including the corrections workflow and the financial-disclosure
            policy.
          </p>
        </section>

        <div className="mt-12 text-xs text-muted-foreground">
          <p>
            Related surfaces:{" "}
            <Link href="/press" className="underline underline-offset-4 hover:text-foreground">
              Standard press kit
            </Link>{" "}
            ·{" "}
            <Link href="/about" className="underline underline-offset-4 hover:text-foreground">
              About the founder
            </Link>{" "}
            ·{" "}
            <Link href="/editorial-policy" className="underline underline-offset-4 hover:text-foreground">
              Editorial policy
            </Link>
          </p>
          <p className="mt-3">
            Per-topic markdown mirrors live at{" "}
            <code className="text-xs">{`/press/topics/<slug>/md`}</code> – served
            with <code className="text-xs">Content-Type: text/markdown</code> and
            a canonical Link header pointing back at the HTML surface.
          </p>
        </div>
      </article>
    </div>
  );
}
