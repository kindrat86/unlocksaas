/**
 * /who — Dream Customer Avatar (Traffic Secrets §1, Secret #1).
 *
 * The single most important page on the site. Names the ONE person
 * Unlock SaaS serves: a non-engineer founder who shipped a real product
 * with AI tools and is watching a flat Stripe line.
 *
 * Brunson's rule: if you can't name ONE person — with a name, a role,
 * a daily reality, a fear, and a dream — every other page on this site
 * is talking to nobody. This page is the anchor.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  DREAM_CUSTOMER,
  type DesireEntry,
  type FearEntry,
  type AwarenessStage,
} from "@/lib/dream-customer";
import { BASE_URL, ID } from "@/lib/seo/entity";
import { pageAlternates } from "@/lib/seo/markdown-alternates";
import { DEFAULT_OG_IMAGES } from "@/lib/seo/og-image";

const CANONICAL = "/who";

export const metadata: Metadata = {
  title: "Who We Serve — The Dream Customer of Unlock SaaS",
  description:
    "One person. One name. One daily reality. This is the exact founder Unlock SaaS was built for: the non-engineer who shipped a real product and is stuck on distribution.",
  alternates: pageAlternates(CANONICAL),
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Who We Serve — The Unlock SaaS Dream Customer",
    description:
      "One person. Not a segment. A name, a fear, a daily reality, and the exact outcome they're building toward.",
    url: CANONICAL,
    siteName: "Unlock SaaS",
    images: DEFAULT_OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: "Who We Serve — Unlock SaaS",
    description: "One person. One promise. This is who the Playbook is for.",
  },
};

const BREADCRUMB_JSON = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: `${BASE_URL}/` },
    { "@type": "ListItem", position: 2, name: "Who We Serve", item: `${BASE_URL}/who` },
  ],
});

export default function WhoPage() {
  const dc = DREAM_CUSTOMER;

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "Who Unlock SaaS serves",
            description: dc.oneLiner,
            url: `${BASE_URL}/who`,
            isPartOf: { "@id": ID.website },
            mainEntity: {
              "@type": "Person",
              name: dc.name,
              description: dc.thePerson.background,
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: BREADCRUMB_JSON }}
      />

      <nav
        aria-label="Breadcrumb"
        className="max-w-3xl mx-auto px-6 pt-10 text-xs text-muted-foreground"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">Who we serve</li>
        </ol>
      </nav>

      <header className="max-w-3xl mx-auto px-6 pt-8 pb-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          Traffic Secrets &sect;1 — Dream Customer
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
          One person. The one we built this for.
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-3">
          {dc.oneLiner}
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Russell Brunson&rsquo;s first rule:&nbsp;
          <strong className="text-foreground">
            name ONE person. Not a segment. A person.
          </strong>
          &nbsp;Every page on this site is written for the exact person below.
          If this isn&rsquo;t you, the Playbook is not for you — and that&rsquo;s honest.
        </p>
      </header>

      <Separator className="my-2" />

      {/* The Person */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="the-person">
        <h2 id="the-person" className="text-xl font-semibold mb-4 leading-tight">
          Davi (our dream customer)
        </h2>
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Background</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{dc.thePerson.background}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Current Reality</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{dc.thePerson.currentReality}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5 pb-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Internal State</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{dc.thePerson.internalState}</p>
            </CardContent>
          </Card>
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Dream Outcome</p>
              <p className="text-sm leading-relaxed">{dc.thePerson.dreamOutcome}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="my-2" />

      {/* Five Desires + Five Fears side by side */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="desires-fears">
        <h2 id="desires-fears" className="text-xl font-semibold mb-4 leading-tight">
          What they want — and what they&rsquo;re afraid of
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              The Five Desires
            </p>
            <div className="space-y-3">
              {dc.theFiveDesires.map((d: DesireEntry, i: number) => (
                <Card key={i}>
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm font-semibold mb-1 leading-tight">{d.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{d.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              The Five Fears
            </p>
            <div className="space-y-3">
              {dc.theFiveFears.map((f: FearEntry, i: number) => (
                <Card key={i} className="border-red-200 dark:border-red-900">
                  <CardContent className="pt-4 pb-4">
                    <p className="text-sm font-semibold mb-1 leading-tight">{f.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Separator className="my-2" />

      {/* Awareness Ladder */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="ladder">
        <h2 id="ladder" className="text-xl font-semibold mb-4 leading-tight">
          The Awareness Ladder — how they find us
        </h2>
        <div className="space-y-3">
          {dc.awarenessLadder.map((step: AwarenessStage, i: number) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4 flex items-start gap-4">
                <Badge variant="outline" className="shrink-0 mt-0.5">
                  {step.stage}
                </Badge>
                <div>
                  <p className="text-sm font-semibold mb-0.5">{step.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-1">{step.description}</p>
                  <p className="text-xs text-primary italic">{step.ourMessage}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-2" />

      {/* Where they hang out */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="where">
        <h2 id="where" className="text-xl font-semibold mb-4 leading-tight">
          Where they hang out
        </h2>
        <div className="space-y-2">
          {dc.whereTheyHangOut.map((w, i: number) => (
            <Card key={i}>
              <CardContent className="pt-3 pb-3 flex items-start gap-3">
                <Badge variant="outline" className="shrink-0 mt-0.5">
                  {w.place.split(" ")[0]}
                </Badge>
                <p className="text-sm text-muted-foreground leading-relaxed">{w.why}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-2" />

      {/* The Big Lie replacement */}
      <section className="max-w-3xl mx-auto px-6 py-8" aria-labelledby="lie">
        <Card className="border-amber-200 dark:border-amber-900">
          <CardContent className="pt-6 pb-6">
            <h2 id="lie" className="text-xl font-bold mb-3 leading-tight">
              The Big Lie
            </h2>
            <blockquote className="text-sm italic mb-4 pl-4 border-l-2 border-muted-foreground text-muted-foreground">
              &ldquo;{dc.theBigLie.lie}&rdquo;
            </blockquote>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              <strong className="text-foreground">Why it&rsquo;s wrong:</strong>{" "}
              {dc.theBigLie.whyItsWrong}
            </p>
            <p className="text-sm leading-relaxed">
              <strong className="text-foreground">Our replacement:</strong>{" "}
              {dc.theBigLie.ourReplacement}
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-2" />

      <section className="max-w-3xl mx-auto px-6 py-12" aria-labelledby="cta">
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="pt-6 pb-6">
            <h2 id="cta" className="text-xl font-bold mb-3 leading-tight">
              Does this sound like you?
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
              If you recognized yourself in the description above, the free diagnostic
              will name the exact gap between your product and your first paying customer.
              Two minutes, no email required.
            </p>
            <Button asChild>
              <Link href="/diagnostic">Take the 2-minute diagnostic</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
