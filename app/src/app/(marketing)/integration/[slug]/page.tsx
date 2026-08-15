import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  INTEGRATION_SLUGS,
  INTEGRATION_ENTRIES,
  getIntegrationBySlug,
  resolveIntegrationTeardown,
  type IntegrationEntry,
} from "@/lib/integrations";
import { getTeardownBySlug } from "@/lib/funnel-teardowns";
import { getPricingTeardownBySlug } from "@/lib/pricing-teardowns";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { formatVerifiedDate } from "@/lib/seo/dates";


export function generateStaticParams() {
  return INTEGRATION_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getIntegrationBySlug(params.slug);
  if (!e) return {};
  const canonical = `/integration/${e.slug}`;
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

function buildJsonLd(e: IntegrationEntry, canonicalUrl: string): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.intro,
    step: e.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.description,
    })),
    inLanguage: "en-US",
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    description: e.metaDescription,
    abstract: e.intro,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    inLanguage: "en-US",
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: e.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
        inLanguage: "en-US",
      },
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "Integrations",
        item: `${BASE_URL}/integration`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: e.displayName,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(article),
    JSON.stringify(howTo),
    JSON.stringify(faqPage),
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

function resolveToolLink(
  slug: string | undefined,
): { label: string; href: string } | null {
  if (!slug) return null;
  const resolved = resolveIntegrationTeardown(slug);
  if (!resolved) return null;
  if (resolved.kind === "funnel") {
    const t = getTeardownBySlug(slug);
    return t ? { label: t.displayName, href: resolved.href } : null;
  }
  const t = getPricingTeardownBySlug(slug);
  return t ? { label: t.displayName, href: resolved.href } : null;
}

export default async function IntegrationDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getIntegrationBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/integration/${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const toolALink = resolveToolLink(e.toolATeardownSlug);
  const toolBLink = resolveToolLink(e.toolBTeardownSlug);

  const related = INTEGRATION_ENTRIES.filter(
    (other) => other.slug !== e.slug,
  ).slice(0, 4);

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={howToJson} />
      <JsonLdBlock json={faqJson} />
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
            <Link href="/integration" className="hover:underline">
              Integrations
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {e.toolA} + {e.toolB}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Tool-pair integration pattern
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          {e.intro}
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

      <section
        className="max-w-3xl mx-auto px-6 py-8 grid sm:grid-cols-2 gap-6"
        aria-labelledby="owns"
      >
        <Card className="border-border/40">
          <CardContent className="pt-6">
            <h2
              id="owns"
              className="text-base font-semibold mb-3 leading-tight"
            >
              {e.toolA} owns
              {toolALink ? (
                <>
                  {" "}
                  <Link
                    href={toolALink.href}
                    className="text-sm text-primary hover:underline font-normal"
                  >
                    (teardown →)
                  </Link>
                </>
              ) : null}
            </h2>
            <p className="text-sm leading-relaxed">{e.toolAOwns}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40">
          <CardContent className="pt-6">
            <h2 className="text-base font-semibold mb-3 leading-tight">
              {e.toolB} owns
              {toolBLink ? (
                <>
                  {" "}
                  <Link
                    href={toolBLink.href}
                    className="text-sm text-primary hover:underline font-normal"
                  >
                    (teardown →)
                  </Link>
                </>
              ) : null}
            </h2>
            <p className="text-sm leading-relaxed">{e.toolBOwns}</p>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="shape"
      >
        <h2 id="shape" className="text-xl font-semibold mb-4 leading-tight">
          Integration shape
        </h2>
        <p className="text-base leading-relaxed">{e.integrationShape}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="steps"
      >
        <h2 id="steps" className="text-xl font-semibold mb-4 leading-tight">
          Implementation steps
        </h2>
        <ol className="space-y-6">
          {e.steps.map((s, i) => (
            <li key={s.title} className="border-l-2 border-primary/30 pl-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Step {i + 1}
              </p>
              <p className="text-base font-semibold mb-2 leading-tight">
                {s.title}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                {s.description}
              </p>
              {s.gotcha ? (
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold text-foreground">Gotcha:</span>{" "}
                  <span className="text-muted-foreground">{s.gotcha}</span>
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="gotchas"
      >
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
          <CardContent className="pt-6">
            <h2
              id="gotchas"
              className="text-base font-semibold mb-3 leading-tight"
            >
              Common gotchas across the whole integration
            </h2>
            <ul className="space-y-2 list-disc list-inside text-sm leading-relaxed">
              {e.commonGotchas.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="not"
      >
        <h2 id="not" className="text-xl font-semibold mb-4 leading-tight">
          When NOT to build this integration
        </h2>
        <p className="text-base leading-relaxed">{e.whenNotToBuild}</p>
      </section>

      {e.faqs.length > 0 ? (
        <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
          <h2 id="faq" className="text-xl font-semibold mb-4 leading-tight">
            Frequently asked
          </h2>
          <dl className="space-y-4">
            {e.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-semibold mb-1">{f.q}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related"
        >
          <h2
            id="related"
            className="text-base font-semibold mb-3 leading-tight"
          >
            Other tool-pair integrations
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/integration/${r.slug}`}
                  className="text-sm text-primary hover:underline"
                >
                  {r.displayName}
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
              See the stack this integration belongs to
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Integration patterns assume the right stack underneath. Use the
              stack recommendations to pick the right tools first, then the
              integration to wire them together.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/stack">Stack recommendations</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/integration">All integrations</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
