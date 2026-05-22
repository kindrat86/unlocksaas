import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LAUNCH_CHECKLIST_SLUGS,
  getLaunchChecklistBySlug,
  type LaunchChecklistEntry,
} from "@/lib/launch-checklists";
import { getNicheBySlug } from "@/lib/niches";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { articleImageFor } from "@/lib/seo/article-image";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";

export function generateStaticParams() {
  return LAUNCH_CHECKLIST_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getLaunchChecklistBySlug(params.slug);
  if (!e) return {};

  const canonical = `/launch-checklist/${e.slug}`;
  return {
    title: e.metaTitle,
    description: e.metaDescription,
    alternates: markdownAlternate(canonical, `${canonical}/md`),
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

function buildJsonLd(
  e: LaunchChecklistEntry,
  canonicalUrl: string,
): string[] {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    image: articleImageFor(canonicalUrl),
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
      audienceType: e.displayName,
    },
    keywords: [
      `launch checklist for ${e.displayName}`,
      `pre-revenue checklist`,
      `${e.displayName} launch plan`,
      "Brunson",
      "indie SaaS",
    ].join(", "),
    inLanguage: "en-US",
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
  };

  // HowTo schema – each checklist step maps to a HowToStep. Google
  // surfaces HowTo carousels on intent-shaped queries like "how to launch
  // [niche] saas" so the schema-to-content pairing earns the carousel
  // slot when traffic lands there.
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `Pre-revenue launch checklist for ${e.displayName}`,
    description: e.heroSubhead,
    inLanguage: "en-US",
    totalTime: "P14D",
    step: e.steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.detail,
      // Time estimates are founder-readable strings (e.g. "30 min", "2 hrs").
      // Schema.org HowToStep accepts a plain text `timeRequired` fallback;
      // we keep it as a string rather than ISO-8601 to match the rendered
      // text on the page (drift-free).
      timeRequired: s.timeEstimate,
    })),
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
        name: "Launch checklist",
        item: `${BASE_URL}/launch-checklist`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `Launch checklist for ${e.displayName}`,
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

const BUCKET_ORDER = [
  "Foundation",
  "Offer",
  "Proof",
  "Traffic",
  "Follow-up",
] as const;

export default async function LaunchChecklistDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getLaunchChecklistBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/launch-checklist/${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  // Cross-link to the matching /for/[slug] page if it exists.
  const niche = getNicheBySlug(e.slug);

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
            <Link href="/launch-checklist" className="hover:underline">
              Launch checklist
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground capitalize">
            {e.displayName}
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Launch checklist for {e.displayName}
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 capitalize">
          The 14-day launch checklist for {e.displayName}.
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable
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
        headingLabel={`Checklist TL;DR for ${e.displayName}`}
        items={[
          { term: "Who this is for", definition: e.whoThisIsFor },
          {
            term: "Steps",
            definition: `${e.steps.length} ordered moves, grouped into Foundation, Offer, Proof, Traffic, and Follow-up`,
          },
          {
            term: "Time to complete",
            definition: "Roughly 14 hours of focused work spread over 14 days",
          },
          {
            term: "Final step",
            definition:
              "Run the free 90-second diagnostic on the rewritten page",
          },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="who"
      >
        <h2 id="who" className="text-2xl font-bold mb-4 leading-tight">
          Who this checklist is for
        </h2>
        <p className="text-base leading-relaxed">{e.whoThisIsFor}</p>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="steps"
      >
        <h2 id="steps" className="text-2xl font-bold mb-6 leading-tight">
          The 10 ordered moves
        </h2>
        <ol className="space-y-6 list-none p-0">
          {e.steps.map((s, i) => (
            <li key={s.title} className="relative pl-12">
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
              >
                {i + 1}
              </span>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold leading-tight">
                  {s.title}
                </h3>
                <Badge variant="outline" className="text-xs font-normal">
                  {s.bucket}
                </Badge>
                <Badge variant="secondary" className="text-xs font-normal">
                  {s.timeEstimate}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="buckets"
      >
        <h2 id="buckets" className="text-2xl font-bold mb-4 leading-tight">
          How the buckets work
        </h2>
        <ul className="text-sm leading-relaxed space-y-2 text-muted-foreground">
          {BUCKET_ORDER.map((bucket) => {
            const count = e.steps.filter((s) => s.bucket === bucket).length;
            if (count === 0) return null;
            const description: Record<typeof bucket, string> = {
              Foundation:
                "The hero, the headline, the cohort definition. Where the page either earns the next four seconds or loses the reader.",
              Offer:
                "The Stack, the guarantee, the pricing structure. What turns the reader from interested into ready-to-pay.",
              Proof:
                "Dated, named, specific evidence. What turns ready-to-pay into actually-paid.",
              Traffic:
                "How the right cohort finds the page. Always after the page is rewritten, never before.",
              "Follow-up":
                "Soap Opera, Seinfeld, OTOs, post-purchase sequences. What turns one customer into compounding revenue.",
            };
            return (
              <li key={bucket}>
                <span className="font-semibold text-foreground">{bucket}</span>
                {" · "}
                {count} step{count === 1 ? "" : "s"}
                {" · "}
                {description[bucket]}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions {e.displayName} ask before starting
        </h2>
        <div className="space-y-4">
          {e.faqs.map((f) => (
            <div key={f.q}>
              <p className="text-base font-semibold mb-2 aeo-q">{f.q}</p>
              <p className="text-sm text-muted-foreground leading-relaxed aeo-a">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {niche ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="cross-niche"
        >
          <h2
            id="cross-niche"
            className="text-xl font-semibold mb-3 leading-tight"
          >
            Read the cohort breakdown first
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            The diagnostic page for {e.displayName} walks the Hook / Story /
            Offer triage on the cohort's vocabulary, money mechanics, and most
            common mistakes. Pair it with this checklist for context.
          </p>
          <Link
            href={`/for/${niche.slug}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Open the {e.displayName} cohort page →
          </Link>
        </section>
      ) : null}

      <section
        className="max-w-3xl mx-auto px-6 py-12 border-t border-border/40"
        aria-labelledby="cta"
      >
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Step 10 made easy: run the diagnostic now
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              The free 90-second Launch Diagnostic runs the Hook / Story /
              Offer triage on your actual URL and labels what&rsquo;s broken.
              You can run it before step 1 (to see where you start) and after
              step 9 (to see what shifted).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/launch-checklist">Other checklists</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
