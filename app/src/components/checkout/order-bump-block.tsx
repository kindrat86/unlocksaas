"use client";

/**
 * Order Bump – Brunson DotCom Secrets Secret 14 (Cart Funnel).
 *
 * Renders directly above the primary "Start for $1" CTA on /starter. The
 * Brunson rule: the bump lives in the checkout flow, not on a separate
 * page – it must be a one-checkbox decision the visitor can make without
 * leaving the buying mood.
 *
 * Render gate: we fetch /api/offers/availability on mount and only render
 * the block when `starter_bump === true`. Until the operator pastes a Stripe
 * price id, the bump silently doesn't exist. That way the $1 cart never
 * shows a broken checkbox.
 *
 * Voice rule: Reluctant Hero. The block names the bump in the founder's own
 * voice – no "LIMITED TIME!" or "97% OFF!". The strikethrough anchor is
 * factual: the same templates inside a typical $97 outreach course.
 */

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { OFFERS, formatDollars } from "@/lib/offers";
import { track } from "@/lib/analytics/client";
import { Event } from "@/lib/analytics/events";

interface OrderBumpBlockProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
}

export function OrderBumpBlock({ checked, onCheckedChange }: OrderBumpBlockProps) {
  const offer = OFFERS.starter_bump;
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/offers/availability")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, boolean> | null) => {
        if (cancelled) return;
        setEnabled(Boolean(data?.starter_bump));
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (enabled !== true) return null;

  const price = formatDollars(offer.priceCents);
  const anchorPrice =
    offer.anchorPriceCents != null ? formatDollars(offer.anchorPriceCents) : null;

  function handleToggle() {
    const next = !checked;
    track(Event.StarterBumpToggled, {
      offer_id: offer.id,
      checked: next,
    });
    onCheckedChange(next);
  }

  return (
    <Card
      className={
        "mb-6 border-2 transition-colors " +
        (checked
          ? "border-primary bg-primary/5"
          : "border-dashed border-primary/40 bg-primary/[0.02]")
      }
    >
      <CardContent className="pt-6">
        {/* Single hit target: the whole card flips the checkbox so the
            visitor can't fail to click the right pixel. */}
        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={checked}
          className="w-full text-left"
        >
          <div className="flex items-start gap-3">
            {/* Checkbox visual. Native input kept off-DOM so a screen-reader
                still announces the pressed state via aria-pressed above. */}
            <span
              aria-hidden="true"
              className={
                "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-colors " +
                (checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-primary/50 bg-background")
              }
            >
              {checked && <CheckCircle2 className="h-4 w-4" />}
            </span>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Add to your order
              </p>
              <p className="text-base font-semibold leading-snug mb-1">
                {offer.title}{" "}
                <span className="font-normal text-muted-foreground">
                  – just {price}
                  {anchorPrice && (
                    <span className="ml-1 line-through text-muted-foreground/60">
                      {anchorPrice}
                    </span>
                  )}
                </span>
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {offer.subtitle}
              </p>
              <ul className="space-y-1.5 text-sm">
                {offer.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground leading-relaxed">
                      {bullet}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground italic">
                {checked
                  ? `Yes – add it. ${price} on top of the $1 Starter.`
                  : `Click to add. ${price} on top of the $1 Starter. No upsell after.`}
              </p>
            </div>
          </div>
        </button>
      </CardContent>
    </Card>
  );
}
