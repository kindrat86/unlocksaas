import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  CITY_SLUGS,
  getCityBySlug,
  type CityEntry,
} from "@/lib/founders-in";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  buildSpeakable,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

async function getCachedEntry(slug: string): Promise<CityEntry | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`founders-in:${slug}`);
  return getCityBySlug(slug);
}

export function generateStaticParams() {
  return CITY_SLUGS.map((city) => ({ city }));
}

type RouteParams = { city: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = await getCachedEntry(params.city);
  if (!e) return {};

  const canonical = `/founders-in/${e.slug}`;
  return {
    title: e.metaTitle,
    description: e.metaDescription,
    alternates: pageAlternates(canonical),
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: e.metaTitle,
      description: e.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: e.metaTitle,
      description: e.metaDescription,
    },
  };
}

function buildJsonLd(e: CityEntry, canonicalUrl: string): string[] {
  const placeNode = {
    "@type": "Place",
    name: e.city,
    address: {
      "@type": "PostalAddress",
      addressLocality: e.city,
      addressRegion: e.region.length > 0 ? e.region : undefined,
      addressCountry: e.country,
    },
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.heroSubhead,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    audience: {
      "@type": "Audience",
      audienceType: `Indie SaaS founders in ${e.displayName}`,
    },
    contentLocation: placeNode,
    keywords: [
      `micro-saas founders in ${e.city}`,
      `indie hackers ${e.city}`,
      `saas founder ${e.city}`,
      `bootstrappers ${e.city}`,
      "Unlock SaaS",
    ].join(", "),
    inLanguage: "en-US",
    speakable: buildSpeakable('[data-speakable="lede"]'),
    ...ACCESS_MODE_TEXTUAL,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Founders in",
        item: `${BASE_URL}/founders-in`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Founders in ${e.displayName}`,
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

export default async function FoundersInDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = await getCachedEntry(params.city);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/founders-in/${e.slug}`;
  const [articleJson, breadcrumbJson] = buildJsonLd(e, canonicalUrl);

  const relatedEntries = e.relatedCities
    .map((slug) => getCityBySlug(slug))
    .filter((c): c is CityEntry => c !== undefined);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={breadcrumbJson} />

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
            <Link href="/founders-in" className="hover:underline">
              Founders in
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          {e.country}
          {e.region.length > 0 ? ` · ${e.region}` : ""}
          {" · "}
          {e.utcOffsetLabel}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Micro-SaaS founders in {e.displayName}.
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable="lede"
        >
          {e.heroSubhead}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={e.lastVerified}>
            {formatVerifiedDate(e.lastVerified)}
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

      <TldrSummary
        headingLabel={`Key facts for ${e.city}`}
        items={[
          { term: "City", definition: e.displayName },
          { term: "Country", definition: e.country },
          { term: "Timezone", definition: `${e.timezone} (${e.utcOffsetLabel})` },
          { term: "Scene summary", definition: e.heroSubhead },
          { term: "Local pain angle", definition: e.localPainAngle },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="scene"
      >
        <h2 id="scene" className="text-2xl font-bold mb-4 leading-tight">
          The {e.city} indie SaaS scene
        </h2>
        <p className="text-base leading-relaxed">{e.sceneIntro}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="pain"
      >
        <h2 id="pain" className="text-2xl font-bold mb-4 leading-tight">
          The pain angle that lands hardest here
        </h2>
        <p className="text-base leading-relaxed">{e.localPainAngle}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="where"
      >
        <h2 id="where" className="text-2xl font-bold mb-4 leading-tight">
          Where to find {e.city} founders
        </h2>
        <ul className="space-y-3 text-base leading-relaxed list-disc list-inside marker:text-muted-foreground">
          {e.whereToFind.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          Discovery tactics, not exhaustive directory listings. If a
          specific {e.city} indie SaaS community should be on this list,
          submit it via <Link href="/contact" className="underline hover:text-foreground">contact</Link> and
          we will verify before adding.
        </p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="tz"
      >
        <h2 id="tz" className="text-2xl font-bold mb-4 leading-tight">
          Cross-timezone collaboration window
        </h2>
        <p className="text-base leading-relaxed">{e.timeWindowForCrossTzWork}</p>
      </section>

      {relatedEntries.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related"
        >
          <h2
            id="related"
            className="text-xl font-semibold mb-4 leading-tight"
          >
            Related cities
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {relatedEntries.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/founders-in/${r.slug}`}
                  className="text-primary hover:underline"
                >
                  {r.displayName} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              See the diagnostic applied to your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic runs the Hook / Story /
              Offer triage on your actual URL and labels what&rsquo;s
              broken. Same triage that powers this page, applied to your
              specific landing page – whether you build from {e.city} or
              anywhere else.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/founders-in">Other cities</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
