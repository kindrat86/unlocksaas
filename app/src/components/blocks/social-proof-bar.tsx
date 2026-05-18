/**
 * Social Proof Bar — Brunson Building Block #20 (honest variant).
 *
 * Block-the-fake-testimonials rule: Marco is a skeptic avatar (workbook 01 §6
 * Beat 4: "Cannot Code" + "Praise Junkie"). Fabricated "trusted by X founders"
 * counters destroy his trust in three seconds. So this bar carries STRUCTURAL
 * proof instead of inflated numbers:
 *
 *   - the mechanism that ENFORCES the promise (Stripe-verified refund logic)
 *   - the founder's own scar tissue (12 shipped products, flat lines)
 *   - the conversation-corpus the avatar is built on (10+ founder interviews)
 *
 * Every line here is true today.
 *
 * Verified-Builder slot (DOM↔schema contract)
 * -------------------------------------------
 * When `verifiedCount` is >= 1, the third slot is REPLACED with a
 * Stripe-verified count: "N Verified Builders". This is the visible
 * rendering of the same number that the AggregateRating sub-graph on the
 * Playbook SoftwareApplication schema reports (ratingCount = reviewCount).
 *
 * Google's structured-data policy demotes Rich Results when schema
 * numbers don't appear in rendered DOM. Wiring both surfaces from the
 * SAME `loadPublicBadgeCount()` call upstream keeps them locked together
 * by construction — no drift surface.
 *
 * Brunson Hard-Rule: when verifiedCount is 0 or undefined, the bar falls
 * back to the original "10+ founder conversations" line. No "0 Verified
 * Builders" embarrassment. The slot only switches on when the number
 * carries actual weight.
 */
import { Stamp, Wallet, Users } from "lucide-react";

export interface SocialProofBarProps {
  /**
   * Public, Stripe-verified Verified Builder count from the
   * `builder_badges` Supabase view. Same source the AggregateRating
   * schema reads from upstream, so the rendered count and the
   * schema count are mechanically identical.
   *
   * Optional. When undefined or < 1, the bar renders the
   * conversation-corpus copy (the pre-revenue default).
   */
  verifiedCount?: number;
}

export function SocialProofBar({ verifiedCount }: SocialProofBarProps = {}) {
  const showVerifiedSlot =
    typeof verifiedCount === "number" &&
    Number.isFinite(verifiedCount) &&
    verifiedCount >= 1;

  return (
    <section
      aria-label="What this is built on"
      className="border-y border-border/60 bg-card/40 py-6 px-6"
    >
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
        <div className="flex items-start gap-3 md:justify-start justify-center">
          <Stamp className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold leading-tight">
              Refund enforced by code
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              The guarantee is a Stripe webhook, not a promise.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 md:justify-start justify-center">
          <Wallet className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold leading-tight">
              12 shipped products, one flat line
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              The founder built this on his own scar tissue first.
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 md:justify-start justify-center">
          <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" aria-hidden="true" />
          {showVerifiedSlot ? (
            /*
              Verified-Builder count slot. The headline number matches
              `aggregateRating.ratingCount` exactly (both read from the
              same Supabase view). Subtitle states the verification
              mechanism — no marketing softeners, no "happy customers"
              language, just the binary fact the count represents.
            */
            <div>
              <p className="text-sm font-semibold leading-tight">
                {verifiedCount} Verified{" "}
                {verifiedCount === 1 ? "Builder" : "Builders"}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                First paying customer confirmed by Stripe. Not self-reported.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold leading-tight">
                10+ founder conversations
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Every story below is sourced from a real conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
