"use client";

/**
 * Generic OTO step renderer. The three pages /oto/vault, /oto/cold-emails,
 * /oto/lifetime each thin-wrap this with their own copy + offer id.
 *
 * Brunson rule (DotCom Secrets Secret 16 + Expert Secrets §3 Stack-and-Closes):
 *   - One screen, one decision.
 *   - The accept CTA must restate the price + what the visitor gets.
 *   - The decline link must carry the visitor forward to the next OTO.
 *
 * Render gate: if the offer's env var (price id) is unset, the page auto-
 * advances to the decline href on mount. Visitors never see a half-broken
 * OTO – the chain compresses around the disabled rung.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { AbExposureBeacon } from "@/components/ab-exposure-beacon";
import { OFFERS, formatDollars, type OfferId } from "@/lib/offers";
import { track } from "@/lib/analytics/client";
import { type EventName } from "@/lib/analytics/events";

export interface OtoStepProps {
  /** Offer id in lib/offers.ts. Resolves price + copy + env-gate. */
  offerId: OfferId;
  /** Headline that frames the offer in Reluctant Hero voice. */
  headline: string;
  /** 1-3 short paragraphs above the offer card. */
  intro: readonly string[];
  /** Label on the primary accept CTA. */
  acceptCtaLabel: string;
  /** Label on the decline link. */
  declineLabel: string;
  /** Where the decline link sends the visitor (the next step). */
  declineHref: string;
  /**
   * Optional reassurance paragraph below the buttons. Brunson "the no-vote
   * does not get punished" beat.
   */
  reassurance?: string;
  /** Event names for the four lifecycle moments. */
  events: {
    viewed: EventName;
    accepted: EventName;
    declined: EventName;
  };
}

export function OtoStep({
  offerId,
  headline,
  intro,
  acceptCtaLabel,
  declineLabel,
  declineHref,
  reassurance,
  events,
}: OtoStepProps) {
  const router = useRouter();
  const params = useSearchParams();
  const offer = OFFERS[offerId];
  const parentSessionId = params.get("session_id") ?? "";

  // Availability gate. Until /api/offers/availability confirms the env var is
  // set, we render the page but mark the CTA disabled. If the offer is
  // disabled, we auto-advance to the decline href.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    track(events.viewed, {
      offer_id: offerId,
      parent_session_id: parentSessionId || undefined,
    });
  }, [events.viewed, offerId, parentSessionId]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/offers/availability")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, boolean> | null) => {
        if (cancelled) return;
        const isEnabled = Boolean(data?.[offerId]);
        setEnabled(isEnabled);
        if (!isEnabled) {
          // Offer disabled — auto-advance the visitor down the chain. We
          // don't track a "declined" here because the visitor never saw the
          // CTA. The page-viewed event already fired so funnel reports can
          // detect the auto-advance bucket via `enabled === false`.
          router.replace(declineHref);
        }
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [offerId, router, declineHref]);

  async function handleAccept() {
    if (submitting) return;
    setSubmitting(true);
    track(events.accepted, {
      offer_id: offerId,
      price_cents: offer.priceCents,
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceType: offerId, // "oto_vault" | "oto_downsell" | "oto_lifetime"
          parentSessionId,
        }),
      });
      if (!res.ok) {
        // 503 = offer disabled (env var unset between availability check + click).
        // 5xx = Stripe error. Either way, walk forward instead of stalling.
        router.replace(declineHref);
        return;
      }
      const { url } = (await res.json()) as { url?: string };
      if (url) {
        window.location.href = url;
      } else {
        router.replace(declineHref);
      }
    } catch (err) {
      console.warn("[oto-step] checkout failed:", err);
      router.replace(declineHref);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDecline() {
    track(events.declined, { offer_id: offerId });
  }

  // While the availability check is in flight, render a quiet placeholder so
  // a slow network doesn't show a "click me" CTA that's about to redirect.
  if (enabled === null) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
        <p className="text-sm text-muted-foreground">Loading the next step.</p>
      </div>
    );
  }

  // When disabled, the useEffect above already kicked off the redirect. Show
  // a brief notice in case the redirect is slow.
  if (!enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
        <p className="text-sm text-muted-foreground">Routing you to the next step.</p>
      </div>
    );
  }

  const price = formatDollars(offer.priceCents);
  const anchorPrice =
    offer.anchorPriceCents != null ? formatDollars(offer.anchorPriceCents) : null;

  return (
    <div className="min-h-screen flex items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
      <AbExposureBeacon />
      <div className="max-w-xl w-full">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3 text-center">
          One more thing before we close the tab
        </p>
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-6 text-center">
          {headline}
        </h1>

        {intro.map((paragraph) => (
          <p
            key={paragraph}
            className="text-muted-foreground leading-relaxed mb-4"
          >
            {paragraph}
          </p>
        ))}

        <Card className="mb-6 border-primary/20">
          <CardContent className="pt-6">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
              {offer.title}
            </p>
            <p className="text-2xl font-bold leading-snug mb-3">
              {price}
              {anchorPrice && (
                <span className="ml-2 text-base font-normal text-muted-foreground line-through">
                  {anchorPrice}
                </span>
              )}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                one-time
              </span>
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {offer.subtitle}
            </p>
            <ul className="space-y-2 text-sm">
              {offer.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground leading-relaxed">
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <Button
          size="lg"
          className="w-full text-lg py-6 mb-4"
          onClick={handleAccept}
          disabled={submitting}
        >
          {submitting ? "Opening Stripe…" : acceptCtaLabel}
        </Button>

        <div className="text-center">
          <Link
            href={declineHref}
            onClick={handleDecline}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            {declineLabel}
          </Link>
        </div>

        {reassurance && (
          <p className="text-xs text-muted-foreground mt-8 leading-relaxed text-center">
            {reassurance}
          </p>
        )}
      </div>
    </div>
  );
}
