import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cacheLife, cacheTag } from "next/cache";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PARTNER_SLUGS,
  getPartnerBySlug,
  partnerCtaHref,
  type PartnerEntry,
} from "@/lib/partners";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";

async function getCachedPartner(slug: string): Promise<PartnerEntry | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`partners:${slug}`);
  return getPartnerBySlug(slug);
}

export function generateStaticParams() {
  return PARTNER_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getCachedPartner(slug);
  if (!p) return {};

  const canonical = `/partners/${p.slug}`;
  return {
    title: p.metaTitle,
    description: p.metaDescription,
    alternates: pageAlternates(canonical),
    robots: { index: true, follow: true },
    openGraph: {
      type: "profile",
      title: p.metaTitle,
      description: p.metaDescription,
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title: p.metaTitle,
      description: p.metaDescription,
    },
  };
}

/**
 * Build the JSON-LD graph for a partner detail page.
 *
 *   - ProfilePage   – canonical schema.org type for personal landing pages
 *   - Person        – the partner themselves, sameAs every verified social
 *   - BreadcrumbList – home → partners → <partner>
 *
 * The Person block is anchored to the founder Person @id (lib/seo/entity)
 * when kind === "founder" so the founder Knowledge Graph node is reinforced
 * rather than duplicated. Affiliate Person blocks are standalone – they
 * describe a different human and should not borrow the founder @id.
 */
function buildJsonLd(p: PartnerEntry, canonicalUrl: string): string[] {
  const personId =
    p.kind === "founder" ? ID.person : `${canonicalUrl}#person`;

  const sameAs: string[] = [];
  if (p.socials?.x) sameAs.push(p.socials.x);
  if (p.socials?.linkedin) sameAs.push(p.socials.linkedin);
  if (p.socials?.github) sameAs.push(p.socials.github);
  if (p.socials?.youtube) sameAs.push(p.socials.youtube);
  if (p.socials?.website) sameAs.push(p.socials.website);

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": personId,
    name: p.displayName,
    description: p.headline,
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(p.photo ? { image: `${BASE_URL}${p.photo}` } : {}),
  };

  const profilePage = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: canonicalUrl,
    name: p.metaTitle,
    description: p.metaDescription,
    isPartOf: { "@id": ID.website },
    mainEntity: { "@id": personId },
    dateModified: p.lastVerified,
    inLanguage: "en-US",
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Partners",
        item: `${BASE_URL}/partners`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: p.displayName,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(person),
    JSON.stringify(profilePage),
    JSON.stringify(breadcrumbs),
  ];
}

function JsonLdBlock({ json }: { json: string }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

function Monogram({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <div
      aria-hidden="true"
      className="flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 text-primary text-3xl font-bold ring-1 ring-primary/20"
    >
      {initial}
    </div>
  );
}

export default async function PartnerDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await props.params;
  const p = await getCachedPartner(slug);
  if (!p) notFound();

  const canonicalUrl = `${BASE_URL}/partners/${p.slug}`;
  const [personJson, profileJson, breadcrumbJson] = buildJsonLd(
    p,
    canonicalUrl,
  );
  const ctaHref = partnerCtaHref(p);
  const ctaLabel =
    p.kind === "founder"
      ? "Start the free diagnostic"
      : `Start the diagnostic via ${p.displayName}`;

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={personJson} />
      <JsonLdBlock json={profileJson} />
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
            <Link href="/partners" className="hover:underline">
              Partners
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {p.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {p.photo ? (
            // Plain <img> is fine here – the asset lives in /public, no
            // remote loader, no LCP-critical hero. Avoiding next/image
            // keeps the static shell trivially prerenderable and skips a
            // sharp dependency for one small avatar.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.photo}
              alt={`${p.displayName} headshot`}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <Monogram name={p.displayName} />
          )}
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              {p.kind === "founder" ? "From the founder" : "Featured partner"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">
              {p.displayName}
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              {p.headline}
            </p>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          Verified{" "}
          <time dateTime={p.lastVerified}>
            {formatVerifiedDate(p.lastVerified)}
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

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="pitch">
        <h2 id="pitch" className="text-2xl font-bold mb-4 leading-tight">
          Why {p.displayName} recommends Unlock SaaS
        </h2>
        <p className="text-base leading-relaxed">{p.pitch}</p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="proof">
        <h2 id="proof" className="text-2xl font-bold mb-4 leading-tight">
          What they have actually done with it
        </h2>
        <p className="text-base leading-relaxed">{p.proof}</p>
      </section>

      {p.socials && Object.values(p.socials).some(Boolean) ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="elsewhere"
        >
          <h2
            id="elsewhere"
            className="text-xl font-semibold mb-4 leading-tight"
          >
            Find {p.displayName} elsewhere
          </h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {p.socials.x ? (
              <li>
                <a
                  href={p.socials.x}
                  rel="noopener me"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  X →
                </a>
              </li>
            ) : null}
            {p.socials.linkedin ? (
              <li>
                <a
                  href={p.socials.linkedin}
                  rel="noopener me"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  LinkedIn →
                </a>
              </li>
            ) : null}
            {p.socials.github ? (
              <li>
                <a
                  href={p.socials.github}
                  rel="noopener me"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  GitHub →
                </a>
              </li>
            ) : null}
            {p.socials.youtube ? (
              <li>
                <a
                  href={p.socials.youtube}
                  rel="noopener me"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  YouTube →
                </a>
              </li>
            ) : null}
            {p.socials.website ? (
              <li>
                <a
                  href={p.socials.website}
                  rel="noopener me"
                  target="_blank"
                  className="text-primary hover:underline"
                >
                  Website →
                </a>
              </li>
            ) : null}
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
              {p.kind === "founder"
                ? "Run the same diagnostic the founder runs on his own launch."
                : `Take the diagnostic via ${p.displayName}.`}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic runs the Hook / Story /
              Offer triage on your actual URL and labels what is broken.
              {p.kind === "affiliate"
                ? " The link below carries the partner attribution cookie so any future Core subscription pays them their 50% rev share."
                : ""}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/partners">Other partners</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
