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
 * Every line here is true today. When real customers exist, replace one or
 * two slots with first-paying-customer counts (per workbook 09 §6 Public
 * Proof Loop).
 */
import { Stamp, Wallet, Users } from "lucide-react";

export function SocialProofBar() {
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
          <div>
            <p className="text-sm font-semibold leading-tight">
              10+ founder conversations
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              Every parable below is sourced from a real conversation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
