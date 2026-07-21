/**
 * Shared scaffold for /tools/<slug> detail pages.
 *
 * Each detail page imports its widget + scaffold, supplies the slug,
 * and renders. The scaffold reads the manifest entry by slug (single
 * source of truth from `tools-catalog.ts`) and renders:
 *   - Breadcrumb nav + JSON-LD
 *   - H1 + speakable lede + formula card
 *   - The widget (caller-supplied client island)
 *   - FAQ block + FAQPage JSON-LD
 *   - "Related calculators" cross-link rail (Brunson Dream-100 internal-
 *     linking play; every detail page surfaces the other four)
 *
 * Server-rendered. Caller-supplied widget is the only client island.
 */

import type { ReactNode } from "react";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/copy-button";
import {
  ArticleJsonLd,
  BreadcrumbListJsonLd,
  FaqPageJsonLd,
} from "@/components/seo/json-ld";
import {
  TOOLS,
  TOOLS_HUB_PATH,
  TOOLS_HUB_URL,
  TOOL_BY_SLUG,
} from "@/lib/tools-catalog";

const PUBLISHED_AT = "2026-05-22";
const LAST_REVIEWED_AT = "2026-05-22";

export interface ToolDetailScaffoldProps {
  slug: string;
  widget: ReactNode;
}

export function ToolDetailScaffold({
  slug,
  widget,
}: ToolDetailScaffoldProps) {
  const tool = TOOL_BY_SLUG.get(slug);
  if (!tool) {
    // Static safety – every slug rendered through this scaffold lives
    // in the manifest. A miss here means a route file ships with a
    // typo'd slug, which a build-time grep would catch. Surface a
    // visible no-op instead of crashing the page tree.
    return null;
  }

  const trail = [
    { name: "Unlock SaaS", url: "https://unlocksaas.com/" },
    { name: "Free tools", url: TOOLS_HUB_URL },
    { name: tool.title, url: tool.url },
  ] as const;

  const related = TOOLS.filter((t) => t.slug !== tool.slug);

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <BreadcrumbListJsonLd trail={trail} />
      <ArticleJsonLd
        headline={tool.title}
        description={tool.description}
        url={tool.url}
        datePublished={PUBLISHED_AT}
        dateModified={LAST_REVIEWED_AT}
        articleSection="Free tools"
        keywords={tool.keywords}
      />
      <FaqPageJsonLd items={tool.faq} />

      <article className="max-w-3xl mx-auto">
        <nav
          aria-label="Breadcrumb"
          className="text-xs text-muted-foreground mb-6"
        >
          <Link
            href="/"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Unlock SaaS
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <Link
            href={TOOLS_HUB_PATH}
            className="underline underline-offset-4 hover:text-foreground"
          >
            Free tools
          </Link>
          <span className="mx-2" aria-hidden>
            ›
          </span>
          <span>{tool.eyebrow}</span>
        </nav>

        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            {tool.eyebrow}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
            {tool.title}.
          </h1>
          <p
            data-speakable="lede"
            className="text-base leading-relaxed text-muted-foreground"
          >
            {tool.lede}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Published{" "}
            <time dateTime={PUBLISHED_AT}>{PUBLISHED_AT}</time>. Last
            reviewed{" "}
            <time dateTime={LAST_REVIEWED_AT}>{LAST_REVIEWED_AT}</time>.
          </p>
        </header>

        <Card className="border-border/60 mb-8">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Formula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <code className="block text-sm font-mono leading-relaxed text-foreground">
              {tool.formula}
            </code>
          </CardContent>
        </Card>

        <section
          aria-labelledby="calculator"
          className="mb-12"
        >
          <h2
            id="calculator"
            className="sr-only"
          >
            Calculator
          </h2>
          {widget}
        </section>

        {/* Embed this calculator — editorial backlink farm */}
        <section
          aria-labelledby="embed"
          className="mb-12"
        >
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle
                id="embed"
                className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
              >
                📋 Embed this calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Free to embed. Paste this snippet anywhere that allows an iframe
                — blogs, Notion, Substack, Webflow, Ghost.
              </p>
              <pre className="block overflow-x-auto rounded-md bg-muted p-3 text-xs font-mono leading-relaxed">
{`<iframe src="https://unlocksaas.com/embed/tools/${tool.slug}" title="${tool.title} by UnlockSaaS" width="100%" height="560" frameborder="0" loading="lazy" style="border:0;max-width:640px"></iframe>`}
              </pre>
              <CopyButton
                text={`<iframe src="https://unlocksaas.com/embed/tools/${tool.slug}" title="${tool.title} by UnlockSaaS" width="100%" height="560" frameborder="0" loading="lazy" style="border:0;max-width:640px"></iframe>`}
              />
              <p className="text-xs text-muted-foreground">
                Also auto-embeds when you paste{" "}
                <code className="text-xs bg-muted px-1 rounded">
                  https://unlocksaas.com/tools/{tool.slug}
                </code>{" "}
                into oEmbed-aware editors.{" "}
                <Link
                  href="/embed/"
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  See all embeddable widgets →
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>

        <section
          aria-labelledby="faq"
          className="space-y-4 mb-12"
        >
          <h2
            id="faq"
            className="text-xl font-semibold tracking-tight"
          >
            Frequently asked
          </h2>
          <dl className="space-y-5">
            {tool.faq.map((item) => (
              <div
                key={item.q}
                className="space-y-2"
              >
                <dt
                  data-speakable="faq-q"
                  className="text-sm font-semibold text-foreground"
                >
                  {item.q}
                </dt>
                <dd
                  data-speakable="faq-a"
                  className="text-sm leading-relaxed text-muted-foreground"
                >
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="related"
          className="space-y-4"
        >
          <h2
            id="related"
            className="text-xl font-semibold tracking-tight"
          >
            Related calculators
          </h2>
          <ul className="space-y-2 text-sm">
            {related.map((other) => (
              <li key={other.slug}>
                <Link
                  href={other.path}
                  className="underline underline-offset-4 hover:text-foreground"
                >
                  {other.title}
                </Link>
                <span className="text-muted-foreground">
                  {" "}
                  – {other.hubLede}
                </span>
              </li>
            ))}
          </ul>
          <p className="pt-4 text-sm">
            <Link
              href={TOOLS_HUB_PATH}
              className="underline underline-offset-4 hover:text-foreground"
            >
              ← Back to all free tools
            </Link>
          </p>
        </section>
      </article>
    </div>
  );
}
