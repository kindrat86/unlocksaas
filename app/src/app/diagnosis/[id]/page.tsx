import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createAdminClient } from "@/lib/supabase/server";
import {
  LABEL_PUBLIC_NAME,
  isValidLeadId,
  loadPublicDiagnosis,
} from "@/lib/diagnostic-share";
import { DiagnosisShareViewBeacon } from "./share-view-beacon";

/**
 * Brunson DCS Chapter 11 (The Best Bait) — Butterfly-Marketing Loop 1.
 *
 * The shareable, public side of a single diagnosis. Renders only when the
 * underlying lead has share_visibility='public' (set by the share endpoint
 * after explicit consent). Otherwise 404.
 *
 * What the page is: a Reluctant-Hero one-screen artifact a founder can
 * link to from X / IH / Reddit. Shows the diagnosed hostname, the label,
 * the public explanation, the evidence sentence. Bottom of the page is the
 * bait-amplified CTA — visitors who click in from a friend's share land
 * one step deeper than a cold visitor: they have already seen ONE founder's
 * diagnosis before they paste their own.
 *
 * What the page is NOT: a /diagnostic/result clone. That page carries the
 * bridge offer matched to the buyer's bucket; this page never gets the
 * bridge. It is the shareable artifact — a clean piece of social proof.
 *
 * Source:
 *   strategy/workbooks/10-growth-hacking.md §5 (Butterfly Marketing,
 *     Loop 1: shareable diagnostic result)
 *   strategy/workbooks/04-building-your-funnels.md §3 (Diagnostic Result)
 */


type RouteParams = { id: string };

export async function generateMetadata(
  props: {
    params: Promise<RouteParams>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const { id } = params;
  if (!isValidLeadId(id)) {
    return { robots: { index: false, follow: false } };
  }

  const diag = await loadPublicDiagnosis(createAdminClient(), id);
  if (!diag) {
    return { robots: { index: false, follow: false } };
  }

  const labelName = LABEL_PUBLIC_NAME[diag.label];
  const title = `Diagnosis for ${diag.hostname} — ${labelName}`;
  const description = `Reluctant-Hero diagnosis of ${diag.hostname}. Label: ${labelName}. Run yours free in 90 seconds.`;

  return {
    title,
    description,
    alternates: { canonical: `https://unlocksaas.com/diagnosis/${diag.id}` },
    // Public shared diagnoses are indexable — they're Brunson-canon
    // butterfly-marketing case studies. The /diagnostic/result page stays
    // noindex; this page stands in for it on the public web.
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `https://unlocksaas.com/diagnosis/${diag.id}`,
      siteName: "Unlock SaaS",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PublicDiagnosisPage(
  props: {
    params: Promise<RouteParams>;
  }
) {
  const params = await props.params;
  const { id } = params;
  if (!isValidLeadId(id)) notFound();

  const diag = await loadPublicDiagnosis(createAdminClient(), id);
  if (!diag) notFound();

  const labelName = LABEL_PUBLIC_NAME[diag.label];
  const dateStr = diag.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen py-12 sm:py-16 px-4 sm:px-6">
      <Suspense fallback={null}>
        <DiagnosisShareViewBeacon leadId={diag.id} label={diag.label} />
      </Suspense>
      <div className="max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
          A public Unlock SaaS diagnosis
        </p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2">
          {diag.hostname} got diagnosed.
        </h1>
        <p className="text-sm text-muted-foreground mb-10 leading-relaxed">
          The Unlock SaaS engine reads a live product page and labels the
          upstream failure mode. This founder made their result public so
          other post-launch founders could see the pattern.
        </p>

        <Card className="mb-8 border-primary/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant="default" className="text-xs uppercase tracking-wider">
                {labelName}
              </Badge>
              {diag.bucket && (
                <Badge variant="outline" className="text-xs uppercase tracking-wider">
                  {diag.bucket.replace(/_/g, " ")}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{dateStr}</span>
            </div>

            <p className="text-base leading-relaxed text-foreground whitespace-pre-line">
              {diag.explanation}
            </p>

            {diag.evidence && (
              <>
                <Separator className="my-6" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  What I saw on the page
                </p>
                <p className="text-sm leading-relaxed italic">{diag.evidence}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Separator className="my-10" />

        <section className="mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            About this diagnosis
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            The Unlock SaaS diagnostic is free and runs on a live URL.
            Wrong Person, Weak Offer, or Weak Belief — one of three upstream
            failure modes. Founders who run it get the label, the evidence,
            and a single door that fixes the labeled one.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The visitor is not an account, a profile, or a customer record on
            this page — only the diagnosis is shared, with their explicit
            consent. The product URL belongs to them; the diagnosis belongs
            to them; sharing was their choice.
          </p>
        </section>

        <Button
          asChild
          size="lg"
          className="w-full text-base py-6"
          data-share-page-cta="run-mine"
        >
          <Link
            href={`/diagnostic?utm_source=share&utm_medium=referral&utm_content=${diag.id}`}
          >
            Run the diagnostic on my product
          </Link>
        </Button>

        <Button
          asChild
          variant="ghost"
          size="lg"
          className="w-full text-sm mt-3"
        >
          <Link href={diag.productUrl} target="_blank" rel="noopener nofollow">
            See the product they diagnosed →
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground mt-8 text-center leading-relaxed">
          Built by{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            Maryan at Unlock SaaS
          </Link>
          . Reluctant Hero. Non-engineer. Built the playbook he wishes someone
          had handed him. No card, no spam, one short note a day for five days
          after you run yours.
        </p>
      </div>
    </div>
  );
}
