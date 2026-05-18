import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import {
  PRESS_TOPIC_SLUGS,
  PRESS_CONTACT,
  BYLINE_HEADSHOT_URL,
  getPressTopicBySlug,
  type PressTopic,
} from "@/lib/press-topics";
import {
  OrganizationJsonLd,
  PersonJsonLd,
  BreadcrumbListJsonLd,
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";
import { ID, BASE_URL, FOUNDER, ORGANIZATION } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

/**
 * Pre-assembled press story package – /press/topics/[slug].
 *
 * Why this surface exists
 * -----------------------
 * Off-page lift item #7 of the 2026-05-18 autonomous-mode plan: when a
 * writer Googles a story angle, the article is 80% drafted by the time
 * they land here. Thesis, drop-in lede, pre-approved quotes, three data
 * points with citations, three honest counter-points, fact sheet, embed
 * code, byline-ready headshot pointer. The piece that follows links to
 * unlocksaas.com because every quotable string was pre-cited.
 *
 * Schema graph
 * ------------
 *   - Article (the topic package itself – headline = displayName,
 *     description = thesis)
 *   - FAQPage – not appropriate here (no Q/A pairs). Skipped on purpose.
 *   - BreadcrumbList (Home → Press → Topics → <topic>)
 *   - Person (founder, the canonical quote source)
 *   - Organization (publisher)
 *   - SpeakableSpecification – the lede + each quote are voice-safe
 *
 * Pattern source: app/(marketing)/alternatives-to/[slug]/page.tsx.
 */

const BASE = BASE_URL;

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PRESS_TOPIC_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const t = getPressTopicBySlug(params.slug);
  if (!t) return {};

  const canonical = `/press/topics/${t.slug}`;
  return {
    title: t.metaTitle,
    description: t.thesis,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
    robots: { index: true, follow: true },
    openGraph: {
      title: t.displayName,
      description: t.thesis,
      type: "article",
      url: canonical,
      siteName: ORGANIZATION.name,
    },
    twitter: {
      card: "summary_large_image",
      title: t.displayName,
      description: t.thesis,
    },
  };
}

// ---------------------------------------------------------------------------
// JSON-LD per slug
// ---------------------------------------------------------------------------

function buildJsonLd(t: PressTopic, canonicalUrl: string): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: t.displayName,
    description: t.thesis,
    // @id graph anchors – Google walks these instead of treating each page
    // as carrying disconnected Person/Org records.
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    inLanguage: "en-US",
    datePublished: t.lastVerified,
    dateModified: t.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    // Mentions array – every related-surface link target named as a WebPage
    // entity reachable on the same origin. Reinforces the entity graph
    // density that LLMO scoring rewards.
    mentions: t.relatedSurfaces.map((r) => ({
      "@type": "WebPage",
      url: `${BASE}${r.path}`,
      name: r.label,
    })),
    // Lede + quotes are explicitly voice-safe – speakable selectors below
    // resolve to the lede paragraph and each quote blockquote.
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE}/` },
      { "@type": "ListItem", position: 2, name: "Press", item: `${BASE}/press` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Topics",
        item: `${BASE}/press/topics`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: t.displayName,
        item: canonicalUrl,
      },
    ],
  };

  return [JSON.stringify(article), JSON.stringify(breadcrumbs)];
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PressTopicPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const t = getPressTopicBySlug(params.slug);
  if (!t) notFound();

  const canonicalUrl = `${BASE}/press/topics/${t.slug}`;
  const [articleJson, breadcrumbJson] = buildJsonLd(t, canonicalUrl);

  return (
    <article className="min-h-screen">
      <OrganizationJsonLd />
      <PersonJsonLd />
      <BreadcrumbListJsonLd
        trail={[
          { name: "Unlock SaaS", url: `${BASE}/` },
          { name: "Press", url: `${BASE}/press` },
          { name: "Topics", url: `${BASE}/press/topics` },
          { name: t.displayName, url: canonicalUrl },
        ]}
      />
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={breadcrumbJson} />

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2 flex-wrap">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/press" className="hover:underline">
              Press
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/press/topics" className="hover:underline">
              Topics
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {t.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Press topic
        </p>
        <h1
          id="topic-headline"
          data-speakable
          className="text-3xl sm:text-4xl font-bold leading-tight mb-4"
        >
          {t.displayName}
        </h1>
        <p
          id="topic-thesis"
          aria-labelledby="topic-headline"
          data-speakable
          className="text-lg text-muted-foreground leading-relaxed"
        >
          {t.thesis}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={t.lastVerified}>
            {formatVerifiedDate(t.lastVerified)}
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

      {/* Fits-for box. Helps the writer self-qualify in two seconds. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="fits-for"
      >
        <h2
          id="fits-for"
          className="text-xs uppercase tracking-widest text-muted-foreground mb-2"
        >
          This topic fits
        </h2>
        <ul className="text-sm space-y-1 list-disc pl-6">
          {t.fitsFor.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Drop-in lede. Speakable for voice answer engines. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="lede"
      >
        <h2 id="lede" className="text-2xl font-bold mb-3">
          Drop-in lede
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Paste verbatim as the opening paragraph, or rewrite in your voice.
        </p>
        <blockquote
          data-speakable
          aria-labelledby="lede"
          className="rounded-md border bg-muted/40 p-4 text-base leading-relaxed"
        >
          {t.lede}
        </blockquote>
      </section>

      <Separator className="my-2" />

      {/* Pre-approved quotes. Each carries usage context. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="quotes"
      >
        <h2 id="quotes" className="text-2xl font-bold mb-3">
          Pre-approved founder quotes
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Use verbatim. No permission email required. Each quote is tagged
          with the context that best fits the format.
        </p>
        <ul className="space-y-5">
          {t.quotes.map((q, i) => (
            <li key={i} className="space-y-2">
              <blockquote
                data-speakable
                className="rounded-md border bg-muted/40 p-4 text-base leading-relaxed"
              >
                &ldquo;{q.text}&rdquo;
                <footer className="text-xs text-muted-foreground mt-2">
                  — {FOUNDER.name}, founder, {ORGANIZATION.name}
                </footer>
              </blockquote>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Usage:</span> {q.context}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Data points. Each cites a live URL. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="data-points"
      >
        <h2 id="data-points" className="text-2xl font-bold mb-3">
          Data points (verifiable on the live site)
        </h2>
        <ul className="space-y-4">
          {t.dataPoints.map((d, i) => (
            <li key={i} className="rounded-md border bg-card p-4 space-y-2">
              <p className="text-base leading-relaxed">{d.claim}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Source:</span>{" "}
                <Link
                  href={d.sourcePath}
                  className="underline hover:text-foreground"
                >
                  {BASE}
                  {d.sourcePath}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold">Verify:</span> {d.verifyNote}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Honest counter-points. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="counter-points"
      >
        <h2 id="counter-points" className="text-2xl font-bold mb-3">
          Honest counter-points
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Brunson polarity: the page that names who Unlock SaaS is NOT for is
          the page a serious journalist trusts.
        </p>
        <ul className="space-y-3 list-disc pl-6">
          {t.counterPoints.map((c, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {c.claim}
              {c.context ? (
                <span className="block text-xs text-muted-foreground mt-1">
                  Context: {c.context}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Fact sheet. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="fact-sheet"
      >
        <h2 id="fact-sheet" className="text-2xl font-bold mb-3">
          Fact sheet
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-x-6 gap-y-3 text-sm">
          {t.factSheet.map((row, i) => (
            <div key={i} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium break-words">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <Separator className="my-2" />

      {/* Embed-ready blockquote. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="embed"
      >
        <h2 id="embed" className="text-2xl font-bold mb-3">
          Embed-ready blockquote
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Copy the snippet below. Ships attribution and a link target to the
          canonical URL of this topic. Render-safe across CMSs, RSS, and most
          rich-text editors.
        </p>
        <pre className="rounded-md border bg-muted/40 p-4 overflow-x-auto text-xs leading-relaxed">
          <code>{t.embedHtml}</code>
        </pre>
      </section>

      <Separator className="my-2" />

      {/* Byline-ready headshot pointer. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="headshot"
      >
        <h2 id="headshot" className="text-2xl font-bold mb-3">
          Byline-ready imagery
        </h2>
        <p className="text-sm leading-relaxed">
          Use{" "}
          <a
            href={BYLINE_HEADSHOT_URL}
            className="underline hover:text-foreground"
          >
            {BYLINE_HEADSHOT_URL}
          </a>{" "}
          as the brand mark. Until a real founder photograph ships, no stock
          portrait of {FOUNDER.name} appears in the press kit – the empty
          state is the honest state. Email{" "}
          <a
            href={`mailto:${PRESS_CONTACT.email}?subject=${encodeURIComponent(
              `${PRESS_CONTACT.subjectPrefix} – headshot request`,
            )}`}
            className="underline hover:text-foreground"
          >
            {PRESS_CONTACT.email}
          </a>{" "}
          to request a headshot once one is published.
        </p>
      </section>

      <Separator className="my-2" />

      {/* Related surfaces. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="related"
      >
        <h2 id="related" className="text-2xl font-bold mb-3">
          Related surfaces to link
        </h2>
        <ul className="space-y-2 list-disc pl-6 text-sm">
          {t.relatedSurfaces.map((r) => (
            <li key={r.path}>
              <Link
                href={r.path}
                className="underline underline-offset-4 hover:text-foreground"
              >
                {r.label}
              </Link>{" "}
              <span className="text-xs text-muted-foreground font-mono">
                ({BASE}
                {r.path})
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Separator className="my-2" />

      {/* Press contact CTA. */}
      <section
        className="max-w-3xl mx-auto px-6 py-6"
        aria-labelledby="contact"
      >
        <h2 id="contact" className="text-2xl font-bold mb-3">
          Reach the founder
        </h2>
        <p className="text-sm leading-relaxed">
          For fact-checks, additional quotes, or follow-up interviews, email{" "}
          <a
            href={`mailto:${PRESS_CONTACT.email}?subject=${encodeURIComponent(
              `${PRESS_CONTACT.subjectPrefix} – ${t.displayName}`,
            )}`}
            className="underline hover:text-foreground"
          >
            {PRESS_CONTACT.email}
          </a>
          . Time zone: EU. Typical response window: within one business day.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-6 pb-12 mt-8 text-xs text-muted-foreground">
        <p>
          Markdown mirror:{" "}
          <Link
            href={`/press/topics/${t.slug}/md`}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {BASE}/press/topics/{t.slug}/md
          </Link>{" "}
          ·{" "}
          <Link
            href="/press/topics"
            className="underline underline-offset-4 hover:text-foreground"
          >
            All press topics
          </Link>{" "}
          ·{" "}
          <Link
            href="/press"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Standard press kit
          </Link>
        </p>
      </div>
    </article>
  );
}
