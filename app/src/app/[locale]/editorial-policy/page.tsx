import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { BreadcrumbListJsonLd } from "@/components/seo/json-ld";
import { isLocale, localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  getTranslationStatus,
  isApproved,
  localesWithApprovedContent,
  renderableLocalesForPath,
} from "@/lib/i18n/registry";
import { getEditorialPolicyChrome } from "@/lib/i18n/translations";

/**
 * Locale-aware /editorial-policy surface – E-E-A-T anchor page in es and
 * pt-BR. Mirrors the canonical (marketing)/editorial-policy structure with
 * locale-swapped chrome.
 *
 * Three-state contract (identical to other [locale] routes):
 *   - approved → indexable + hreflang + sitemap + no banner.
 *   - pending-review → renders + amber banner + noindex + sitemap-omitted.
 *   - missing/archived → notFound() (404).
 *
 * Editorial-policy specifics: the corrections-workflow item 1 references
 * the support email. In the locale variant we render it as plain text,
 * not a mailto: link (acceptable degradation – the address remains
 * legible and copy-pasteable). The canonical en-US page keeps its mailto
 * link via inline JSX in app/(marketing)/editorial-policy/page.tsx.
 *
 * Published / Last-reviewed dates are inherited from the canonical and
 * stay constant across locales – the editorial standard itself is one
 * document, translated, not re-dated.
 */

const POLICY_PUBLISHED_AT = "2026-05-17";
const POLICY_LAST_REVIEWED_AT = "2026-05-17";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") return {};

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const chrome = getEditorialPolicyChrome(locale);
  const path = "/editorial-policy";
  const localised = localizedPath(path, locale);
  const approved = isApproved(path, locale);

  return {
    title: chrome.seoTitle,
    description: chrome.seoDescription,
    alternates: {
      canonical: localised,
      languages: {
        "en-US": path,
        "x-default": path,
        ...(approved
          ? Object.fromEntries(
              localesWithApprovedContent().map((loc) => [
                loc,
                localizedPath(path, loc),
              ]),
            )
          : {}),
      },
    },
    robots: approved
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "article",
      title: chrome.seoTitle,
      description: chrome.seoDescription,
      url: localised,
      publishedTime: POLICY_PUBLISHED_AT,
      authors: ["Maryan"],
      locale:
        locale === "pt-BR" ? "pt_BR" : locale === "es" ? "es_ES" : "en_US",
    },
    twitter: {
      card: "summary",
      title: chrome.seoTitle,
      description: chrome.seoDescription,
    },
  };
}


export function generateStaticParams() {
  return renderableLocalesForPath("/editorial-policy").map((locale) => ({
    locale,
  }));
}

export default async function LocalizedEditorialPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale) || rawLocale === "en-US") notFound();

  const locale = rawLocale as Exclude<Locale, "en-US">;
  const path = "/editorial-policy";

  const row = getTranslationStatus(path, locale);
  if (!row || row.status === "archived") {
    notFound();
  }

  const chrome = getEditorialPolicyChrome(locale);
  const localised = localizedPath(path, locale);
  const absoluteUrl = `https://unlocksaas.com${localised}`;

  const breadcrumbTrail = [
    {
      name: chrome.breadcrumbHome,
      url: `https://unlocksaas.com${localizedPath("/", locale)}`,
    },
    { name: chrome.breadcrumbEditorial, url: absoluteUrl },
  ] as const;

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={breadcrumbTrail} />

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
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href={localizedPath("/", locale)}
            className="underline underline-offset-4 hover:text-foreground"
          >
            {chrome.breadcrumbHome}
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>{chrome.breadcrumbEditorial}</span>
        </nav>

        <header className="mb-10">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {chrome.pageLabel}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {chrome.headline}
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            {chrome.lede}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            {chrome.publishedLabel}{" "}
            <time dateTime={POLICY_PUBLISHED_AT}>{POLICY_PUBLISHED_AT}</time>
            . {chrome.reviewedLabel}{" "}
            <time dateTime={POLICY_LAST_REVIEWED_AT}>
              {POLICY_LAST_REVIEWED_AT}
            </time>
            .
          </p>
        </header>

        <Separator className="my-10" />

        <section className="mb-12" aria-labelledby="editorial-team">
          <h2 id="editorial-team" className="text-xl font-bold mb-4">
            {chrome.section1Heading}
          </h2>
          <p className="text-base leading-relaxed mb-3">{chrome.section1P1}</p>
          <p className="text-base leading-relaxed">{chrome.section1P2}</p>
        </section>

        <section className="mb-12" aria-labelledby="sourcing">
          <h2 id="sourcing" className="text-xl font-bold mb-4">
            {chrome.section2Heading}
          </h2>
          <ul className="list-disc list-outside ml-5 space-y-3 text-base leading-relaxed">
            {chrome.section2Items.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong> {item.body}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="datelines">
          <h2 id="datelines" className="text-xl font-bold mb-4">
            {chrome.section3Heading}
          </h2>
          <p className="text-base leading-relaxed mb-3">{chrome.section3P1}</p>
          <p className="text-base leading-relaxed">{chrome.section3P2}</p>
        </section>

        <section className="mb-12" aria-labelledby="disclosures">
          <h2 id="disclosures" className="text-xl font-bold mb-4">
            {chrome.section4Heading}
          </h2>
          <ul className="list-disc list-outside ml-5 space-y-3 text-base leading-relaxed">
            {chrome.section4Items.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong> {item.body}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12" aria-labelledby="corrections-workflow">
          <h2 id="corrections-workflow" className="text-xl font-bold mb-4">
            {chrome.section5Heading}
          </h2>
          <p className="text-base leading-relaxed mb-3">
            {chrome.section5Intro}
          </p>
          <ol className="list-decimal list-outside ml-5 space-y-3 text-base leading-relaxed">
            {chrome.section5Items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <Separator className="my-10" />

        <section className="mb-12" aria-labelledby="corrections-log">
          <h2 id="corrections-log" className="text-xl font-bold mb-4">
            {chrome.section6Heading}
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed mb-4">
            {chrome.section6Intro}
          </p>
          <div className="border border-border rounded-md p-6 bg-muted/30">
            <p className="text-sm text-muted-foreground italic">
              {chrome.section6EmptyState}
            </p>
          </div>
        </section>

        <Separator className="my-10" />

        <footer className="text-sm text-muted-foreground space-y-3">
          <p>
            {chrome.footerSigPre}{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Maryan
            </Link>
            {chrome.footerSigPost}
          </p>
          <p>
            {chrome.footerSeeAlso}{" "}
            <Link
              href="/about"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {chrome.footerLinkAbout}
            </Link>{" "}
            ·{" "}
            <Link
              href="/press"
              className="underline underline-offset-4 hover:text-foreground"
            >
              {chrome.footerLinkPress}
            </Link>{" "}
            ·{" "}
            <Link
              href={localizedPath("/contact", locale)}
              className="underline underline-offset-4 hover:text-foreground"
            >
              {chrome.footerLinkContact}
            </Link>
            .
          </p>
        </footer>
      </article>
    </div>
  );
}
