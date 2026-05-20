import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  localesWithApprovedContent,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { WHY_ISNT_MY_ENTRIES } from "@/lib/why-isnt-my";
import { BASE_URL, ID } from "@/lib/seo/entity";

/**
 * Locale-aware /why-isnt-my hub – plumbing variant.
 *
 * See /[locale]/alternatives-to/page.tsx for the translation rollout
 * workflow.
 */

const PATH = "/why-isnt-my";

export const dynamic = "force-static";

export function generateStaticParams() {
  return renderableLocalesForPath(PATH).map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const localised = localizedPath(PATH, locale);
  const approved = isApproved(PATH, locale);

  const title =
    "Why Isn't My Funnel Converting? Eight Founder Diagnostics – Unlock SaaS";
  const description =
    "Panic-mode diagnostic guides for indie SaaS founders. Eight specific funnel-element pages, each labeling the issue Wrong Person, Weak Offer, or Weak Belief.";

  return {
    title,
    description,
    alternates: {
      canonical: localised,
      languages: {
        "en-US": PATH,
        "x-default": PATH,
        ...(approved
          ? Object.fromEntries(
              localesWithApprovedContent().map((loc) => [
                loc,
                localizedPath(PATH, loc),
              ]),
            )
          : {}),
      },
    },
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      url: localised,
      siteName: "Unlock SaaS",
      locale:
        locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LocalizedWhyIsntMyHub({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const row = getTranslationStatus(PATH, locale);
  if (!row || row.status === "archived") notFound();

  const localised = localizedPath(PATH, locale);
  const absoluteUrl = `${BASE_URL}${localised}`;
  const inLanguage = locale === "pt-BR" ? "pt-BR" : "es";

  const breadcrumbJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE_URL}${localizedPath("/", locale)}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Why isn't my",
        item: absoluteUrl,
      },
    ],
  });

  const collectionJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Why Isn't My Funnel Converting? – Unlock SaaS",
    url: absoluteUrl,
    inLanguage,
    description:
      "Eight per-element diagnostic pages for indie SaaS founders, each labeling the issue Wrong Person, Weak Offer, or Weak Belief.",
    isPartOf: { "@id": ID.website },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: WHY_ISNT_MY_ENTRIES.length,
      itemListElement: WHY_ISNT_MY_ENTRIES.map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `Why isn't my ${e.element} converting`,
        url: `${BASE_URL}${localizedPath(`/why-isnt-my/${e.slug}`, locale)}`,
        description: e.tldr,
      })),
    },
  });

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: breadcrumbJson }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: collectionJson }}
      />

      <div className="max-w-3xl mx-auto px-6 pt-10">
        {row.status === "pending-review" ? (
          <div
            role="note"
            className="mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          >
            <p className="font-semibold mb-1">Pending founder review</p>
            <p className="leading-relaxed">
              {row.reviewNote ??
                "This locale-prefixed URL is in preview while the localized overlay is being finalized. Content shown reflects the canonical English source."}
            </p>
          </div>
        ) : null}

        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href={localizedPath("/", locale)}
                className="hover:underline"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              Why isn&rsquo;t my
            </li>
          </ol>
        </nav>
      </div>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Panic-mode diagnostics
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          Why isn&rsquo;t my funnel converting?
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Eight per-element diagnostics for the moment your dashboard is
          flat. Each page labels the issue as Wrong Person, Weak Offer, or
          Weak Belief.
        </p>
      </header>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-8 space-y-4"
        aria-labelledby="elements-heading"
      >
        <h2 id="elements-heading" className="sr-only">
          Per-element diagnostics
        </h2>
        {WHY_ISNT_MY_ENTRIES.map((e) => (
          <Card key={e.slug} className="hover:border-primary/40 transition">
            <CardContent className="pt-6">
              <h3 className="text-xl font-semibold leading-tight mb-2">
                <Link
                  href={localizedPath(`/why-isnt-my/${e.slug}`, locale)}
                  className="hover:underline"
                >
                  Why isn&rsquo;t my {e.element} converting?
                </Link>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {e.tldr}
              </p>
              <p>
                <Link
                  href={localizedPath(`/why-isnt-my/${e.slug}`, locale)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Diagnose this element →
                </Link>
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-2" />

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Or just diagnose the whole page in 90 seconds
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Paste your live product URL into the free Launch Diagnostic.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href={localizedPath("/diagnostic", locale)}>
                  Get the free diagnostic
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={localizedPath("/glossary", locale)}>
                  Brunson glossary
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
