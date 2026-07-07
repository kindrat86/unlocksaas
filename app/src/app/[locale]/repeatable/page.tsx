import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { isLocale, localizedPath, ogLocaleFormat, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { localeAlternates } from "@/lib/seo/markdown-alternates";
import { getRepeatableChrome } from "@/lib/i18n/translations";

/**
 * Locale-aware /repeatable surface – Rung 2 (Repeatable Revenue Layer)
 * public spec in es and pt-BR.
 *
 * Three-state contract (identical to [locale]/faq + [locale]/contact):
 *   - approved → indexable, sitemap-listed, hreflang back-link present.
 *   - pending-review → renders for founder preview but noindex + omitted
 *     from sitemap + no hreflang advertised.
 *   - missing/archived → notFound() (404).
 *
 * Differences from the canonical en-US page:
 *   - force-static rather than force-dynamic (locale variants are not in
 *     the A/B exposure population, so the AbExposureBeacon is intentionally
 *     omitted).
 *   - CTAs link to canonical en-US /playbook-sales and /starter (those
 *     paths are not yet translated; localizedPath would route to a
 *     non-existent /es/playbook-sales).
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Locale;
  const chrome = getRepeatableChrome(locale);
  const path = "/repeatable";
  const localised = localizedPath(path, locale);
  const approved = isApproved(path, locale);

  return {
    title: chrome.seoTitle,
    description: chrome.seoDescription,
    alternates: localeAlternates(path, locale),
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "article",
      title: chrome.seoTitle,
      description: chrome.seoDescription,
      url: localised,
      locale:
        ogLocaleFormat(locale),
    },
    twitter: {
      card: "summary_large_image",
      title: chrome.seoTitle,
      description: chrome.seoDescription,
    },
  };
}


export function generateStaticParams() {
  return renderableLocalesForPath("/repeatable").map((locale) => ({ locale }));
}

export default async function LocalizedRepeatablePage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Locale;
  const path = "/repeatable";

  const row = getTranslationStatus(path, locale);
  if (!row || row.status === "archived") {
    notFound();
  }

  const chrome = getRepeatableChrome(locale);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      {row.status === "pending-review" ? (
        <div
          role="note"
          className="max-w-2xl mx-auto mb-8 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p className="font-semibold mb-1">
            Pending review – not indexed yet
          </p>
          <p className="leading-relaxed">
            {row.reviewNote ??
              "Translation is in review. The page renders but is noindex; sitemap omits it; no hreflang alternate is advertised."}
          </p>
        </div>
      ) : null}

      <article className="max-w-2xl mx-auto">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {chrome.topLabel}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {chrome.headline}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {chrome.lede}
          </p>
        </header>

        <Separator className="my-8" />

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">{chrome.whatItIsHeading}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {chrome.whatItIsP1}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {chrome.whatItIsP2}
          </p>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">{chrome.whatItIsNotHeading}</h2>
          <Card className="bg-muted/40">
            <CardContent className="pt-6">
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                {chrome.whatItIsNotItems.map((item) => (
                  <li key={item}>– {item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">{chrome.gatesHeading}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {chrome.gatesIntro}
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-sm text-muted-foreground leading-relaxed">
            {chrome.gatesItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <section className="mb-10 space-y-4">
          <h2 className="text-xl font-bold">{chrome.priceHeading}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {chrome.priceP}{" "}
            <code className="text-xs">
              strategy/decisions/rung-2-repeatable-revenue.md
            </code>
            .
          </p>
        </section>

        <Separator className="my-8" />

        <Card className="mb-8 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">{chrome.ctaIntro}</p>
            <Button asChild size="lg" className="text-base px-8">
              <Link href="/playbook-sales">{chrome.ctaPrimary}</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              {chrome.ctaSecondaryPre}{" "}
              <Link
                href="/starter"
                className="underline underline-offset-4 hover:text-foreground"
              >
                {chrome.ctaSecondaryLink}
              </Link>{" "}
              {chrome.ctaSecondaryPost}
            </p>
          </CardContent>
        </Card>

        <p className="text-sm text-muted-foreground italic">{chrome.signoff}</p>
      </article>
    </div>
  );
}
