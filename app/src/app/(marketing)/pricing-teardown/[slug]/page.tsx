import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  PRICING_TEARDOWN_SLUGS,
  getPricingTeardownBySlug,
  getRelatedPricingTeardowns,
  type PricingTeardown,
} from "@/lib/pricing-teardowns";
import { getTeardownBySlug as getFunnelTeardownBySlug } from "@/lib/funnel-teardowns";

/**
 * Programmatic SEO surface — Pricing teardown: {Company}.
 *
 * Surface A (organic) of strategy/google-strategy.md, third pSEO block
 * after /alternatives-to and /funnel-teardown. Target intent:
 * "[product] pricing teardown", "how does [product] price",
 * "[category] pricing strategy", "[product] pricing model explained".
 *
 * Cross-pattern linking: if a slug also exists in the funnel-teardowns
 * manifest, the page renders a "Also see funnel teardown" callout so
 * readers researching pricing find the funnel analysis (and vice
 * versa from the funnel-teardown route). The cross-link compounds the
 * SEO authority across both surfaces.
 *
 * Brunson Hard-Rule reconciliation:
 *   - Pattern-level analysis only. Approximate prices, not exact.
 *   - lastVerified ISO is visible in the footer.
 *   - "What's working / what to adapt / what to avoid" framing keeps
 *     the page useful to the reader rather than positioning Unlock SaaS.
 *
 * Static rendering: force-static + dynamicParams=false. Every slug
 * prerendered at build; unknown slugs 404.
 */

const BASE = "https://unlocksaas.com";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return PRICING_TEARDOWN_SLUGS.map((slug) => ({ slug }));
}

// ----- Per-page metadata -----------------------------------------------------
type RouteParams = { slug: string };

export function generateMetadata({
  params,
}: {
  params: RouteParams;
}): Metadata {
  const t = getPricingTeardownBySlug(params.slug);
  if (!t) return {};

  const canonical = `/pricing-teardown/${t.slug}`;
  const title = `${t.displayName} Pricing Teardown — Model, Tiers, and Strategy`;
  const description = t.oneLine;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      siteName: "Unlock SaaS",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

// ----- JSON-LD --------------------------------------------------------------

function buildJsonLd(t: PricingTeardown, canonicalUrl: string): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${t.displayName} Pricing Teardown — Model, Tiers, and Strategy`,
    description: t.oneLine,
    abstract: t.tldr,
    author: {
      "@type": "Person",
      name: "Maryan",
      url: `${BASE}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "Unlock SaaS",
      url: `${BASE}/`,
    },
    datePublished: t.lastVerified,
    dateModified: t.lastVerified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    about: t.displayName,
    keywords: t.tags.join(", "),
    inLanguage: "en-US",
  };

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-US",
    mainEntity: t.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${BASE}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pricing teardowns",
        item: `${BASE}/pricing-teardown`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${t.displayName} pricing teardown`,
        item: canonicalUrl,
      },
    ],
  };

  return [
    JSON.stringify(article),
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

// ----- Page ------------------------------------------------------------------

export default function PricingTeardownPage({
  params,
}: {
  params: RouteParams;
}) {
  const t = getPricingTeardownBySlug(params.slug);
  if (!t) notFound();

  const canonicalUrl = `${BASE}/pricing-teardown/${t.slug}`;
  const [articleJson, faqJson, breadcrumbJson] = buildJsonLd(t, canonicalUrl);
  const related = getRelatedPricingTeardowns(t.slug, 4);
  // Cross-pattern: does this company also have a funnel teardown?
  const hasFunnelTeardown = Boolean(getFunnelTeardownBySlug(t.slug));

  return (
    <article className="min-h-screen">
      <JsonLdBlock json={articleJson} />
      <JsonLdBlock json={faqJson} />
      <JsonLdBlock json={breadcrumbJson} />

      {/* Breadcrumb */}
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
            <Link href="/pricing-teardown" className="hover:underline">
              Pricing teardowns
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {t.displayName}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Pricing teardown · {t.category}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {t.displayName} pricing teardown
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t.oneLine}
        </p>
      </header>

      <Separator className="my-2" />

      {/* TL;DR — AEO citation block */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="tldr">
        <h2 id="tldr" className="sr-only">
          TL;DR
        </h2>
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-primary mb-3">
              TL;DR
            </p>
            <p className="text-base leading-relaxed">{t.tldr}</p>
          </CardContent>
        </Card>
      </section>

      {/* Cross-pattern callout */}
      {hasFunnelTeardown ? (
        <section
          className="max-w-3xl mx-auto px-6 py-4"
          aria-labelledby="cross-pattern"
        >
          <h2 id="cross-pattern" className="sr-only">
            Also see
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm leading-relaxed">
              Studying{" "}
              <span className="font-semibold">{t.displayName}</span>&apos;s
              broader funnel, not just pricing?
            </p>
            <Link
              href={`/funnel-teardown/${t.slug}`}
              className="text-sm font-semibold text-primary hover:underline shrink-0"
            >
              Read the funnel teardown →
            </Link>
          </div>
        </section>
      ) : null}

      {/* Product snapshot */}
      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="snapshot"
      >
        <h2 id="snapshot" className="text-2xl font-bold mb-6 leading-tight">
          What {t.displayName} actually sells
        </h2>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              What they sell
            </dt>
            <dd className="text-sm leading-relaxed">
              {t.productSnapshot.whatTheySell}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Who it is for
            </dt>
            <dd className="text-sm leading-relaxed">
              {t.productSnapshot.whoFor}
            </dd>
          </div>
        </dl>
      </section>

      {/* Pricing structure */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="structure"
      >
        <h2
          id="structure"
          className="text-2xl font-bold mb-6 leading-tight"
        >
          The pricing structure
        </h2>
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Model
              </p>
              <p className="text-sm font-semibold">
                {t.pricingStructure.model}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Payment frequency
              </p>
              <p className="text-sm">{t.pricingStructure.paymentFrequency}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Free or trial behavior
              </p>
              <p className="text-sm">
                {t.pricingStructure.freeTrialBehavior}
              </p>
            </div>
          </CardContent>
        </Card>

        <h3 className="text-lg font-semibold mb-4">Tiers, as observed</h3>
        <div className="space-y-3">
          {t.pricingStructure.tiers.map((tier) => (
            <Card key={tier.name}>
              <CardContent className="pt-6">
                <div className="flex items-baseline justify-between gap-3 mb-2 flex-wrap">
                  <h4 className="text-base font-bold leading-tight">
                    {tier.name}
                  </h4>
                  <p className="text-sm font-mono text-primary">
                    {tier.pricePoint}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {tier.includes}
                </p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  For: {tier.audience}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Anchor analysis */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="anchor"
      >
        <h2 id="anchor" className="text-2xl font-bold mb-6 leading-tight">
          Anchor analysis
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-base font-semibold mb-3">
              {t.anchorAnalysis.pattern}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.anchorAnalysis.analysis}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Upgrade trigger */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="trigger"
      >
        <h2 id="trigger" className="text-2xl font-bold mb-6 leading-tight">
          The upgrade trigger
        </h2>
        <Card>
          <CardContent className="pt-6">
            <p className="text-base font-semibold mb-3">
              {t.upgradeTrigger.pattern}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.upgradeTrigger.analysis}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* What's working */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="working"
      >
        <h2 id="working" className="text-2xl font-bold mb-6 leading-tight">
          What is working in this pricing model
        </h2>
        <ul className="space-y-3">
          {t.whatsWorking.map((bullet) => (
            <li key={bullet} className="flex gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* What to adapt vs avoid */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="adapt"
      >
        <h2 id="adapt" className="text-2xl font-bold mb-6 leading-tight">
          What to adapt, what to avoid
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/30">
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-primary mb-3">
                Adapt for your indie SaaS
              </p>
              <ul className="space-y-2">
                {t.whatToAdapt.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <Check className="h-4 w-4 text-primary shrink-0 mt-1" />
                    <span className="text-sm leading-relaxed">{bullet}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Do not copy without context
              </p>
              <ul className="space-y-2">
                {t.whatToAvoid.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <X className="h-4 w-4 text-muted-foreground/60 shrink-0 mt-1" />
                    <span className="text-sm text-muted-foreground leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Brunson lens */}
      <section
        className="max-w-3xl mx-auto px-6 py-10"
        aria-labelledby="brunson"
      >
        <h2 id="brunson" className="text-2xl font-bold mb-6 leading-tight">
          The Brunson lens
        </h2>
        <p className="text-sm text-muted-foreground italic mb-6 leading-relaxed">
          Four levers the Machine applies when critiquing your own pricing
          page: how the offer stacks, where it sits on the Value Ladder, what
          psychology drives the tier choice, and what payment mechanics do
          to commitment.
        </p>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Stack
              </p>
              <p className="text-sm leading-relaxed">{t.brunsonLens.stack}</p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Value Ladder
              </p>
              <p className="text-sm leading-relaxed">
                {t.brunsonLens.valueLadder}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Decoy or anchor
              </p>
              <p className="text-sm leading-relaxed">
                {t.brunsonLens.decoyOrAnchor}
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-xs uppercase tracking-widest text-primary mb-1">
                Payment mechanics
              </p>
              <p className="text-sm leading-relaxed">
                {t.brunsonLens.paymentMechanics}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-10" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-6 leading-tight">
          {t.displayName} pricing — FAQ
        </h2>
        <div className="space-y-3">
          {t.faqs.map((f) => (
            <details
              key={f.q}
              className="group border border-border rounded-lg px-4 py-3"
            >
              <summary className="cursor-pointer font-semibold leading-snug list-none flex items-start justify-between gap-3">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="text-muted-foreground shrink-0 group-open:rotate-180 transition-transform"
                >
                  ▾
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Want this pricing teardown applied to your own page?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The 90-second diagnostic labels what is broken on your offer:
              Wrong Person, Weak Offer, or Weak Belief. Pricing-page
              dysfunction usually shows up as Weak Offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/starter">Start with $1</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Related pricing teardowns */}
      {related.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-10 border-t border-border/40"
          aria-labelledby="related"
        >
          <h2 id="related" className="text-lg font-bold mb-4 leading-tight">
            Related pricing teardowns
          </h2>
          <ul className="space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/pricing-teardown/${r.slug}`}
                  className="group flex items-start gap-2 text-sm hover:text-primary transition"
                >
                  <ArrowRight className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground group-hover:text-primary" />
                  <span>
                    <span className="font-semibold">{r.displayName}</span>{" "}
                    <span className="text-muted-foreground">— {r.oneLine}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-muted-foreground">
            <Link
              href="/pricing-teardown"
              className="underline hover:text-foreground"
            >
              Browse every pricing teardown →
            </Link>
          </p>
        </section>
      ) : null}

      {/* Honesty footer */}
      <footer className="max-w-3xl mx-auto px-6 py-8 text-xs text-muted-foreground leading-relaxed border-t border-border/40">
        <p>
          Last verified {t.lastVerified}. Prices noted in this teardown are
          approximations as observed on {t.displayName}&apos;s public pricing
          page at that date; the exact figures and tier composition may shift
          between verifications.
          {t.pricingPageUrl ? (
            <>
              {" "}
              See the live pricing at{" "}
              <a
                href={t.pricingPageUrl}
                target="_blank"
                rel="noopener noreferrer external"
                className="underline hover:text-foreground"
              >
                {t.pricingPageUrl
                  .replace(/^https?:\/\//, "")
                  .replace(/\/$/, "")}
              </a>
              .
            </>
          ) : t.homepageUrl ? (
            <>
              {" "}
              See{" "}
              <a
                href={t.homepageUrl}
                target="_blank"
                rel="noopener noreferrer external"
                className="underline hover:text-foreground"
              >
                {t.homepageUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              </a>
              .
            </>
          ) : null}{" "}
          If anything on this page is wrong or out of date, email{" "}
          <a
            href="mailto:maryan@unlocksaas.com"
            className="underline hover:text-foreground"
          >
            maryan@unlocksaas.com
          </a>{" "}
          and we will fix it.
        </p>
      </footer>
    </article>
  );
}
