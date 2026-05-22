import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  SCRIPT_SLUGS,
  getScriptBySlug,
  type ScriptEntry,
} from "@/lib/scripts";
import { getGlossaryBySlug } from "@/lib/glossary";
import { getFunnelPlaybookBySlug } from "@/lib/funnel-playbooks";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { markdownAlternate } from "@/lib/seo/markdown-alternates";
import { articleImageFor } from "@/lib/seo/article-image";
import { formatVerifiedDate } from "@/lib/seo/dates";
import { TldrSummary } from "@/components/seo/tldr-summary";
import { DirectAnswer } from "@/components/seo/direct-answer";
import {
  SPEAKABLE_SPEC,
  ACCESS_MODE_TEXTUAL,
} from "@/components/seo/json-ld";


export function generateStaticParams() {
  return SCRIPT_SLUGS.map((slug) => ({ slug }));
}

type RouteParams = { slug: string };

export async function generateMetadata(props: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const params = await props.params;
  const e = getScriptBySlug(params.slug);
  if (!e) return {};

  const canonical = `/scripts/${e.slug}`;
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

function buildJsonLd(e: ScriptEntry, canonicalUrl: string): string[] {
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: e.displayName,
    description: e.tldr,
    totalTime: e.targetLength,
    step: e.blocks.map((b, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: `${b.marker} – ${b.intent}`,
      text: b.saySomethingLike,
    })),
    inLanguage: "en-US",
  };

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: e.metaTitle,
    image: articleImageFor(canonicalUrl),
    description: e.metaDescription,
    abstract: e.tldr,
    author: { "@id": ID.person },
    publisher: { "@id": ID.organization },
    isPartOf: { "@id": ID.website },
    datePublished: e.lastVerified,
    dateModified: e.lastVerified,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    keywords: [
      `${e.displayName}`,
      `${e.displayName} template`,
      `${e.displayName} script`,
      "Brunson",
      "indie SaaS",
    ].join(", "),
    inLanguage: "en-US",
    speakable: SPEAKABLE_SPEC,
    ...ACCESS_MODE_TEXTUAL,
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
        name: "Scripts",
        item: `${BASE_URL}/scripts`,
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

export default async function ScriptDetailPage(props: {
  params: Promise<RouteParams>;
}) {
  const params = await props.params;
  const e = getScriptBySlug(params.slug);
  if (!e) notFound();

  const canonicalUrl = `${BASE_URL}/scripts/${e.slug}`;
  const [articleJson, howToJson, faqJson, breadcrumbJson] = buildJsonLd(
    e,
    canonicalUrl,
  );

  const glossaryLinks = e.relatedGlossary
    .map((termSlug) => {
      const term = getGlossaryBySlug(termSlug);
      return term ? { slug: term.slug, term: term.term } : null;
    })
    .filter((x): x is { slug: string; term: string } => x !== null);

  const playbook = e.relatedPlaybook
    ? getFunnelPlaybookBySlug(e.relatedPlaybook)
    : undefined;

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
            <Link href="/scripts" className="hover:underline">
              Scripts
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
          Funnel script
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          {e.displayName}
        </h1>
        <p
          className="text-lg text-muted-foreground leading-relaxed"
          data-speakable
        >
          {e.tldr}
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

      {/* Direct answer – speakable TL;DR paragraph for AI Overviews,
          Perplexity, ChatGPT browse, Claude search. */}
      <DirectAnswer lastVerified={e.lastVerified} variant="tldr">
        {e.tldr}
      </DirectAnswer>

      <TldrSummary
        headingLabel={`${e.displayName} TL;DR`}
        items={[
          { term: "Script", definition: e.displayName },
          { term: "Format", definition: e.format },
          { term: "Target length", definition: e.targetLength },
          { term: "When to use", definition: e.whenToUse },
          { term: "TL;DR", definition: e.tldr },
          {
            term: "Last verified",
            definition: formatVerifiedDate(e.lastVerified),
          },
        ]}
      />

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="blocks">
        <h2 id="blocks" className="text-2xl font-bold mb-4 leading-tight">
          The script, block by block
        </h2>
        <ol className="space-y-4">
          {e.blocks.map((b, i) => (
            <li key={b.marker}>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    Block {i + 1} · {b.marker}
                  </p>
                  <h3 className="text-lg font-semibold mb-2 leading-tight">
                    {b.intent}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-3 mb-1">
                    Say something like
                  </p>
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {b.saySomethingLike}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-3 mb-1">
                    Founder note
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {b.founderNote}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="variables"
      >
        <h2 id="variables" className="text-xl font-semibold mb-3 leading-tight">
          Variables to fill in
        </h2>
        <ul className="space-y-2">
          {e.variables.map((v) => (
            <li key={v.name} className="text-sm leading-relaxed">
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                {v.name}
              </code>{" "}
              – <span className="text-muted-foreground">{v.note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="max-w-3xl mx-auto px-6 py-8"
        aria-labelledby="mistakes"
      >
        <h2 id="mistakes" className="text-2xl font-bold mb-4 leading-tight">
          Common script-level mistakes
        </h2>
        <ul className="space-y-3 list-disc list-inside">
          {e.commonMistakes.map((m) => (
            <li key={m} className="text-base leading-relaxed">
              {m}
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-bold mb-4 leading-tight">
          Questions founders ask about this script
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

      {playbook ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related-playbook"
        >
          <h2
            id="related-playbook"
            className="text-xl font-semibold mb-3 leading-tight"
          >
            Related funnel playbook
          </h2>
          <p className="text-sm leading-relaxed">
            <Link
              href={`/funnel-playbook/${playbook.slug}`}
              className="text-primary hover:underline"
            >
              {playbook.displayName} playbook →
            </Link>
            <br />
            <span className="text-sm text-muted-foreground">
              {playbook.tldr}
            </span>
          </p>
        </section>
      ) : null}

      {glossaryLinks.length > 0 ? (
        <section
          className="max-w-3xl mx-auto px-6 py-8"
          aria-labelledby="related-glossary"
        >
          <h2
            id="related-glossary"
            className="text-xl font-semibold mb-4 leading-tight"
          >
            Related Brunson terms
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {glossaryLinks.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/glossary/${g.slug}`}
                  className="text-primary hover:underline"
                >
                  {g.term} →
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
              Now diagnose your live page
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              Script is the structure. The 90-second Launch Diagnostic checks
              whether your live page is breaking on Hook, Story, or Offer
              right now and tells you which block of this script needs the
              most work first.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/diagnostic">Get the free diagnostic</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/scripts">Other scripts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </article>
  );
}
